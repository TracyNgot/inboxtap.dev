import type { Expect } from "@playwright/test";
import type { TestInbox } from "../client/index.js";
import type { CapturedEmail } from "../types.js";
import type {
  InboxTapMatcherContext,
  InboxTapMatcherOptions,
  InboxTapMatcherResult,
  ToHaveDeliveredOnceOptions,
  ToHaveUnsubscribeHeaderOptions,
} from "./index.js";
import { createInboxTapMatchers } from "./index.js";

type InboxTapPlaywrightMatchers = {
  toHaveDeliveredOnce(
    this: InboxTapMatcherContext,
    received: TestInbox,
    options?: ToHaveDeliveredOnceOptions,
  ): Promise<InboxTapMatcherResult>;
  toHaveRecipient(
    this: InboxTapMatcherContext,
    received: CapturedEmail,
    address: string,
  ): InboxTapMatcherResult;
  toContainLink(
    this: InboxTapMatcherContext,
    received: CapturedEmail,
    pattern: string | RegExp,
  ): InboxTapMatcherResult;
  toHaveUnsubscribeHeader(
    this: InboxTapMatcherContext,
    received: CapturedEmail,
    options?: ToHaveUnsubscribeHeaderOptions,
  ): InboxTapMatcherResult;
};

export function extendInboxTapExpect<ExtendedMatchers extends object>(
  baseExpect: Expect<ExtendedMatchers>,
  options: InboxTapMatcherOptions = {},
): Expect<ExtendedMatchers & InboxTapPlaywrightMatchers> {
  const matchers: InboxTapPlaywrightMatchers = createInboxTapMatchers(options);
  return baseExpect.extend(matchers);
}
