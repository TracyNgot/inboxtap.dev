# InboxTap — Project Overview

Canonical, contributor-facing description of what InboxTap is, the problem it
solves, and the constraints it will not compromise on. User-facing guides and
API reference live on [inboxtap.dev/docs](https://inboxtap.dev/docs) (sources in
`web/content/docs/`); this document is for people changing the code.

## What it is

InboxTap is an open-source, local-only SMTP capture server and test SDK that
lets developers write deterministic automated tests for email-dependent flows —
signup verification, password resets, OTP codes, invitation links, API key
delivery — without relying on real mail services or fragile test fixtures.

## The problem it solves

Modern applications send emails at critical moments: account verification,
password resets, two-factor codes, team invitations. Testing these flows
end-to-end is painful because:

- Real SMTP services (SendGrid, Mailgun, and similar) are external, slow,
  rate-limited, and non-deterministic — unsuitable for CI/CD.
- Mocking email at the unit-test level misses the integration boundary where
  most bugs live: template rendering, link generation, SMTP delivery.
- Shared test mailboxes create race conditions in parallel test suites — one
  test reads another test's verification email.
- Existing tools (Mailhog, Mailpit) are Go binaries or Docker containers that
  add infrastructure overhead and do not provide a programmatic test SDK.

InboxTap solves this by running a tiny SMTP server on the loopback interface that captures
every message in a bounded in-memory store and exposes it through a typed SDK
and HTTP API — so tests can assert on the exact email that was "sent."

## How it works

```mermaid
graph LR
    A[Application under test] -->|SMTP on localhost:1025| B[InboxTap Server]
    B -->|bounded in-memory store| C[HTTP API :8025]
    D[Test suite / Playwright / Jest] -->|InboxTapClient SDK| C
    C -->|verification URL, OTP, API key| D
    D -->|asserts & drives flow| A
```

1. Start the server — `bunx inboxtap` or `npx inboxtap` (Node 20+).
2. Point the app under test at `localhost:1025` via environment variables.
3. In the test, create an isolated inbox with a unique address, trigger the
   email flow, then await the extracted value (link, code, pattern match).
4. No message leaves the machine. No auth, no TLS, no relay.

## Core components

| Module | Responsibility |
| --- | --- |
| `src/smtp.ts` | Wraps `smtp-server` with `AUTH`/`STARTTLS` disabled, claims at most one matching fault when a transaction reaches `DATA`, enforces the max message size (SMTP 552 on overflow), and stores only successfully completed deliveries. |
| `src/faults/` | Owns the bounded `server.faults` controller, validated next-matching rule queue, and independently timed pause gates shared by both SMTP listeners. |
| `src/smtp-disconnect.ts` | Quarantines the tested adapter that maps an `smtp-server` session to its private connection socket and closes it safely for disconnect injection. |
| `src/server.ts` | `InboxTapServer` composes the SMTP listener, shared programmatic fault controller, and HTTP API, binding both loopback addresses (`127.0.0.1` and `::1`) on the `1025`/`8025` defaults (domain `local.test`, 100 messages, 5 MiB), and owns the start/stop lifecycle and `/health` payload. |
| `src/listen.ts` | Generic listen/close helpers plus `listenDualStack`, which binds `127.0.0.1` and `::1` on one port with bounded ephemeral-port retries and graceful IPv4-only fallback when IPv6 is unavailable. |
| `src/parser.ts` | Parses raw RFC 822 mail via `mailparser` into a `CapturedEmail`: normalized headers, text/HTML bodies, deduplicated http(s) links, unique 4–8 digit codes, and the raw source. |
| `src/store.ts` | In-memory `EmailStore` with FIFO eviction at `maxMessages`, filtered `list`/`latest`/`get`/`clear`, and long-poll waiters resolved on a matching add or cleaned up on timeout. |
| `src/api.ts` | Dependency-free `node:http` JSON handler for `/health` and `/api/emails` routes, validating filters and capping waits at 60 s and list limits at 100. |
| `src/client/` | The fetch-based test SDK: `InboxTapClient` plus `TestInbox` with `waitForMessage`/`waitForLink`/`waitForCode`/`waitForMatch` polling helpers and a typed `InboxTapError`. |
| `src/fixtures/` | Optional runner-native fixtures: the shared starter owns dynamic SMTP/API ports, a verified Nodemailer transport, partial-startup cleanup, and idempotent shutdown; Bun, Vitest, and Playwright adapters map that lifecycle to their native scopes. |
| `src/matchers/` | Peer-free matcher implementations for delivery count, envelope recipients, extracted links, and raw unsubscribe headers; isolated Bun, Vitest, and Playwright adapters add native `expect` types without loading runner peers from the root package. Matcher observations contain only bounded counts, booleans, matcher state, and message IDs for later redacted reports. |
| `src/reports/` | Client-side `InboxTapReport` collection and deterministic JSON/static HTML rendering. It accepts matcher observations, explicit application assertions, and captured messages; applies bounded best-effort redaction and pseudonymization; and writes artifacts without adding server routes or remote assets. |
| `src/cli.ts` | Node/Bun executable that parses the CLI flags, starts `InboxTapServer`, prints connection info, and shuts down on `SIGINT`/`SIGTERM`. |
| `src/index.ts` | Public server entry point re-exporting `InboxTapServer` and the shared public types. |
| `src/types.ts` | Shared interfaces (`CapturedEmail`, `EmailFilters`, `HealthResponse`, …) imported by both server and client — the mechanism behind the SDK ↔ API alignment invariant. |

