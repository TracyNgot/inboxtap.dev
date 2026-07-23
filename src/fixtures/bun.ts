import { afterAll, beforeAll } from "bun:test";
import type { CreateInboxOptions, TestInbox } from "../client/index.js";
import type { InboxTapFixture, InboxTapFixtureOptions, InboxTapSmtpConfig } from "./index.js";
import { startInboxTapFixture } from "./index.js";

export type BunInboxTapFixture = InboxTapFixture;

export function setupInboxTap(options: InboxTapFixtureOptions = {}): BunInboxTapFixture {
  let fixture: InboxTapFixture | undefined;

  const activeFixture = (): InboxTapFixture => {
    if (!fixture) {
      throw new Error("InboxTap is available only after the Bun beforeAll hook has completed");
    }
    return fixture;
  };

  beforeAll(async () => {
    fixture = await startInboxTapFixture(options);
  });

  afterAll(async () => {
    const active = fixture;
    fixture = undefined;
    await active?.close();
  });

  return {
    get server() {
      return activeFixture().server;
    },
    get client() {
      return activeFixture().client;
    },
    get transport() {
      return activeFixture().transport;
    },
    get smtp(): InboxTapSmtpConfig {
      return activeFixture().smtp;
    },
    createInbox(createOptions?: CreateInboxOptions): Promise<TestInbox> {
      return activeFixture().createInbox(createOptions);
    },
    close(): Promise<void> {
      return fixture?.close() ?? Promise.resolve();
    },
  };
}
