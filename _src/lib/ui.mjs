// Shared HTML helpers & components
import fs from "node:fs";
import path from "node:path";
import { site } from "../site.mjs";

export const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const strip = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
export const join = (arr, fn, sep = "") => (arr || []).map(fn).join(sep);
export const ar = (n) => Number(n).toLocaleString("en-US");

export const ic = (name, cls = "") => `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="{{root}}assets/img/icons.svg#${name}"/></svg>`;

export const waUrl = (text) => `https://wa.me/${site.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
export const waBtn = (text, label = "احجز عبر واتساب", cls = "btn btn--wa") =>
  `<a class="${cls}" href="${waUrl(text)}" target="_blank" rel="noopener">${ic("whatsapp")}<span>${label}</span></a>`;

/* ---------- Image registry (photos supplied later) ---------- */
export const imageRegistry = new Map(); // key -> { prompt, usedOn:Set }
const PH = [
  "linear-gradient(150deg,#0F2C52 0%,#19487E 55%,#2B6BAB 100%)",
  "linear-gradient(160deg,#0A1F3A 0%,#143A68 60%,#4F8BC9 100%)",
  "linear-gradient(140deg,#19487E 0%,#2B6BAB 60%,#8EC1F0 140%)",
  "linear-gradient(155deg,#061428 0%,#19487E 70%,#B8551E 150%)",
];
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export function photoExists(key) {
  return ["webp", "jpg", "jpeg", "png", "avif"].map((e) => `${key}.${e}`).find((f) => fs.existsSync(path.join(ROOT_DIR, "assets/img/photos", f)));
}
export function registerImage(key, prompt, usedOn) {
  if (!key) return;
  const r = imageRegistry.get(key) || { prompt: "", usedOn: new Set() };
  if (prompt && !r.prompt) r.prompt = prompt;
  if (usedOn) r.usedOn.add(usedOn);
  imageRegistry.set(key, r);
}
/** media block: photo if present, otherwise branded illustration placeholder */
export function media({ img, prompt, alt = "", icon = "compass", ratio = "ratio-4x3", cls = "", eager = false, page = "" }) {
  registerImage(img, prompt, page);
  const file = img && photoExists(img);
  const ph = PH[hash(img || alt) % PH.length];
  const pic = file
    ? `<img src="{{root}}assets/img/photos/${file}" alt="${esc(alt)}" width="1536" height="1024" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
    : "";
  return `<div class="media ${ratio} ${cls}" style="--ph:${ph}">${file ? "" : ic(icon, "media__art")}${pic}</div>`;
}

/* ---------- Meteors (Aceternity-style) ---------- */
export function meteors(n = 14, seed = 3) {
  let x = seed;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  return `<div class="meteors" aria-hidden="true">${Array.from({ length: n }, () => `<span class="meteor" style="left:${Math.round(r() * 120)}%;--delay:${(r() * 8).toFixed(2)}s;--dur:${(5 + r() * 6).toFixed(2)}s"></span>`).join("")}</div>`;
}

/* ---------- Layout pieces ---------- */
export const sectionHead = ({ eyebrow, title, lead, center = false, row = false, after = "", h = "h2", cls = "h-xl" }) => `
<div class="section-head${center ? " section-head--center" : ""}${row ? " section-head--row" : ""}" data-reveal>
  <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}<${h} class="${cls}">${title}</${h}>${lead ? `<p class="lead">${lead}</p>` : ""}</div>${after}
</div>`;

export function crumbs(items) {
  return `<nav class="crumbs" aria-label="مسار التصفح"><ol>${items
    .map((c, i) => (i === items.length - 1 ? `<li><span aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="{{root}}${c.path}">${esc(c.name)}</a></li>`))
    .join("")}</ol></nav>`;
}

export function pageHero({ crumbs: cr, eyebrow, title, lead, icon = "compass", img, prompt, chips = [], actions = "", page = "", extra = "" }) {
  registerImage(img, prompt, page);
  const file = img && photoExists(img);
  return `
<section class="page-hero${file ? " has-photo" : ""}">
  ${file ? `<div class="page-hero__bg"><img src="{{root}}assets/img/photos/${file}" alt="" width="1536" height="1024" fetchpriority="high"></div>` : ""}
  <div class="page-hero__art" aria-hidden="true">
    <span class="orb orb--1"></span><span class="orb orb--2"></span>
    <svg class="route" viewBox="0 0 800 600" preserveAspectRatio="none"><path d="M-20 520 C 160 420, 260 560, 420 380 S 640 160, 820 120"/><path d="M-20 300 C 140 260, 300 340, 460 220 S 700 60, 820 40"/></svg>
    ${ic(icon, "big-ico")}
  </div>
  <div class="container">
    ${cr ? crumbs(cr) : ""}
    ${eyebrow ? `<p class="eyebrow fade-in" style="--d:.05s">${eyebrow}</p>` : ""}
    <h1 class="fade-in" style="--d:.12s">${title}</h1>
    ${lead ? `<p class="lead fade-in" style="--d:.24s">${lead}</p>` : ""}
    ${chips.length ? `<div class="page-hero__meta fade-in" style="--d:.34s">${chips.map((c) => `<span class="chip chip--dark">${c.icon ? ic(c.icon) : ""}${c.text}</span>`).join("")}</div>` : ""}
    ${actions ? `<div class="btn-row fade-in" style="--d:.42s">${actions}</div>` : ""}
    ${extra}
  </div>
</section>`;
}

