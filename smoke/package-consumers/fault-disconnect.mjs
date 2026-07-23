import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { InboxTapServer } from "inboxtap";

const server = await new InboxTapServer({
  apiHost: "127.0.0.1",
  apiPort: 0,
  smtpHost: "127.0.0.1",
  smtpPort: 0,
}).start();
const transport = nodemailer.createTransport({
  connectionTimeout: 2_000,
  host: server.smtpHost,
  ignoreTLS: true,
  port: server.smtpPort,
  secure: false,
  socketTimeout: 2_000,
});

try {
  server.faults.disconnectNext({ afterBytes: 0 });
  await assert.rejects(
    transport.sendMail({
      from: "sender@example.test",
      subject: "Disconnected",
      text: "This message must not be captured.",
      to: "node-smoke@example.test",
    }),
  );

  await transport.sendMail({
    from: "sender@example.test",
    subject: "Recovered",
    text: "This message should be captured.",
    to: "node-smoke@example.test",
  });

  const response = await fetch(
    `${server.apiUrl}/api/emails?to=${encodeURIComponent("node-smoke@example.test")}`,
  );
  const body = await response.json();
  assert.deepEqual(
    body.emails.map(({ subject }) => subject),
    ["Recovered"],
  );
} finally {
  transport.close();
  await server.stop();
}
