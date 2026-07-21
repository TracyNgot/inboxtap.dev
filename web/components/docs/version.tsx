export function Version() {
  const version = process.env.INBOXTAP_VERSION;

  if (!version) {
    throw new Error("INBOXTAP_VERSION is not configured");
  }

  return <span>{version}</span>;
}
