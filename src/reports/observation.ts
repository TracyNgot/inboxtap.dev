import type { InboxTapMatcherObservation } from "../matchers/index.js";
import type { InboxTapReportAssertion } from "./types.js";

export function projectMatcherObservationDetails(
  observation: InboxTapMatcherObservation,
): InboxTapReportAssertion["details"] {
  const details = observation.details as Record<string, unknown>;
  switch (observation.matcher) {
    case "toHaveDeliveredOnce": {
      requireEnum(details.subjectFilter, ["none", "string", "regexp"]);
      requireInteger(details.quietMs, 0, 60_000);
      requireInteger(details.initialCount, 0);
      if (details.finalCount !== undefined) requireInteger(details.finalCount, 0);
      requireBoolean(details.additionalObserved);
      return {
        additionalObserved: details.additionalObserved,
        ...(details.finalCount === undefined ? {} : { finalCount: details.finalCount }),
        initialCount: details.initialCount,
        quietMs: details.quietMs,
        subjectFilter: details.subjectFilter,
      };
    }
    case "toHaveRecipient":
      requireInteger(details.envelopeRecipientCount, 0);
      return { envelopeRecipientCount: details.envelopeRecipientCount };
    case "toContainLink":
      requireEnum(details.patternKind, ["string", "regexp"]);
      requireInteger(details.linkCount, 0);
      return { linkCount: details.linkCount, patternKind: details.patternKind };
    case "toHaveUnsubscribeHeader":
      requireBoolean(details.oneClickRequired);
      requireBoolean(details.hasListUnsubscribe);
      requireBoolean(details.hasHttpsTarget);
      requireBoolean(details.hasOneClickPost);
      return {
        hasHttpsTarget: details.hasHttpsTarget,
        hasListUnsubscribe: details.hasListUnsubscribe,
        hasOneClickPost: details.hasOneClickPost,
        oneClickRequired: details.oneClickRequired,
      };
  }
}

export function requireMatcherObservation(
  value: unknown,
): asserts value is InboxTapMatcherObservation {
  if (!isObject(value) || value.schemaVersion !== 1 || value.kind !== "matcher")
    throw new TypeError("InboxTap matcher observation is invalid.");
  if (
    typeof value.matcher !== "string" ||
    ![
      "toHaveDeliveredOnce",
      "toHaveRecipient",
      "toContainLink",
      "toHaveUnsubscribeHeader",
    ].includes(value.matcher)
  )
    throw new TypeError("InboxTap matcher observation is invalid.");
  requireBoolean(value.negated);
  requireBoolean(value.predicatePassed);
  requireBoolean(value.assertionPassed);
  if (value.assertionPassed !== (value.negated ? !value.predicatePassed : value.predicatePassed))
    throw new TypeError("InboxTap matcher observation pass state is inconsistent.");
  validateMessageId(value.messageId);
  if (!isObject(value.details))
    throw new TypeError("InboxTap matcher observation details are invalid.");
}

function validateMessageId(value: unknown): void {
  if (value === undefined) return;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 1_024)
    throw new TypeError("InboxTap matcher observation message ID is invalid.");
}

function requireBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== "boolean")
    throw new TypeError("InboxTap matcher observation details are invalid.");
}

function requireInteger(
  value: unknown,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum)
    throw new TypeError("InboxTap matcher observation details are invalid.");
}

function requireEnum<const Value extends string>(
  value: unknown,
  allowed: readonly Value[],
): asserts value is Value {
  if (typeof value !== "string" || !allowed.includes(value as Value))
    throw new TypeError("InboxTap matcher observation details are invalid.");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
