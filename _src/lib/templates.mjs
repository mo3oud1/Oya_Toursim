// Detail page templates fed by _src/content/*.mjs
import { site } from "../site.mjs";
import { factIcon, visaValue, daysAr, nightsAr, esc, strip, ic, ar, media, photoStrip, toneFor, pageHero, sectionHead, faqBlock, ctaBand, packageCard, destCard, visaCard, postCard, waBtn, waUrl, featureItem } from "./ui.mjs";
import { tourForm, visaForm } from "./forms.mjs";
import * as S from "./schema.mjs";

const TAGS = { family: "عائلي", honeymoon: "شهر عسل", budget: "اقتصادي", luxury: "فاخر", friends: "أصدقاء", winter: "شتوي", nature: "طبيعة", city: "مدن", beach: "شواطئ" };
export const tagLabel = (t) => TAGS[t] || t;

const base = (page, extra = []) => [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), ...extra].filter(Boolean);

/* ---------------- Destination ---------------- */
/* ---------------- Topic map: which guides support which money pages ---------------- */
const POST_MAP = {
  istanbul: ["istanbul-itinerary-5-days", "day-trips-from-istanbul", "cost-of-travel-to-turkey"],
  bursa: ["day-trips-from-istanbul", "best-time-to-visit-turkey", "turkey-family-itinerary-10-days"],
  sapanca: ["day-trips-from-istanbul", "best-time-to-visit-turkey", "turkey-family-itinerary-10-days"],
  trabzon: ["trabzon-uzungol-travel-guide", "turkey-family-itinerary-10-days", "best-time-to-visit-turkey"],
  uzungol: ["trabzon-uzungol-travel-guide", "turkey-family-itinerary-10-days", "best-time-to-visit-turkey"],
  antalya: ["honeymoon-in-turkey", "best-time-to-visit-turkey", "cost-of-travel-to-turkey"],
  bodrum: ["honeymoon-in-turkey", "best-time-to-visit-turkey", "cost-of-travel-to-turkey"],
  cappadocia: ["honeymoon-in-turkey", "best-time-to-visit-turkey", "cost-of-travel-to-turkey"],
  honeymoon: ["honeymoon-in-turkey", "best-time-to-visit-turkey", "cost-of-travel-to-turkey"],
  family: ["turkey-family-itinerary-10-days", "cost-of-travel-to-turkey", "best-time-to-visit-turkey"],
  world: ["cost-of-travel-to-turkey", "schengen-visa-from-turkey", "best-time-to-visit-turkey"],
  saudi: ["saudi-tourist-visa-for-turkey-residents", "schengen-visa-from-turkey"],
  gcc: ["saudi-tourist-visa-for-turkey-residents", "schengen-visa-from-turkey"],
  intl: ["schengen-visa-from-turkey", "saudi-tourist-visa-for-turkey-residents"],
  matches: ["spanish-super-cup-2027-istanbul-guide", "istanbul-itinerary-5-days", "day-trips-from-istanbul"],
};
export function relatedPosts(keys, data, exclude = "") {
  const slugs = [...new Set(keys.flatMap((k) => POST_MAP[k] || []))].filter((s) => s !== exclude);
  return slugs.map((s) => data.posts.find((p) => p.slug === s)).filter(Boolean).slice(0, 3);
}
export function readFirst(keys, data, page, title = "اقرأ قبل السفر") {
  const posts = relatedPosts(keys, data);
  if (!posts.length) return "";
  return `
<section class="section section--tight">
  <div class="container">
    ${sectionHead({ eyebrow: "من دليل أويا", title, row: true, after: `<a class="btn btn--ghost" href="{{root}}blog/">كل المقالات ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${posts.map((p) => postCard(p, page)).join("")}</div>
  </div>
</section>`;
}

export function destinationPage(d, data) {
  const path = `turkey-tours/${d.slug}/`;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "السياحة في تركيا", path: "turkey-tours/" }, { name: d.name, path }];
  const pkgs = (d.packages || []).map((s) => data.packages.find((p) => p.slug === s)).filter(Boolean);
  const others = data.destinations.filter((x) => x.slug !== d.slug);
  const page = { path, nav: "turkey", title: d.seo.title, description: d.seo.description, crumbs, primaryImage: S.imageUrl(d.img), mbar: { label: "اطلب برنامجاً", icon: "route", msg: `مرحباً أويا للسياحة، أرغب ببرنامج سياحي إلى ${d.name}.` } };
  page.body = `
${pageHero({ crumbs, eyebrow: `دليل الوجهة • <span class="ltr">${esc(d.nameEn)}</span>`, title: d.h1, lead: d.intro, icon: d.icon, img: d.img, prompt: d.imgPrompt, alt: `${d.name}${d.tagline ? " — " + d.tagline : ""}`, page: path,
    chips: (d.facts || []).slice(0, 3).map((f) => ({ icon: "check-circle", text: `${f.k}: ${strip(f.v)}` })),
    actions: `${waBtn(`مرحباً أويا للسياحة، أرغب ببرنامج سياحي إلى ${d.name}.`, `اطلب برنامجاً إلى ${d.name}`)}<a class="btn btn--glass" href="#programs">${ic("route")}<span>البرامج المقترحة</span></a>` })}

<section class="section">
  <div class="container split">
    <div class="prose" data-reveal>
      <p class="eyebrow">لماذا ${esc(d.name)}؟</p>
      <h2 class="h-l" style="margin-top:0">نظرة على ${esc(d.name)}</h2>
      ${d.overview.map((p) => `<p>${p}</p>`).join("")}
    </div>
    <div data-reveal="right">
      ${media({ img: d.img, prompt: d.imgPrompt, alt: `${d.name} — ${d.nameEn}`, icon: d.icon, ratio: "ratio-4x3", label: d.name, en: d.nameEn, tone: toneFor(d.slug), cls: "", page: path }).replace('class="media', 'style="border-radius:var(--r-l);box-shadow:var(--sh-2)" class="media')}
      <dl class="kv mt-2">${(d.facts || []).map((f) => `<div><dt>${ic(factIcon(f.k))}${esc(f.k)}</dt><dd>${f.v}</dd></div>`).join("")}</dl>
    </div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "أبرز المعالم", title: `أجمل الأماكن السياحية في ${esc(d.name)}`, lead: `قائمة مختارة بعناية لما يستحق وقتك في ${esc(d.name)}، مع ترتيب ذكي للزيارات ضمن برامجنا.` })}
    <div class="grid grid-3" data-stagger>
      ${d.highlights.map((h) => `<div class="svc" data-reveal><span class="ico">${ic(h.icon || "camera")}</span><h3>${h.name}</h3><p>${h.text}</p></div>`).join("")}
    </div>
  </div>
