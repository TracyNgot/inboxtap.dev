import { expect, test } from "bun:test";
import type { Listener } from "../src/listen.js";
import { listenDualStack } from "../src/listen.js";

type ListenStep = { port: number } | { error: string };

interface FakeListener extends Listener {
  attempts: Array<{ port: number; host: string }>;
  closes: number;
}

function fakeListener(steps: ListenStep[]): FakeListener {
  let boundPort: number | null = null;
  let onError: ((error: Error) => void) | undefined;
  const listener: FakeListener = {
    attempts: [],
    closes: 0,
    get listening() {
      return boundPort !== null;
    },
    listen(port, host, callback) {
      listener.attempts.push({ host, port });
      const step = steps.shift();
      if (!step) throw new Error("Unexpected listen call");
      if ("error" in step) {
        const error = new Error(step.error) as Error & { code: string };
        error.code = step.error;
        queueMicrotask(() => onError?.(error));
        return;
      }
      boundPort = port === 0 ? step.port : port;
      queueMicrotask(() => callback?.());
    },
    close(callback) {
      boundPort = null;
      listener.closes += 1;
      queueMicrotask(() => callback?.());
    },
    once(_event, handler) {
      onError = handler;
    },
    off() {
      onError = undefined;
    },
    address() {
      return boundPort === null ? null : { address: "", family: "IPv4", port: boundPort };
    },
  };
  return listener;
}

test("binds both loopback families on the same port", async () => {
  const ipv4 = fakeListener([{ port: 40_001 }]);
  const ipv6 = fakeListener([{ port: 40_001 }]);

  const result = await listenDualStack(ipv4, ipv6, 0);

  expect(result).toEqual({ hosts: ["127.0.0.1", "::1"], port: 40_001 });
  expect(ipv4.attempts).toEqual([{ host: "127.0.0.1", port: 0 }]);
  expect(ipv6.attempts).toEqual([{ host: "::1", port: 40_001 }]);
});

test("retries with a fresh ephemeral port when ::1 has a collision", async () => {
  const ipv4 = fakeListener([{ port: 40_001 }, { port: 40_002 }]);
  const ipv6 = fakeListener([{ error: "EADDRINUSE" }, { port: 40_002 }]);

  const result = await listenDualStack(ipv4, ipv6, 0);

  expect(result).toEqual({ hosts: ["127.0.0.1", "::1"], port: 40_002 });
  expect(ipv4.closes).toBe(1);
});

test("falls back to IPv4 only after exhausting ephemeral retries", async () => {
  const ports = [40_001, 40_002, 40_003, 40_004];
  const ipv4 = fakeListener(ports.map((port) => ({ port })));
  const ipv6 = fakeListener(ports.map(() => ({ error: "EADDRINUSE" })));

  const result = await listenDualStack(ipv4, ipv6, 0);

  expect(result).toEqual({ hosts: ["127.0.0.1"], port: 40_004 });
  expect(ipv4.closes).toBe(3);
  expect(ipv4.listening).toBe(true);
});

test.each(["EAFNOSUPPORT", "EADDRNOTAVAIL"])(
  "falls back to IPv4 only when IPv6 is unavailable (%s)",
  async (code) => {
    const ipv4 = fakeListener([{ port: 40_001 }]);
    const ipv6 = fakeListener([{ error: code }]);

    const result = await listenDualStack(ipv4, ipv6, 0);

    expect(result).toEqual({ hosts: ["127.0.0.1"], port: 40_001 });
    expect(ipv4.closes).toBe(0);
    expect(ipv4.listening).toBe(true);
  },
);

test("keeps the IPv4 bind when a fixed port is squatted on ::1", async () => {
  const ipv4 = fakeListener([{ port: 1025 }]);
  const ipv6 = fakeListener([{ error: "EADDRINUSE" }]);

  const result = await listenDualStack(ipv4, ipv6, 1025);

  expect(result).toEqual({ hosts: ["127.0.0.1"], port: 1025 });
  expect(ipv4.closes).toBe(0);
});

test("closes the IPv4 bind and rethrows unexpected ::1 errors", async () => {
  const ipv4 = fakeListener([{ port: 40_001 }]);
  const ipv6 = fakeListener([{ error: "EACCES" }]);

  await expect(listenDualStack(ipv4, ipv6, 0)).rejects.toThrow("EACCES");
  expect(ipv4.closes).toBe(1);
  expect(ipv4.listening).toBe(false);
});
