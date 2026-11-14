// Cabins at build time (data/cabins.json, edited from /admin/): the cards are written into the HTML of
// /cabins/ and the city sections (assets/js/cabins.js then only filters them and adds what changed since the
// last build), and every visible cabin gets its own page /cabins/<slug>/ with a descriptive title, real photos,
// features, nightly price and structured data. Titles are composed per language from the vocabularies below.
import fs from "node:fs";
import path from "node:path";
import { site } from "../site.mjs";
import { ROOT_DIR, ic, esc, sectionHead, pageHero, waUrl, ctaBand } from "./ui.mjs";
import * as S from "./schema.mjs";

const MANIFEST = path.join(ROOT_DIR, "_src/.cabin-pages.json");
export const AREAS = { sapanca: ["سبانجا", "sapanca"], masukiye: ["معشوقية", "sapanca"], kartepe: ["كارتبه", "sapanca"], uzungol: ["أوزنجول", "trabzon"], trabzon: ["طرابزون", "trabzon"], ayder: ["أيدر", "trabzon"] };
export const FEAT = {
  pool: "مسبح خاص", heated: "مسبح مدفأ", jacuzzi: "جاكوزي", fireplace: "مدفأة حطب", lake: "إطلالة على البحيرة",
  mountain: "إطلالة جبلية", forest: "بين الغابات", garden: "حديقة خاصة", bbq: "منطقة شواء", kitchen: "مطبخ مجهّز",
  breakfast: "فطور", wifi: "إنترنت", parking: "موقف سيارات", family: "مناسب للعائلات", couples: "مناسب للأزواج",
};
const CURRENCY = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "data/prices.json"), "utf8")).currency || {}; } catch { return {}; } })();
const CUR = String(CURRENCY.symbol || "$").replace(/[<>&"']/g, "").slice(0, 4), CODE = /^[A-Z]{3}$/.test(CURRENCY.code || "") ? CURRENCY.code : "USD";
const int = (v, d, max) => Math.max(1, Math.min(max, parseInt(v, 10) || d));
export const cabinSlug = (c) => (/^[a-z0-9-]{3,80}$/.test(c.slug || "") ? c.slug : `${c.area}-cabin-${String(c.id).toLowerCase().replace(/[^a-z0-9]+/g, "")}`);

let LIST = null;
export function cabinList() {
  if (LIST) return LIST;
  let db = { cabins: [] };
  try { db = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "data/cabins.json"), "utf8")); } catch {}
  LIST = (Array.isArray(db.cabins) ? db.cabins : [])
    .filter((c) => c && typeof c === "object" && c.active !== false && c.name && c.id && AREAS[c.area])
    .map((c) => ({ ...c, id: String(c.id), slug: cabinSlug(c), rooms: int(c.rooms, 1, 50), guests: int(c.guests, 2, 99), price: typeof c.price === "number" && c.price > 0 ? c.price : 0,
      photos: (Array.isArray(c.photos) ? c.photos : []).filter((p) => /^assets\/img\/[\w./-]+$/.test(p) && !p.includes("..")), features: (Array.isArray(c.features) ? c.features : []).filter((f) => FEAT[f]) }));
  // two cabins with the same composed title keep distinct <title> tags (the owner's name is added)
  const seen = new Map();
  LIST.forEach((c) => { const t = cabinTitle(c); seen.set(t, (seen.get(t) || 0) + 1); });
  LIST.forEach((c) => { c.dup = seen.get(cabinTitle(c)) > 1; });
  return LIST;
}