</section>

${pkgs.length ? `
<section class="section" id="programs">
  <div class="container">
    ${sectionHead({ eyebrow: "برامج جاهزة", title: `برامج سياحية تشمل ${esc(d.name)}`, lead: "برامج يوماً بيوم يمكن تعديلها بالكامل حسب عدد أيامك وميزانيتك.", row: true, after: `<a class="btn btn--ghost" href="{{root}}packages/">كل البرامج ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${pkgs.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>` : ""}

<section class="section section--sky">
  <div class="container grid grid-2">
    ${d.dayTours && d.dayTours.length ? `<div data-reveal><p class="eyebrow">جولات يومية</p><h2 class="h-l">جولات ورحلات يومية من ${esc(d.name)}</h2><div class="incl" style="grid-template-columns:1fr"><div><ul class="yes">${d.dayTours.map((t) => `<li>${ic("route")}<span><strong>${t.name}:</strong> ${t.text}</span></li>`).join("")}</ul></div></div></div>` : ""}
    ${d.stayAreas && d.stayAreas.length ? `<div data-reveal><p class="eyebrow">أين تقيم؟</p><h2 class="h-l">أفضل مناطق السكن في ${esc(d.name)}</h2><div class="incl" style="grid-template-columns:1fr"><div><ul class="yes">${d.stayAreas.map((t) => `<li>${ic("bed")}<span><strong>${t.name}:</strong> ${t.text}</span></li>`).join("")}</ul></div></div><p class="mt-1">${(data.hotels || []).some((h) => h.slug === d.slug) ? `<a class="link-arrow" href="{{root}}hotels/${d.slug}/">فنادق ${esc(d.name)}: المناطق والخيارات ${ic("arrow")}</a>` : `<a class="link-arrow" href="{{root}}hotels/">احجز فندقك مع أويا ${ic("arrow")}</a>`}</p><p class="muted" style="font-size:.93rem">ونرتّب لك أيضاً <a href="{{root}}transfers/">الاستقبال من المطار</a> و<a href="{{root}}private-driver/">سائقاً خاصاً يتحدث العربية</a>.</p></div>` : ""}
  </div>
</section>

${d.tips && d.tips.length ? `
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "نصائح أويا", title: `نصائح قبل السفر إلى ${esc(d.name)}` })}
    <ul class="docs" data-stagger>${d.tips.map((t) => `<li data-reveal>${ic("check-circle")}<span>${t}</span></li>`).join("")}</ul>
  </div>
