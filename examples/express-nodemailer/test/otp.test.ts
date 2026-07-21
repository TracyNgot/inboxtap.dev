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

describe("one-time codes", () => {
  it("rejects a wrong code and accepts the emailed one", async () => {
    const inbox = await stack.inboxTap.createInbox({ alias: "otp" });
    await postJson(`${stack.baseUrl}/otp/request`, { email: inbox.address });

    const code = await inbox.waitForCode();
    const wrongCode = code === "000000" ? "000001" : "000000";

    const wrong = await postJson(`${stack.baseUrl}/otp/verify`, {
      email: inbox.address,
      code: wrongCode,
    });
    expect(wrong.status).toBe(401);

    const right = await postJson(`${stack.baseUrl}/otp/verify`, { email: inbox.address, code });
    expect(right.status).toBe(200);
    expect(await right.json()).toEqual({ email: inbox.address, verified: true });
  });

  it("keeps inboxes isolated and clears captured mail", async () => {
    const inboxA = await stack.inboxTap.createInbox({ alias: "otp-a" });
    const inboxB = await stack.inboxTap.createInbox({ alias: "otp-b" });

    await postJson(`${stack.baseUrl}/otp/request`, { email: inboxA.address });
    await inboxA.waitForCode();

    expect(await inboxB.messages()).toHaveLength(0);

    expect(await inboxA.clear()).toBe(1);
    expect(await inboxA.messages()).toHaveLength(0);
  });
});
