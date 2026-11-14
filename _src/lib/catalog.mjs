// Owner-edited catalogues (data/events.json, data/flights.json, data/hotels.json — edited from /admin/).
// The build renders events and flight routes into the page (Arabic, translated like any other text), and
// assets/js/catalog.js redraws them in the browser only when the live file differs from what was built
// (data-sig), so additions from the panel show without a rebuild. Hotels are drawn in the browser only.
import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR, ic, esc, waUrl, sectionHead } from "./ui.mjs";

const readJson = (f, key) => { try { const j = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "data", f), "utf8")); return Array.isArray(j[key]) ? j[key].filter((x) => x && typeof x === "object") : []; } catch { return []; } };
// the currency chosen in the panel (data/prices.json)
const CUR = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "data/prices.json"), "utf8")).currency.symbol || "$"; } catch { return "$"; } })();
// same signature as catalog.js computes from the live file
export const sig = (list, keys) => { let h = 0; const s = JSON.stringify(list.map((x) => keys.map((k) => x[k] ?? null))); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h >>> 0); };

/* ---------- airports (code → Arabic name); keep in step with AIRPORTS in assets/js/catalog.js and admin ---------- */
export const AIRPORTS = {
  IST: "إسطنبول", SAW: "إسطنبول (صبيحة)", ESB: "أنقرة", TZX: "طرابزون", AYT: "أنطاليا", ADB: "إزمير", BJV: "بودروم", DLM: "دالامان", NAV: "كابادوكيا", YEI: "بورصة",
  RUH: "الرياض", JED: "جدة", DMM: "الدمام", MED: "المدينة المنورة", TIF: "الطائف", AHB: "أبها", TUU: "تبوك", ELQ: "القصيم",
  DXB: "دبي", AUH: "أبوظبي", SHJ: "الشارقة", DOH: "الدوحة", KWI: "الكويت", BAH: "البحرين", MCT: "مسقط",
  BGW: "بغداد", EBL: "أربيل", BSR: "البصرة", NJF: "النجف", ISU: "السليمانية", AMM: "عمّان", BEY: "بيروت", DAM: "دمشق", ALP: "حلب",
  CAI: "القاهرة", HRG: "الغردقة", CMN: "الدار البيضاء", RAK: "مراكش", TUN: "تونس", ALG: "الجزائر", MJI: "طرابلس", KRT: "الخرطوم",
  TBS: "تبليسي", BUS: "باتومي", GYD: "باكو", TAS: "طشقند", KUL: "كوالالمبور",
  LHR: "لندن", CDG: "باريس", FRA: "فرانكفورت", MUC: "ميونخ", AMS: "أمستردام", MAD: "مدريد", BCN: "برشلونة", FCO: "روما", VIE: "فيينا",
};
// "4 ساعات تقريباً", "ساعتان و30 دقيقة تقريباً", "ساعة و45 دقيقة تقريباً" (same wording as catalog.js)
export function arDur(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  const hs = h === 0 ? "" : h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
  const ms = !m ? "" : m === 1 ? "دقيقة" : m === 2 ? "دقيقتان" : m <= 10 ? `${m} دقائق` : `${m} دقيقة`;
  return `${[hs, ms].filter(Boolean).join(" و")} تقريباً`;
}

/* ---------- flight routes ---------- */
const FKEYS = ["id", "from", "to", "mins", "price", "active"];
export function flightRoutes() {
  const all = readJson("flights.json", "routes");
  const list = all.filter((r) => r && r.active !== false && AIRPORTS[r.from] && AIRPORTS[r.to]);
  const tile = (r) => `<a class="ctile" data-reveal href="${waUrl(`مرحباً أويا، أرغب بحجز طيران من ${AIRPORTS[r.from]} إلى ${AIRPORTS[r.to]}.`)}" target="_blank" rel="noopener"><span class="ico">${ic("plane")}</span><div><b>${AIRPORTS[r.from]} ← ${AIRPORTS[r.to]}</b><span>${r.mins ? arDur(r.mins) : ""}</span></div>${typeof r.price === "number" && r.price > 0 ? `<span class="ctile__price">من ${Number(r.price).toLocaleString("en-US")}${esc(CUR)}</span>` : ""}</a>`;
  return `<div class="grid grid-4" data-stagger data-flights data-sig="${sig(all, FKEYS)}">${list.map(tile).join("")}</div>`;
}