</section>` : ""}

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>
      ${sectionHead({ eyebrow: "صمّم رحلتك", title: `خطّط لرحلتك إلى ${esc(d.name)}`, lead: "املأ النموذج وسيصلك برنامج مقترح مع خيارات الفنادق والتنقلات عبر واتساب." })}
      <ul class="docs" style="grid-template-columns:1fr">${["استقبال من المطار وسائق يتحدث العربية", "فنادق مختارة تناسب العائلات والأزواج", "برنامج مرن يُعدّل حسب رغبتك", "متابعة على واتساب طوال الرحلة"].map((x) => `<li>${ic("check-circle")}${x}</li>`).join("")}</ul>
    </div>
    <div class="form-card" data-reveal="zoom">${tourForm({ program: "" })}</div>
  </div>
</section>

${faqBlock(d.faq, { title: `أسئلة شائعة عن السياحة في ${esc(d.name)}` })}
${readFirst([d.slug], data, path)}

<section class="section section--tight">
  <div class="container" data-rail>
    ${sectionHead({ eyebrow: "اكتشف المزيد", title: "وجهات أخرى في تركيا", row: true, after: `<div class="rail-ctrl"><button type="button" data-rail-prev aria-label="السابق">${ic("chev-right")}</button><button type="button" data-rail-next aria-label="التالي">${ic("chev-left")}</button></div>` })}
    <div class="rail">${others.map((o) => destCard(o, path)).join("")}</div>
  </div>
</section>
${ctaBand({ wa: `مرحباً أويا للسياحة، أرغب بعرض لرحلة إلى ${d.name}.` })}`;
  page.schemaGraph = base(page, [S.destinationNode(page, d), S.faqNode(page, d.faq)]);
  return page;
}

