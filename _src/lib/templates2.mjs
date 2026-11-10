// Templates: hotel city pages, quick service pages, seasonal offers (+ offers hub)
import { site } from "../site.mjs";
import { heroPhoto } from "../content/hero-photos.mjs";
import { factIcon, esc, strip, ic, ar, media, photoStrip, toneFor, pageHero, sectionHead, faqBlock, ctaBand, packageCard, waBtn, waUrl } from "./ui.mjs";
import { hotelForm, tourForm, transferForm, driverForm, dayTripForm, umrahForm } from "./forms.mjs";
import { readFirst } from "./templates.mjs";
import * as S from "./schema.mjs";

const TAG = { family: "عائلات", luxury: "فاخر", budget: "اقتصادي", view: "إطلالة", nature: "طبيعة", shopping: "تسوق", quiet: "هدوء", beach: "شاطئ", city: "مدن", friends: "أصدقاء", honeymoon: "شهر عسل", winter: "شتوي" };
const graph = (page, extra, type = "WebPage") => [S.orgNode(), S.websiteNode(), S.webPageNode(page, type), S.breadcrumbNode(page), ...extra].filter(Boolean);
const kv = (facts) => `<dl class="kv" data-stagger>${(facts || []).map((f) => `<div data-reveal><dt>${ic(factIcon(f.k))}${esc(f.k)}</dt><dd>${f.v}</dd></div>`).join("")}</dl>`;
const steps = (list) => `<div class="steps" data-stagger>${list.map((s, i) => `<div class="step" data-reveal><span class="ico">${ic(["send", "doc", "check-circle", "plane"][i % 4])}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>`;

/* ---------------- Hotel city pages ---------------- */
export function hotelCityPage(h, data) {
  const path = `hotels/${h.slug}/`;
  const short = h.slug === "family-friendly" ? "فنادق محافظة وعائلية" : `فنادق ${h.city}`;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "فنادق ومنتجعات", path: "hotels/" }, { name: short, path }];
  const pkgs = (h.packages || []).map((s) => data.packages.find((p) => p.slug === s)).filter(Boolean).slice(0, 3);
  const dest = h.destination && data.destinations.find((d) => d.slug === h.destination);
  const others = data.hotels.filter((x) => x.slug !== h.slug);
  const page = { path, nav: "hotels", crumbs, title: h.seo.title, description: h.seo.description, primaryImage: S.imageUrl(h.img) };
  page.body = `
${pageHero({ crumbs, eyebrow: `فنادق ومنتجعات • <span class="ltr">${esc(h.cityEn)}</span>`, title: h.h1, lead: h.intro, icon: h.icon || "hotel", img: h.img, prompt: h.imgPrompt, page: path,
    chips: (h.facts || []).slice(0, 3).map((f) => ({ icon: "check-circle", text: `${f.k}: ${strip(f.v).split(/[،(]/)[0]}` })),
    actions: `<a class="btn" href="#book">${ic("bed")}<span>اطلب عروض الفنادق</span></a>${waBtn(`مرحباً أويا، أرغب بحجز ${short}.`, "واتساب", "btn btn--glass")}` })}

<section class="section section--tight"><div class="container">${kv(h.facts)}</div></section>