export function faqBlock(items, { title = "الأسئلة الشائعة", eyebrow = "أسئلة وأجوبة", lead = "", id = "faq" } = {}) {
  if (!items || !items.length) return "";
  return `
<section class="section" id="${id}">
  <div class="narrow">
    ${sectionHead({ eyebrow, title, lead, center: true })}
    <div class="faq" data-stagger>
      ${items.map((f, i) => `<details data-reveal${i === 0 ? " open" : ""}><summary>${f.q}<span class="pm">${ic("plus")}</span></summary><div class="ans"><p>${f.a}</p></div></details>`).join("")}
    </div>
  </div>
</section>`;
}

export function ctaBand({ title = "جاهز لحكايتك القادمة؟", lead = "أخبرنا بوجهتك وتواريخك وعدد المسافرين، ويصلك عرض مفصّل خلال وقت قصير — بدون أي التزام.", wa = "مرحباً أويا للسياحة، أرغب بالحصول على عرض لرحلتي القادمة." } = {}) {
  return `
<section class="section section--tight">
  <div class="container">
    <div class="cta" data-reveal="zoom">
      ${ic("plane", "cta__plane")}
      <div class="cta__grid">
        <div><p class="eyebrow">${ic("sparkles")} خدمة شخصية من البداية للنهاية</p><h2 class="h-xl">${title}</h2><p class="lead">${lead}</p></div>
        <div class="btn-row">${waBtn(wa, "تواصل عبر واتساب", "btn btn--wa")}<a class="btn btn--glass" href="tel:${site.phoneIntl}">${ic("phone")}<span class="ltr">${site.phoneDisplay}</span></a></div>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Cards ---------- */
export function priceTag(p) {
  if (p.priceFrom) return `<div class="price"><small>يبدأ من</small><b>${ar(p.priceFrom)}<span class="cur">$</span></b></div>`;
  return `<div class="price"><small>السعر</small><b style="font-size:1.02rem">حسب الموسم — اطلب عرضك</b></div>`;
}
export function packageCard(p, page) {
  const href = `{{root}}packages/${p.slug}/`;
  return `
<article class="card" data-reveal data-tags="${esc([p.region, ...(p.tags || [])].join(" "))}">
  ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
  ${media({ img: p.img, prompt: p.imgPrompt, alt: p.title, icon: p.icon, ratio: "ratio-4x3", page })}
  <div class="card__body">
    <div class="card__meta"><span>${ic("calendar")}${ar(p.days)} أيام / ${ar(p.nights)} ليالٍ</span><span>${ic("pin")}${esc(p.cities.join(" • "))}</span></div>
    <h3 class="card__title"><a href="${href}">${esc(p.title)}</a></h3>
    <p class="card__text">${p.summary}</p>
    <div class="card__foot">${priceTag(p)}<span class="card__go" aria-hidden="true">${ic("arrow")}</span></div>
  </div>
</article>`;
}
export function destCard(d, page, { count } = {}) {
  return `
<a class="dest" href="{{root}}turkey-tours/${d.slug}/" data-reveal>
  ${media({ img: d.img, prompt: d.imgPrompt, alt: d.name, icon: d.icon, ratio: "", page })}
  ${count ? `<span class="chip chip--dark dest__count">${ic("route")}${ar(count)} برامج</span>` : ""}
  <div class="dest__body"><h3>${esc(d.name)}</h3><span class="en">${esc(d.nameEn)}</span><p>${d.tagline || ""}</p></div>
</a>`;
}
export function visaCard(v, base, page) {
  return `
<article class="vcard" data-reveal>
  <div style="display:flex;align-items:center;gap:14px"><span class="stamp${v.group === "saudi" ? "" : " stamp--orange"}">${esc(v.stamp)}</span><h3><a class="cover" href="{{root}}${base}${v.slug}/">${esc(v.name)}</a></h3></div>
  <p>${v.intro}</p>
  <div class="facts">${(v.facts || []).slice(0, 2).map((f) => `<span class="chip">${esc(f.k)}: ${esc(strip(f.v).split(/[(،؛.]| - | — /)[0].trim())}</span>`).join("")}</div>
  <span class="link-arrow">التفاصيل والمتطلبات ${ic("arrow")}</span>
</article>`;
}
export function postCard(p, page) {
  return `
<article class="card post-card" data-reveal>
  ${media({ img: p.img, prompt: p.imgPrompt, alt: p.title, icon: p.icon || "doc", ratio: "ratio-16x9", page })}
  <div class="card__body">
    <div class="post-meta"><span>${esc(p.category || "دليل السفر")}</span><span>${ar(p.readMins || 6)} دقائق قراءة</span></div>
    <h3 class="card__title"><a href="{{root}}blog/${p.slug}/">${esc(p.title)}</a></h3>
    <p class="card__text">${p.excerpt}</p>
  </div>
</article>`;
}
export const featureItem = ({ icon, title, text, tone = "" }) =>
  `<div class="feature" data-reveal><span class="ico ${tone}">${ic(icon)}</span><div><h3>${title}</h3><p>${text}</p></div></div>`;
