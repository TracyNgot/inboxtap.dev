# InboxTap coding style

This is the source of truth for code style and engineering conventions. Biome
and TypeScript enforce the mechanical rules; this guide covers design choices.

## Principles

1. Keep the local email-testing path obvious from SMTP input to test result.
2. Prefer the smallest complete change over speculative abstractions.
3. Preserve public behavior unless a breaking change is intentional and labeled.
4. Bound memory, message sizes, waits, and network exposure.
5. Make failures useful to a developer running a test suite.

## TypeScript

- Use strict types. Avoid `any`; narrow `unknown` at boundaries.
- Use `interface` for public object shapes and `type` for unions or composition.
- Keep NodeNext-compatible `.js` extensions in TypeScript imports.
- Prefer `async`/`await` and typed errors over nested callbacks.
- Validate CLI, HTTP, SMTP, and configuration input at the boundary.
- Keep exported names descriptive and stable.

## Modules

- Keep production source files below 250 lines.
- Give each module one responsibility: parsing, storage, transport, API, SDK, or CLI.
- Extract a helper when it removes duplication or clarifies an invariant.
- Do not add a dependency for behavior that is clear in a few tested lines.
- Re-export public APIs from a small entry point; keep internals private by default.

## Product boundaries

- Default hosts stay on `127.0.0.1`; broader network binding must be explicit.
- Never add outbound email relay behavior to the capture server.
- Keep storage bounded and preserve predictable FIFO eviction.
- Keep SDK filters and return types aligned with HTTP API fields and semantics.
- Reject oversized input before it reaches the store.
- Use bounded long-poll timeouts and clean up waiters after resolution or timeout.

## Errors and logging

- Return specific HTTP and SMTP status codes for user-correctable failures.
- Error messages should state what failed and how to correct it.
- Do not include email bodies, credentials, keys, or tokens in routine logs.
- The CLI should fail with a non-zero exit code and a concise message.

## Tests

- Unit-test parsing and store behavior without network setup where possible.
- Use real local SMTP and HTTP traffic for integration boundaries.
- Test the success case plus relevant malformed, timeout, size, and cleanup cases.
- Verify both ESM and CJS package exports and the compiled Node CLI.
- Every bug fix should include a regression test.

## Documentation

- Treat README examples as public API commitments.
- Update the README and types whenever flags, routes, response fields, or SDK methods change.
- Keep examples copy-pasteable and use unique local-only test addresses.
- Mark breaking changes with the `breaking` GitHub label and migration notes.

## Required gate

Run before review, merge, or release:

```bash
bun run verify
```
