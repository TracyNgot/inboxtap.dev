import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";
import { FakeMailProvider, type MailMessage, VirtualClock } from "../src/mail-provider";

const test = extendInboxTap(base);
const startTime = new Date("2030-01-15T09:00:00.000Z");

function message(to: string, subject: string): MailMessage {
  return {
    from: "app@local.test",
    subject,
    text: `${subject} body`,
    to,
  };
}

test("sends immediate mail but keeps future mail pending", async ({ inbox, inboxTap }) => {
  const clock = new VirtualClock(startTime);
  const provider = new FakeMailProvider({
    clock,
    deliver: (mail) => inboxTap.transport.sendMail(mail),
  });

  await provider.send(message(inbox.address, "Immediate receipt"));
  expect(() => provider.schedule(message(inbox.address, "Past receipt"), startTime)).toThrow(
    "scheduledAt must be later than the current virtual time; use send() for immediate mail",
  );
  provider.schedule(message(inbox.address, "Future receipt"), new Date("2030-01-15T09:05:00.000Z"));
  await clock.advanceTo(new Date("2030-01-15T09:04:59.999Z"));

  expect((await inbox.messages()).map((email) => email.subject)).toEqual(["Immediate receipt"]);
  expect(provider.pendingCount).toBe(1);
});

test("delivers mail at its due time exactly once", async ({ inbox, inboxTap }) => {
  const clock = new VirtualClock(startTime);
  const provider = new FakeMailProvider({
    clock,
    deliver: (mail) => inboxTap.transport.sendMail(mail),
  });

  const id = provider.schedule(
    message(inbox.address, "Due receipt"),
    new Date("2030-01-15T09:05:00.000Z"),
  );
  await clock.advanceTo(new Date("2030-01-15T09:05:00.000Z"));
  expect(provider.cancel(id)).toBe(false);
  await clock.advanceBy(86_400_000);

  expect((await inbox.messages()).map((email) => email.subject)).toEqual(["Due receipt"]);
  expect(provider.pendingCount).toBe(0);
});

test("cancels scheduled mail before delivery", async ({ inbox, inboxTap }) => {
  const clock = new VirtualClock(startTime);
  const provider = new FakeMailProvider({
    clock,
    deliver: (mail) => inboxTap.transport.sendMail(mail),
  });

  const id = provider.schedule(
    message(inbox.address, "Cancelled receipt"),
    new Date("2030-01-15T09:05:00.000Z"),
  );
  expect(provider.cancel(id)).toBe(true);
  expect(provider.cancel(id)).toBe(false);
  await clock.advanceTo(new Date("2030-01-15T10:00:00.000Z"));

  expect(await inbox.messages()).toEqual([]);
});

test("orders due mail by time and then insertion", async ({ inbox, inboxTap }) => {
  const clock = new VirtualClock(startTime);
  const provider = new FakeMailProvider({
    clock,
    deliver: (mail) => inboxTap.transport.sendMail(mail),
  });

  provider.schedule(message(inbox.address, "Third"), new Date("2030-01-15T09:02:00.000Z"));
  provider.schedule(message(inbox.address, "First"), new Date("2030-01-15T09:01:00.000Z"));
  provider.schedule(message(inbox.address, "Second"), new Date("2030-01-15T09:01:00.000Z"));
  await clock.advanceTo(new Date("2030-01-15T09:02:00.000Z"));

  expect((await inbox.messages()).map((email) => email.subject)).toEqual([
    "First",
    "Second",
    "Third",
  ]);
});

test("bounds the pending schedule and frees capacity after cancellation", async ({
  inbox,
  inboxTap,
}) => {
  const clock = new VirtualClock(startTime);
  const provider = new FakeMailProvider({
    clock,
    deliver: (mail) => inboxTap.transport.sendMail(mail),
    maxScheduled: 2,
  });
  const dueAt = new Date("2030-01-15T09:05:00.000Z");

  const first = provider.schedule(message(inbox.address, "First"), dueAt);
  provider.schedule(message(inbox.address, "Second"), dueAt);
  expect(() => provider.schedule(message(inbox.address, "Overflow"), dueAt)).toThrow(
    "Scheduled mail limit of 2 reached",
  );

  expect(provider.cancel(first)).toBe(true);
  expect(() => provider.schedule(message(inbox.address, "Replacement"), dueAt)).not.toThrow();
  expect(provider.pendingCount).toBe(2);
});
