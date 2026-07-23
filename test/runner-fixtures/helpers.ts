import { appendFile, writeFile } from "node:fs/promises";
import type { InboxTapFixture } from "../../src/fixtures/index.js";
import type { InboxTapServer } from "../../src/server.js";

const instrumentedServers = new WeakSet<InboxTapServer>();

export function instrumentTeardown(inboxTap: InboxTapFixture): void {
  const outputPath = process.env.INBOXTAP_RUNNER_TEARDOWN;
  const server = inboxTap.server;
  if (!outputPath || instrumentedServers.has(server)) return;

  instrumentedServers.add(server);
  const stop = server.stop.bind(server);
  server.stop = async () => {
    try {
      await stop();
    } finally {
      await appendFile(outputPath, "stopped\n", "utf8");
    }
  };
}

export async function recordPorts(apiPort: number, smtpPort: number): Promise<void> {
  const outputPath = process.env.INBOXTAP_RUNNER_PORTS;
  if (!outputPath) return;
  await writeFile(outputPath, JSON.stringify({ apiPort, smtpPort }), "utf8");
}
