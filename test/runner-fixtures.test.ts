import { expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RUNNERS = [
  {
    args: ["test", "./test/runner-fixtures/bun.case.ts"],
    name: "Bun",
  },
  {
    args: ["x", "vitest", "run", "--config", "test/runner-fixtures/vitest.config.ts"],
    name: "Vitest",
  },
  {
    args: ["x", "playwright", "test", "--config", "test/runner-fixtures/playwright.config.ts"],
    name: "Playwright",
  },
] as const;

const RUNNER_TEST_TIMEOUT_MS = 30_000;

for (const runner of RUNNERS) {
  test(
    `${runner.name} fixture follows its native lifecycle`,
    async () => {
      await verifyRunnerLifecycle(runner.args, false);
    },
    RUNNER_TEST_TIMEOUT_MS,
  );

  test(
    `${runner.name} fixture cleans up after a failed test`,
    async () => {
      await verifyRunnerLifecycle(runner.args, true);
    },
    RUNNER_TEST_TIMEOUT_MS,
  );
}

async function verifyRunnerLifecycle(
  args: readonly string[],
  forceFailure: boolean,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "inboxtap-runner-"));
  const portsPath = join(directory, "ports.json");
  const teardownPath = join(directory, "teardown.txt");

  try {
    const result = await runBun(args, {
      INBOXTAP_FORCE_RUNNER_FAILURE: forceFailure ? "1" : "0",
      INBOXTAP_RUNNER_PORTS: portsPath,
      INBOXTAP_RUNNER_TEARDOWN: teardownPath,
    });
    if (forceFailure) expect(result.exitCode).not.toBe(0);
    else expect(result.exitCode, result.output).toBe(0);

    const ports = JSON.parse(await readFile(portsPath, "utf8")) as {
      apiPort: number;
      smtpPort: number;
    };
    expect(await readFile(teardownPath, "utf8")).toContain("stopped");
    await Promise.all([assertPortAvailable(ports.apiPort), assertPortAvailable(ports.smtpPort)]);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

function runBun(
  args: readonly string[],
  extraEnvironment: Record<string, string>,
): Promise<{ exitCode: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...extraEnvironment },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Runner timed out: bun ${args.join(" ")}\n${output}`));
    }, 20_000);
    const collect = (chunk: Buffer): void => {
      output = `${output}${chunk.toString()}`.slice(-20_000);
    };
    child.stdout?.on("data", collect);
    child.stderr?.on("data", collect);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (exitCode) => {
      clearTimeout(timeout);
      resolve({ exitCode, output });
    });
  });
}

async function assertPortAvailable(port: number): Promise<void> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
