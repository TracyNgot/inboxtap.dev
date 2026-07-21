import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Stack } from "./helpers.js";
import { postJson, startStack } from "./helpers.js";

let stack: Stack;

beforeAll(async () => {
  stack = await startStack();
});

afterAll(async () => {
  await stack.stop();
});

describe("signup verification", () => {
  it("verifies a new user through the emailed link", async () => {
    const inbox = await stack.inboxTap.createInbox({ alias: "signup" });

    const signup = await postJson(`${stack.baseUrl}/signup`, { email: inbox.address });
    expect(signup.status).toBe(201);

    const link = await inbox.waitForLink({ subject: /welcome/i, contains: "/verify?token=" });
    const verify = await fetch(link);
    expect(verify.status).toBe(200);

    const user = await fetch(`${stack.baseUrl}/users/${encodeURIComponent(inbox.address)}`);
    expect(user.status).toBe(200);
    expect(await user.json()).toEqual({ email: inbox.address, verified: true });
  });

  it("captures the welcome email with recipients, html, and links", async () => {
    const inbox = await stack.inboxTap.createInbox({ alias: "signup-shape" });
    await postJson(`${stack.baseUrl}/signup`, { email: inbox.address });

    const email = await inbox.waitForMessage({ subject: /welcome/i });
    expect(email.to).toEqual([inbox.address]);
    expect(email.from).toContain("no-reply@example.test");
    expect(email.html).toContain("<a href=");
    expect(email.links).toHaveLength(1);
    expect(email.links[0]).toContain("/verify?token=");
  });
});
