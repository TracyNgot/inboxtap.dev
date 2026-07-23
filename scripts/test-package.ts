import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { copyFile, cp, mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

await verifyModuleExports();
await verifyDeclarationExports();
await verifyIsolatedDeclarations();
await runBun(["test", "./smoke/package-consumers/bun-fixture.case.js"]);
await runNode(["./smoke/package-consumers/fault-disconnect.mjs"]);
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
    "import { InboxTapServer } from 'inboxtap'; import { InboxTapClient } from 'inboxtap/client'; import { startInboxTapFixture } from 'inboxtap/fixtures'; import { extendInboxTap as extendVitest } from 'inboxtap/fixtures/vitest'; import { extendInboxTap as extendPlaywright } from 'inboxtap/fixtures/playwright'; import { createInboxTapMatchers } from 'inboxtap/matchers'; import { extendInboxTapExpect as extendBunExpect } from 'inboxtap/matchers/bun'; import { extendInboxTapExpect as extendVitestExpect } from 'inboxtap/matchers/vitest'; import { extendInboxTapExpect as extendPlaywrightExpect } from 'inboxtap/matchers/playwright'; if (!InboxTapServer || !InboxTapClient || !startInboxTapFixture || !extendVitest || !extendPlaywright || !createInboxTapMatchers || !extendBunExpect || !extendVitestExpect || !extendPlaywrightExpect) process.exit(1);",
  ]);
  await runNode([
    "--input-type=commonjs",
    "--eval",
    "const { InboxTapServer } = require('inboxtap'); const { InboxTapClient } = require('inboxtap/client'); const { startInboxTapFixture } = require('inboxtap/fixtures'); const { extendInboxTap: extendVitest } = require('inboxtap/fixtures/vitest'); const { extendInboxTap: extendPlaywright } = require('inboxtap/fixtures/playwright'); const { createInboxTapMatchers } = require('inboxtap/matchers'); const { extendInboxTapExpect: extendBunExpect } = require('inboxtap/matchers/bun'); const { extendInboxTapExpect: extendVitestExpect } = require('inboxtap/matchers/vitest'); const { extendInboxTapExpect: extendPlaywrightExpect } = require('inboxtap/matchers/playwright'); if (!InboxTapServer || !InboxTapClient || !startInboxTapFixture || !extendVitest || !extendPlaywright || !createInboxTapMatchers || !extendBunExpect || !extendVitestExpect || !extendPlaywrightExpect) process.exit(1);",
  ]);
  await runNode([
    "--experimental-loader",
    "./smoke/package-consumers/block-fixture-peers-loader.mjs",
    "--input-type=module",
    "--eval",
    "import { InboxTapServer } from 'inboxtap'; import { InboxTapClient } from 'inboxtap/client'; import { createInboxTapMatchers } from 'inboxtap/matchers'; if (!InboxTapServer || !InboxTapClient || !createInboxTapMatchers) process.exit(1);",
  ]);
  await runNode([
    "--input-type=commonjs",
    "--eval",
    "const Module = require('node:module'); const load = Module._load; const blocked = new Set(['@playwright/test', 'nodemailer', 'vitest']); Module._load = function(request, parent, isMain) { if (blocked.has(request)) throw new Error('Unexpected optional peer import: ' + request); return load.call(this, request, parent, isMain); }; const { InboxTapServer } = require('inboxtap'); const { InboxTapClient } = require('inboxtap/client'); const { createInboxTapMatchers } = require('inboxtap/matchers'); if (!InboxTapServer || !InboxTapClient || !createInboxTapMatchers) process.exit(1);",
  ]);
}

async function verifyDeclarationExports(): Promise<void> {
  await runBun(["x", "tsc", "--project", "smoke/package-consumers/tsconfig.json"]);
  await runBun(["x", "tsc", "--project", "smoke/package-consumers/bun-matchers-tsconfig.json"]);
  await runBun(["x", "tsc", "--project", "smoke/package-consumers/playwright-tsconfig.json"]);
}

async function verifyIsolatedDeclarations(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "inboxtap-types-"));
  try {
    await copyPackage(directory);
    await verifyRootClientMatcherTypesWithoutPeers(directory);
    await copyFixtureTypeDependencies(directory);
    await verifyFixtureTypesWithNodemailer(directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

async function copyPackage(directory: string): Promise<void> {
  const packageDirectory = join(directory, "node_modules", "inboxtap");
  await mkdir(packageDirectory, { recursive: true });
  await cp("dist", join(packageDirectory, "dist"), { recursive: true });
  await copyFile("package.json", join(packageDirectory, "package.json"));
}

async function verifyRootClientMatcherTypesWithoutPeers(directory: string): Promise<void> {
  const source = [
    'import { InboxTapServer } from "inboxtap";',
    'import { InboxTapClient } from "inboxtap/client";',
    'import { createInboxTapMatchers } from "inboxtap/matchers";',
    "void [InboxTapServer, InboxTapClient, createInboxTapMatchers];",
  ].join("\n");
  await writeFile(join(directory, "root-client.mts"), source, "utf8");
  await writeFile(join(directory, "root-client.cts"), source, "utf8");
  await writeTypeScriptConfig(directory, ["root-client.mts", "root-client.cts"], []);
  await runBun(["x", "tsc", "--project", join(directory, "tsconfig.json")]);
}

async function copyFixtureTypeDependencies(directory: string): Promise<void> {
  for (const packageName of ["nodemailer", "@types/nodemailer", "@types/node"]) {
    const source = await realpath(join("node_modules", packageName));
    const destination = join(directory, "node_modules", packageName);
    await mkdir(join(destination, ".."), { recursive: true });
    await cp(source, destination, { recursive: true });
  }
  const nodeTypes = await realpath(join("node_modules", "@types/node"));
  const undiciTypes = await realpath(join(nodeTypes, "..", "..", "undici-types"));
  await cp(undiciTypes, join(directory, "node_modules", "undici-types"), {
    recursive: true,
  });
}

async function verifyFixtureTypesWithNodemailer(directory: string): Promise<void> {
  const source = [
    'import { startInboxTapFixture } from "inboxtap/fixtures";',
    "void startInboxTapFixture;",
  ].join("\n");
  await writeFile(join(directory, "fixture.mts"), source, "utf8");
  await writeFile(join(directory, "fixture.cts"), source, "utf8");
  await writeTypeScriptConfig(directory, ["fixture.mts", "fixture.cts"], ["node"]);
  await runBun(["x", "tsc", "--project", join(directory, "tsconfig.json")]);
}

async function writeTypeScriptConfig(
  directory: string,
  files: string[],
  types: string[],
): Promise<void> {
  await writeFile(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        lib: ["ES2023", "DOM"],
        module: "Node16",
        moduleResolution: "Node16",
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: "ES2022",
        types,
      },
      files,
    }),
    "utf8",
  );
}

async function runNode(args: string[]): Promise<void> {
  const child = spawn("node", args, { stdio: "inherit" });
  const [exitCode] = (await once(child, "exit")) as [number | null];
  assert.equal(exitCode, 0, `Node command failed: node ${args.join(" ")}`);
}

async function runBun(args: string[]): Promise<void> {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  const [exitCode] = (await once(child, "exit")) as [number | null];
  assert.equal(exitCode, 0, `Bun command failed: bun ${args.join(" ")}`);
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
