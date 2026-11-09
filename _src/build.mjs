#!/usr/bin/env node
// OYA Tourism static site generator — zero dependencies.
// Usage: node _src/build.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { site } from "./site.mjs";
import { ROOT_DIR, imageRegistry, photoExists } from "./lib/ui.mjs";
import { renderPage } from "./lib/layout.mjs";
import { destinationPage, packagePage, visaPage, postPage } from "./lib/templates.mjs";
import { homePage } from "./pages/home.mjs";
import { flightsPage, hotelsPage } from "./pages/services.mjs";
import { turkeyHub, worldHub, packagesHub, visaHub, blogHub } from "./pages/hubs.mjs";
import { matchesHub, superCupPage } from "./pages/matches.mjs";
import { aboutPage, contactPage, faqPage, privacyPage, termsPage, notFoundPage } from "./pages/info.mjs";

const load = async (f) => {
  const p = path.join(ROOT_DIR, "_src/content", f);
  if (!fs.existsSync(p)) { console.warn(`! missing content file ${f}`); return []; }
  return (await import(p + "?t=" + Date.now())).default;
};

const data = {
  destinations: await load("destinations.mjs"),
  packages: [...(await load("packages-turkey.mjs")), ...(await load("packages-world.mjs"))],
  visas: [...(await load("visas-saudi.mjs")), ...(await load("visas-gcc-intl.mjs"))],
  posts: (await load("posts.mjs")).sort((a, b) => (a.date < b.date ? 1 : -1)),
};

// path -> title (for related links)
data.titles = {};
data.destinations.forEach((d) => (data.titles[`turkey-tours/${d.slug}/`] = `السياحة في ${d.name}`));
data.packages.forEach((p) => (data.titles[`packages/${p.slug}/`] = p.title));
const hubOf = { saudi: "saudi-visa/", gcc: "gcc-visas/", intl: "visas/" };
data.visas.forEach((v) => (data.titles[`${hubOf[v.group]}${v.slug}/`] = v.name));
data.posts.forEach((p) => (data.titles[`blog/${p.slug}/`] = p.title));
Object.assign(data.titles, { "flights/": "تذاكر طيران", "hotels/": "فنادق ومنتجعات", "turkey-tours/": "السياحة في تركيا", "world-tours/": "رحلات خارج تركيا", "packages/": "البرامج السياحية", "saudi-visa/": "تأشيرات السعودية", "gcc-visas/": "تأشيرات الخليج", "visas/": "التأشيرات الدولية", "matches/": "تذاكر المباريات", "matches/spanish-super-cup-2027/": "تذاكر كأس السوبر الإسباني 2027" });

const pages = [
  homePage(data),
  flightsPage(data),
  hotelsPage(data),
  turkeyHub(data),
  ...data.destinations.map((d) => destinationPage(d, data)),
  worldHub(data),
  packagesHub(data),
  ...data.packages.map((p) => packagePage(p, data)),
  visaHub("saudi", data), visaHub("gcc", data), visaHub("intl", data),
  ...data.visas.map((v) => visaPage(v, data)),
  matchesHub(data),
  superCupPage(data),
  blogHub(data),
  ...data.posts.map((p) => postPage(p, data)),
  aboutPage(data), contactPage(data), faqPage(data), privacyPage(), termsPage(),
  notFoundPage(),
];

// cache-busting version from asset contents
const ver = crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT_DIR, "assets/css/main.css"))).update(fs.readFileSync(path.join(ROOT_DIR, "assets/js/main.js"))).update(fs.readFileSync(path.join(ROOT_DIR, "assets/img/icons.svg"))).digest("hex").slice(0, 8);

