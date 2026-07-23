export function compareAscii(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function uniqueKey(record: Record<string, unknown>, key: string): string {
  if (!(key in record)) return key;
  let index = 2;
  while (`${key} (${index})` in record) index += 1;
  return `${key} (${index})`;
}