/* ---------- events (tournaments / matches) ---------- */
const EKEYS = ["id", "title", "tag", "text", "link", "photo", "icon", "priceFrom", "featured", "active", "i18n"];
// the owner's own wording per language (i18n.en / .ru / .tr / .pt) → that language's dictionary for the build
export function eventsDict(lang, dict, idOf) {
  const d = {}, msg = dict[idOf("مرحباً أويا، أرغب بحضور: {0}.")];
  for (const e of readJson("events.json", "events")) {
    const i = e.i18n || {}, pick = (f) => (i[lang] && i[lang][f]) || (i.en && i.en[f]) || "";
    for (const f of ["title", "tag", "text"]) if (e[f] && pick(f) && !(idOf(e[f]) in dict)) d[idOf(e[f])] = pick(f);
    if (e.title && pick("title") && msg && !(idOf(`مرحباً أويا، أرغب بحضور: ${e.title}.`) in dict)) d[idOf(`مرحباً أويا، أرغب بحضور: ${e.title}.`)] = msg.replace("{0}", pick("title"));
  }
  return d;
}
export function eventsGrid() {
  const all = readJson("events.json", "events");
  const list = all.filter((e) => e && e.active !== false && e.title);
  return `<div class="evt-grid" data-events data-sig="${sig(all, EKEYS)}">${list.map(eventCard).join("")}</div>`;
}
export function eventCard(e) {
  const link = e.link ? `{{root}}${esc(e.link.replace(/^\/+/, ""))}` : "";
  const price = typeof e.priceFrom === "number" && e.priceFrom > 0;
  const go = link
    ? `<a class="btn btn--sm evt__go" href="${link}">${ic("ticket")}<span>التذاكر والمقاعد</span></a>`
    : `<a class="btn btn--wa btn--sm evt__go" href="${waUrl(`مرحباً أويا، أرغب بحضور: ${e.title}.`)}" target="_blank" rel="noopener">${ic("whatsapp")}<span>اسأل عن التذاكر</span></a>`;
  return `
<article class="evt${e.featured ? " evt--featured" : ""}" data-reveal>
  <div class="evt__media">${e.photo ? `<img src="{{root}}${esc(e.photo)}" alt="" loading="lazy" decoding="async">` : `<span class="evt__art">${ic(["ball", "trophy", "stadium", "globe"].includes(e.icon) ? e.icon : "ball")}</span>`}${e.tag ? `<span class="evt__tag">${esc(e.tag)}</span>` : ""}</div>
  <div class="evt__body">
    <h3>${link ? `<a class="cover" href="${link}">${esc(e.title)}</a>` : esc(e.title)}</h3>
    ${e.text ? `<p>${esc(e.text)}</p>` : ""}
    <div class="evt__foot">${price ? `<div class="price"><small>يبدأ من / للتذكرة</small><b>${Number(e.priceFrom).toLocaleString("en-US")}<span class="cur">${esc(CUR)}</span></b></div>` : ""}${go}</div>
  </div>
</article>`;
}

/* ---------- selected hotels (browser-drawn; hidden until the owner adds hotels) ---------- */
export const HOTEL_CITIES = { istanbul: "إسطنبول", trabzon: "طرابزون", uzungol: "أوزنجول", sapanca: "سبانجا", antalya: "أنطاليا", bursa: "بورصة", bodrum: "بودروم", cappadocia: "كابادوكيا" };
export function hotelsBlock({ city = "", limit = 0 } = {}) {
  return `
<div class="cabins hotels-db" data-hotels data-city="${city}" data-limit="${limit}">
  <div class="grid grid-3 cab-grid"></div>
  <noscript><p class="muted">لعرض الفنادق فعّل JavaScript، أو راسلنا على واتساب لنرسل لك الخيارات.</p></noscript>
</div>`;
}
export function hotelsSection({ city = "", title = "فنادق مختارة نتعامل معها" } = {}) {
  return `
<section class="section section--white" data-hotels-sec hidden>
  <div class="container">
    ${sectionHead({ eyebrow: `${ic("hotel")} فنادق مختارة`, title, lead: "فنادق نعرفها ونحجز فيها لزبائننا، بصورها الحقيقية وسعر الليلة. اختر فندقك ونؤكد لك التوفر كتابةً." })}
    ${hotelsBlock({ city })}
  </div>
</section>`;
}
