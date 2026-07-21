import { randomBytes, randomInt } from "node:crypto";
import express from "express";
import type { Mailer } from "./mailer.js";

export interface AppOptions {
  mailer: Mailer;
  baseUrl: string;
}

interface User {
  email: string;
  verified: boolean;
}

export function createApp({ mailer, baseUrl }: AppOptions): express.Express {
  const users = new Map<string, User>();
  const verifyTokens = new Map<string, string>();
  const invites = new Map<string, string>();
  const otps = new Map<string, string>();

  const app = express();
  app.use(express.json());

  app.post("/signup", async (req, res) => {
    const email = readEmail(req.body);
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }
    users.set(email, { email, verified: false });
    const token = randomBytes(16).toString("hex");
    verifyTokens.set(token, email);
    await mailer.sendWelcomeEmail(email, `${baseUrl}/verify?token=${token}`);
    res.status(201).json({ email });
  });

  app.get("/verify", (req, res) => {
    const token = readString(req.query.token);
    const email = token ? verifyTokens.get(token) : undefined;
    if (!token || !email) {
      res.status(400).json({ error: "invalid or expired token" });
      return;
    }
    verifyTokens.delete(token);
    const user = users.get(email);
    if (user) user.verified = true;
    res.json({ email, verified: true });
  });

  app.get("/users/:email", (req, res) => {
    const user = users.get(req.params.email);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    res.json(user);
  });

  app.post("/invites", async (req, res) => {
    const email = readEmail(req.body);
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }
    const token = `invite_${randomBytes(6).toString("hex")}`;
    invites.set(token, email);
    await mailer.sendInviteEmail(email, token);
    res.status(201).json({ email });
  });

  app.post("/invites/accept", (req, res) => {
    const token = readString((req.body as Record<string, unknown>)?.token);
    const email = token ? invites.get(token) : undefined;
    if (!token || !email) {
      res.status(400).json({ error: "invalid or already used invite" });
      return;
    }
    invites.delete(token);
    res.json({ email, accepted: true });
  });

  app.post("/otp/request", async (req, res) => {
    const email = readEmail(req.body);
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    otps.set(email, code);
    await mailer.sendOtpEmail(email, code);
    res.json({ email });
  });

  app.post("/otp/verify", (req, res) => {
    const email = readEmail(req.body);
    const code = readString((req.body as Record<string, unknown>)?.code);
    if (!email || !code || otps.get(email) !== code) {
      res.status(401).json({ error: "invalid code" });
      return;
    }
    otps.delete(email);
    res.json({ email, verified: true });
  });

  return app;
}

function readEmail(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const email = (body as { email?: unknown }).email;
  return typeof email === "string" && email.includes("@") ? email : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
