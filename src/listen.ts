import type { AddressInfo } from "node:net";

export interface Listener {
  readonly listening: boolean;
  listen(port: number, host: string, callback?: () => void): unknown;
  close(callback?: () => void): unknown;
  once(event: "error", listener: (error: Error) => void): unknown;
  off(event: "error", listener: (error: Error) => void): unknown;
  address(): AddressInfo | string | null;
}

export interface DualStackResult {
  port: number;
  hosts: string[];
}

const IPV6_UNAVAILABLE_CODES = new Set(["EAFNOSUPPORT", "EADDRNOTAVAIL"]);

export function listenOn(listener: Listener, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error): void => reject(error);
    listener.once("error", onError);
    listener.listen(port, host, () => {
      listener.off("error", onError);
      resolve();
    });
  });
}

export function closeListener(listener: Listener): Promise<void> {
  return new Promise((resolve) => {
    if (!listener.listening) return resolve();
    listener.close(() => resolve());
  });
}

export function readPort(listener: Listener): number {
  const address = listener.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine the listening port");
  }
  return address.port;
}

export async function listenDualStack(
  ipv4: Listener,
  ipv6: Listener,
  port: number,
  maxRetries = 3,
): Promise<DualStackResult> {
  for (let attempt = 0; ; attempt += 1) {
    await listenOn(ipv4, port, "127.0.0.1");
    const boundPort = readPort(ipv4);
    try {
      await listenOn(ipv6, boundPort, "::1");
      return { port: boundPort, hosts: ["127.0.0.1", "::1"] };
    } catch (error) {
      const code = errorCode(error);
      if (code !== undefined && IPV6_UNAVAILABLE_CODES.has(code)) {
        return { port: boundPort, hosts: ["127.0.0.1"] };
      }
      if (code === "EADDRINUSE") {
        if (port === 0 && attempt < maxRetries) {
          await closeListener(ipv4);
          continue;
        }
        return { port: boundPort, hosts: ["127.0.0.1"] };
      }
      await closeListener(ipv4);
      throw error;
    }
  }
}

function errorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return undefined;
}
