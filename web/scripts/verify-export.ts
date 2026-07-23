import { expectedRoutes } from "./export-routes";
import { parseChangelog } from "../lib/changelog";
import { getDictionary } from "../lib/i18n";

const outputRoot = new URL("../out/", import.meta.url);
const routes = expectedRoutes();
const changelog = parseChangelog(
  await Bun.file(new URL("../../CHANGELOG.md", import.meta.url)).text(),
);
const englishChangelogCopy = changelog.flatMap((release) => [
  ...release.notes,
  ...release.categories.flatMap((category) => [
    ...(category.title ? [category.title] : []),
    ...category.items.map((item) => item.text),
  ]),
  ...release.extras,
]);

const requiredFiles = [
  ...routes.map((route) => route.file),
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "icon.svg",
  "favicon.ico",
  "inboxtap-demo.mp4",
  "opengraph-image.png",
  "twitter-image.png",
];

for (const relativePath of requiredFiles) {
  const file = Bun.file(new URL(relativePath, outputRoot));
  if (!(await file.exists())) throw new Error(`Missing static export file: ${relativePath}`);
}

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (const imagePath of ["opengraph-image.png", "twitter-image.png"]) {
  const image = Bun.file(new URL(imagePath, outputRoot));
  const signature = new Uint8Array(await image.slice(0, 8).arrayBuffer());
  if (!pngSignature.every((byte, index) => signature[index] === byte)) {
    throw new Error(`Static social image ${imagePath} is not a PNG`);
  }
}

function requireTag(html: string, tag: string, route: string, label: string) {
  if (!html.toLowerCase().includes(tag.toLowerCase())) {
    throw new Error(`Missing ${label} in ${route}: ${tag}`);
  }
}

function escapeHtmlText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const routePaths = new Set(routes.map((route) => route.path));
for (const route of routes) {
  const html = await Bun.file(new URL(route.file, outputRoot)).text();
  const dictionary = getDictionary(route.locale);

  requireTag(html, `<html lang="${route.htmlLang}"`, route.path, "html lang");
  requireTag(
    html,
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
    route.path,
    "viewport meta",
  );
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
  requireTag(html, dictionary.chrome.productHuntLabel, route.path, "localized Product Hunt link");
  if (html.includes("api.producthunt.com/widgets/embed-image")) {
    throw new Error(`English Product Hunt badge leaked into ${route.path}`);
  }
  if (html.includes("/buy-me-a-coffee-button.svg")) {
    throw new Error(`English Buy Me a Coffee artwork leaked into ${route.path}`);
  }
  if (route.locale === "en") {
    requireTag(
      html,
      'property="og:image" content="https://inboxtap.dev/opengraph-image.png"',
      route.path,
      "Open Graph image",
    );
    requireTag(
      html,
      'name="twitter:image" content="https://inboxtap.dev/twitter-image.png"',
      route.path,
      "Twitter image",
    );
  } else {
    for (const marker of [
      'property="og:image" content="https://inboxtap.dev/opengraph-image.png"',
      'name="twitter:image" content="https://inboxtap.dev/twitter-image.png"',
    ]) {
      if (html.includes(marker)) {
        throw new Error(`English social image leaked into ${route.path}: ${marker}`);
      }
    }
  }
  for (const type of route.jsonLdTypes) {
    requireTag(html, `"@type":"${type}"`, route.path, "JSON-LD type");
  }
  if (route.kind === "home") {
    for (const marker of ["story-track", "story-stacked", "test@example.com"]) {
      requireTag(html, marker, route.path, "landing story");
    }
    for (const marker of Object.values(dictionary.landing.demo)) {
      requireTag(html, marker, route.path, "localized landing demo");
    }
    if (route.locale !== "en") {
      for (const marker of Object.values(getDictionary("en").landing.demo)) {
        if (html.includes(marker)) {
          throw new Error(`English landing demo copy leaked into ${route.path}: ${marker}`);
        }
      }
    }
  }
  if (route.kind === "example") {
    const h1Count = html.match(/<h1(?:\s|>)/g)?.length ?? 0;
    if (h1Count !== 1) {
      throw new Error(`Example page ${route.path} has ${h1Count} H1 elements instead of one`);
    }
    requireTag(html, 'class="shiki', route.path, "highlighted README code fence");
    requireTag(
      html,
      `"inLanguage":"${route.locale}"`,
      route.path,
      "localized TechArticle language",
    );
    if (route.locale !== "en" && html.includes('<div lang="en">')) {
      throw new Error(`English README wrapper leaked into ${route.path}`);
    }
  }
  if (route.locale !== "en" && route.path.endsWith("/docs/changelog")) {
    for (const marker of englishChangelogCopy) {
      if (html.includes(escapeHtmlText(marker))) {
        throw new Error(`English changelog copy leaked into ${route.path}: ${marker}`);
      }
    }
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

const robots = await Bun.file(new URL("robots.txt", outputRoot)).text();
for (const marker of [
  "User-Agent: OAI-SearchBot",
  "User-Agent: ChatGPT-User",
  "User-Agent: *",
  "Sitemap: https://inboxtap.dev/sitemap.xml",
]) {
  if (!robots.includes(marker)) {
    throw new Error(`robots.txt is missing "${marker}"`);
  }
}

const notFoundHtml = await Bun.file(new URL("404.html", outputRoot)).text();
requireTag(
  notFoundHtml,
  '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
  "/404",
  "viewport meta",
);
for (const marker of [
  'data-not-found-locale="en"',
  'data-locale="en"',
  'data-locale="fr"',
  'data-locale="es"',
]) {
  if (!notFoundHtml.includes(marker)) {
    throw new Error(`404.html is missing the "${marker}" locale guard`);
  }
}
const notFoundHeadEnd = notFoundHtml.indexOf("</head>");
if (notFoundHeadEnd < 0) {
  throw new Error("404.html is missing its document head");
}
const notFoundHead = notFoundHtml.slice(0, notFoundHeadEnd);
for (const marker of [
  "document.documentElement.lang = locale",
  "document.documentElement.dataset.notFoundLocale = locale",
]) {
  if (!notFoundHead.includes(marker)) {
    throw new Error(`404.html head is missing the executable "${marker}" locale guard`);
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
