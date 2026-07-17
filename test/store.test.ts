import { expect, test } from "bun:test";
import { EmailStore } from "../src/store.js";
import type { CapturedEmail } from "../src/types.js";

test("retains the newest bounded set and filters by recipient", () => {
  const store = new EmailStore(2);
  store.add(email("one", "one@example.test"));
  store.add(email("two", "two@example.test"));
  store.add(email("three", "two@example.test"));

  expect(store.list().map((message) => message.id)).toEqual(["two", "three"]);
  expect(store.list({ to: "TWO@example.test" }).map((message) => message.id)).toEqual([
    "two",
    "three",
  ]);
  expect(store.latest({ afterId: "two" })?.id).toBe("three");
  expect(store.clear("two@example.test")).toBe(2);
  expect(store.list()).toEqual([]);
});

test("resolves matching waits and times out unmatched waits", async () => {
  const store = new EmailStore();
  const wait = store.waitFor({ to: "target@example.test" }, 100);
  store.add(email("target", "target@example.test"));

  expect((await wait)?.id).toBe("target");
  expect(await store.waitFor({ to: "missing@example.test" }, 10)).toBeUndefined();
});

function email(id: string, to: string): CapturedEmail {
  return {
    id,
    receivedAt: "2026-01-01T00:00:00.000Z",
    envelope: { from: "sender@example.test", to: [to] },
    from: "sender@example.test",
    to: [to],
    subject: `Email ${id}`,
    headers: {},
    text: "",
    html: "",
    links: [],
    codes: [],
    raw: "",
  };
}