/* ---------------- Package ---------------- */
export function packagePage(p, data) {
  const path = `packages/${p.slug}/`;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: p.region === "turkey" ? "البرامج السياحية" : "رحلات خارج تركيا", path: p.region === "turkey" ? "packages/" : "world-tours/" }, { name: p.title, path }];
  const related = data.packages.filter((x) => x.slug !== p.slug && x.region === p.region).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 3);
  const page = { path, nav: p.region === "turkey" ? "turkey" : "world", title: p.seo.title, description: p.seo.description, crumbs, primaryImage: S.imageUrl(p.img) };
  const waText = `مرحباً أويا للسياحة، أرغب بحجز برنامج: ${p.title} (${daysAr(p.days)}).`;
  page.mbar = null; // sticky bar points to the on-page form (#book)
  page.body = `
${pageHero({ crumbs, eyebrow: `${daysAr(p.days)} • ${nightsAr(p.nights)} • ${esc(p.country)}`, title: p.h1, lead: p.summary, icon: p.icon, img: p.img, prompt: p.imgPrompt, alt: `${p.title} — ${p.cities.join("، ")}`, page: path,
    chips: [{ icon: "pin", text: p.cities.join(" ← ") }, ...(p.tags || []).slice(0, 3).map((t) => ({ icon: "tag", text: tagLabel(t) }))],
    actions: `${waBtn(waText, "احجز هذا البرنامج")}<a class="btn btn--glass" href="#itinerary">${ic("route")}<span>البرنامج يوماً بيوم</span></a>` })}

<section class="section">
  <div class="container with-aside">
    <div>
      <div class="prose" data-reveal>
        <h2 class="h-l" style="margin-top:0">عن البرنامج</h2>
        ${p.intro.map((x) => `<p>${x}</p>`).join("")}
      </div>
      ${p.highlights && p.highlights.length ? `<div class="incl mt-2" data-reveal style="grid-template-columns:1fr"><div><h3>${ic("star")} أبرز ما في الرحلة</h3><ul class="yes">${p.highlights.map((h) => `<li>${ic("check")}<span>${h}</span></li>`).join("")}</ul></div></div>` : ""}

      <h2 class="h-l mt-3" id="itinerary" data-reveal>البرنامج يوماً بيوم</h2>
      <ol class="itinerary mt-2" data-stagger>
        ${p.itinerary.map((d) => `<li class="day" data-reveal><span class="day__n"><span><small>اليوم</small><b>${ar(d.day)}</b></span></span><div class="day__card"><h3>${d.title}</h3><p>${d.text}</p>${d.stops && d.stops.length ? `<ul>${d.stops.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}</div></li>`).join("")}
      </ol>

      <div class="incl mt-3" data-stagger>
        <div class="yes" data-reveal><h3>${ic("check-circle")} يشمل البرنامج</h3><ul class="yes">${p.includes.map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div>
        <div class="no" data-reveal><h3>${ic("x-circle")} لا يشمل</h3><ul class="no">${p.excludes.map((x) => `<li>${ic("x")}<span>${x}</span></li>`).join("")}</ul></div>
      </div>

      ${p.hotels && p.hotels.length ? `<div class="mt-3" data-reveal><h2 class="h-l">الإقامة المقترحة</h2><div class="table-wrap"><table class="table"><thead><tr><th>المدينة</th><th>الليالي</th><th>المقترح</th></tr></thead><tbody>${p.hotels.map((h) => `<tr><td><strong>${h.city}</strong></td><td>${h.nights ? ar(h.nights) : "—"}</td><td>${h.text}</td></tr>`).join("")}</tbody></table></div></div>` : ""}

      ${p.notes && p.notes.length ? `<div class="mt-3 stack" data-reveal>${p.notes.map((n) => `<div class="note">${ic("info")}<span>${n}</span></div>`).join("")}</div>` : ""}
    </div>

    <aside class="aside-sticky">
      <div class="summary" data-reveal="right">
        <div class="summary__top">${p.priceFrom ? `<div class="price"><small>يبدأ من / للشخص</small><b>${ar(p.priceFrom)}<span class="cur">$</span></b></div>` : `<div class="price"><small>السعر</small><b style="font-size:1.35rem">حسب الموسم والفندق</b></div>`}<p style="margin:.4em 0 0;color:#B9CCE0;font-size:.9rem">${p.priceNote || "اطلب عرض سعر مخصص لعدد المسافرين وتواريخك."}</p></div>
        <dl>
          <div><dt>${ic("calendar")}المدة</dt><dd>${daysAr(p.days)} / ${nightsAr(p.nights)}</dd></div>
          <div><dt>${ic("pin")}المدن</dt><dd>${esc(p.cities.join("، "))}</dd></div>${(p.dest || []).length ? `<div><dt>${ic("map")}أدلة الوجهات</dt><dd>${(p.dest || []).map((sl) => { const dd = data.destinations.find((x) => x.slug === sl); return dd ? `<a href="{{root}}turkey-tours/${sl}/">${esc(dd.name)}</a>` : ""; }).filter(Boolean).join("، ")}</dd></div>` : ""}
          <div><dt>${ic("users")}مناسب لـ</dt><dd>${(p.tags || []).slice(0, 3).map(tagLabel).join("، ") || "الجميع"}</dd></div>
          <div><dt>${ic("car")}التنقل</dt><dd><a href="{{root}}private-driver/">سيارة خاصة مع سائق</a></dd></div>
          <div><dt>${ic("refresh")}المرونة</dt><dd>قابل للتعديل بالكامل</dd></div>
        </dl>
        <div class="btn-col">
          <a class="btn btn--block" href="#book">${ic("calendar")}<span>احجز الآن — حدّد تاريخك</span></a>
          ${waBtn(waText, "اسأل عبر واتساب", "btn btn--wa btn--block")}
          <a class="btn btn--ghost btn--block" href="${waUrl(`مرحباً أويا، أرغب بتعديل ${p.title} حسب رغبتي.`)}" target="_blank" rel="noopener">${ic("sparkles")}<span>عدّل البرنامج حسب رغبتك</span></a>
          <a class="btn btn--ghost btn--block" href="tel:${site.phoneIntl}">${ic("phone")}<span class="ltr">${site.phoneDisplay}</span></a>
        </div>
      </div>
    </aside>
  </div>
</section>

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "احجز هذا البرنامج", title: `احجز ${esc(p.title)}`, lead: "أضف تاريخ الوصول وعدد المسافرين ومستوى الفنادق، ويصلك عرض مكتوب بالسعر النهائي عبر واتساب." })}</div>
    <div class="form-card" data-reveal="zoom">${tourForm({ program: p.title, days: p.days })}</div>
  </div>
