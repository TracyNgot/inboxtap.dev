const blockedPackages = ["@playwright/test", "vitest"];

export async function resolve(specifier, context, nextResolve) {
  const blocked =
    specifier === "nodemailer" ||
    blockedPackages.some((name) => specifier === name || specifier.startsWith(`${name}/`));
  if (blocked) {
    throw new Error(`Unexpected optional peer import: ${specifier}`);
  }
  return nextResolve(specifier, context);
}
