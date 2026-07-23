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

describe("invites", () => {
  it("accepts an emailed invite token exactly once", async () => {
    const inbox = await stack.inboxTap.createInbox({ alias: "invite" });

    const invite = await postJson(`${stack.baseUrl}/invites`, { email: inbox.address });
    expect(invite.status).toBe(201);
    await expect(inbox).toHaveDeliveredOnce({ subject: "invited" });

    const token = await inbox.waitForMatch({ pattern: /invite_[a-f0-9]{12}/ });

    const first = await postJson(`${stack.baseUrl}/invites/accept`, { token });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ email: inbox.address, accepted: true });

    const second = await postJson(`${stack.baseUrl}/invites/accept`, { token });
    expect(second.status).toBe(400);
  });
});
