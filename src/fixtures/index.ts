import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { InboxTapClient } from "../client/index.js";
import type { CreateInboxOptions, TestInbox } from "../client/index.js";
import { InboxTapServer } from "../server.js";
import type { InboxTapServerOptions } from "../types.js";

export type InboxTapFixtureOptions = InboxTapServerOptions;

export interface InboxTapSmtpConfig {
  host: string;
  ignoreTLS: true;
  port: number;
  secure: false;
}

export interface InboxTapFixture {
  readonly server: InboxTapServer;
  readonly client: InboxTapClient;
  readonly transport: Transporter;
  readonly smtp: InboxTapSmtpConfig;
  createInbox(options?: CreateInboxOptions): Promise<TestInbox>;
  close(): Promise<void>;
}

export async function startInboxTapFixture(
  options: InboxTapFixtureOptions = {},
): Promise<InboxTapFixture> {
  const server = new InboxTapServer({
    ...options,
    apiPort: options.apiPort ?? 0,
    smtpPort: options.smtpPort ?? 0,
  });
  let transport: Transporter | undefined;

  try {
    await server.start();
    const smtp = {
      host: server.smtpHost,
      ignoreTLS: true,
      port: server.smtpPort,
      secure: false,
    } as const;
    const activeTransport = nodemailer.createTransport(smtp);
    transport = activeTransport;
    await activeTransport.verify();

    const client = new InboxTapClient({
      baseUrl: server.apiUrl,
      domain: server.domain,
    });
    await client.health();
    let closePromise: Promise<void> | undefined;
    const close = (): Promise<void> => {
      closePromise ??= (async () => {
        try {
          activeTransport.close();
        } finally {
          await server.stop();
        }
      })();
      return closePromise;
    };

    return {
      server,
      client,
      transport: activeTransport,
      smtp,
      createInbox: (createOptions) => client.createInbox(createOptions),
      close,
    };
  } catch (error) {
    try {
      transport?.close();
    } finally {
      await server.stop();
    }
    throw error;
  }
}
