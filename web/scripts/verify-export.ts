import { docs } from "../lib/docs-config";

const outputRoot = new URL("../out/", import.meta.url);
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

const routePaths = new Set(routeFiles.map((route) => route.path));
for (const route of routeFiles) {
  const html = await Bun.file(new URL(route.file, outputRoot)).text();
  const expectedCanonical =
    route.path === "/" ? "https://inboxtap.dev/" : `https://inboxtap.dev${route.path}/`;
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
    throw new Error(`Missing canonical URL for ${route.path}`);
  }
  if (html.includes("support.js") || html.includes("text/x-dc") || html.includes("<x-dc")) {
    throw new Error(`DCanvas runtime leaked into ${route.path}`);
  }

  for (const match of html.matchAll(/href="(\/docs[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const href = (match[1] ?? "").replace(/\/$/, "") || "/";
    if (!routePaths.has(href))
      throw new Error(`Broken documentation link ${href} in ${route.path}`);
  }
}

const sitemap = await Bun.file(new URL("sitemap.xml", outputRoot)).text();
for (const route of routeFiles) {
  const url = route.path === "/" ? "https://inboxtap.dev" : `https://inboxtap.dev${route.path}`;
  if (!sitemap.includes(url)) throw new Error(`Sitemap is missing ${url}`);
}

console.log(`Verified ${routeFiles.length} static routes and their internal documentation links.`);