## Design invariants

These are hard constraints the project will not compromise on. Each one is
enforced in code today:

1. **Local-only** — binds only the loopback addresses (`127.0.0.1` and `::1`,
   so `localhost` resolves either way) by default; never an outbound relay.
   (`listenDualStack` in `src/listen.ts`; wider binding requires explicit
   `--smtp-host`/`--api-host` flags.)
2. **Capture, don't deliver** — no message is forwarded externally. The SMTP
   server disables `AUTH` and `STARTTLS` and only writes to the store
   (`src/smtp.ts`); the only mail dependencies are `smtp-server` and
   `mailparser` — there is no outbound SMTP client.
3. **Bounded resources** — memory, message sizes, wait times, and poll
   durations are all capped: 100-message FIFO store (`src/store.ts`), 5 MiB
   message limit (`src/smtp.ts`), 60,000 ms long-poll ceiling and list limit of
   100 (`src/api.ts`).
4. **Deterministic tests** — inbox addresses are generated in the client
   (`createInbox` in `src/client/index.ts`), so parallel tests isolate their
   messages without server-side registration; the API has no registration
   route at all. Runner adapters create a fresh `TestInbox` for every test
   while sharing only the bounded server lifecycle at file scope (Vitest) or
   worker scope (Playwright). Bun keeps per-test creation explicit. SMTP fault
   rules are programmatic, bounded, and consumed by the next matching
   transaction at `DATA`, so failure-path tests remain deterministic without
   exposing a remote control surface. `toHaveDeliveredOnce` starts from an
   immediate inbox snapshot; its optional, bounded quiet window observes only
   that interval rather than claiming that no later retry is possible.
5. **Dual-format output** — ships ESM, CJS, type declarations, and a compiled
   Node 20 CLI (`exports`/`bin` in `package.json`, `tsup.config.ts`, smoke-
   tested by `scripts/test-package.ts`).
6. **SDK ↔ API alignment** — HTTP response shapes and SDK return types stay in
   lockstep because both sides import the same `src/types.ts` definitions,
   backed by integration tests.
7. **Content-safe matcher diagnostics** — custom matchers never attach
   captured bodies, raw headers, recipient arguments, link values, or
   token-bearing patterns to assertion results. Failures and structured
   recorder observations expose only the minimum counts and boolean states
   needed to diagnose the assertion.
