#!/usr/bin/env node
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
    console.error(error instanceof Error ? error.message : "Unable to start InboxTap");
    process.exitCode = 1;
  });
}

async function start(options: InboxTapServerOptions): Promise<void> {
  const server = new InboxTapServer(options);
  await server.start();
  console.log(`SMTP listening on ${server.smtpHost}:${server.smtpPort}`);
  console.log(`Test API listening on ${server.apiUrl}`);
  console.log("Set SMTP_HOST and SMTP_PORT in the application under test. Press Ctrl+C to stop.");

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
  console.log(`Usage: inboxtap [start] [options]

Options:
  --smtp-host <host>          SMTP host (default: localhost, binds 127.0.0.1 and ::1)
  --smtp-port <port>          SMTP port (default: 1025)
  --api-host <host>           API host (default: localhost, binds 127.0.0.1 and ::1)
  --api-port <port>           API port (default: 8025)
  --domain <domain>           Test recipient domain (default: local.test)
  --max-messages <count>      Messages to retain (default: 100)
  --max-message-size <bytes>  Maximum SMTP message size (default: 5242880)`);
}