</section>

${faqBlock(p.faq, { title: `أسئلة عن ${esc(p.title)}` })}
${readFirst([...(p.tags || []).filter((t) => t === "honeymoon" || t === "family"), ...(p.region === "world" ? ["world"] : (p.dest || []))], data, path)}

${related.length ? `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "قد يعجبك أيضاً", title: "برامج مشابهة", row: true, after: `<a class="btn btn--ghost" href="{{root}}${p.region === "turkey" ? "packages/" : "world-tours/"}">عرض الكل ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${related.map((r) => packageCard(r, path)).join("")}</div>
  </div>
</section>` : ""}
${ctaBand({ title: "لم تجد البرنامج المثالي؟", lead: "نصمم لك برنامجاً خاصاً بعدد الأيام والمدن والفنادق التي تريدها — فقط أخبرنا.", wa: "مرحباً أويا للسياحة، أرغب ببرنامج مخصص." })}`;
  page.schemaGraph = base(page, [S.tripNode(page, p), S.faqNode(page, p.faq)]);
  return page;
}

/* ---------------- Visa ---------------- */
const VISA_GROUPS = {
  saudi: { hub: "saudi-visa/", hubName: "تأشيرات السعودية", form: "visa" },
  gcc: { hub: "gcc-visas/", hubName: "تأشيرات الخليج", form: "visa" },
  intl: { hub: "visas/", hubName: "التأشيرات الدولية", form: "visa" },
};
export const visaSteps = [
  { icon: "whatsapp", t: "تواصل واستشارة مجانية", d: "أرسل جنسيتك وبلد إقامتك ونوع الزيارة، ونحدد لك التأشيرة المناسبة والمتطلبات بدقة." },
  { icon: "doc", t: "تجهيز الملف", d: "نراجع أوراقك ونرشدك لاستكمال الناقص، ونجهز حجوزات الفندق والطيران والتأمين عند الحاجة." },
  { icon: "send", t: "التقديم والمتابعة", d: "نتولى تعبئة الطلب وتقديمه عبر القناة الرسمية المعتمدة ونتابع حالته أولاً بأول." },
  { icon: "passport", t: "استلام التأشيرة", d: "نبلغك فور صدور القرار ونرسل التأشيرة الإلكترونية، ونساعدك في إكمال باقي ترتيبات السفر." },
];
// sticker visas: the applicant attends biometrics / the interview and collects the passport
export const visaStepsConsular = [
  visaSteps[0],
  visaSteps[1],
  { icon: "calendar", t: "الموعد والتقديم", d: "نساعدك في تعبئة النموذج ونحجز موعدك حسب المتاح، وتحضر البصمة أو المقابلة بنفسك في المركز أو السفارة." },
  { icon: "passport", t: "القرار واستلام الجواز", d: "نتابع حالة طلبك ونخبرك بطريقة الاستلام، ونساعدك في إكمال باقي ترتيبات السفر." },
];

