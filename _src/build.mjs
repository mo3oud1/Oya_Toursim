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
import { hotelCityPage, extraPage, offersHub } from "./lib/templates2.mjs";
import { turkeyVisaPage } from "./pages/turkey-visa.mjs";
import { cabinsPage } from "./pages/cabins.mjs";
import { Translator, hasAr } from "./lib/i18n.mjs";

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
  hotels: await load("hotels.mjs"),
  extras: await load("services-extra.mjs"),
};

// prices database (data/prices.json, edited from /admin/): package "from" prices; new packages are added with null
const PRICES_FILE = path.join(ROOT_DIR, "data/prices.json");
{
  const db = JSON.parse(fs.readFileSync(PRICES_FILE, "utf8"));
  const bySlug = new Map((db.packages || []).map((x) => [x.slug, x]));
  const regionOf = (p) => (p.region || (p.destinations ? "world" : undefined));
  let changed = false;
  data.packages.forEach((p) => {
    const row = bySlug.get(p.slug);
    if (!row) { db.packages.push({ slug: p.slug, name: p.title, region: regionOf(p) || "turkey", priceFrom: null }); changed = true; return; }
    if (row.name !== p.title) { row.name = p.title; changed = true; }
    p.priceFrom = typeof row.priceFrom === "number" && row.priceFrom > 0 ? row.priceFrom : null;
  });
  if (changed) fs.writeFileSync(PRICES_FILE, JSON.stringify(db, null, 2) + "\n");
}

// path -> title (for related links)
data.titles = {};
data.destinations.forEach((d) => (data.titles[`turkey-tours/${d.slug}/`] = `السياحة في ${d.name}`));
data.packages.forEach((p) => (data.titles[`packages/${p.slug}/`] = p.title));
const hubOf = { saudi: "saudi-visa/", gcc: "gcc-visas/", intl: "visas/" };
data.visas.forEach((v) => (data.titles[`${hubOf[v.group]}${v.slug}/`] = v.name));
data.posts.forEach((p) => (data.titles[`blog/${p.slug}/`] = p.title));
data.hotels.forEach((h) => (data.titles[`hotels/${h.slug}/`] = h.slug === "family-friendly" ? "فنادق محافظة وعائلية" : `فنادق ${h.city}`));
data.extras.forEach((x) => (data.titles[x.path] = x.h1.split(":")[0]));
Object.assign(data.titles, { "cabins/": "أكواخ وبنغلات", "flights/": "تذاكر طيران", "hotels/": "فنادق ومنتجعات", "turkey-tours/": "السياحة في تركيا", "world-tours/": "رحلات خارج تركيا", "packages/": "البرامج السياحية", "saudi-visa/": "تأشيرات السعودية", "gcc-visas/": "تأشيرات الخليج", "visas/": "التأشيرات الدولية", "matches/": "تذاكر المباريات", "matches/spanish-super-cup-2027/": "تذاكر كأس السوبر الإسباني 2027", "turkey-visa/": "تأشيرة تركيا للعرب" });

const pages = [
  homePage(data),
  flightsPage(data),
  hotelsPage(data),
  cabinsPage(data),
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
  ...data.hotels.map((h) => hotelCityPage(h, data)),
  ...data.extras.map((x) => extraPage(x, data)),
  ...(data.extras.length ? [offersHub(data)] : []),
  turkeyVisaPage(data),
  aboutPage(data), contactPage(data), faqPage(data), privacyPage(), termsPage(),
  notFoundPage(),
];

// cache-busting version from asset contents
// cache-busting version: covers the stylesheet, the icon sprite and every first-party script
const verHash = crypto.createHash("md5");
for (const f of ["assets/css/main.css", "assets/img/icons.svg", ...fs.readdirSync(path.join(ROOT_DIR, "assets/js")).filter((f) => f.endsWith(".js")).sort().map((f) => `assets/js/${f}`)]) verHash.update(fs.readFileSync(path.join(ROOT_DIR, f)));
const ver = verHash.digest("hex").slice(0, 8);

