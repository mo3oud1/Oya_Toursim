// Articles written by the owner in the admin panel (data/blog.json). The build turns each published article
// into a real page (blog/<slug>/) with its title, description, Article + FAQ structured data, sitemap entry
// and share image, so search engines see it like every other article. Articles are Arabic only (noLocale).
// Scheduling: an article with status "publish" appears once its publishAt time (Istanbul) has passed;
// .github/workflows/build.yml rebuilds the site on every change and every hour.
import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR, photoExists } from "./ui.mjs";

const FILE = path.join(ROOT_DIR, "data/blog.json");
const MANIFEST = path.join(ROOT_DIR, "_src/.owner-posts.json"); // slugs built last time (to remove deleted articles)

export const istanbulTime = (local) => new Date(`${local}${local.length === 16 ? ":00" : ""}+03:00`);
const words = (html) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/* ---------- body sanitizer: a small allow-list, so a paste from Word or a typo cannot break the page ---------- */
const ALLOW = { p: [], h2: ["id"], h3: ["id"], strong: [], b: [], em: [], i: [], u: [], ul: [], ol: [], li: [], blockquote: [], br: [], a: ["href"], img: ["src", "alt"], figure: [], figcaption: [], table: [], thead: [], tbody: [], tr: [], th: [], td: [] };
const VOID = new Set(["br", "img"]);
const BLOCK = new Set(["p", "h2", "h3", "ul", "ol", "blockquote", "figure", "table"]);
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slugId = (t, used) => { let b = t.replace(/<[^>]+>/g, "").trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "part"; let id = b, n = 2; while (used.has(id)) id = `${b}-${n++}`; used.add(id); return id; };
export function sanitize(html) {
  html = String(html || "").replace(/<(script|style|iframe|object|embed|svg|math|template)\b[\s\S]*?<\/\1>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const out = [], stack = [];
  for (const m of html.matchAll(/<\/?([a-zA-Z0-9]+)([^>]*)>|[^<]+|</g)) {
    const tok = m[0];
    if (!m[1]) { out.push(tok === "<" ? "&lt;" : tok.replace(/>/g, "&gt;")); continue; }
    const tag = m[1].toLowerCase(), close = tok.startsWith("</");
    const t = tag === "b" ? "strong" : tag === "i" ? "em" : tag === "div" ? "p" : tag;
    if (!ALLOW[t]) continue;
    if (close) { const i = stack.lastIndexOf(t); if (i > -1) { while (stack.length > i) out.push(`</${stack.pop()}>`); } continue; }
    // a block inside an open paragraph closes the paragraph first (no <p> inside <p>)
    if (BLOCK.has(t) && stack.includes("p")) { while (stack.length) { const x = stack.pop(); out.push(`</${x}>`); if (x === "p") break; } }
    const attrs = [];
    for (const a of (m[2] || "").matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      const k = a[1].toLowerCase(), v = (a[3] ?? a[4] ?? a[5] ?? "").replace(/&amp;/g, "&");
      if (!ALLOW[t].includes(k)) continue;
      if (k === "href" && !/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(v) && !/^[a-z0-9-]+(\/[a-z0-9-]*)*\/?(#[\w-]*)?$/i.test(v)) continue;
      if (k === "src" && !/^(assets\/img\/|https:\/\/)/.test(v)) continue;
      attrs.push(`${k}="${escAttr(v)}"`);
    }
    if (t === "img" && !attrs.some((a) => a.startsWith("src="))) continue;
    out.push(`<${t}${attrs.length ? " " + attrs.join(" ") : ""}>`);
    if (!VOID.has(t)) stack.push(t);
  }
  while (stack.length) out.push(`</${stack.pop()}>`);
  let s = out.join("").replace(/<p>\s*(<br>)?\s*<\/p>/g, "").trim();
  // headings get ids (table of contents), links to our own pages stay relative, outside links open safely
  const used = new Set();
  s = s.replace(/<h([23])( id="[^"]*")?>([\s\S]*?)<\/h\1>/g, (m, n, id, t) => `<h${n} id="${slugId(t, used)}">${t}</h${n}>`);
  s = s.replace(/<a href="https:\/\/(www\.)?oyatourism\.com\/([^"]*)"/g, '<a href="{{root}}$2"');
  s = s.replace(/<a href="([a-z0-9-]+(?:\/[a-z0-9-]*)*\/?(?:#[\w-]*)?)"/gi, '<a href="{{root}}$1"');
  s = s.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
  s = s.replace(/<img src="(assets\/img\/[^"]+)"/g, '<img src="{{root}}$1" loading="lazy" decoding="async"');
  s = s.replace(/<img src="(https:\/\/[^"]+)"/g, '<img src="$1" loading="lazy" decoding="async"');
  return s;
}

/* ---------- published articles as post objects for the blog templates ---------- */
export function ownerPosts(now = new Date()) {
  let db = { posts: [] };
  try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch {}
  const list = Array.isArray(db.posts) ? db.posts : [];
  return list
    .filter((p) => p && p.status === "publish" && /^[a-z0-9-]{3,90}$/.test(p.slug || "") && p.title && p.body && (!p.publishAt || istanbulTime(p.publishAt) <= now))
    .map((p) => {
      const body = sanitize(p.body);
      const date = (p.publishAt || p.created || new Date().toISOString()).slice(0, 10);
      const title = p.title.trim();
      const seoTitle = (p.seoTitle || title).trim();
      return {
        owner: true, slug: p.slug, title, h1: title,
        seo: { title: seoTitle.length > 60 ? seoTitle : `${seoTitle} | أويا`, description: (p.description || p.excerpt || "").trim().slice(0, 165) },
        excerpt: (p.excerpt || p.description || "").trim(), date, updated: (p.updated || date).slice(0, 10),
        readMins: Math.max(2, Math.round(words(body) / 200)), category: p.category || "دليل السفر", icon: "doc",
        img: p.cover && photoExists(p.cover) ? p.cover : null, imgAlt: p.coverAlt || title,
        body, faq: (p.faq || []).filter((f) => f && f.q && f.a).map((f) => ({ q: f.q.trim(), a: f.a.trim() })), related: [],
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// remove the pages of articles that were deleted, unpublished or renamed since the last build
export function pruneOwnerPages(current) {
  let before = [];
  try { before = JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch {}
  const keep = new Set(current.map((p) => p.slug));
  for (const slug of before) if (!keep.has(slug) && /^[a-z0-9-]{3,90}$/.test(slug)) fs.rmSync(path.join(ROOT_DIR, "blog", slug), { recursive: true, force: true });
  fs.writeFileSync(MANIFEST, JSON.stringify([...keep].sort(), null, 1) + "\n");
}
