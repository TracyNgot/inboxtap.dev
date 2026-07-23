import type { Expect } from "bun:test";
import type {
  InboxTapMatcherOptions,
  ToHaveDeliveredOnceOptions,
  ToHaveUnsubscribeHeaderOptions,
} from "./index.js";
import { createInboxTapMatchers } from "./index.js";

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toHaveDeliveredOnce(options?: ToHaveDeliveredOnceOptions): Promise<void>;
    toHaveRecipient(address: string): void;
    toContainLink(pattern: string | RegExp): void;
    toHaveUnsubscribeHeader(options?: ToHaveUnsubscribeHeaderOptions): void;
  }
}

export function extendInboxTapExpect(
  baseExpect: Expect,
  options: InboxTapMatcherOptions = {},
): void {
  baseExpect.extend(createInboxTapMatchers(options));
}
