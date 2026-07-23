import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { SMTPServer } from "smtp-server";
import { createApiHandler } from "./api.js";
import { createSmtpFaultControllerRuntime } from "./faults/index.js";
import type { SmtpFaultController, SmtpFaultRuntime } from "./faults/index.js";
import type { Listener } from "./listen.js";
import { closeListener, listenDualStack, listenOn, readPort } from "./listen.js";
import { createSmtpServer } from "./smtp.js";
import { EmailStore } from "./store.js";
import type { HealthResponse, InboxTapServerOptions } from "./types.js";

const DEFAULT_OPTIONS = {
  apiPort: 8025,
  domain: "local.test",
  maxMessages: 100,
  maxMessageSize: 5 * 1024 * 1024,
  smtpPort: 1025,
} as const;

export class InboxTapServer {
  apiHost: string;
  apiPort: number;
  readonly domain: string;
  readonly faults: SmtpFaultController;
  readonly maxMessageSize: number;
  readonly store: EmailStore;
  smtpHost: string;
  smtpPort: number;
  readonly #explicitApiHost?: string;
  readonly #explicitSmtpHost?: string;
  readonly #apiServers: HttpServer[];
  readonly #faultRuntime: SmtpFaultRuntime;
  readonly #smtpServers: SMTPServer[];
  #started = false;

  constructor(options: InboxTapServerOptions = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    this.#explicitApiHost = options.apiHost;
    this.#explicitSmtpHost = options.smtpHost;
    this.apiHost = options.apiHost ?? "localhost";
    this.apiPort = config.apiPort;
    this.domain = config.domain.toLowerCase();
    this.maxMessageSize = config.maxMessageSize;
    this.smtpHost = options.smtpHost ?? "localhost";
    this.smtpPort = config.smtpPort;
    this.store = new EmailStore(config.maxMessages);
    const faults = createSmtpFaultControllerRuntime();
    this.faults = faults.controller;
    this.#faultRuntime = faults.runtime;
    this.#smtpServers = createInstances(this.#explicitSmtpHost, () =>
      createSmtpServer({
        faults: this.#faultRuntime,
        maxMessageSize: config.maxMessageSize,
        onEmail: (email) => this.store.add(email),
      }),
    );
    const handler = createApiHandler({ health: () => this.health(), store: this.store });
    this.#apiServers = createInstances(this.#explicitApiHost, () => createServer(handler));
  }

  get apiUrl(): string {
    return `http://${this.apiHost}:${this.apiPort}`;
  }

  async start(): Promise<this> {
    if (this.#started) return this;
    try {
      const smtp = await bindGroup(
        this.#smtpServers.map(smtpListener),
        this.smtpPort,
        this.#explicitSmtpHost,
      );
      this.smtpHost = smtp.host;
      this.smtpPort = smtp.port;
      const api = await bindGroup(this.#apiServers, this.apiPort, this.#explicitApiHost);
      this.apiHost = api.host;
      this.apiPort = api.port;
      this.#started = true;
      return this;
    } catch (error) {
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    const listeners = [...this.#smtpServers.map(smtpListener), ...this.#apiServers];
    const closing = listeners.map(closeListener);
    this.#faultRuntime.shutdown();
    await Promise.all(closing);
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

interface BoundGroup {
  host: string;
  port: number;
}

function createInstances<T>(explicitHost: string | undefined, create: () => T): T[] {
  return Array.from({ length: explicitHost === undefined ? 2 : 1 }, create);
}

async function bindGroup(
  listeners: Listener[],
  port: number,
  explicitHost: string | undefined,
): Promise<BoundGroup> {
  const [ipv4, ipv6] = listeners;
  if (!ipv4) throw new Error("No listener configured");
  if (explicitHost !== undefined || !ipv6) {
    const host = explicitHost ?? "127.0.0.1";
    await listenOn(ipv4, port, host);
    return { host, port: readPort(ipv4) };
  }
  const bound = await listenDualStack(ipv4, ipv6, port);
  return { host: bound.hosts.includes("::1") ? "localhost" : "127.0.0.1", port: bound.port };
}

function smtpListener(server: SMTPServer): Listener {
  return {
    get listening() {
      return server.server.listening;
    },
    listen: (port, host, callback) => server.listen(port, host, callback),
    close: (callback) => server.close(callback),
    once: (event, listener) => server.once(event, listener),
    off: (event, listener) => server.off(event, listener),
    address: () => server.server.address(),
  };
}
