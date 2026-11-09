// Interactive, decision-focused components: Destination Globe + Trip Finder
import { ic, esc, sectionHead, waUrl } from "./ui.mjs";

const COORDS = {
  istanbul: [41.0082, 28.9784], trabzon: [41.0027, 39.7168], uzungol: [40.6195, 40.2869], bursa: [40.1885, 29.061],
  sapanca: [40.6917, 30.2672], antalya: [36.8969, 30.7133], cappadocia: [38.6431, 34.8289], bodrum: [37.0344, 27.4305],
  "georgia-7-days": [41.7151, 44.8271], "azerbaijan-6-days": [40.4093, 49.8671], "bosnia-7-days": [43.8563, 18.4131],
  "malaysia-9-days": [3.139, 101.6869], "bali-9-days": [-8.4095, 115.1889], "thailand-9-days": [7.8804, 98.3923],
  "maldives-5-days": [4.1755, 73.5093], "egypt-8-days": [30.0444, 31.2357], "uzbekistan-7-days": [39.6542, 66.9597],
};

export function globePlaces(data) {
  const tr = data.destinations.map((d) => ({ id: d.slug, g: "tr", name: d.name, en: d.nameEn, text: d.tagline || "", url: `turkey-tours/${d.slug}/`, cta: "دليل الوجهة والبرامج", loc: COORDS[d.slug] })).filter((x) => x.loc);
  const world = data.packages.filter((p) => p.region === "world").map((p) => ({ id: p.slug, g: "world", name: p.country, en: p.cities.join(" • "), text: p.summary, url: `packages/${p.slug}/`, cta: `البرنامج ${p.days} أيام`, loc: COORDS[p.slug] })).filter((x) => x.loc);
  const visas = [
    { id: "makkah", g: "visa", name: "السعودية — مكة والمدينة", en: "Saudi Arabia", text: "تأشيرة سياحية أو عمرة أو زيارة، مع حجز الطيران وفنادق مكة والمدينة.", url: "saudi-visa/", cta: "تأشيرات السعودية", loc: [21.4225, 39.8262] },
    { id: "dubai", g: "visa", name: "الإمارات — دبي", en: "UAE", text: "فيزا دبي والإمارات لمختلف الجنسيات مع الفندق والطيران.", url: "gcc-visas/uae/", cta: "تأشيرة الإمارات", loc: [25.2048, 55.2708] },
    { id: "doha", g: "visa", name: "قطر — الدوحة", en: "Qatar", text: "تأشيرة قطر ومتطلبات الدخول حسب جنسيتك.", url: "gcc-visas/qatar/", cta: "تأشيرة قطر", loc: [25.2854, 51.531] },
    { id: "paris", g: "visa", name: "أوروبا — شنغن", en: "Schengen", text: "تجهيز ملف فيزا شنغن من تركيا: الأوراق والحجوزات والتأمين.", url: "visas/schengen/", cta: "تأشيرة شنغن", loc: [48.8566, 2.3522] },
    { id: "london", g: "visa", name: "بريطانيا — لندن", en: "United Kingdom", text: "فيزا بريطانيا من إسطنبول مع مراجعة كاملة للملف.", url: "visas/uk/", cta: "تأشيرة بريطانيا", loc: [51.5074, -0.1278] },
  ];
  return [...tr, ...world, ...visas];
}