<section class="section" style="padding-top:0">
  <div class="container split">
    <div class="prose" data-reveal><h2 class="h-l" style="margin-top:0">${esc(short)}: ما يجب أن تعرفه</h2>${h.overview.map((p) => `<p>${p}</p>`).join("")}</div>
    <div data-reveal="right">${media({ img: h.img, prompt: h.imgPrompt, alt: short, ratio: "ratio-4x3", label: short, en: h.cityEn, tone: h.destination ? toneFor(h.destination) : "gulf", page: path }).replace('class="media', 'style="border-radius:var(--r-l);box-shadow:var(--sh-2)" class="media')}</div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "أين تقيم؟", title: h.slug === "family-friendly" ? "أين تجد الفنادق المناسبة للعائلات؟" : `أفضل مناطق السكن في ${esc(h.city)}`, lead: "اختر المنطقة حسب برنامجك وأسلوب رحلتك، ونقترح لك فنادق مناسبة داخلها." })}
    <div class="grid grid-3" data-stagger>
      ${h.areas.map((a) => `<article class="vcard" data-reveal><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3>${esc(a.name)}</h3>${a.nameEn ? `<span class="muted ltr" style="font-size:.78rem">${esc(a.nameEn)}</span>` : ""}</div><span class="chip chip--orange" style="align-self:flex-start">${ic("users")}${esc(a.bestFor)}</span><p>${a.text}</p><div class="facts">${(a.tags || []).map((t) => `<span class="chip">${TAG[t] || t}</span>`).join("")}</div></article>`).join("")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "أنواع الإقامة", title: `خيارات الإقامة في ${h.slug === "family-friendly" ? "تركيا" : esc(h.city)}` })}
    <div class="grid grid-3" data-stagger>${h.types.map((t) => `<div class="svc" data-reveal><span class="ico">${ic(t.icon || "hotel")}</span><h3>${t.name}</h3><p>${t.text}</p></div>`).join("")}</div>
  </div>
</section>

<section class="section section--sky">
  <div class="container grid grid-2">
    <div data-reveal><p class="eyebrow">قبل أن تحجز</p><h2 class="h-l">تأكّد من هذه التفاصيل</h2><ul class="docs" style="grid-template-columns:1fr">${h.checklist.map((x) => `<li>${ic("check-circle")}<span>${x}</span></li>`).join("")}</ul></div>
    <div data-reveal><p class="eyebrow">نصائح أويا</p><h2 class="h-l">نصائح الحجز</h2><ul class="docs" style="grid-template-columns:1fr">${h.tips.map((x) => `<li>${ic("sparkles")}<span>${x}</span></li>`).join("")}</ul>${dest ? `<p class="mt-1"><a class="link-arrow" href="{{root}}turkey-tours/${dest.slug}/">دليل السياحة في ${esc(dest.name)} ${ic("arrow")}</a></p>` : ""}</div>
  </div>
</section>

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "عروض مختارة", title: `احصل على عروض ${esc(short)}`, lead: "أرسل التواريخ وعدد الغرف والمنطقة المفضلة، ونرسل لك خيارات مختارة بالصور والأسعار المؤكدة." })}</div>
    <div class="form-card" data-reveal="zoom">${hotelForm({ city: h.slug === "family-friendly" ? "" : h.city })}</div>
  </div>
</section>

${pkgs.length ? `<section class="section"><div class="container">${sectionHead({ eyebrow: "فندق + برنامج", title: "برامج تشمل الإقامة", row: true, after: `<a class="btn btn--ghost" href="{{root}}packages/">كل البرامج ${ic("arrow", "i-flip")}</a>` })}<div class="grid grid-3" data-stagger>${pkgs.map((p) => packageCard(p, path)).join("")}</div></div></section>` : ""}
${faqBlock(h.faq, { title: `أسئلة شائعة عن ${esc(short)}` })}
${readFirst([h.destination || "family"], data, path)}
<section class="section section--tight"><div class="container">${sectionHead({ eyebrow: "مدن أخرى", title: "فنادق في وجهات أخرى" })}<div class="contact-tiles">${others.map((o) => `<a class="ctile" href="{{root}}hotels/${o.slug}/"><span class="ico">${ic(o.icon || "hotel")}</span><div><b>${o.slug === "family-friendly" ? "فنادق محافظة وعائلية" : `فنادق ${esc(o.city)}`}</b><span>${esc(o.cityEn)}</span></div></a>`).join("")}</div></div></section>
${ctaBand({ title: "فندقك المثالي على بُعد رسالة", wa: `مرحباً أويا، أرغب بحجز ${short}.` })}`;
  page.schemaGraph = graph(page, [S.serviceNode(page, { name: short, type: "Hotel booking", description: strip(h.intro), areaServed: "TR" }), S.faqNode(page, h.faq)]);
  return page;
}

/* ---------------- Services & seasonal offers ---------------- */
const FORMS = {
  "airport-transfer": () => transferForm(),
  "private-driver": () => driverForm(),
  "day-trips": (s) => dayTripForm(s.items || []),
  "eid-al-fitr-2027": () => tourForm({ program: "" }),
  "ramadan-umrah-2027": () => umrahForm(),
};
export function extraPage(s, data) {
  const path = s.path;
  const isOffer = s.kind === "offer";
  const crumbs = isOffer ? [{ name: "الرئيسية", path: "" }, { name: "العروض الموسمية", path: "offers/" }, { name: s.h1.split(":")[0], path }] : [{ name: "الرئيسية", path: "" }, { name: s.h1.split(":")[0], path }];
  const page = { path, nav: isOffer ? "offers" : "turkey", crumbs, title: s.seo.title, description: s.seo.description, primaryImage: S.imageUrl(s.img) };
  const suggested = (s.suggested || []).map((x) => data.packages.find((p) => p.slug === x)).filter(Boolean);
  page.body = `
