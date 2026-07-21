import { expectedRoutes } from "./export-routes";

const outputRoot = new URL("../out/", import.meta.url);
const routes = expectedRoutes();

const requiredFiles = [
  ...routes.map((route) => route.file),
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "icon.svg",
  "fr/opengraph-image",
  "es/opengraph-image",
];

for (const relativePath of requiredFiles) {
  const file = Bun.file(new URL(relativePath, outputRoot));
  if (!(await file.exists())) throw new Error(`Missing static export file: ${relativePath}`);
}

// The English Open Graph image lives in the (en) route group, so the exporter
// emits it under a content-hashed name; find every OG image by prefix.
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const openGraphGlob = new Bun.Glob("**/opengraph-image*");
const openGraphImages: string[] = [];
for await (const imagePath of openGraphGlob.scan({ cwd: Bun.fileURLToPath(outputRoot) })) {
  openGraphImages.push(imagePath);
  const image = Bun.file(new URL(imagePath, outputRoot));
  const signature = new Uint8Array(await image.slice(0, 8).arrayBuffer());
  if (!pngSignature.every((byte, index) => signature[index] === byte)) {
    throw new Error(`Static Open Graph image ${imagePath} is not a PNG`);
  }
}
if (openGraphImages.length < 3) {
  throw new Error(`Expected one Open Graph image per locale, found: ${openGraphImages.join(", ")}`);
}

function requireTag(html: string, tag: string, route: string, label: string) {
  if (!html.toLowerCase().includes(tag.toLowerCase())) {
    throw new Error(`Missing ${label} in ${route}: ${tag}`);
  }
}

const routePaths = new Set(routes.map((route) => route.path));
for (const route of routes) {
  const html = await Bun.file(new URL(route.file, outputRoot)).text();

  requireTag(html, `<html lang="${route.htmlLang}"`, route.path, "html lang");
  requireTag(html, `rel="canonical" href="${route.canonical}"`, route.path, "canonical");
  for (const [hreflang, href] of Object.entries(route.hreflangs)) {
    requireTag(
      html,
      `rel="alternate" hreflang="${hreflang}" href="${href}"`,
      route.path,
      "hreflang alternate",
    );
  }
  requireTag(html, `property="og:locale" content="${route.ogLocale}"`, route.path, "og:locale");
  for (const type of route.jsonLdTypes) {
    requireTag(html, `"@type":"${type}"`, route.path, "JSON-LD type");
  }
  for (const id of route.tocIds) {
    if (!html.includes(`id="${id}"`)) {
      throw new Error(`Missing table-of-contents anchor #${id} in ${route.path}`);
    }
  }

  if (html.includes("support.js") || html.includes("text/x-dc") || html.includes("<x-dc")) {
    throw new Error(`DCanvas runtime leaked into ${route.path}`);
  }

  if (html.includes('class="shiki')) {
    if (/style="color:[^"]*--shiki-dark/.test(html)) {
      throw new Error(
        `Shiki inlined single-theme colors in ${route.path}; dark mode cannot override them`,
      );
    }
    if (!html.includes("--shiki-light:")) {
      throw new Error(`Shiki output in ${route.path} is missing --shiki-light variables`);
    }
  }

  for (const match of html.matchAll(/href="(\/(?:docs|fr|es)(?:\/[^"?#]*)?)(?:[?#][^"]*)?"/g)) {
    const href = (match[1] ?? "").replace(/\/$/, "") || "/";
    if (href.endsWith("/opengraph-image")) continue;
    if (!routePaths.has(href)) {
      throw new Error(`Broken internal link ${href} in ${route.path}`);
    }
  }
}

const sitemap = await Bun.file(new URL("sitemap.xml", outputRoot)).text();
for (const route of routes) {
  if (!sitemap.includes(`<loc>${route.canonical}</loc>`)) {
    throw new Error(`Sitemap is missing ${route.canonical}`);
  }
}
const xDefaultLinks = sitemap.match(/hreflang="x-default"/g)?.length ?? 0;
if (xDefaultLinks < routes.length) {
  throw new Error(`Sitemap has ${xDefaultLinks} x-default alternates for ${routes.length} URLs`);
}

const notFoundHtml = await Bun.file(new URL("404.html", outputRoot)).text();
for (const marker of ["not in the inbox", "boîte de réception", "bandeja de entrada"]) {
  if (!notFoundHtml.includes(marker)) {
    throw new Error(`404.html is missing the "${marker}" copy`);
  }
}

const analyticsMarker = "/_vercel/insights";
const chunkGlob = new Bun.Glob("_next/static/chunks/**/*.js");
let analyticsWired = false;
for await (const chunkPath of chunkGlob.scan({ cwd: Bun.fileURLToPath(outputRoot) })) {
  if ((await Bun.file(new URL(chunkPath, outputRoot)).text()).includes(analyticsMarker)) {
    analyticsWired = true;
    break;
  }
}
if (!analyticsWired) {
  throw new Error(
    `No exported chunk references ${analyticsMarker}; is <Analytics /> still rendered in the root layouts?`,
  );
}

console.log(
  `Verified ${routes.length} static routes across ${new Set(routes.map((route) => route.locale)).size} locales: canonicals, hreflang reciprocity, JSON-LD, anchors, internal links, sitemap, and the Vercel Analytics bootstrap.`,
);
