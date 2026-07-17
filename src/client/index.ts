import { randomUUID } from "node:crypto";
import type { CapturedEmail, EmailFilters, HealthResponse } from "../types.js";

export interface InboxTapClientOptions {
  baseUrl?: string;
  domain?: string;
}

export interface CreateInboxOptions {
  alias?: string;
}

export interface WaitForMessageOptions {
  subject?: string | RegExp;
  timeoutMs?: number;
  afterId?: string;
}

export class InboxTapClient {
  readonly baseUrl: string;
  #domain?: string;

  constructor(options: InboxTapClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://127.0.0.1:8025").replace(/\/$/, "");
    this.#domain = options.domain;
  }

  async health(): Promise<HealthResponse> {
    const health = await this.request<HealthResponse>("/health");
    this.#domain = health.domain;
    return health;
  }

  async createInbox(options: CreateInboxOptions = {}): Promise<TestInbox> {
    const domain = this.#domain ?? (await this.health()).domain;
    const alias = normalizeAlias(options.alias ?? "test");
    const address = `${alias}-${randomUUID().slice(0, 12)}@${domain}`;
    return new TestInbox(this, address);
  }

  async listEmails(filters: EmailFilters = {}): Promise<CapturedEmail[]> {
    return (await this.request<{ emails: CapturedEmail[] }>(`/api/emails?${toQuery(filters)}`))
      .emails;
  }

  async latestEmail(filters: EmailFilters = {}): Promise<CapturedEmail> {
    return (await this.request<{ email: CapturedEmail }>(`/api/emails/latest?${toQuery(filters)}`))
      .email;
  }

  async waitForEmail(options: EmailWaitQuery): Promise<CapturedEmail> {
    return (await this.request<{ email: CapturedEmail }>(`/api/emails/wait?${toQuery(options)}`))
      .email;
  }

  async clearEmails(to?: string): Promise<number> {
    const query = to ? `?${toQuery({ to })}` : "";
    return (await this.request<{ deleted: number }>(`/api/emails${query}`, { method: "DELETE" }))
      .deleted;
  }

  async request<Response>(path: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const payload = (await response.json()) as Response & { error?: string };
    if (!response.ok) {
      throw new InboxTapError(
        payload.error ?? `InboxTap request failed (${response.status})`,
        response.status,
      );
    }
    return payload;
  }
}

export class TestInbox {
  constructor(
    private readonly client: InboxTapClient,
    readonly address: string,
  ) {}

  messages(): Promise<CapturedEmail[]> {
    return this.client.listEmails({ to: this.address });
  }

  clear(): Promise<number> {
    return this.client.clearEmails(this.address);
  }

  waitForMessage(options: WaitForMessageOptions = {}): Promise<CapturedEmail> {
    return this.client.waitForEmail({ ...options, to: this.address });
  }

  async waitForLink(options: WaitForLinkOptions = {}): Promise<string> {
    return this.waitForValue({
      ...options,
      description: "a link",
      find: (email) =>
        email.links.find((link) => !options.contains || link.includes(options.contains)),
    });
  }

  async waitForCode(options: WaitForCodeOptions = {}): Promise<string> {
    const pattern = options.pattern ?? /\b\d{6}\b/;
    return this.waitForValue({
      ...options,
      description: "a code",
      find: (email) => matchText(email, pattern),
    });
  }

  async waitForMatch(options: WaitForMatchOptions): Promise<string> {
    return this.waitForValue({
      ...options,
      description: `a match for ${options.pattern}`,
      find: (email) => matchText(email, options.pattern),
    });
  }

  private async waitForValue(options: InternalWaitOptions): Promise<string> {
    const timeoutMs = options.timeoutMs ?? 10_000;
    const deadline = Date.now() + timeoutMs;
    const existing = await this.messages();
    let afterId: string | undefined;
    for (const email of existing) {
      afterId = email.id;
      if (!matchesSubject(email, options.subject)) continue;
      const value = options.find(email);
      if (value) return value;
    }

    while (Date.now() < deadline) {
      const remaining = Math.max(1, deadline - Date.now());
      let email: CapturedEmail;
      try {
        email = await this.waitForMessage({
          afterId,
          subject: options.subject,
          timeoutMs: remaining,
        });
      } catch (error) {
        if (error instanceof InboxTapError && error.status === 408) break;
        throw error;
      }
      afterId = email.id;
      const value = options.find(email);
      if (value) return value;
    }

    throw new InboxTapError(`Timed out waiting for ${options.description} in ${this.address}`, 408);
  }
}

export class InboxTapError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "InboxTapError";
  }
}

export interface WaitForLinkOptions extends WaitForMessageOptions {
  contains?: string;
}

export interface WaitForCodeOptions extends WaitForMessageOptions {
  pattern?: RegExp | string;
}

export interface WaitForMatchOptions extends WaitForMessageOptions {
  pattern: RegExp | string;
}

interface InternalWaitOptions extends WaitForMessageOptions {
  description: string;
  find: (email: CapturedEmail) => string | undefined;
}

type EmailWaitQuery = Omit<EmailFilters, "subject"> & WaitForMessageOptions;

function toQuery(options: EmailWaitQuery): string {
  const query = new URLSearchParams();
  if (options.to) query.set("to", options.to);
  if (typeof options.subject === "string") query.set("subject", options.subject);
  if (options.subject instanceof RegExp) {
    query.set("subjectPattern", options.subject.source);
    query.set("subjectFlags", options.subject.flags);
  }
  if (options.afterId) query.set("afterId", options.afterId);
  if (options.limit) query.set("limit", String(options.limit));
  if (options.timeoutMs) query.set("timeoutMs", String(options.timeoutMs));
  return query.toString();
}

function normalizeAlias(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "test"
  );
}

function matchText(email: CapturedEmail, pattern: RegExp | string): string | undefined {
  const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
  regex.lastIndex = 0;
  return `${email.text}\n${email.html}`.match(regex)?.[0];
}

function matchesSubject(email: CapturedEmail, subject: string | RegExp | undefined): boolean {
  if (!subject) return true;
  if (typeof subject === "string")
    return email.subject.toLowerCase().includes(subject.toLowerCase());
  subject.lastIndex = 0;
  return subject.test(email.subject);
}