/* ---------- descriptive titles in every language ---------- */
const TOP = (c) => { const f = c.features, out = []; if (f.includes("heated")) out.push("heated"); else if (f.includes("pool")) out.push("pool"); if (f.includes("jacuzzi")) out.push("jacuzzi"); if (out.length < 2 && f.includes("fireplace")) out.push("fireplace"); return out.slice(0, 2); };
const isVilla = (c) => /v[iİı]ll?a|فيلا/i.test(c.name);
// "Wood fireplace, mountain view, private garden. " from the translated feature labels
const sentence = (feats, lang) => { const t = feats.map((f) => f.toLocaleLowerCase(lang)).join(", "); return t ? t[0].toLocaleUpperCase(lang) + t.slice(1) + ". " : ""; };
// the features a description lists: those the title has not already named
const moreFeats = (c) => { const top = TOP(c); return c.features.filter((f) => !top.includes(f) && !(f === "pool" && top.includes("heated"))).slice(0, 4); };
const list = (a, and) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + and + a[a.length - 1]);
const V = {
  ar: {
    area: { sapanca: "سبانجا", masukiye: "معشوقية", kartepe: "كارتبه", uzungol: "أوزنجول", trabzon: "طرابزون", ayder: "أيدر" },
    feat: { heated: "مسبح مدفأ", pool: "مسبح خاص", jacuzzi: "جاكوزي", fireplace: "مدفأة حطب" },
    title: (c, f) => `${isVilla(c) ? "فيلا" : "بنغل"} ${c.rooms === 1 ? "بغرفة نوم واحدة" : c.rooms === 2 ? "بغرفتي نوم" : `${c.rooms} غرف نوم`}${f.length ? " مع " + f.map((x) => V.ar.feat[x]).join(" و") : ""} في ${V.ar.area[c.area]}`,
    desc: (c, h1, feats) => `${h1}، ${c.guests === 2 ? "يتسع لشخصين" : c.guests > 10 ? `يتسع حتى ${c.guests} شخصاً` : `يتسع حتى ${c.guests} أشخاص`}. ${feats.length ? feats.join("، ") + ". " : ""}صور حقيقية وسعر الليلة، ونؤكد التوفر كتابةً عبر واتساب.`,
    brand: "أويا",
  },
  en: {
    area: { sapanca: "Sapanca", masukiye: "Maşukiye", kartepe: "Kartepe", uzungol: "Uzungöl", trabzon: "Trabzon", ayder: "Ayder" },
    feat: { heated: "heated pool", pool: "private pool", jacuzzi: "jacuzzi", fireplace: "fireplace" },
    title: (c, f) => `${c.rooms}-bedroom ${isVilla(c) ? "villa" : "bungalow"}${f.length ? " with " + list(f.map((x) => V.en.feat[x]), " and ") : ""} in ${V.en.area[c.area]}`,
    desc: (c, h1, feats) => `${h1}, sleeps up to ${c.guests}. ${sentence(feats, "en")}Real photos and nightly rate; availability confirmed in writing on WhatsApp.`,
    brand: "OYA",
  },
  ru: {
    area: { sapanca: "Сапандже", masukiye: "Машукие", kartepe: "Картепе", uzungol: "Узунгёле", trabzon: "Трабзоне", ayder: "Айдере" },
    feat: { heated: "подогреваемым бассейном", pool: "собственным бассейном", jacuzzi: "джакузи", fireplace: "камином" },
    title: (c, f) => `${isVilla(c) ? "Вилла" : "Бунгало"} с ${list([c.rooms === 1 ? "1 спальней" : `${c.rooms} спальнями`, ...f.map((x) => V.ru.feat[x])], " и ")} в ${V.ru.area[c.area]}`,
    desc: (c, h1, feats) => `${h1}, до ${c.guests} гостей. ${sentence(feats, "ru")}Настоящие фото и цена за ночь; наличие подтверждаем письменно в WhatsApp.`,
    brand: "OYA",
  },
  tr: {
    area: { sapanca: "Sapanca'da", masukiye: "Maşukiye'de", kartepe: "Kartepe'de", uzungol: "Uzungöl'de", trabzon: "Trabzon'da", ayder: "Ayder'de" },
    feat: { heated: "ısıtmalı havuzlu", pool: "özel havuzlu", jacuzzi: "jakuzili", fireplace: "şömineli" },
    title: (c, f) => `${V.tr.area[c.area]} ${f.length ? list(f.map((x) => V.tr.feat[x]), " ve ") + " " : ""}${c.rooms} yatak odalı ${isVilla(c) ? "villa" : "bungalov"}`,
    desc: (c, h1, feats) => `${h1}, ${c.guests} kişiye kadar. ${sentence(feats, "tr")}Gerçek fotoğraflar ve gecelik fiyat; müsaitliği WhatsApp'tan yazılı teyit ediyoruz.`,
    brand: "OYA",
  },
  pt: {
    area: { sapanca: "Sapanca", masukiye: "Maşukiye", kartepe: "Kartepe", uzungol: "Uzungöl", trabzon: "Trabzon", ayder: "Ayder" },
    feat: { heated: "piscina aquecida", pool: "piscina privativa", jacuzzi: "jacuzzi", fireplace: "lareira" },
    title: (c, f) => `${isVilla(c) ? "Vila" : "Bangalô"} de ${c.rooms} ${c.rooms === 1 ? "quarto" : "quartos"}${f.length ? " com " + list(f.map((x) => V.pt.feat[x]), " e ") : ""} em ${V.pt.area[c.area]}`,
    desc: (c, h1, feats) => `${h1}, até ${c.guests} hóspedes. ${sentence(feats, "pt")}Fotos reais e preço da diária; disponibilidade confirmada por escrito no WhatsApp.`,
    brand: "OYA",
  },
};
export function cabinTitle(c, lang = "ar") { return V[lang].title(c, TOP(c)); }
const titleTag = (c, lang) => `${cabinTitle(c, lang)}${c.dup ? ` (${c.name})` : ""} | ${V[lang].brand}`;
// kept within 160 characters: the closing sentence is dropped when the features make the text long
const fit = (s) => { if (s.length <= 160) return s; const cut = s.slice(0, s.length - 1).lastIndexOf(". "); return cut > 60 ? s.slice(0, cut + 1) : s; };
const cabinDesc = (c, lang, featLabels) => fit(V[lang].desc(c, cabinTitle(c, lang), featLabels));
const waMsg = (c) => `مرحباً أويا، أرغب بحجز «${c.name}» (${AREAS[c.area][0]}). التواريخ وعدد الأشخاص:`;

