export interface UnsubscribeHeaderState {
  hasListUnsubscribe: boolean;
  hasHttpsTarget: boolean;
  hasOneClickPost: boolean;
}

export function inspectUnsubscribeHeaders(raw: string): UnsubscribeHeaderState {
  const headers = parseTopHeaders(raw);
  const unsubscribe = headers.get("list-unsubscribe") ?? [];
  const post = headers.get("list-unsubscribe-post") ?? [];

  return {
    hasListUnsubscribe: unsubscribe.some((value) => value.trim().length > 0),
    hasHttpsTarget: unsubscribe.some(hasAngleBracketedHttpsTarget),
    hasOneClickPost: post.some((value) => /^list-unsubscribe\s*=\s*one-click$/i.test(value.trim())),
  };
}

function hasAngleBracketedHttpsTarget(value: string): boolean {
  for (const match of value.matchAll(/<([^<>]+)>/g)) {
    const target = match[1];
    if (!target) continue;
    try {
      if (new URL(target.trim()).protocol === "https:") return true;
    } catch {
      // Ignore malformed targets and continue through the header's alternatives.
    }
  }
  return false;
}

function parseTopHeaders(raw: string): Map<string, string[]> {
  const separator = raw.search(/\r?\n\r?\n/);
  const block = separator === -1 ? raw : raw.slice(0, separator);
  const headers = new Map<string, string[]>();
  let currentName: string | undefined;
  let currentValue = "";

  const commit = () => {
    if (!currentName) return;
    const values = headers.get(currentName) ?? [];
    values.push(currentValue.trim());
    headers.set(currentName, values);
  };

  for (const line of block.split(/\r?\n/)) {
    if (/^[ \t]/.test(line) && currentName) {
      currentValue += ` ${line.trim()}`;
      continue;
    }

    commit();
    const colon = line.indexOf(":");
    if (colon <= 0) {
      currentName = undefined;
      currentValue = "";
      continue;
    }
    currentName = line.slice(0, colon).trim().toLowerCase();
    currentValue = line.slice(colon + 1).trim();
  }
  commit();
  return headers;
}
