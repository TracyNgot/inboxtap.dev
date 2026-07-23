// biome-ignore syntax/correctness/noTypeOnlyImportAttributes: CJS declarations need ESM type resolution.
import type { ExpectStatic } from "vitest" with { "resolution-mode": "import" };
import type {
  InboxTapMatcherOptions,
  ToHaveDeliveredOnceOptions,
  ToHaveUnsubscribeHeaderOptions,
} from "./index.js";
import { createInboxTapMatchers } from "./index.js";

declare module "vitest" {
  // biome-ignore lint/suspicious/noExplicitAny: Must match Vitest's declaration exactly.
  interface Matchers<T = any> {
    toHaveDeliveredOnce(options?: ToHaveDeliveredOnceOptions): Promise<void>;
    toHaveRecipient(address: string): void;
    toContainLink(pattern: string | RegExp): void;
    toHaveUnsubscribeHeader(options?: ToHaveUnsubscribeHeaderOptions): void;
  }
}

export function extendInboxTapExpect(
  baseExpect: ExpectStatic,
  options: InboxTapMatcherOptions = {},
): void {
  baseExpect.extend({ ...createInboxTapMatchers(options) });
}