// wording that only cabin cards and pages use: [en, ru, tr, pt]
const STR = {
  "صور حقيقية للكوخ نفسه مع سعر الليلة. نؤكد لك التوفر والسعر النهائي كتابةً قبل أي دفع.": [
    "Real photos of this very cabin, with the nightly rate. We confirm availability and the final price in writing before any payment.",
    "Настоящие фото именно этого домика и цена за ночь. Наличие и окончательную цену подтверждаем письменно до любой оплаты.",
    "Bu evin gerçek fotoğrafları ve gecelik fiyatı. Müsaitliği ve kesin fiyatı herhangi bir ödemeden önce yazılı olarak teyit ediyoruz.",
    "Fotos reais desta mesma cabana, com o preço da diária. Confirmamos a disponibilidade e o preço final por escrito antes de qualquer pagamento."],
  "صور الكوخ": ["Cabin photos", "Фото домика", "Evin fotoğrafları", "Fotos da cabana"],
  "مواصفات الكوخ": ["Cabin features", "Удобства домика", "Evin özellikleri", "Características da cabana"],
  "اسم الكوخ": ["Cabin name", "Название домика", "Evin adı", "Nome da cabana"],
  "السعر لليلة الواحدة ويتغيّر حسب الموسم وأيام الأسبوع وعدد الليالي. نرسل لك السعر النهائي مكتوباً مع التوفر قبل أي دفع.": [
    "The price is per night and changes with the season, weekdays and number of nights. We send you the final price in writing, with availability, before any payment.",
    "Цена указана за ночь и зависит от сезона, дней недели и количества ночей. Окончательную цену и наличие мы пришлём письменно до любой оплаты.",
    "Fiyat gecelik olup sezona, haftanın günlerine ve gece sayısına göre değişir. Kesin fiyatı ve müsaitliği herhangi bir ödemeden önce yazılı olarak gönderiyoruz.",
    "O preço é por noite e muda conforme a temporada, os dias da semana e o número de noites. Enviamos o preço final por escrito, com a disponibilidade, antes de qualquer pagamento."],
  "اطلب التوفر والسعر عبر واتساب": ["Ask for availability and price on WhatsApp", "Узнать наличие и цену в WhatsApp", "Müsaitlik ve fiyatı WhatsApp'tan sorun", "Peça disponibilidade e preço pelo WhatsApp"],
  "أكواخ أخرى قد تعجبك": ["Other cabins you may like", "Другие домики, которые могут вам понравиться", "Beğenebileceğiniz diğer evler", "Outras cabanas de que você pode gostar"],
  "كل الأكواخ والبنغلات": ["All cabins & bungalows", "Все домики и бунгало", "Tüm evler ve bungalovlar", "Todas as cabanas e bangalôs"],
  "التفاصيل": ["Details", "Подробнее", "Detaylar", "Detalhes"],
  "كبّر الصورة": ["Enlarge photo", "Увеличить фото", "Fotoğrafı büyüt", "Ampliar foto"],
};
const LANGS = ["en", "ru", "tr", "pt"];

const priceBox = (c) => `<div class="price"><small>${c.price ? "لليلة الواحدة" : "السعر"}</small><b${c.price ? "" : ' class="price__ask"'}>${c.price ? `${Number(c.price).toLocaleString("en-US")}<span class="cur">${esc(CUR)}</span>` : "حسب الموسم — اطلب عرضك"}</b></div>`;
const noteP = (c) => (c.note ? `<p class="cab__note" data-langs="${["ar", ...LANGS.filter((l) => c.i18n && c.i18n[l] && c.i18n[l].note)].join(" ")}">${esc(c.note)}</p>` : "");
const specs = (c) => `<p class="cab__specs"><span>غرف النوم: ${c.rooms}</span><span>الأشخاص: حتى ${c.guests}</span></p>`;

