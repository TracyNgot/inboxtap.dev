const SECRET_KEY_SOURCE = `(?:access[_-]?token|refresh[_-]?token|id[_-]?token|auth[_-]?token|csrf[_-]?token|client[_-]?secret|private[_-]?key|api[_-]?key|session(?:[_-]?id)?|authorization|credential|signature|password|passcode|apikey|secret|token|code|otp|sig)`;

export const QUOTED_SECRET_ASSIGNMENT_PATTERN = new RegExp(
  String.raw`(["'])(${SECRET_KEY_SOURCE})\1(\s*[:=]\s*)(["'])([^"'\r\n]*)\4`,
  "giu",
);

export const SECRET_ASSIGNMENT_PATTERN = new RegExp(
  String.raw`\b(${SECRET_KEY_SOURCE})\b(\s*[:=]\s*)(["']?)([^\s<>"',;]+)\3`,
  "giu",
);

const SECRET_NAME_PATTERN = new RegExp(SECRET_KEY_SOURCE, "iu");

export function isSecretName(name: string): boolean {
  return SECRET_NAME_PATTERN.test(name);
}
