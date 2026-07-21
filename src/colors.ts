function supportsColor(stream: { isTTY?: boolean }): boolean {
  return Boolean(stream.isTTY) && !process.env.NO_COLOR;
}

function paint(code: number, enabled: boolean): (text: string) => string {
  return (text) => (enabled ? `\x1b[${code}m${text}\x1b[0m` : text);
}

export const stdoutColor = supportsColor(process.stdout);

export const bold = paint(1, stdoutColor);
export const dim = paint(2, stdoutColor);
export const green = paint(92, stdoutColor);
export const errorRed = paint(31, supportsColor(process.stderr));