${pageHero({ crumbs, eyebrow: s.eyebrow || (isOffer ? "عرض موسمي" : "خدمة"), title: s.h1, lead: s.intro, icon: s.icon || "car", img: s.img, prompt: s.imgPrompt, page: path,
    chips: (s.facts || []).slice(0, 3).map((f) => ({ icon: "check-circle", text: `${f.k}: ${strip(f.v).split(/[،(]/)[0]}` })),
    actions: `<a class="btn" href="#book">${ic(isOffer ? "calendar" : "send")}<span>${s.slug === "ramadan-umrah-2027" ? "سجّل اهتمامك" : "احجز الآن"}</span></a>${waBtn(`مرحباً أويا، أرغب بالاستفسار عن: ${s.h1.split(":")[0]}.`, "واتساب", "btn btn--glass")}` })}
<section class="section section--tight"><div class="container">${kv(s.facts)}</div></section>
<section class="section" style="padding-top:0">
  <div class="container split">
    <div class="prose" data-reveal><h2 class="h-l" style="margin-top:0">نظرة سريعة</h2>${s.overview.map((p) => `<p>${p}</p>`).join("")}</div>
    <div data-reveal="right">${s.includes && s.includes.length ? `<div class="incl" style="grid-template-columns:1fr"><div class="yes"><h3>${ic("check-circle")} ما تشمله الخدمة</h3><ul class="yes">${s.includes.map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div></div>` : ""}</div>
  </div>
</section>
${photoStrip(s.gallery, { eyebrow: "الحرمان الشريفان", title: "مكة المكرمة والمدينة المنورة", page: path })}
${s.options && s.options.length ? `<section class="section section--white"><div class="container">${sectionHead({ eyebrow: "الخيارات", title: isOffer ? "ماذا نرتّب لك؟" : "اختر ما يناسبك" })}<div class="grid grid-3" data-stagger>${s.options.map((o) => `<div class="svc" data-reveal><span class="ico">${ic(o.icon || "sparkles")}</span><h3>${o.name}</h3><p>${o.text}</p></div>`).join("")}</div></div></section>` : ""}
${s.items && s.items.length ? `<section class="section"><div class="container">${sectionHead({ eyebrow: "الجولات", title: "اختر جولتك اليومية", lead: "مدد الجولات تقريبية وتشمل التنقل بسيارة خاصة مع سائق يتحدث العربية." })}<div class="grid grid-3" data-stagger>${s.items.map((t) => `<article class="vcard" data-reveal><span class="chip" style="align-self:flex-start">${ic("pin")}من ${esc(t.from)} • ${esc(t.duration)}</span><h3>${esc(t.name)}</h3><p>${t.text}</p><div class="facts">${(t.stops || []).slice(0, 5).map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div><a class="link-arrow" href="#book" data-prefill="trip-select|${esc(t.name)}">احجز هذه الجولة ${ic("arrow")}</a></article>`).join("")}</div></div></section>` : ""}
${suggested.length ? `<section class="section"><div class="container">${sectionHead({ eyebrow: "برامج مقترحة", title: "برامج تناسب هذا الموسم" })}<div class="grid grid-3" data-stagger>${suggested.map((p) => packageCard(p, path)).join("")}</div></div></section>` : ""}
${s.steps && s.steps.length ? `<section class="section section--white"><div class="container">${sectionHead({ eyebrow: "كيف تعمل", title: "خطوات بسيطة", center: true })}${steps(s.steps)}</div></section>` : ""}
${s.checklist && s.checklist.length ? `<section class="section section--sky"><div class="container">${sectionHead({ eyebrow: "قائمة التحضير", title: s.slug === "ramadan-umrah-2027" ? "جدول التحضير لعمرة رمضان" : "قائمة الحجز المبكر" })}<ul class="docs">${s.checklist.map((x) => `<li>${ic("check-circle")}<span>${x}</span></li>`).join("")}</ul></div></section>` : ""}
${s.notes && s.notes.length ? `<section class="section section--tight"><div class="container stack">${s.notes.map((n) => `<div class="note note--warn" data-reveal>${ic("alert")}<span>${n}</span></div>`).join("")}</div></section>` : ""}
<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: s.slug === "ramadan-umrah-2027" ? "تسجيل اهتمام" : "احجز الآن", title: s.slug === "ramadan-umrah-2027" ? "سجّل اهتمامك بعمرة رمضان" : "أرسل طلبك", lead: "املأ النموذج وسيفتح واتساب برسالة جاهزة، ويصلك عرض مكتوب قبل أي دفع." })}</div>
    <div class="form-card" data-reveal="zoom">${(FORMS[s.slug] || (() => tourForm()))(s)}</div>
  </div>
