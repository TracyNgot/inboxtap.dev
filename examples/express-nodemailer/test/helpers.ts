import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { InboxTapServer } from "inboxtap";
import { InboxTapClient } from "inboxtap/client";
import { createApp } from "../src/app.js";
import { createMailer } from "../src/mailer.js";

export interface Stack {
  inboxTap: InboxTapClient;
  baseUrl: string;
  stop(): Promise<void>;
}

export async function startStack(): Promise<Stack> {
  const inboxTapServer = await new InboxTapServer({ apiPort: 0, smtpPort: 0 }).start();
  const inboxTap = new InboxTapClient({
    baseUrl: inboxTapServer.apiUrl,
    domain: inboxTapServer.domain,
  });
  const mailer = createMailer({
    host: inboxTapServer.smtpHost,
    port: inboxTapServer.smtpPort,
  });

  // Bind first so the app can embed its own ephemeral port in verification links.
  const httpServer = createServer();
  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", resolve);
  });
  const { port } = httpServer.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;
  httpServer.on("request", createApp({ mailer, baseUrl }));

  return {
    inboxTap,
    baseUrl,
    stop: async () => {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
        httpServer.closeAllConnections();
      });
      await inboxTapServer.stop();
    },
  };
}

export function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
