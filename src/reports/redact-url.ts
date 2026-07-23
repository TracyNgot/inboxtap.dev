export function redactUrl(candidate: string): string {
  const { source, trailing } = splitTrailingPunctuation(candidate);
  try {
    const url = new URL(source.replaceAll("&amp;", "&"));
    url.username = "";
    url.password = "";
    const entries = [...url.searchParams.entries()];
    url.search = "";
    for (const [name] of entries) {
      url.searchParams.append(looksOpaque(name) ? "redacted" : name, "redacted");
    }
    if (url.hash) url.hash = "redacted";
    const segments = url.pathname.split("/");
    url.pathname = segments
      .map((segment, index) => {
        const decoded = decodeURIComponentSafe(segment);
        const previous = decodeURIComponentSafe(segments[index - 1] ?? "").toLowerCase();
        if (looksOpaque(decoded) || isSecretRoute(previous)) return "redacted";
        return redactNamedPathValue(segment);
      })
      .join("/");
    return `${url.toString()}${trailing}`;
  } catch {
    return `[REDACTED URL]${trailing}`;
  }
}

function splitTrailingPunctuation(candidate: string): {
  source: string;
  trailing: string;
} {
  let end = candidate.length;
  while (end > 0 && isTrailingPunctuation(candidate.charCodeAt(end - 1))) end -= 1;
  return {
    source: candidate.slice(0, end),
    trailing: candidate.slice(end),
  };
}

function isTrailingPunctuation(code: number): boolean {
  return (
    code === 33 ||
    code === 41 ||
    code === 44 ||
    code === 46 ||
    code === 58 ||
    code === 59 ||
    code === 63 ||
    code === 93
  );
}

function isSecretRoute(value: string): boolean {
  return /^(?:code|confirm|credential|invite|magic|otp|reset|secret|signature|token|unsubscribe|verify)$/iu.test(
    value,
  );
}

function redactNamedPathValue(value: string): string {
  return value.replace(
    /^(token|secret|signature|credential|otp|code)(?:=|:|-).+$/iu,
    "$1-redacted",
  );
}

function looksOpaque(value: string): boolean {
  return /^(?:[A-F0-9]{24,}|[A-Za-z0-9_-]{32,})$/iu.test(value);
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
