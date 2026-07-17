import type { CapturedEmail, EmailSearch } from "./types.js";

interface Waiter {
  filters: EmailSearch;
  resolve: (email: CapturedEmail | undefined) => void;
  timeout: Timer;
}

export class EmailStore {
  readonly maxMessages: number;
  #messages: CapturedEmail[] = [];
  #waiters = new Set<Waiter>();

  constructor(maxMessages = 100) {
    this.maxMessages = maxMessages;
  }

  add(email: CapturedEmail): void {
    this.#messages.push(email);
    if (this.#messages.length > this.maxMessages) {
      this.#messages.splice(0, this.#messages.length - this.maxMessages);
    }

    for (const waiter of [...this.#waiters]) {
      if (this.matches(email, waiter.filters)) this.finishWaiter(waiter, email);
    }
  }

  list(filters: EmailSearch = {}): CapturedEmail[] {
    const afterIndex = filters.afterId
      ? this.#messages.findIndex((email) => email.id === filters.afterId)
      : -1;
    if (filters.afterId && afterIndex === -1) return [];

    const messages = this.#messages.filter(
      (email, index) => index > afterIndex && this.matches(email, filters),
    );
    return filters.limit ? messages.slice(-filters.limit) : messages;
  }

  latest(filters: EmailSearch = {}): CapturedEmail | undefined {
    return this.list(filters).at(-1);
  }

  get(id: string): CapturedEmail | undefined {
    return this.#messages.find((email) => email.id === id);
  }

  clear(to?: string): number {
    const initialCount = this.#messages.length;
    if (!to) this.#messages = [];
    else {
      this.#messages = this.#messages.filter(
        (email) => !email.to.some((address) => sameAddress(address, to)),
      );
    }
    return initialCount - this.#messages.length;
  }

  waitFor(filters: EmailSearch, timeoutMs: number): Promise<CapturedEmail | undefined> {
    const existing = this.list(filters)[0];
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve) => {
      const waiter: Waiter = {
        filters,
        resolve,
        timeout: setTimeout(() => this.finishWaiter(waiter), timeoutMs),
      };
      this.#waiters.add(waiter);
    });
  }

  private matches(email: CapturedEmail, filters: EmailSearch): boolean {
    const recipient = filters.to;
    if (recipient && !email.to.some((address) => sameAddress(address, recipient))) return false;
    if (filters.subject && !email.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
      return false;
    }
    if (filters.subjectRegex) {
      filters.subjectRegex.lastIndex = 0;
      if (!filters.subjectRegex.test(email.subject)) return false;
    }
    return true;
  }

  private finishWaiter(waiter: Waiter, email?: CapturedEmail): void {
    clearTimeout(waiter.timeout);
    this.#waiters.delete(waiter);
    waiter.resolve(email);
  }
}

function sameAddress(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
