import { getDictionary } from "@/lib/i18n";
import { ogImageContentType, ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = getDictionary("en").meta.ogImage.alt;
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return renderOgImage(getDictionary("en").meta.ogImage);
}
