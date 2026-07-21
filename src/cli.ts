#!/usr/bin/env node
import { bold, dim, errorRed, green, stdoutColor } from "./colors.js";
import { InboxTapServer } from "./server.js";
import type { InboxTapServerOptions } from "./types.js";

const initialArgs = process.argv.slice(2);
const args = initialArgs[0] === "start" ? initialArgs.slice(1) : initialArgs;

if (args[0] === "--help" || args[0] === "-h") {
  printHelp();
} else if (args[0] && !args[0].startsWith("--")) {
  console.error("Usage: inboxtap [start] [--smtp-port 1025] [--api-port 8025]");
  process.exitCode = 1;
} else {
  void start(parseOptions(args)).catch((error: unknown) => {
    console.error(errorRed(error instanceof Error ? error.message : "Unable to start InboxTap"));
    process.exitCode = 1;
  });
}

async function start(options: InboxTapServerOptions): Promise<void> {
  const server = new InboxTapServer(options);
  await server.start();
  if (stdoutColor) console.log(`${bold("Inbox")}${bold(green("Tap"))}`);
  console.log(`SMTP listening on ${green(`${server.smtpHost}:${server.smtpPort}`)}`);
  console.log(`Test API listening on ${green(server.apiUrl)}`);
  console.log(
    dim("Set SMTP_HOST and SMTP_PORT in the application under test. Press Ctrl+C to stop."),
  );

  const shutdown = async (): Promise<void> => {
    await server.stop();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

function parseOptions(args: string[]): InboxTapServerOptions {
  const options: InboxTapServerOptions = {};
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    const value = args[index + 1];
    if (!option?.startsWith("--") || value === undefined) {
      throw new Error(`Invalid option: ${option ?? ""}`);
    }
    switch (option) {
      case "--smtp-host":
        options.smtpHost = value;
        break;
      case "--smtp-port":
        options.smtpPort = parsePort(value, option);
        break;
      case "--api-host":
        options.apiHost = value;
        break;
      case "--api-port":
        options.apiPort = parsePort(value, option);
        break;
      case "--domain":
        options.domain = value;
        break;
      case "--max-messages":
        options.maxMessages = parsePositiveInt(value, option);
        break;
      case "--max-message-size":
        options.maxMessageSize = parsePositiveInt(value, option);
        break;
      default:
        throw new Error(`Unknown option: ${option}`);
    }
  }
  return options;
}

function parsePort(value: string, option: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error(`${option} must be 0-65535`);
  }
  return port;
}

function parsePositiveInt(value: string, option: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function printHelp(): void {
  const option = (flag: string, description: string) => `  ${flag.padEnd(28)}${dim(description)}`;
  console.log(`${bold("Usage:")} inboxtap [start] [options]

${bold("Options:")}
${[
  option("--smtp-host <host>", "SMTP host (default: localhost, binds 127.0.0.1 and ::1)"),
  option("--smtp-port <port>", "SMTP port (default: 1025)"),
  option("--api-host <host>", "API host (default: localhost, binds 127.0.0.1 and ::1)"),
  option("--api-port <port>", "API port (default: 8025)"),
  option("--domain <domain>", "Test recipient domain (default: local.test)"),
  option("--max-messages <count>", "Messages to retain (default: 100)"),
  option("--max-message-size <bytes>", "Maximum SMTP message size (default: 5242880)"),
].join("\n")}`);
}
