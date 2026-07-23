interface RawRedactionCallbacks {
  redactHeader(name: string, value: string): string;
  redactText(value: string, maximumBytes?: number): string;
}

export function redactRawSource(raw: string, callbacks: RawRedactionCallbacks): string {
  const separator = raw.match(/\r?\n\r?\n/u);
  const separatorIndex = separator?.index ?? raw.length;
  const headerBlock = raw.slice(0, separatorIndex);
  const bodyStart = separator ? separatorIndex + separator[0].length : raw.length;
  const logicalHeaders: string[] = [];
  for (const line of headerBlock.split(/\r?\n/u)) {
    if (/^[ \t]/u.test(line) && logicalHeaders.length > 0) {
      const lastIndex = logicalHeaders.length - 1;
      logicalHeaders[lastIndex] = `${logicalHeaders[lastIndex] ?? ""} ${line.trim()}`;
    } else logicalHeaders.push(line);
  }
  const headers = logicalHeaders.map((line) => {
    const colon = line.indexOf(":");
    if (colon <= 0) return callbacks.redactText(line, 4_096);
    const name = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    return `${callbacks.redactText(name, 256)}: ${callbacks.redactHeader(name, value)}`;
  });
  const body = callbacks.redactText(raw.slice(bodyStart));
  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}
