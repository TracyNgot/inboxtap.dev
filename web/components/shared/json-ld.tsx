export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Local schema.org data is serialized with script-closing characters escaped.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
