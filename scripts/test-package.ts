import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";

await verifyModuleExports();
const cli = await startCli();

try {
  const health = await fetch(`${cli.apiUrl}/health`).then((response) => response.json());
  assert.equal(health.ok, true);
  assert.equal(health.smtp.port, cli.smtpPort);
} finally {
  cli.process.kill("SIGTERM");
  await once(cli.process, "exit");
}

async function verifyModuleExports(): Promise<void> {
  await runNode([
    "--input-type=module",
    "--eval",
    "import { InboxTapServer } from './dist/index.js'; if (!InboxTapServer) process.exit(1);",
  ]);
  await runNode([
    "--input-type=commonjs",
    "--eval",
    "const { InboxTapServer } = require('./dist/index.cjs'); const { InboxTapClient } = require('./dist/client.cjs'); if (!InboxTapServer || !InboxTapClient) process.exit(1);",
  ]);
}

async function runNode(args: string[]): Promise<void> {
  const process = spawn("node", args, { stdio: "inherit" });
  const [exitCode] = (await once(process, "exit")) as [number | null];
  assert.equal(exitCode, 0, `Node command failed: node ${args.join(" ")}`);
}

async function startCli(): Promise<{
  apiUrl: string;
  process: ReturnType<typeof spawn>;
  smtpPort: number;
}> {
  const process = spawn("node", ["dist/cli.js", "--smtp-port", "0", "--api-port", "0"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";

  const result = await new Promise<{ apiUrl: string; smtpPort: number }>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`CLI startup timed out: ${output}`)), 5_000);
    const inspectOutput = (chunk: Buffer): void => {
      output += chunk.toString();
      const apiUrl = output.match(/Test API listening on (http:\/\/[^\s]+)/)?.[1];
      const smtpPort = output.match(/SMTP listening on [^:]+:(\d+)/)?.[1];
      if (apiUrl && smtpPort) {
        clearTimeout(timeout);
        resolve({ apiUrl, smtpPort: Number.parseInt(smtpPort, 10) });
      }
    };
    process.stdout?.on("data", inspectOutput);
    process.stderr?.on("data", inspectOutput);
    process.once("error", reject);
    process.once("exit", (code) => reject(new Error(`CLI exited early (${code}): ${output}`)));
  });

  return { ...result, process };
}
