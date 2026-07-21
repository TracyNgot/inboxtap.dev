import { docs } from "../lib/docs-config";

const outputRoot = new URL("../out/", import.meta.url);
const siteOrigin = "https://inboxtap.dev";
const routeFiles = [
  { path: "/", file: "index.html" },
  ...docs.map((doc) => ({
    file: `${doc.path.slice(1)}/index.html`,
    path: doc.path,
  })),
];
const requiredFiles = [
  ...routeFiles.map((route) => route.file),
  "robots.txt",
  "sitemap.xml",
  "icon.svg",
  "opengraph-image",
];

for (const relativePath of requiredFiles) {
  const file = Bun.file(new URL(relativePath, outputRoot));
  if (!(await file.exists())) throw new Error(`Missing static export file: ${relativePath}`);
}

const openGraphImage = Bun.file(new URL("opengraph-image", outputRoot));
const openGraphSignature = new Uint8Array(await openGraphImage.slice(0, 8).arrayBuffer());
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
if (!pngSignature.every((byte, index) => openGraphSignature[index] === byte)) {
  throw new Error("Static Open Graph image is not a PNG");
}

function absoluteRouteUrl(path: string): string {
  return path === "/" ? `${siteOrigin}/` : `${siteOrigin}${path}/`;
}

const routePaths = new Set(routeFiles.map((route) => route.path));
for (const route of routeFiles) {
  const html = await Bun.file(new URL(route.file, outputRoot)).text();
  const expectedCanonical = absoluteRouteUrl(route.path);
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
    throw new Error(`Missing canonical URL for ${route.path}`);
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

  for (const match of html.matchAll(/href="(\/docs[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const href = (match[1] ?? "").replace(/\/$/, "") || "/";
    if (!routePaths.has(href))
      throw new Error(`Broken documentation link ${href} in ${route.path}`);
  }
}

const sitemap = await Bun.file(new URL("sitemap.xml", outputRoot)).text();
for (const route of routeFiles) {
  const url = absoluteRouteUrl(route.path);
  if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Sitemap is missing ${url}`);
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
    `No exported chunk references ${analyticsMarker}; is <Analytics /> still rendered in app/layout.tsx?`,
  );
}

console.log(
  `Verified ${routeFiles.length} static routes, their internal documentation links, and the Vercel Analytics bootstrap.`,
);