const written = [];
const titles = new Map();
for (const page of pages) {
  const depth = page.path.endsWith(".html") ? 0 : page.path.split("/").filter(Boolean).length;
  const root = page.absoluteRoot ? site.url + "/" : depth ? "../".repeat(depth) : "./";
  let html = renderPage(page, data, ver).replaceAll("{{root}}", root);
  html = html.replace(/\n\s*\n+/g, "\n");
  // motion budget: reveal whole sections/cards only, never individual list rows
  html = html.replace(/<(details|li)([^>]*?) data-reveal(="[a-z]+")?/g, "<$1$2");
  const out = page.path.endsWith(".html") ? path.join(ROOT_DIR, page.path) : path.join(ROOT_DIR, page.path, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written.push({ page, out });
  if (titles.has(page.title)) console.warn(`! duplicate title: ${page.title} (${page.path} & ${titles.get(page.title)})`);
  titles.set(page.title, page.path);
  if (page.title.length > 70) console.warn(`! long title (${page.title.length}): ${page.path}`);
  if (page.description.length > 165) console.warn(`! long description (${page.description.length}): ${page.path}`);
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const prio = (p) => (p === "" ? "1.0" : /^(hotels|flights|turkey-tours|saudi-visa|gcc-visas|visas|packages|matches|world-tours)\/$/.test(p) ? "0.9" : /^(turkey-tours|packages|saudi-visa|gcc-visas|visas|matches)\//.test(p) ? "0.8" : p.startsWith("blog/") ? "0.7" : "0.5");
const urls = written.filter((w) => !w.page.noindex).map((w) => `  <url><loc>${site.url}/${w.page.path}</loc><lastmod>${today}</lastmod><priority>${prio(w.page.path)}</priority></url>`);
fs.writeFileSync(path.join(ROOT_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

// robots.txt
fs.writeFileSync(path.join(ROOT_DIR, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /_src/\n\nSitemap: ${site.url}/sitemap.xml\n`);

// web manifest
fs.writeFileSync(path.join(ROOT_DIR, "site.webmanifest"), JSON.stringify({
  name: `${site.name} | ${site.nameEn}`, short_name: "أويا", lang: "ar", dir: "rtl", start_url: "./", scope: "./", display: "standalone",
  background_color: "#F7F4EE", theme_color: "#0A1F3A",
  icons: [{ src: "assets/img/brand/oya-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "assets/img/brand/oya-icon-512.png", sizes: "512x512", type: "image/png" }, { src: "assets/img/brand/oya-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
}, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, ".nojekyll"), "");

// IMAGES.md — list of every photo slot + AI prompt
const rows = [...imageRegistry.entries()].sort(([a], [b]) => a.localeCompare(b));
const done = rows.filter(([k]) => photoExists(k)).length;
let md = `# صور الموقع — قائمة التوليد (ChatGPT / أي مولّد صور)\n\n`;
md += `- العدد الكلي: **${rows.length}** صورة — الجاهز: **${done}** — المتبقي: **${rows.length - done}**\n`;
md += `- المقاس المطلوب: **1536×1024** (أفقي 3:2). الصيغة: PNG أو JPG — سيتم ضغطها وتحويلها إلى WebP تلقائياً.\n`;
md += `- اسم الملف = المفتاح في الجدول (مثال: \`dest-istanbul.png\`). ضع الصور في \`assets/img/photos/\` ثم شغّل البناء، أو أرسلها لـ Claude ليضعها.\n`;
md += `- أضف لكل برومبت عند الحاجة: *photorealistic, natural colors, no text, no watermark, 3:2 landscape*.\n\n`;
md += `| # | المفتاح (اسم الملف) | الحالة | تُستخدم في | Prompt |\n|---|---|---|---|---|\n`;
rows.forEach(([k, r], i) => {
  md += `| ${i + 1} | \`${k}\` | ${photoExists(k) ? "✅" : "⏳"} | ${[...r.usedOn].slice(0, 2).map((u) => `/${u}`).join("<br>")} | ${(r.prompt || "").replace(/\|/g, "/").replace(/\n/g, " ")} |\n`;
});
fs.writeFileSync(path.join(ROOT_DIR, "IMAGES.md"), md);

// internal link check
let broken = 0;
for (const { out } of written) {
  const html = fs.readFileSync(out, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(u) || u.startsWith(site.url)) continue;
    let target = path.resolve(path.dirname(out), u);
    if (u.endsWith("/") || u === "./" || u === "." || u === "..") target = path.join(target, "index.html");
    if (!fs.existsSync(target)) { broken++; if (broken < 40) console.warn(`! broken link in ${path.relative(ROOT_DIR, out)} -> ${u}`); }
  }
}
console.log(`✓ ${written.length} pages, ${urls.length} in sitemap, ${rows.length} image slots (${done} ready), ${broken} broken links, assets v=${ver}`);
