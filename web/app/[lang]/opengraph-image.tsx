import { getDictionary } from "@/lib/i18n";
import { assertLocale, translatedLocales } from "@/lib/i18n/config";
import { ogImageContentType, ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "InboxTap";
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = assertLocale((await params).lang);
  return renderOgImage(getDictionary(lang).meta.ogImage);
}