// Official portals per visa (shown as "official sources": we are a private agency, the decision is theirs)
const SRC = {
  saudi: [["منصة التأشيرات السعودية (KSA Visa)", "https://ksavisa.sa"], ["وزارة الخارجية السعودية", "https://www.mofa.gov.sa"]],
  umrah: [["منصة نسك", "https://www.nusuk.sa"], ["منصة التأشيرات السعودية (KSA Visa)", "https://ksavisa.sa"]],
  tourist: [["Visit Saudi", "https://www.visitsaudi.com"], ["منصة التأشيرات السعودية (KSA Visa)", "https://ksavisa.sa"]],
  uae: [["الهيئة الاتحادية للهوية والجنسية (ICP)", "https://icp.gov.ae"], ["إقامة دبي (GDRFA)", "https://gdrfad.gov.ae"]],
  qatar: [["منصة هيّا", "https://hayya.qa"], ["Visit Qatar", "https://visitqatar.com"]],
  oman: [["التأشيرة الإلكترونية — شرطة عُمان السلطانية", "https://evisa.rop.gov.om"]],
  bahrain: [["التأشيرة الإلكترونية — مملكة البحرين", "https://www.evisa.gov.bh"]],
  kuwait: [["بوابة تأشيرات الكويت", "https://kuwaitvisa.moi.gov.kw"]],
  "gcc-unified": [["الأمانة العامة لمجلس التعاون لدول الخليج العربية", "https://www.gcc-sg.org"]],
  schengen: [["المفوضية الأوروبية — الهجرة والشؤون الداخلية", "https://home-affairs.ec.europa.eu"]],
  uk: [["GOV.UK — تأشيرة الزائر القياسية", "https://www.gov.uk/standard-visitor"]],
  usa: [["وزارة الخارجية الأمريكية — التأشيرات", "https://travel.state.gov"]],
  canada: [["الهجرة واللاجئون والمواطنة الكندية (IRCC)", "https://www.canada.ca/en/immigration-refugees-citizenship.html"]],
};
const visaSources = (v) => SRC[v.slug] || (v.group === "saudi" ? SRC.saudi : []);
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const arDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${AR_MONTHS[m - 1]} ${y}`; };
export function visaPage(v, data) {
  const G = VISA_GROUPS[v.group];
  const path = `${G.hub}${v.slug}/`;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: G.hubName, path: G.hub }, { name: v.name, path }];
  const siblings = data.visas.filter((x) => x.group === v.group && x.slug !== v.slug);
  const pending = v.status === "not-launched"; // announced but not open yet: register interest only, no application wording
  const steps = v.consular ? visaStepsConsular : visaSteps;
  const page = { path, nav: "visas", title: v.seo.title, description: v.seo.description, crumbs, modified: site.visasReviewed || undefined, mbar: { label: pending ? "سجّل اهتمامك" : "ابدأ الطلب", icon: "passport", msg: `مرحباً أويا للسياحة، أرغب بالاستفسار عن ${v.name}.` } };
  const pendingBook = `
<section class="section section--white" id="book">
  <div class="container narrow center" data-reveal>
    ${sectionHead({ eyebrow: "سجّل اهتمامك", title: `نبلغك فور إطلاق ${esc(v.name)}`, lead: "تسجيل الاهتمام مجاني ولا يعني حجزاً أو أولوية، ولا نطلب أي دفعة قبل الإعلان الرسمي.", center: true })}
    <div class="btn-row" style="justify-content:center">${waBtn(`مرحباً أويا للسياحة، أرغب بتسجيل اهتمامي بـ${v.name} لتبلغوني عند إطلاقها.`, "سجّل اهتمامك عبر واتساب")}</div>
  </div>
