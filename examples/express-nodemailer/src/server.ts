import { createApp } from "./app.js";
import { createMailer } from "./mailer.js";

const smtpHost = process.env.SMTP_HOST ?? "127.0.0.1";
const smtpPort = Number(process.env.SMTP_PORT ?? 1025);
const port = Number(process.env.PORT ?? 3001);

const mailer = createMailer({ host: smtpHost, port: smtpPort });
const app = createApp({ mailer, baseUrl: `http://localhost:${port}` });

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port} (SMTP at ${smtpHost}:${smtpPort})`);
});
