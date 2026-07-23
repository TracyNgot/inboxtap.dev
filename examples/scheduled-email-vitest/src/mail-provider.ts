export interface MailMessage {
  readonly from: string;
  readonly subject: string;
  readonly text: string;
  readonly to: string;
}

export interface MailProvider {
  cancel(id: string): boolean;
  schedule(message: MailMessage, scheduledAt: Date): string;
  send(message: MailMessage): Promise<void>;
}

type ClockListener = (now: Date) => Promise<void>;

export class VirtualClock {
  #advancing = false;
  #listeners = new Set<ClockListener>();
  #nowMs: number;

  constructor(initialTime: Date) {
    this.#nowMs = validTime(initialTime, "initialTime");
  }

  now(): Date {
    return new Date(this.#nowMs);
  }

  async advanceBy(durationMs: number): Promise<void> {
    if (!Number.isSafeInteger(durationMs) || durationMs < 0) {
      throw new RangeError("durationMs must be a non-negative safe integer");
    }
    await this.advanceTo(new Date(this.#nowMs + durationMs));
  }

  async advanceTo(time: Date): Promise<void> {
    const nextTimeMs = validTime(time, "time");
    if (nextTimeMs < this.#nowMs) {
      throw new RangeError("VirtualClock cannot move backwards");
    }
    if (this.#advancing) {
      throw new Error("VirtualClock cannot advance concurrently");
    }

    this.#advancing = true;
    this.#nowMs = nextTimeMs;
    try {
      for (const listener of [...this.#listeners]) {
        await listener(this.now());
      }
    } finally {
      this.#advancing = false;
    }
  }

  onAdvance(listener: ClockListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

interface ScheduledMail {
  dueAtMs: number;
  id: string;
  message: MailMessage;
  sequence: number;
}

interface FakeMailProviderOptions {
  clock: VirtualClock;
  deliver: (message: MailMessage) => Promise<unknown>;
  maxScheduled?: number;
}

const MAX_SCHEDULED_LIMIT = 100;

export class FakeMailProvider implements MailProvider {
  readonly maxScheduled: number;
  #clock: VirtualClock;
  #deliver: (message: MailMessage) => Promise<unknown>;
  #nextSequence = 1;
  #scheduled = new Map<string, ScheduledMail>();

  constructor({ clock, deliver, maxScheduled = MAX_SCHEDULED_LIMIT }: FakeMailProviderOptions) {
    if (
      !Number.isSafeInteger(maxScheduled) ||
      maxScheduled < 1 ||
      maxScheduled > MAX_SCHEDULED_LIMIT
    ) {
      throw new RangeError(`maxScheduled must be between 1 and ${MAX_SCHEDULED_LIMIT}`);
    }

    this.#clock = clock;
    this.#deliver = deliver;
    this.maxScheduled = maxScheduled;
    clock.onAdvance((now) => this.#deliverDue(now));
  }

  get pendingCount(): number {
    return this.#scheduled.size;
  }

  async send(message: MailMessage): Promise<void> {
    await this.#deliver(copyMessage(message));
  }

  schedule(message: MailMessage, scheduledAt: Date): string {
    const dueAtMs = validTime(scheduledAt, "scheduledAt");
    if (dueAtMs <= this.#clock.now().getTime()) {
      throw new RangeError(
        "scheduledAt must be later than the current virtual time; use send() for immediate mail",
      );
    }
    if (this.#scheduled.size >= this.maxScheduled) {
      throw new Error(`Scheduled mail limit of ${this.maxScheduled} reached`);
    }

    const sequence = this.#nextSequence;
    this.#nextSequence += 1;
    const id = `scheduled-${sequence.toString().padStart(4, "0")}`;
    this.#scheduled.set(id, {
      dueAtMs,
      id,
      message: copyMessage(message),
      sequence,
    });
    return id;
  }

  cancel(id: string): boolean {
    return this.#scheduled.delete(id);
  }

  async #deliverDue(now: Date): Promise<void> {
    const nowMs = now.getTime();
    const due = [...this.#scheduled.values()]
      .filter((entry) => entry.dueAtMs <= nowMs)
      .sort((left, right) => left.dueAtMs - right.dueAtMs || left.sequence - right.sequence);

    for (const entry of due) {
      if (!this.#scheduled.delete(entry.id)) continue;
      await this.send(entry.message);
    }
  }
}

function copyMessage(message: MailMessage): MailMessage {
  return {
    from: message.from,
    subject: message.subject,
    text: message.text,
    to: message.to,
  };
}

function validTime(value: Date, name: string): number {
  const time = value.getTime();
  if (!Number.isFinite(time)) throw new RangeError(`${name} must be a valid Date`);
  return time;
}
