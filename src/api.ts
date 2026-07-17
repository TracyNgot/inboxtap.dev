import type { IncomingMessage, ServerResponse } from "node:http";
import type { EmailStore } from "./store.js";
import type { EmailSearch, HealthResponse } from "./types.js";

interface ApiDependencies {
  health: () => HealthResponse;
  store: EmailStore;
}

const MAX_WAIT_MS = 60_000;

export function createApiHandler(dependencies: ApiDependencies) {
  return (request: IncomingMessage, response: ServerResponse): void => {
    void handleRequest(request, response, dependencies).catch((error: unknown) => {
      const status = error instanceof ApiError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Internal server error";
      sendJson(response, status, { error: message });
    });
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: ApiDependencies,
): Promise<void> {
  const url = new URL(request.url ?? "/", "http://localhost");
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/health") {
    sendJson(response, 200, dependencies.health());
    return;
  }

  if (request.method === "GET" && pathname === "/api/emails") {
    sendJson(response, 200, { emails: dependencies.store.list(parseFilters(url, true)) });
    return;
  }

  if (request.method === "GET" && pathname === "/api/emails/latest") {
    const email = dependencies.store.latest(parseFilters(url));
    if (!email) throw new ApiError(404, "No matching email found");
    sendJson(response, 200, { email });
    return;
  }

  if (request.method === "GET" && pathname === "/api/emails/wait") {
    const timeoutMs = parsePositiveInt(url.searchParams.get("timeoutMs"), 10_000, MAX_WAIT_MS);
    const email = await dependencies.store.waitFor(parseFilters(url), timeoutMs);
    if (!email) throw new ApiError(408, "Timed out waiting for a matching email");
    sendJson(response, 200, { email });
    return;
  }

  if (request.method === "DELETE" && pathname === "/api/emails") {
    const deleted = dependencies.store.clear(url.searchParams.get("to") ?? undefined);
    sendJson(response, 200, { deleted });
    return;
  }

  const id = pathname.match(/^\/api\/emails\/([^/]+)$/)?.[1];
  if (request.method === "GET" && id) {
    const email = dependencies.store.get(decodeURIComponent(id));
    if (!email) throw new ApiError(404, "Email not found");
    sendJson(response, 200, { email });
    return;
  }

  throw new ApiError(404, "Route not found");
}

function parseFilters(url: URL, includeLimit = false): EmailSearch {
  const subjectPattern = url.searchParams.get("subjectPattern");
  let subjectRegex: RegExp | undefined;
  if (subjectPattern) {
    try {
      subjectRegex = new RegExp(subjectPattern, url.searchParams.get("subjectFlags") ?? "");
    } catch {
      throw new ApiError(400, "Invalid subject regular expression");
    }
  }

  return {
    to: url.searchParams.get("to") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
    subjectRegex,
    afterId: url.searchParams.get("afterId") ?? undefined,
    limit: includeLimit ? parseOptionalLimit(url.searchParams.get("limit")) : undefined,
  };
}

function parseOptionalLimit(value: string | null): number | undefined {
  if (value === null) return undefined;
  return parsePositiveInt(value, 100, 100);
}

function parsePositiveInt(value: string | null, fallback: number, maximum: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new ApiError(400, `Expected an integer from 1 to ${maximum}`);
  }
  return parsed;
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-length": Buffer.byteLength(payload),
    "content-type": "application/json; charset=utf-8",
  });
  response.end(payload);
}

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