8. **Bounded, client-side reports** — reports add no server state or control
   surface. They cap collection at 100 messages and 1,000 assertions, cap each
   rendered artifact at 10 MiB, record explicit truncation, exclude raw RFC
   source by default, and render captured HTML as escaped evidence without
   executing captured scripts or loading captured or remote resources.
   Omitted-byte accounting identifies exact counts and bounded lower bounds
   separately. Redaction is documented as best-effort rather than a promise to
   detect arbitrary personal information.

## Current scope (v0.1)

Included:

- In-memory bounded store with FIFO eviction
- CLI, HTTP API, and TypeScript SDK
- Optional fixture subpaths for explicit, Bun, Vitest, and Playwright
  lifecycles, backed by Nodemailer 9
- Programmatic SMTP fault injection for bounded failure, delay, disconnect, and
  pause/release scenarios; rules can target a unique envelope recipient and
  failed or disconnected messages never reach the store
- Pure assertion matchers plus isolated Bun, Vitest, and Playwright `expect`
  adapters for one-delivery snapshots, envelope recipients, extracted links,
  and raw `List-Unsubscribe` header shape; matcher observations form the safe
  handoff to client-side reports
- Client-side, deterministic, versioned JSON and self-contained static HTML
  reports with matcher observations, application assertions, captured-message
  evidence, consistent email pseudonyms, best-effort redaction, and explicit
  truncation markers
- Server-side extraction of http(s) links and 4–8 digit codes; arbitrary
  regex matching is SDK-side via `waitForMatch` (and `waitForCode` defaults to
  6-digit codes)
- Long-poll support (up to 60 s timeout)
- Dual ESM/CJS package exports

Explicitly excluded:

- Persistence / database backing
- Web dashboard / UI for captured mail (the `web/` workspace is the static
  marketing and docs site for inboxtap.dev; it never talks to the API)
- Attachment handling
- Webhooks / event streaming
- Docker images
- Configurable extraction rules
- SMTP authentication or STARTTLS
- Outbound relay of any kind
- Fault-control HTTP routes, CLI flags, history, or statistics

## Target users

- QA and test engineers writing E2E tests (Playwright, Cypress) that involve
  email verification flows.
- Backend developers running integration test suites that trigger
  transactional emails.
- CI/CD pipelines that need a zero-config, zero-dependency SMTP capture
  solution.

## Distribution and toolchain

- Published as `inboxtap` on the public npm registry; runnable via
  `bunx inboxtap` or `npx inboxtap` with no install.
- Importable as a library: `import { InboxTapClient } from "inboxtap/client"`.
  Runner integrations live behind `inboxtap/fixtures`,
  `inboxtap/fixtures/bun`, `inboxtap/fixtures/vitest`, and
  `inboxtap/fixtures/playwright`. Pure matchers live at
  `inboxtap/matchers`, with runner-specific adapters at
  `inboxtap/matchers/bun`, `inboxtap/matchers/vitest`, and
  `inboxtap/matchers/playwright`. Client-side reports live at
  `inboxtap/reports`. Root, client, pure-matcher, and report imports do not load
  optional peers.
- Built with tsup; tested with Bun; formatted and linted with Biome;
  pre-commit/push hooks via Lefthook.
- `examples/` holds standalone integration examples for the docs guides; they
  are not part of the published package or the root verify gate.
- The website imports every example's `README.md`, `README.fr.md`, and
  `README.es.md` through the explicit `web/lib/example-registry.ts` registry
  and publishes one fully localized README body per Examples route.
  Verification fails for unregistered examples, missing locale variants,
  multiple H1s, mismatched localized section anchors, changed code fences, or
  unresolved relative file and image links.

See [README.md](../README.md) for usage, [AGENTS.md](../AGENTS.md) for the
agent and contributor contract, [STYLE_GUIDE.md](../STYLE_GUIDE.md) for
engineering conventions, and [RELEASING.md](../RELEASING.md) for the release
flow.

**In one sentence:** InboxTap is a zero-config, local-only SMTP capture server
with a typed test SDK that makes email-dependent flows testable in
deterministic, parallel, CI-friendly automated tests.
