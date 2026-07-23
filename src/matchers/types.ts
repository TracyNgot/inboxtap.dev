export interface ToHaveDeliveredOnceOptions {
  subject?: string | RegExp;
  quietMs?: number;
}

export interface ToHaveUnsubscribeHeaderOptions {
  oneClick?: boolean;
}

export interface InboxTapMatcherOptions {
  recorder?: InboxTapMatcherRecorder;
}

export interface InboxTapMatcherContext {
  readonly isNot: boolean;
}

export interface InboxTapMatcherResult {
  pass: boolean;
  message(): string;
}

export type InboxTapMatcherName =
  | "toHaveDeliveredOnce"
  | "toHaveRecipient"
  | "toContainLink"
  | "toHaveUnsubscribeHeader";

interface MatcherObservationBase<Name extends InboxTapMatcherName> {
  readonly schemaVersion: 1;
  readonly kind: "matcher";
  readonly matcher: Name;
  readonly negated: boolean;
  readonly predicatePassed: boolean;
  readonly assertionPassed: boolean;
  readonly messageId?: string;
}

export interface DeliveredOnceMatcherObservation
  extends MatcherObservationBase<"toHaveDeliveredOnce"> {
  readonly details: {
    readonly subjectFilter: "none" | "string" | "regexp";
    readonly quietMs: number;
    readonly initialCount: number;
    readonly finalCount?: number;
    readonly additionalObserved: boolean;
  };
}

export interface RecipientMatcherObservation extends MatcherObservationBase<"toHaveRecipient"> {
  readonly details: {
    readonly envelopeRecipientCount: number;
  };
}

export interface LinkMatcherObservation extends MatcherObservationBase<"toContainLink"> {
  readonly details: {
    readonly patternKind: "string" | "regexp";
    readonly linkCount: number;
  };
}

export interface UnsubscribeMatcherObservation
  extends MatcherObservationBase<"toHaveUnsubscribeHeader"> {
  readonly details: {
    readonly oneClickRequired: boolean;
    readonly hasListUnsubscribe: boolean;
    readonly hasHttpsTarget: boolean;
    readonly hasOneClickPost: boolean;
  };
}

export type InboxTapMatcherObservation =
  | DeliveredOnceMatcherObservation
  | RecipientMatcherObservation
  | LinkMatcherObservation
  | UnsubscribeMatcherObservation;

export interface InboxTapMatcherRecorder {
  recordMatcherObservation(observation: InboxTapMatcherObservation): void;
}

export type InboxTapMatcherImplementation<
  Arguments extends unknown[] = unknown[],
  Result extends InboxTapMatcherResult | Promise<InboxTapMatcherResult> = InboxTapMatcherResult,
> = (this: InboxTapMatcherContext, received: unknown, ...arguments_: Arguments) => Result;

export interface InboxTapMatcherImplementations {
  toHaveDeliveredOnce: InboxTapMatcherImplementation<
    [options?: ToHaveDeliveredOnceOptions],
    Promise<InboxTapMatcherResult>
  >;
  toHaveRecipient: InboxTapMatcherImplementation<[address: string]>;
  toContainLink: InboxTapMatcherImplementation<[pattern: string | RegExp]>;
  toHaveUnsubscribeHeader: InboxTapMatcherImplementation<
    [options?: ToHaveUnsubscribeHeaderOptions]
  >;
}