export function globeSection(data) {
  const places = globePlaces(data);
  const groups = [["tr", "داخل تركيا"], ["world", "خارج تركيا"], ["visa", "تأشيرات"]];
  const first = places[0];
  return `
<section class="section globe-sec" data-globe data-root="{{root}}">
  <div class="container">
    ${sectionHead({ eyebrow: `${ic("globe")} من إسطنبول إلى العالم`, title: "اختر وجهتك… ونرسم لك الطريق", lead: "اسحب الكرة الأرضية أو اختر وجهة من القائمة، لترى أين نأخذك وما البرامج والخدمات المتاحة لها.", center: true })}
    <div class="globe-wrap">
      <div class="globe-stage">
        <canvas class="globe-canvas" width="1200" height="1200" aria-label="كرة أرضية تفاعلية تُظهر وجهات أويا للسياحة" role="img"></canvas>
        <div class="globe-fallback" aria-hidden="true">${ic("globe")}</div>
        <p class="globe-hint">${ic("refresh")} اسحب للتدوير</p>
      </div>
      <div class="globe-panel">
        <div class="globe-tabs" role="tablist" aria-label="نوع الوجهة">
          ${groups.map(([k, l], i) => `<button type="button" role="tab" class="globe-tab" data-group="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}
        </div>
        <div class="globe-chips" role="listbox" aria-label="الوجهات">
          ${places.map((p, i) => `<button type="button" class="globe-chip" role="option" data-id="${p.id}" data-g="${p.g}" aria-selected="${i === 0}"${p.g !== "tr" ? " hidden" : ""}>${ic("pin")}${esc(p.name.split(" — ")[0])}</button>`).join("")}
        </div>
        <article class="globe-card" aria-live="polite">
          <p class="globe-card__en ltr">${esc(first.en)}</p>
          <h3 class="globe-card__name">${esc(first.name)}</h3>
          <p class="globe-card__text">${first.text}</p>
          <div class="btn-row">
            <a class="btn btn--sm globe-card__go" href="{{root}}${first.url}">${ic("route")}<span>${esc(first.cta)}</span></a>
            <a class="btn btn--wa btn--sm globe-card__wa" href="${waUrl(`مرحباً أويا، أرغب برحلة إلى ${first.name}.`)}" target="_blank" rel="noopener">${ic("whatsapp")}<span>اسأل عنها</span></a>
          </div>
        </article>
      </div>
    </div>
  </div>
  <script type="application/json" class="globe-data">${JSON.stringify(places.map((p) => ({ ...p, url: p.url }))).replace(/</g, "\\u003c")}</script>
</section>`;
}

export function finderSection(data, { compact = false } = {}) {
  const pk = data.packages.map((p) => ({ s: p.slug, t: p.title, r: p.region, d: p.days, n: p.nights, c: p.cities.join(" • "), tags: p.tags || [], sum: p.summary, f: !!p.featured }));
  const steps = [
    { k: "who", q: "مع من ستسافر؟", opts: [["family", "family", "عائلة مع أطفال"], ["honeymoon", "ring", "زوجان / شهر عسل"], ["friends", "users", "أصدقاء"], ["any", "user", "بمفردي / رحلة عمل"]] },
    { k: "vibe", q: "ماذا تحب في رحلتك؟", opts: [["nature", "mountain", "طبيعة وبحيرات وجبال"], ["city", "mosque", "مدن ومعالم وتسوق"], ["beach", "sun", "بحر وشواطئ ومنتجعات"], ["winter", "snow", "ثلوج وأجواء شتوية"]] },
    { k: "days", q: "كم يوماً لديك؟", opts: [["short", "clock", "3 – 5 أيام"], ["mid", "calendar", "6 – 8 أيام"], ["long", "calendar", "9 – 12 يوماً"], ["xl", "route", "أكثر من 12 يوماً"]] },
    { k: "where", q: "أين تفضّل؟", opts: [["turkey", "map", "داخل تركيا"], ["world", "globe", "خارج تركيا"], ["any", "compass", "لا يهم — فاجئني"]] },
  ];
  return `
<section class="section${compact ? " section--tight" : ""} finder-sec" data-finder data-root="{{root}}" id="finder">
  <div class="container">
    <div class="finder">
      <div class="finder__intro">
        <p class="eyebrow">${ic("sparkles")} مكتشف الرحلات</p>
        <h2 class="h-xl">لست متأكداً أين تذهب؟</h2>
        <p class="lead">أجب عن 4 أسئلة سريعة ونقترح لك البرامج الأنسب من بين ${pk.length} برنامجاً — خلال 20 ثانية.</p>
        <div class="finder__progress" aria-hidden="true"><span></span></div>
      </div>
      <div class="finder__body">
        ${steps.map((s, i) => `
        <fieldset class="finder__step" data-step="${i}"${i ? " hidden" : ""}>
          <legend><span class="finder__n">${i + 1}/${steps.length}</span>${s.q}</legend>
          <div class="finder__opts">${s.opts.map(([v, icon, l]) => `<button type="button" class="finder__opt" data-k="${s.k}" data-v="${v}">${ic(icon)}<span>${l}</span></button>`).join("")}</div>
          ${i ? `<button type="button" class="finder__back">${ic("arrow")} رجوع</button>` : ""}
        </fieldset>`).join("")}
        <div class="finder__result" hidden>
          <h3 class="finder__rtitle">${ic("check-circle")} أنسب البرامج لك</h3>
          <div class="finder__cards"></div>
          <div class="btn-row mt-1">
            <a class="btn btn--wa finder__wa" href="#" target="_blank" rel="noopener">${ic("whatsapp")}<span>أرسل اختياراتي لمستشار أويا</span></a>
            <button type="button" class="btn btn--ghost finder__restart">${ic("refresh")}<span>ابدأ من جديد</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script type="application/json" class="finder-data">${JSON.stringify(pk).replace(/</g, "\\u003c")}</script>
</section>`;
}
