import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { SMTPServer } from "smtp-server";
import { createApiHandler } from "./api.js";
import { createSmtpServer } from "./smtp.js";
import { EmailStore } from "./store.js";
import type { HealthResponse, InboxTapServerOptions } from "./types.js";

const DEFAULT_OPTIONS = {
  apiHost: "127.0.0.1",
  apiPort: 8025,
  domain: "local.test",
  maxMessages: 100,
  maxMessageSize: 5 * 1024 * 1024,
  smtpHost: "127.0.0.1",
  smtpPort: 1025,
} as const;

export class InboxTapServer {
  readonly apiHost: string;
  apiPort: number;
  readonly domain: string;
  readonly maxMessageSize: number;
  readonly store: EmailStore;
  readonly smtpHost: string;
  smtpPort: number;
  #apiServer: HttpServer;
  #smtpServer: SMTPServer;
  #started = false;

  constructor(options: InboxTapServerOptions = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    this.apiHost = config.apiHost;
    this.apiPort = config.apiPort;
    this.domain = config.domain.toLowerCase();
    this.maxMessageSize = config.maxMessageSize;
    this.smtpHost = config.smtpHost;
    this.smtpPort = config.smtpPort;
    this.store = new EmailStore(config.maxMessages);
    this.#smtpServer = createSmtpServer({
      maxMessageSize: config.maxMessageSize,
      onEmail: (email) => this.store.add(email),
    });
    this.#apiServer = createServer(
      createApiHandler({ health: () => this.health(), store: this.store }),
    );
  }

  get apiUrl(): string {
    return `http://${this.apiHost}:${this.apiPort}`;
  }

  async start(): Promise<this> {
    if (this.#started) return this;
    try {
      await listenSmtp(this.#smtpServer, this.smtpPort, this.smtpHost);
      this.smtpPort = readPort(this.#smtpServer.server.address());
      await listenHttp(this.#apiServer, this.apiPort, this.apiHost);
      this.apiPort = readPort(this.#apiServer.address());
      this.#started = true;
      return this;
    } catch (error) {
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    await Promise.all([closeSmtp(this.#smtpServer), closeHttp(this.#apiServer)]);
    this.#started = false;
  }

  health(): HealthResponse {
    return {
      ok: true,
      api: { host: this.apiHost, port: this.apiPort },
      smtp: { host: this.smtpHost, port: this.smtpPort },
      domain: this.domain,
    };
  }
}

function listenSmtp(server: SMTPServer, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function listenHttp(server: HttpServer, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function closeSmtp(server: SMTPServer): Promise<void> {
  return new Promise((resolve) => {
    if (!server.server.listening) return resolve();
    server.close(resolve);
  });
}

function closeHttp(server: HttpServer): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) return resolve();
    server.close(() => resolve());
  });
}

function readPort(address: string | AddressInfo | null): number {
  if (!address || typeof address === "string")
    throw new Error("Unable to determine the listening port");
  return address.port;
}