</section>
`;
  const applySections = `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "كيف نعمل", title: "خطوات الحصول على التأشيرة مع أويا", center: true })}
    <div class="steps" data-stagger>${steps.map((s) => `<div class="step" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>
    <p class="center muted mt-2" style="font-size:.92rem">${ic("info")} أويا للسياحة جهة خدمات سفر تساعدك في تجهيز الطلب ومتابعته، وقرار منح التأشيرة يعود للجهات الرسمية المختصة وحدها.</p>
  </div>
</section>

<section class="section" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "ابدأ الآن", title: `اطلب ${esc(v.name)}`, lead: "أرسل بياناتك الأساسية عبر النموذج، ويتواصل معك مختص التأشيرات خلال وقت قصير لتأكيد الأهلية والمتطلبات." })}</div>
    <div class="form-card" data-reveal="zoom">${visaForm({ visa: v.formName || v.name })}</div>
  </div>
</section>
`;
  page.body = `
${pageHero({ crumbs, eyebrow: `${G.hubName} • خدمة تجهيز ومتابعة`, title: v.h1, lead: v.intro, icon: v.icon || "passport", img: v.img, prompt: v.imgPrompt, alt: v.heroAlt || v.name, zoom: v.heroZoom, page: path,
    chips: (v.facts || []).slice(0, 3).map((f) => ({ icon: "check-circle", text: `${f.k}: ${strip(f.v)}` })),
    actions: `${waBtn(pending ? `مرحباً أويا للسياحة، أرغب بتسجيل اهتمامي بـ${v.name} لتبلغوني عند إطلاقها.` : `مرحباً أويا للسياحة، أرغب بالاستفسار عن ${v.name}.`, pending ? "سجّل اهتمامك عبر واتساب" : "ابدأ طلبك عبر واتساب")}<a class="btn btn--glass" href="#docs">${ic("doc")}<span>الأوراق المطلوبة</span></a>` })}

<section class="section section--tight">
  <div class="container"><dl class="kv" data-stagger>${(v.facts || []).map((f) => `<div data-reveal><dt>${ic(factIcon(f.k))}${esc(f.k)}</dt><dd>${f.v}</dd></div>`).join("")}</dl></div>
</section>
${pending ? "" : visaValue({ name: v.name, mode: v.consular ? "consular" : "evisa" })}

<section class="section" style="padding-top:0">
  <div class="container split">
    <div class="prose" data-reveal>
      <h2 class="h-l" style="margin-top:0">نظرة عامة</h2>
      ${v.overview.map((p) => `<p>${p}</p>`).join("")}
    </div>
    <div data-reveal="right">
      ${v.who && v.who.length ? `<div class="incl" style="grid-template-columns:1fr"><div class="yes"><h3>${ic("users")} من يمكنه التقديم؟</h3><ul class="yes">${v.who.map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div></div>` : ""}
    </div>
  </div>
</section>

${photoStrip(v.gallery, { eyebrow: v.galleryEyebrow || "الحرمان الشريفان", title: v.galleryTitle || "مكة المكرمة والمدينة المنورة", page: path })}
${v.types && v.types.length ? `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "الأنواع والخيارات", title: `أنواع ${esc(v.name)}` })}
    <div class="grid grid-3" data-stagger>${v.types.map((t) => `<div class="svc" data-reveal><span class="ico ico--orange">${ic("passport")}</span><h3>${t.name}</h3><p>${t.text}</p></div>`).join("")}</div>
  </div>
