import { evaluateDeliveredOnce, subjectFilterKind } from "./delivery.js";
import { requireCapturedEmail, requireTestInbox } from "./guards.js";
import type {
  DeliveredOnceMatcherObservation,
  InboxTapMatcherContext,
  InboxTapMatcherImplementations,
  InboxTapMatcherObservation,
  InboxTapMatcherOptions,
  InboxTapMatcherResult,
  LinkMatcherObservation,
  RecipientMatcherObservation,
  ToHaveDeliveredOnceOptions,
  ToHaveUnsubscribeHeaderOptions,
  UnsubscribeMatcherObservation,
} from "./types.js";
import { inspectUnsubscribeHeaders } from "./unsubscribe.js";

const OPTIONS_TYPE_ERROR = "InboxTap matcher options are invalid.";
const ADDRESS_TYPE_ERROR = "toHaveRecipient() expects a non-empty address string.";
const LINK_PATTERN_TYPE_ERROR = "toContainLink() expects a string or RegExp.";

export function createInboxTapMatchers(
  options: InboxTapMatcherOptions = {},
): InboxTapMatcherImplementations {
  const record = (observation: InboxTapMatcherObservation) =>
    options.recorder?.recordMatcherObservation(observation);

  return {
    async toHaveDeliveredOnce(
      this: InboxTapMatcherContext,
      received: unknown,
      matcherOptions: ToHaveDeliveredOnceOptions = {},
    ): Promise<InboxTapMatcherResult> {
      const inbox = requireTestInbox(received);
      const evaluation = await evaluateDeliveredOnce(inbox, matcherOptions);
      const negated = this.isNot === true;
      const observation: DeliveredOnceMatcherObservation = {
        ...observationBase("toHaveDeliveredOnce", negated, evaluation.pass),
        ...(evaluation.messageId ? { messageId: evaluation.messageId } : {}),
        details: {
          subjectFilter: subjectFilterKind(matcherOptions.subject),
          quietMs: matcherOptions.quietMs ?? 0,
          initialCount: evaluation.initialCount,
          ...(evaluation.finalCount === undefined ? {} : { finalCount: evaluation.finalCount }),
          additionalObserved: evaluation.additionalObserved,
        },
      };
      record(observation);
      return result(
        evaluation.pass,
        negated,
        `Expected inbox to contain exactly one matching delivery, but observed ${
          evaluation.finalCount ?? evaluation.initialCount
        }.`,
        "Expected inbox not to contain exactly one matching delivery.",
      );
    },

    toHaveRecipient(this: InboxTapMatcherContext, received: unknown, address: string) {
      const email = requireCapturedEmail(received);
      if (typeof address !== "string" || address.trim().length === 0)
        throw new TypeError(ADDRESS_TYPE_ERROR);
      const expectedAddress = address.trim().toLowerCase();
      const pass = email.envelope.to.some(
        (recipient) => recipient.trim().toLowerCase() === expectedAddress,
      );
      const negated = this.isNot === true;
      const observation: RecipientMatcherObservation = {
        ...observationBase("toHaveRecipient", negated, pass),
        messageId: email.id,
        details: { envelopeRecipientCount: email.envelope.to.length },
      };
      record(observation);
      const recipientCount = email.envelope.to.length;
      return result(
        pass,
        negated,
        `Expected captured email envelope to include the recipient; inspected ${recipientCount} envelope recipient(s).`,
        `Expected captured email envelope not to include the recipient; inspected ${recipientCount} envelope recipient(s).`,
      );
    },

    toContainLink(this: InboxTapMatcherContext, received: unknown, pattern: string | RegExp) {
      const email = requireCapturedEmail(received);
      if (
        (typeof pattern === "string" && pattern.trim().length === 0) ||
        (typeof pattern !== "string" && !(pattern instanceof RegExp))
      ) {
        throw new TypeError(LINK_PATTERN_TYPE_ERROR);
      }
      const pass = email.links.some((link) => matchesLink(link, pattern));
      const negated = this.isNot === true;
      const observation: LinkMatcherObservation = {
        ...observationBase("toContainLink", negated, pass),
        messageId: email.id,
        details: {
          patternKind: typeof pattern === "string" ? "string" : "regexp",
          linkCount: email.links.length,
        },
      };
      record(observation);
      const linkCount = email.links.length;
      return result(
        pass,
        negated,
        `Expected captured email to contain a matching link; inspected ${linkCount} link(s).`,
        `Expected captured email not to contain a matching link; inspected ${linkCount} link(s).`,
      );
    },

    toHaveUnsubscribeHeader(
      this: InboxTapMatcherContext,
      received: unknown,
      matcherOptions: ToHaveUnsubscribeHeaderOptions = {},
    ) {
      const email = requireCapturedEmail(received);
      const normalized = validateUnsubscribeOptions(matcherOptions);
      const state = inspectUnsubscribeHeaders(email.raw);
      const pass =
        state.hasListUnsubscribe &&
        (!normalized.oneClick || (state.hasHttpsTarget && state.hasOneClickPost));
      const negated = this.isNot === true;
      const observation: UnsubscribeMatcherObservation = {
        ...observationBase("toHaveUnsubscribeHeader", negated, pass),
        messageId: email.id,
        details: { oneClickRequired: normalized.oneClick, ...state },
      };
      record(observation);
      const stateSummary = [
        `List-Unsubscribe present: ${yesNo(state.hasListUnsubscribe)}`,
        `HTTPS target present: ${yesNo(state.hasHttpsTarget)}`,
        `one-click Post present: ${yesNo(state.hasOneClickPost)}`,
      ].join("; ");
      return result(
        pass,
        negated,
        normalized.oneClick
          ? `Expected captured email to contain valid one-click unsubscribe headers; ${stateSummary}.`
          : `Expected captured email to contain a List-Unsubscribe header; ${stateSummary}.`,
        normalized.oneClick
          ? `Expected captured email not to contain valid one-click unsubscribe headers; ${stateSummary}.`
          : `Expected captured email not to contain a List-Unsubscribe header; ${stateSummary}.`,
      );
    },
  };
}