</section>
${faqBlock(s.faq, { title: "أسئلة شائعة" })}
${readFirst([s.slug === "ramadan-umrah-2027" ? "saudi" : s.slug === "day-trips" ? "istanbul" : "family"], data, path)}
${ctaBand({})}`;
  const extra = [S.serviceNode(page, { name: s.h1.split(":")[0], type: isOffer ? "Travel offer" : "Travel service", description: strip(s.intro), areaServed: "TR" }), S.faqNode(page, s.faq)];
  if (s.items && s.items.length) extra.push({ "@type": "ItemList", "@id": `${site.url}/${path}#trips`, itemListElement: s.items.map((t, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristTrip", name: t.name, description: strip(t.text), provider: { "@id": `${site.url}/#org` } } })) });
  page.schemaGraph = graph(page, extra);
  return page;
}

export function offersHub(data) {
  const path = "offers/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "العروض الموسمية", path }];
  const page = { path, nav: "offers", crumbs, title: "عروض سياحية موسمية 2027: العيد ورمضان والسوبر الإسباني | أويا", description: "عروض أويا الموسمية: عيد الفطر 2027 في تركيا، عمرة رمضان 2027، وباقات كأس السوبر الإسباني في إسطنبول. احجز مبكراً عبر واتساب." };
  const offers = data.extras.filter((x) => x.kind === "offer").map((x) => ({ href: x.path, title: x.h1.split(":")[0], text: x.intro, icon: x.icon || "calendar" }));
  offers.unshift({ href: "matches/spanish-super-cup-2027/", title: "باقات كأس السوبر الإسباني 2027", text: "فندق قرب الملعب وتنقلات ومساعدة في التذكرة الرسمية — 2 إلى 6 فبراير 2027 في إسطنبول.", icon: "trophy" });
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-offers"), eyebrow: "العروض الموسمية", title: "عروض الموسم: احجز مبكراً واضمن الأفضل", lead: "مواسم الطلب العالي تنفد فيها الفنادق والفلل سريعاً. اختر موسمك وسجّل طلبك مبكراً.", icon: "calendar", page: path })}
<section class="section"><div class="container"><div class="grid grid-3" data-stagger>${offers.map((o) => `<article class="vcard" data-reveal><span class="ico ico--orange">${ic(o.icon)}</span><h3><a class="cover" href="{{root}}${o.href}">${esc(o.title)}</a></h3><p>${o.text}</p><span class="link-arrow">التفاصيل ${ic("arrow")}</span></article>`).join("")}</div></div></section>
${ctaBand({})}`;
  page.schemaGraph = graph(page, [S.itemListNode(page, offers.map((o) => ({ path: o.href, name: o.title })))], "CollectionPage");
  return page;
}