/* ---------- card (assets/js/cabins.js draws the same markup for a cabin added after the last build) ---------- */
export function cabinCard(c) {
  const area = AREAS[c.area], h1 = cabinTitle(c), href = `{{root}}cabins/${c.slug}/`, many = c.photos.length > 1;
  return `<article class="cab" data-reveal data-id="${esc(c.id)}" data-group="${area[1]}" data-guests="${c.guests}" data-price="${c.price}">
<div class="cab__media"${many ? ' tabindex="0" role="group" aria-roledescription="carousel" aria-label="صورة أخرى"' : ""}>${c.photos.length ? c.photos.map((p, i) => `<img ${i ? "data-src" : 'class="is-on" src'}="{{root}}${esc(p)}" alt="${esc(h1)} (${i + 1})" loading="lazy" decoding="async">`).join("") : `<span class="cab__noimg" aria-hidden="true"></span>`}${many ? `<button type="button" dir="ltr" class="cab__nav cab__l" aria-label="صورة أخرى">‹</button><button type="button" dir="ltr" class="cab__nav cab__r" aria-label="صورة أخرى">›</button><span class="cab__n">1 / ${c.photos.length}</span>` : ""}<span class="cab__area">${area[0]}</span></div>
<div class="cab__body"><h3><a href="${href}">${esc(h1)}</a></h3>
${specs(c)}
${c.features.length ? `<ul class="cab__feats">${c.features.slice(0, 6).map((f) => `<li>${FEAT[f]}</li>`).join("")}</ul>` : ""}
${noteP(c)}
<div class="cab__foot">${priceBox(c)}<div class="cab__acts"><a class="cab__more" href="${href}">التفاصيل</a><a class="btn btn--wa btn--sm" href="${waUrl(waMsg(c))}" target="_blank" rel="noopener">احجز</a></div></div>
</div></article>`;
}
export const cabinCards = ({ group = "", limit = 0 } = {}) => { let l = cabinList().filter((c) => !group || AREAS[c.area][1] === group); if (limit) l = l.slice(0, limit); return l.map(cabinCard).join("\n"); };

/* ---------- one page per cabin ---------- */
export function cabinPages() {
  const all = cabinList();
  return all.map((c) => {
    const pathname = `cabins/${c.slug}/`, area = AREAS[c.area][0], h1 = cabinTitle(c);
    const feats = c.features.map((f) => FEAT[f]);
    const crumbs = [{ name: "الرئيسية", path: "" }, { name: "أكواخ وبنغلات", path: "cabins/" }, { name: h1, path: pathname }];
    const og = `assets/img/og/cabin-${c.id.toLowerCase().replace(/[^a-z0-9]+/g, "")}.jpg`;
    const page = { path: pathname, nav: "cabins", crumbs, title: titleTag(c, "ar"), description: cabinDesc(c, "ar", moreFeats(c).map((f) => FEAT[f])), cabin: c };
    if (fs.existsSync(path.join(ROOT_DIR, og))) page.ogImage = og;
    const same = (x) => (AREAS[x.area][1] === AREAS[c.area][1] ? 0 : 1);
    const others = all.filter((x) => x.id !== c.id).sort((a, b) => same(a) - same(b)).slice(0, 3);
    page.body = `
${pageHero({ crumbs, eyebrow: `${ic("cabin")} ${area}`, title: esc(h1), lead: "صور حقيقية للكوخ نفسه مع سعر الليلة. نؤكد لك التوفر والسعر النهائي كتابةً قبل أي دفع.", icon: "cabin", page: pathname, cls: "page-hero--cabin" })}
<section class="section cabp" data-cabins-page>
  <div class="container cabp__grid">
    <div class="cabp__main">
      <h2 class="sr-only">صور الكوخ</h2>
      ${c.photos.length ? `<div class="cabp__photos">${c.photos.map((p, i) => `<a href="{{root}}${esc(p)}" aria-label="كبّر الصورة"><img src="{{root}}${esc(p)}" alt="${esc(h1)} (${i + 1})" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></a>`).join("")}</div>` : ""}
    </div>
    <aside class="cabp__info">
      <h2 class="h-m">مواصفات الكوخ</h2>
      ${specs(c)}
      ${feats.length ? `<ul class="cab__feats">${feats.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}
      ${noteP(c)}
      <p class="cabp__name"><span>اسم الكوخ</span> <b translate="no" dir="ltr">${esc(c.name)}</b></p>
      <div class="cabp__book">
        ${priceBox(c)}
        <a class="btn btn--wa" href="${waUrl(waMsg(c))}" target="_blank" rel="noopener">${ic("whatsapp")}<span>اطلب التوفر والسعر عبر واتساب</span></a>
      </div>
      <p class="muted cabp__terms">السعر لليلة الواحدة ويتغيّر حسب الموسم وأيام الأسبوع وعدد الليالي. نرسل لك السعر النهائي مكتوباً مع التوفر قبل أي دفع.</p>
    </aside>
  </div>
</section>
${others.length ? `<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "أكواخ وبنغلات", title: "أكواخ أخرى قد تعجبك", row: true, after: `<a class="btn btn--ghost" href="{{root}}cabins/">كل الأكواخ والبنغلات ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3 cab-grid" data-stagger>${others.map(cabinCard).join("\n")}</div>
  </div>
</section>` : ""}
${ctaBand({ title: "ما وجدت الكوخ المناسب؟", lead: "أخبرنا بما تبحث عنه، ونرسل لك خيارات أخرى متاحة في تواريخك.", wa: "مرحباً أويا، أبحث عن كوخ أو بنغل للإقامة." })}`;
    const id = `${site.url}/${pathname}#cabin`;
    const node = {
      "@type": "Accommodation", "@id": id, name: h1, description: page.description, url: `${site.url}/${pathname}`,
      ...(c.photos.length ? { image: c.photos.slice(0, 8).map((p) => `${site.url}/${p}`) } : {}),
      numberOfBedrooms: c.rooms, occupancy: { "@type": "QuantitativeValue", maxValue: c.guests },
      address: { "@type": "PostalAddress", addressLocality: area, addressCountry: "TR" },
      amenityFeature: feats.map((f) => ({ "@type": "LocationFeatureSpecification", name: f, value: true })),
    };
    const offer = c.price ? { "@type": "Offer", "@id": `${site.url}/${pathname}#offer`, itemOffered: { "@id": id }, url: `${site.url}/${pathname}`, offeredBy: { "@id": `${site.url}/#org` },
      priceSpecification: { "@type": "UnitPriceSpecification", price: c.price, priceCurrency: CODE, unitCode: "DAY" } } : null;
    page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), node, offer].filter(Boolean);
    return page;
  });
}