</section>` : ""}

<section class="section" id="docs">
  <div class="container">
    ${sectionHead(pending ? { eyebrow: "تسجيل الاهتمام", title: "ما نحتاجه لتسجيل اهتمامك", lead: "لا مستندات رسمية معلنة بعد؛ يكفي ما يلي لنبلغك عند الإطلاق." } : { eyebrow: "قائمة التحقق", title: "الأوراق والمستندات المطلوبة", lead: "القائمة العامة أدناه، وقد تختلف المتطلبات حسب الجنسية وبلد الإقامة — نؤكدها لك قبل التقديم." })}
    <ul class="docs" data-stagger>${v.docs.map((x) => `<li data-reveal>${ic("check-circle")}<span>${x}</span></li>`).join("")}</ul>
    ${v.notes && v.notes.length ? `<div class="stack mt-2">${v.notes.map((n) => `<div class="note note--warn" data-reveal>${ic("alert")}<span>${n}</span></div>`).join("")}</div>` : ""}
  </div>
</section>

${pending ? pendingBook : applySections}

<section class="section section--tight">
  <div class="container narrow">
    <div class="srcbox" data-reveal>
      ${site.visasReviewed ? `<p class="srcbox__date">${ic("calendar")}<span>آخر مراجعة لمعلومات هذه الصفحة: <time datetime="${site.visasReviewed}">${arDate(site.visasReviewed)}</time></span></p>` : ""}
      ${visaSources(v).length ? `<p class="srcbox__t">المصادر الرسمية — تحقّق منها دائماً قبل السفر:</p><ul>${visaSources(v).map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener external">${t} ${ic("arrow")}</a></li>`).join("")}</ul>` : ""}
      <p class="srcbox__n">أويا للسياحة وكالة سفر خاصة ولا تتبع أياً من هذه الجهات. الأنظمة تتغير، ونؤكد لك المتطلبات السارية وقت تقديم طلبك.</p>
    </div>
  </div>
</section>
${faqBlock(v.faq, { title: `أسئلة شائعة عن ${esc(v.name)}` })}
${readFirst([v.group], data, path, "أدلة مفيدة قبل التقديم")}

${siblings.length ? `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "تأشيرات أخرى", title: `المزيد من ${G.hubName}`, row: true, after: `<a class="btn btn--ghost" href="{{root}}${G.hub}">عرض الكل ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${siblings.slice(0, 6).map((s) => visaCard(s, G.hub, path)).join("")}</div>
  </div>
</section>` : ""}
${ctaBand({ title: "سافر بثقة، ونحن نهتم بالأوراق", wa: `مرحباً أويا للسياحة، أرغب بالاستفسار عن ${v.name}.` })}`;
  page.schemaGraph = base(page, [S.serviceNode(page, { name: v.name, type: "Visa assistance", description: strip(v.intro) }), S.faqNode(page, v.faq)]);
  return page;
}

/* ---------------- Blog post ---------------- */
export function postPage(p, data) {
  const path = `blog/${p.slug}/`;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "المدونة", path: "blog/" }, { name: p.title, path }];
  const page = { path, nav: "blog", title: p.seo.title, description: p.seo.description, crumbs, ogType: "article", primaryImage: S.imageUrl(p.img) };
  const toc = [...p.body.matchAll(/<h2 id="([^"]+)"[^>]*>(.*?)<\/h2>/g)].map((m) => ({ id: m[1], t: strip(m[2]) }));
  // related by topic first (same category, then topic map), never the same fixed three
  const sameCat = data.posts.filter((x) => x.slug !== p.slug && x.category === p.category);
  const byTopic = relatedPosts(Object.keys(POST_MAP).filter((k) => (POST_MAP[k] || []).includes(p.slug)), data, p.slug);
  const others = [...new Map([...sameCat, ...byTopic, ...data.posts.filter((x) => x.slug !== p.slug)].map((x) => [x.slug, x])).values()].slice(0, 3);
  const date = new Date(p.date).toLocaleDateString("ar-EG-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
  page.body = `
${pageHero({ crumbs, eyebrow: esc(p.category || "دليل السفر"), title: p.h1 || p.title, lead: p.excerpt, icon: p.icon || "doc", img: p.img, prompt: p.imgPrompt, alt: p.title, page: path, cls: "page-hero--article",
    chips: [{ icon: "calendar", text: `<time datetime="${p.date}">${date}</time>` }, { icon: "clock", text: `${ar(p.readMins || 6)} دقائق قراءة` }, { icon: "user", text: "فريق أويا للسياحة" }] })}
<section class="section">
  <article class="narrow">
    ${toc.length > 2 ? `<nav class="toc" aria-label="محتويات المقال" data-reveal><b>محتويات المقال</b><ol>${toc.map((h) => `<li><a href="#${h.id}">${h.t}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="prose">${p.body}</div>
    <div class="note mt-3">${ic("info")}<span>المعلومات في هذا المقال للإرشاد العام وقد تتغير الأسعار والأنظمة؛ تواصل معنا لتأكيد التفاصيل المحدّثة قبل السفر.</span></div>
  </article>
</section>
${faqBlock(p.faq, { title: "أسئلة متعلقة" })}
${p.related && p.related.length ? `<section class="section section--tight"><div class="narrow"><h2 class="h-l">روابط مفيدة</h2><div class="contact-tiles">${p.related.map((r) => { const name = (data.titles[r] || r); return `<a class="ctile" href="{{root}}${r}"><span class="ico">${ic("route")}</span><div><b>${esc(name)}</b><span>اقرأ المزيد</span></div></a>`; }).join("")}</div></div></section>` : ""}
<section class="section section--white"><div class="container">${sectionHead({ eyebrow: "من المدونة", title: "مقالات قد تهمك" })}<div class="grid grid-3" data-stagger>${others.map((o) => postCard(o, path)).join("")}</div></div></section>
${ctaBand({})}`;
  page.schemaGraph = base(page, [S.articleNode(page, p), S.faqNode(page, p.faq)]);
  page.schemaGraph[2]["@type"] = "WebPage";
  return page;
}