// Tables: every table sits in a keyboard-scrollable wrapper; tables with 4+ columns get per-cell labels
// so phones can show each row as a small card instead of a cut-off grid.
const stripTags = (x) => x.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
function enhanceTables(html) {
  return html.replace(/(<div class="table-wrap"[^>]*>\s*)?<table([^>]*)>([\s\S]*?)<\/table>(\s*<\/div>)?/g, (m, open, attrs, inner, close) => {
    const heads = [...(inner.match(/<thead[\s\S]*?<\/thead>/) || [""])[0].matchAll(/<th(?=[\s>])[^>]*>([\s\S]*?)<\/th>/g)].map((h) => stripTags(h[1]));
    const wide = heads.length > 3;
    let body = inner.replace(/<th(?=[\s>])(?![^>]*scope=)/g, '<th scope="col"');
    if (wide) body = body.replace(/<tbody>([\s\S]*?)<\/tbody>/, (tb, rows) => "<tbody>" + rows.replace(/<tr>([\s\S]*?)<\/tr>/g, (tr, cells) => { let i = 0; return "<tr>" + cells.replace(/<td(?=[\s>])(?![^>]*data-label)/g, () => `<td data-label="${(heads[i++] || "").replace(/"/g, "&quot;")}"`) + "</tr>"; }) + "</tbody>");
    const cls = /class="/.test(attrs) ? attrs.replace(/class="([^"]*)"/, (c, v) => `class="${/\btable\b/.test(v) ? v : v + " table"}${wide ? " table--stack" : ""}"`) : `${attrs} class="table${wide ? " table--stack" : ""}"`;
    const label = heads.filter(Boolean).slice(0, 5).join("، ") || "جدول";
    return `<div class="table-wrap" tabindex="0" role="region" aria-label="جدول: ${label.replace(/"/g, "&quot;")}"><table${cls}>${body}</table></div>`;
  });
}

// ---------- languages ----------
// Arabic is rendered first; every other language is the same page translated unit by unit (_src/lib/i18n.mjs).
const I18N_DIR = path.join(ROOT_DIR, "_src/i18n");
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const AR = site.locales[0];
const OTHERS = site.locales.slice(1);
const catalogue = new Map(); // every Arabic unit, for translators (_src/i18n/source.json)
const collector = new Translator("ar", {}, { collect: catalogue });
// structured data: page URLs move under the language folder, site-level ids (#org, #website) and files stay
const ldHook = (L) => (obj) => {
  const walk = (v, k) => {
    if (k === "inLanguage") return L.code;
    if (typeof v === "string" && v.startsWith(site.url + "/")) {
      const rest = v.slice(site.url.length + 1);
      return /^(#org|#website|assets\/)/.test(rest) ? v : `${site.url}/${L.prefix}${rest}`;
    }
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === "object") { for (const key of Object.keys(v)) v[key] = walk(v[key], key); return v; }
    return v;
  };
  walk(obj);
};
const translators = Object.fromEntries(OTHERS.map((L) => [L.code, new Translator(L.code, readJson(path.join(I18N_DIR, `${L.code}.json`), {}), { ldHook: ldHook(L) })]));

// shared HTML clean-up (before translation, so generated labels such as table captions are translated too)
const post = (html) => enhanceTables(html.replace(/\n\s*\n+/g, "\n").replace(/<(details|li)([^>]*?) data-reveal(="[a-z]+")?/g, "<$1$2"));
// prices are written 1,065 in Arabic/English; Russian uses 1 065, Turkish and Portuguese 1.065 (a comma is the decimal mark there)
const SEP = { ru: "\u00a0", tr: ".", pt: "." };
const localNumbers = (html, code) => (SEP[code] ? html.replace(/(<b[^>]*>|<span class="lg-price">|<b class="pt">)(\d{1,3}(?:,\d{3})+)(?=\s*(?:<span class="cur">|\$|€|₺))/g, (m, tag, n) => tag + n.replace(/,/g, SEP[code])) : html);
// {{root}} = this language's home, {{site}} = the site root (shared files: assets, icons, sitemap)
const fixRoots = (html, siteRoot, pageRoot) => html
  .replace(/\{\{root\}\}(assets\/|favicon|apple-touch-icon|site\.webmanifest|sitemap\.xml)/g, siteRoot + "$1")
  .replaceAll("{{site}}", siteRoot).replaceAll("{{root}}", pageRoot);
const outFile = (p) => (p.endsWith(".html") ? path.join(ROOT_DIR, p) : path.join(ROOT_DIR, p, "index.html"));
const write = (p, html) => { const f = outFile(p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); return f; };
// remove language folders from a previous build (pages that no longer exist must not linger)
for (const L of OTHERS) fs.rmSync(path.join(ROOT_DIR, L.prefix), { recursive: true, force: true });

const written = [];
const titles = new Map();
for (const page of pages) {
  const depth = page.path.endsWith(".html") ? 0 : page.path.split("/").filter(Boolean).length;
  const root = page.absoluteRoot ? new URL(site.url + "/").pathname : depth ? "../".repeat(depth) : "./";
  const arHtml = post(renderPage(page, data, ver, AR.code));
  collector.page = page.path;
  collector.html(arHtml);
  written.push({ page, lang: AR, path: page.path, out: write(page.path, fixRoots(arHtml, root, root)) });
  if (titles.has(page.title)) console.warn(`! duplicate title: ${page.title} (${page.path} & ${titles.get(page.title)})`);
  titles.set(page.title, page.path);
  if (page.title.length > 70) console.warn(`! long title (${page.title.length}): ${page.path}`);
  if (page.description.length > 165) console.warn(`! long description (${page.description.length}): ${page.path}`);
  if (page.noLocale || page.absoluteRoot) continue;
  for (const L of OTHERS) {
    const t = translators[L.code];
    t.page = page.path;
    const p = L.prefix + page.path;
    const d = p.split("/").filter(Boolean).length;
    const html = localNumbers(t.html(post(renderPage(page, data, ver, L.code))), L.code);
    written.push({ page, lang: L, path: p, out: write(p, fixRoots(html, "../".repeat(d), d > 1 ? "../".repeat(d - 1) : "./")) });
  }
}

// translation report + catalogue for translators
fs.mkdirSync(I18N_DIR, { recursive: true });
const source = [...catalogue.entries()].map(([id, e]) => ({ id, kind: e.kind, ar: e.ar, pages: [...e.pages].slice(0, 4), n: e.n }));
fs.writeFileSync(path.join(I18N_DIR, "source.json"), JSON.stringify(source, null, 1));
const i18nReport = OTHERS.map((L) => { const t = translators[L.code]; return `${L.code}: ${t.missing.size} missing${t.bad.size ? `, ${t.bad.size} with broken placeholders` : ""}`; });
fs.writeFileSync(path.join(I18N_DIR, "_missing.json"), JSON.stringify(Object.fromEntries(OTHERS.map((L) => [L.code, [...translators[L.code].missing.keys(), ...translators[L.code].bad.keys()]])), null, 1));

// sitemap.xml — every language version, each listing its alternates
const today = new Date().toISOString().slice(0, 10);
const prio = (p) => (p === "" ? "1.0" : /^(hotels|flights|turkey-tours|saudi-visa|gcc-visas|visas|packages|matches|world-tours)\/$/.test(p) ? "0.9" : /^(turkey-tours|packages|saudi-visa|gcc-visas|visas|matches|turkey-visa)\//.test(p) ? "0.8" : p.startsWith("blog/") ? "0.7" : "0.5");
// image sitemap entries: the main (1536w) photo files used on each page, hero first
const pagePhotos = (body) => [...new Set([...String(body || "").matchAll(/assets\/img\/photos\/([\w-]+?)(?:-640|-1024)?\.webp/g)].map((m) => m[1]))].slice(0, 12);
const urls = written.filter((w) => !w.page.noindex).map((w) => {
  const imgs = pagePhotos(w.page.body).map((k) => `<image:image><image:loc>${site.url}/assets/img/photos/${k}.webp</image:loc></image:image>`).join("");
  const alts = w.page.noLocale ? "" : site.locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l.code}" href="${site.url}/${l.prefix}${w.page.path}"/>`).join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${site.url}/${w.page.path}"/>`;
  return `  <url><loc>${site.url}/${w.path}</loc><lastmod>${today}</lastmod><priority>${prio(w.page.path)}</priority>${alts}${imgs}</url>`;
});
fs.writeFileSync(path.join(ROOT_DIR, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`);

// robots.txt
const basePath = new URL(site.url + "/").pathname; // "/" on a custom domain, "/Repo/" on github.io
fs.writeFileSync(path.join(ROOT_DIR, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: ${basePath}_src/\nDisallow: ${basePath}README.md\nDisallow: ${basePath}admin/\n\nSitemap: ${site.url}/sitemap.xml\n`);

// web manifest
fs.writeFileSync(path.join(ROOT_DIR, "site.webmanifest"), JSON.stringify({
  name: `${site.name} | ${site.nameEn}`, short_name: "أويا", lang: "ar", dir: "rtl", start_url: "./", scope: "./", display: "standalone",
  background_color: "#F7F4EE", theme_color: "#0A1F3A",
  icons: [{ src: "assets/img/brand/oya-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "assets/img/brand/oya-icon-512.png", sizes: "512x512", type: "image/png" }, { src: "assets/img/brand/oya-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
}, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, ".nojekyll"), "");
// GitHub Pages custom domain: the CNAME file follows site.url (removed again on a github.io address)
const host = new URL(site.url).hostname;
const cnameFile = path.join(ROOT_DIR, "CNAME");
if (host.endsWith("github.io")) fs.rmSync(cnameFile, { force: true });
else fs.writeFileSync(cnameFile, host + "\n");

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
fs.writeFileSync(path.join(ROOT_DIR, "_src", "IMAGES.md"), md);

// internal link check
let broken = 0;
for (const { out } of written) {
  const html = fs.readFileSync(out, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(u) || u.startsWith(site.url)) continue;
    const basePath = new URL(site.url + "/").pathname; // e.g. /Oya_Toursim/
    let target = u.startsWith(basePath) ? path.join(ROOT_DIR, u.slice(basePath.length)) : path.resolve(path.dirname(out), u);
    if (u.endsWith("/") || u === "./" || u === "." || u === "..") target = path.join(target, "index.html");
    if (!fs.existsSync(target)) { broken++; if (broken < 40) console.warn(`! broken link in ${path.relative(ROOT_DIR, out)} -> ${u}`); }
  }
}
console.log(`✓ ${written.length} pages (${site.locales.length} languages), ${urls.length} in sitemap, i18n: ${i18nReport.join(" | ")}, ${rows.length} image slots (${done} ready), ${broken} broken links, assets v=${ver}`);