export const inboxTapMatchers: InboxTapMatcherImplementations = createInboxTapMatchers();

export type {
  DeliveredOnceMatcherObservation,
  InboxTapMatcherContext,
  InboxTapMatcherImplementation,
  InboxTapMatcherImplementations,
  InboxTapMatcherName,
  InboxTapMatcherObservation,
  InboxTapMatcherOptions,
  InboxTapMatcherRecorder,
  InboxTapMatcherResult,
  LinkMatcherObservation,
  RecipientMatcherObservation,
  ToHaveDeliveredOnceOptions,
  ToHaveUnsubscribeHeaderOptions,
  UnsubscribeMatcherObservation,
} from "./types.js";

function observationBase<Name extends InboxTapMatcherObservation["matcher"]>(
  matcher: Name,
  negated: boolean,
  predicatePassed: boolean,
) {
  return {
    schemaVersion: 1 as const,
    kind: "matcher" as const,
    matcher,
    negated,
    predicatePassed,
    assertionPassed: negated ? !predicatePassed : predicatePassed,
  };
}

function result(
  pass: boolean,
  negated: boolean,
  positiveFailure: string,
  negativeFailure: string,
): InboxTapMatcherResult {
  return { pass, message: () => (negated ? negativeFailure : positiveFailure) };
}

function matchesLink(link: string, pattern: string | RegExp): boolean {
  return typeof pattern === "string" ? link.includes(pattern) : cloneRegex(pattern).test(link);
}

function cloneRegex(pattern: RegExp): RegExp {
  return new RegExp(pattern.source, pattern.flags);
}

function yesNo(value: boolean): "yes" | "no" {
  return value ? "yes" : "no";
}

function validateUnsubscribeOptions(options: ToHaveUnsubscribeHeaderOptions) {
  if (
    !isOptionsObject(options) ||
    (options.oneClick !== undefined && typeof options.oneClick !== "boolean")
  ) {
    throw new TypeError(OPTIONS_TYPE_ERROR);
  }
  return { oneClick: options.oneClick ?? false };
}

function isOptionsObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
