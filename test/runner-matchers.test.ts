import { expect, test } from "bun:test";
import { spawn } from "node:child_process";

const RUNNERS = [
  {
    args: ["test", "./test/runner-matchers/bun.case.ts"],
    name: "Bun",
  },
  {
    args: ["x", "vitest", "run", "--config", "test/runner-matchers/vitest.config.ts"],
    name: "Vitest",
  },
  {
    args: ["x", "playwright", "test", "--config", "test/runner-matchers/playwright.config.ts"],
    name: "Playwright",
  },
] as const;

const RUNNER_TEST_TIMEOUT_MS = 30_000;

for (const runner of RUNNERS) {
  test(
    `${runner.name} registers async, sync, and negated InboxTap matchers`,
    async () => {
      const result = await runBun(runner.args);
      expect(result.exitCode, result.output).toBe(0);
    },
    RUNNER_TEST_TIMEOUT_MS,
  );
}

function runBun(args: readonly string[]): Promise<{ exitCode: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
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