/* ---------- translations of composed strings (titles, specs, alt texts, WhatsApp messages) ---------- */
export function cabinDict(lang, dict, idOf) {
  const d = {}, li = LANGS.indexOf(lang), T = (ar) => dict[idOf(ar)] || "";
  for (const [ar, tr] of Object.entries(STR)) d[idOf(ar)] = tr[li];
  const rooms = T("غرف النوم: {0}"), guests = T("الأشخاص: حتى {0}"), msg = T("مرحباً أويا، أرغب بحجز «{0}» ({1}). التواريخ وعدد الأشخاص:");
  for (const c of cabinList()) {
    const ar = cabinTitle(c), tr = cabinTitle(c, lang), area = T(AREAS[c.area][0]) || V[lang].area[c.area];
    const feats = moreFeats(c).map((f) => T(FEAT[f]) || FEAT[f]);
    d[idOf(ar)] = tr; d[idOf(titleTag(c, "ar"))] = titleTag(c, lang);
    d[idOf(cabinDesc(c, "ar", moreFeats(c).map((f) => FEAT[f])))] = cabinDesc(c, lang, feats);
    c.photos.forEach((p, i) => { d[idOf(`${ar} (${i + 1})`)] = `${tr} (${i + 1})`; });
    if (rooms) d[idOf(`غرف النوم: ${c.rooms}`)] = rooms.replace("{0}", c.rooms);
    if (guests) d[idOf(`الأشخاص: حتى ${c.guests}`)] = guests.replace("{0}", c.guests);
    if (msg) d[idOf(waMsg(c))] = msg.replace("{0}", c.name).replace("{1}", area);
    const note = c.i18n && c.i18n[lang] && c.i18n[lang].note; if (c.note && note) d[idOf(c.note)] = String(note);
  }
  return d;
}

// remove the pages of cabins that were deleted or hidden since the last build
export function pruneCabinPages(pages) {
  let before = [];
  try { before = JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch {}
  const keep = new Set(pages.map((p) => p.cabin.slug));
  for (const slug of Array.isArray(before) ? before : []) if (!keep.has(slug) && /^[a-z0-9-]{3,80}$/.test(slug)) fs.rmSync(path.join(ROOT_DIR, "cabins", slug), { recursive: true, force: true });
  fs.writeFileSync(MANIFEST, JSON.stringify([...keep].sort(), null, 1) + "\n");
}
