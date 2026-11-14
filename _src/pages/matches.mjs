import fs from "node:fs";
import path from "node:path";
import { site } from "../site.mjs";
import { heroPhoto } from "../content/hero-photos.mjs";
import { ROOT_DIR, ic, esc, sectionHead, faqBlock, ctaBand, pageHero, waBtn, waUrl, packageCard, nightsAr } from "../lib/ui.mjs";
import { readFirst } from "../lib/templates.mjs";
import { matchForm } from "../lib/forms.mjs";
import * as S from "../lib/schema.mjs";
import { eventsGrid } from "../lib/catalog.mjs";

// ---- Event data (edit here when official kick-off times / venues / prices are announced) ----
// Club crests: the owner supplied them and chose to show them (they are the clubs' trademarks — the owner's
// decision and risk). Set SHOW_CRESTS = false to fall back to the generic kit-colour shields.
// stripes = kit colours for the generic shield / club card band; tone = the colour used for the card background.
const SHOW_CRESTS = true;
const teams = {
  fcb: { name: "برشلونة", en: "FC Barcelona", short: "FCB", stripes: ["#004D98", "#A50044"], rim: "#EDBB00", tone: "#004D98", nick: "البلاوغرانا", city: "برشلونة", founded: 1899 },
  atm: { name: "أتلتيكو مدريد", en: "Atlético de Madrid", short: "ATM", stripes: ["#CB3524", "#FFFFFF"], band: "#272E61", rim: "#272E61", tone: "#CB3524", nick: "الروخيبلانكوس", city: "مدريد", founded: 1903 },
  rma: { name: "ريال مدريد", en: "Real Madrid", short: "RMA", stripes: ["#FFFFFF", "#F1F1F1"], rim: "#FEBE10", tone: "#5B4A9E", nick: "لوس بلانكوس", city: "مدريد", founded: 1902 },
  rso: { name: "ريال سوسيداد", en: "Real Sociedad", short: "RSO", stripes: ["#0067B1", "#FFFFFF"], rim: "#0067B1", tone: "#0067B1", nick: "التشوري أوردين", city: "سان سيباستيان", founded: 1909 },
  tbd: { name: "الفائز من نصف النهائي الأول", en: "TBD", short: "?", stripes: ["#19487E", "#143A68"], rim: "#ED5404", tone: "#ED5404" },
  tbd2: { name: "الفائز من نصف النهائي الثاني", en: "TBD", short: "?", stripes: ["#19487E", "#143A68"], rim: "#ED5404", tone: "#ED5404" },
};
// Ticket prices per category — fill the numbers from the owner's price list (null = «اطلب السعر»).
const CURRENCY = { symbol: "$", code: "USD" };
// prices come from data/prices.json (edited from /admin/); labels A+ / A / B / C follow the owner's price list
const PRICE_DB = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "data/prices.json"), "utf8"));
const dbPrices = (id) => { const r = PRICE_DB.superCup?.matches?.[id] || {}; const o = {}; for (const k of ["cat3", "cat2", "cat1", "vip"]) o[k] = typeof r[k] === "number" && r[k] > 0 ? r[k] : null; return o; };
const CATS = [["cat3", "الفئة C"], ["cat2", "الفئة B"], ["cat1", "الفئة A"], ["vip", "الفئة A+\u200E"]];
export const scMatches = [
  { id: "sf1", stage: "نصف النهائي الأول", date: "2027-02-02", dateAr: "الثلاثاء 2 فبراير 2027 • 22:00", home: "fcb", away: "atm", start: "2027-02-02T22:00:00+03:00", venue: "Chobani Stadyumu (Fenerbahçe Şükrü Saracoğlu), Kadıköy", venueAr: "ملعب شكري سراج أوغلو (Chobani) — كاديكوي", form: "نصف النهائي: برشلونة × أتلتيكو مدريد (2 فبراير)",
    prices: dbPrices("sf1") },
  { id: "sf2", stage: "نصف النهائي الثاني", date: "2027-02-03", dateAr: "الأربعاء 3 فبراير 2027 • 22:00", home: "rso", away: "rma", start: "2027-02-03T22:00:00+03:00", venue: "Tüpraş Stadium, Beşiktaş", venueAr: "ملعب توبراش (Tüpraş) — بشكتاش", form: "نصف النهائي: ريال مدريد × ريال سوسيداد (3 فبراير)",
    prices: dbPrices("sf2") },
  { id: "final", stage: "المباراة النهائية", date: "2027-02-06", dateAr: "السبت 6 فبراير 2027 • 22:00", home: "tbd", away: "tbd2", start: "2027-02-06T22:00:00+03:00", venue: "RAMS Park (Ali Sami Yen Sports Complex), Sarıyer", venueAr: "ملعب رامز بارك (RAMS Park) — سارير", form: "النهائي (6 فبراير)",
    prices: dbPrices("final") },
];
const KICKOFF = "2027-02-02T22:00:00+03:00";
const minPrice = (m) => { const v = Object.values(m.prices || {}).filter((x) => typeof x === "number"); return v.length ? Math.min(...v) : null; };
const fmt = (n) => `${Number(n).toLocaleString("en-US")}<span class="cur">${CURRENCY.symbol}</span>`;
const hasPrices = () => scMatches.some((m) => minPrice(m) !== null);
function priceTable() {
  if (!hasPrices()) return "";
  return `
<div class="table-wrap mt-2" data-reveal><table class="table price-table">
  <thead><tr><th>المباراة</th>${CATS.map(([, l]) => `<th>${l}</th>`).join("")}</tr></thead>
  <tbody>${scMatches.map((m) => `<tr><td><strong>${m.stage}</strong><br><small class="muted">${teams[m.home].name} × ${teams[m.away].name}</small></td>${CATS.map(([k]) => `<td data-sc-p="${m.id}:${k}">${typeof m.prices?.[k] === "number" ? `<b class="pt">${fmt(m.prices[k])}</b>` : `<span class="muted">عند الطلب</span>`}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>
<p class="muted mt-1" style="font-size:.85rem">الأسعار للتذكرة الواحدة حسب الفئة وتخضع للتوفر وقت التأكيد. ونرسل لك قبل أي دفع عرضاً مكتوباً يوضّح السعر الرسمي للتذكرة ورسوم خدمتنا.</p>`;
}

// Generic heater shield striped in the club's kit colours, with the club's initials (not an official crest)
let shieldN = 0;
function shield(t, size = 72) {
  const id = `sh${++shieldN}`, [s1, s2] = t.stripes, w = 64 / 5;
  const stripes = [0, 1, 2, 3, 4].map((i) => `<rect x="${i * w}" y="0" width="${w + 0.2}" height="72" fill="${i % 2 ? s2 : s1}"/>`).join("");
  return `<svg class="shield" width="${size}" height="${Math.round(size * 1.125)}" viewBox="0 0 64 72" aria-hidden="true" focusable="false">
  <defs><clipPath id="${id}"><path d="M32 2 60 9.5V33c0 18.5-12.4 30.2-28 37C16.4 63.2 4 51.5 4 33V9.5Z"/></clipPath></defs>
  <g clip-path="url(#${id})">${stripes}${t.band ? `<rect x="0" y="0" width="64" height="20" fill="${t.band}"/>` : ""}<rect x="0" y="0" width="64" height="72" fill="url(#shGloss)"/></g>
  <path d="M32 2 60 9.5V33c0 18.5-12.4 30.2-28 37C16.4 63.2 4 51.5 4 33V9.5Z" fill="none" stroke="${t.rim}" stroke-width="3"/>
  <rect x="13" y="29" width="38" height="17" rx="8.5" fill="rgba(8,24,48,.78)"/>
  <text x="32" y="41.5" text-anchor="middle" font-family="Alexandria,system-ui,sans-serif" font-size="11.5" font-weight="800" fill="#fff" letter-spacing=".6">${t.short}</text>
</svg>`;
}
// club crest image (owner-supplied) or the generic shield; alt is empty because the club name is written next to it
const CREST_W = { fcb: 187, rma: 143, atm: 144, rso: 174 };
function badge(t, h = 76) {
  const k = Object.keys(teams).find((x) => teams[x] === t);
  if (!SHOW_CRESTS || !CREST_W[k]) return shield(t, Math.round(h * 0.95));
  return `<img class="crest" src="{{root}}assets/img/clubs/${k}.webp" width="${Math.round((CREST_W[k] * h) / 192)}" height="${h}" alt="" loading="lazy" decoding="async">`;
}
// shared gloss gradient for the shields (once per page)
const shieldDefs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="shGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs></svg>`;

// Match card styled as a ticket: dark stub with both clubs' colours, perforation, light details half
function matchCard(m, pickIdx = null) {
  const h = teams[m.home], a = teams[m.away];
  const msg = `مرحباً أويا للسياحة، أرغب بباقة حضور كأس السوبر الإسباني 2027: ${m.stage} — ${h.name} × ${a.name} (${m.dateAr}).`;
  const team = (t) => `<div class="mtk__team">${badge(t)}<b>${t.name}</b>${t.en !== "TBD" ? `<small class="ltr">${t.en}</small>` : ""}</div>`;
  return `
<article class="mtk${m.home === "tbd" ? " mtk--final" : ""}" style="--hc:${h.tone};--ac:${a.tone}" data-reveal>
  <div class="mtk__stub">
    <div class="mtk__head"><span class="mtk__stage">${ic("trophy")}${m.stage}</span><span class="mtk__official">${ic("check")}تذكرة رسمية باسمك</span></div>
    <div class="mtk__teams">${team(h)}<div class="mtk__mid"><span class="mtk__vs">VS</span><span class="mtk__time ltr">22:00</span></div>${team(a)}</div>
  </div>
  <div class="mtk__perf" aria-hidden="true"></div>
  <div class="mtk__body">
    <ul class="mtk__meta">
      <li>${ic("calendar")}<span>${m.dateAr}</span></li>
      <li>${ic("stadium")}<span>${m.venueAr}</span></li>
      <li>${ic("clock")}<span>صافرة البداية 22:00 بتوقيت إسطنبول</span></li>
    </ul>
    <div class="mtk__foot">
      ${minPrice(m) !== null ? `<div class="price" data-sc-min="${m.id}"><small>يبدأ من / للتذكرة</small><b>${fmt(minPrice(m))}</b></div>` : `<div class="price" data-sc-min="${m.id}"><small>الفئات</small><b class="price__ask">A+ • A • B • C</b></div>`}
      ${pickIdx === null ? `<a class="btn btn--sm" href="${waUrl(msg)}" target="_blank" rel="noopener">${ic("ticket")}<span>احجز</span></a>` : `<a class="btn btn--sm" href="#stadium" data-pick-match="${pickIdx}">${ic("stadium")}<span>اختر مقعدك</span></a>`}
    </div>
  </div>
</article>`;
}

// Club cards (kit colours, city, founded, nickname, their match in Istanbul)
function clubCards() {
  const matchOf = (k) => scMatches.find((m) => m.home === k || m.away === k);
  return `<div class="clubs">${["fcb", "rma", "atm", "rso"].map((k) => {
    const t = teams[k], m = matchOf(k);
    return `<article class="club" style="--s1:${t.stripes[0]};--s2:${t.stripes[1]};--tone:${t.tone}">
      <div class="club__band" aria-hidden="true"></div>
      ${badge(t, 78)}
      <h3>${t.name}</h3><small class="ltr club__en">${t.en}</small>
      <dl class="club__facts">
        <div><dt>المدينة</dt><dd>${t.city}</dd></div>
        <div><dt>التأسيس</dt><dd class="ltr">${t.founded}</dd></div>
        <div><dt>اللقب</dt><dd>${t.nick}</dd></div>
      </dl>
      <p class="club__match">${ic("calendar")}<span>${m.stage}</span></p>
    </article>`;
  }).join("")}</div>`;
}

const tiers = (ctx = "كأس السوبر الإسباني 2027") => `
<div class="tiers" data-stagger>
  <div class="tier" data-reveal>
    <span class="ico">${ic("hotel")}</span><h3>لديك تذكرتك؟</h3>
    <p class="muted" style="margin:0">لمن اشترى تذكرته من القناة الرسمية ويحتاج الإقامة والتنقلات فقط.</p>
    <ul>${["فندق قريب من ملعب مباراتك", "نقل خاص إلى الملعب والعودة بعد المباراة", "إرشادات الدخول للملعب بالعربية"].map((x) => `<li>${ic("check")}${x}</li>`).join("")}</ul>
    <a class="btn btn--ghost btn--block" href="${waUrl(`مرحباً أويا، لديّ تذكرتي وأحتاج الفندق والتنقلات — ${ctx}.`)}" target="_blank" rel="noopener">اطلب الإقامة والتنقلات</a>
  </div>
  <div class="tier tier--pop" data-reveal>
    <span class="badge">الخيار المتكامل</span>
    <span class="ico ico--glass">${ic("star")}</span><h3>باقة المشجع</h3>
    <p style="margin:0;color:#B9CCE0">فندق + تنقلات + مساعدة في تذكرتك الرسمية — تصل وتستمتع فقط.</p>
    <ul>${["مساعدتك في شراء التذكرة الرسمية باسمك من القناة الرسمية", "فندق قريب من ملعب مباراتك (3 ليالٍ أو أكثر)", "استقبال من المطار ونقل خاص للملعب والعودة بعد المباراة (22:00)", "جولة في إسطنبول مع سائق يتحدث العربية"].map((x) => `<li>${ic("check")}${x}</li>`).join("")}</ul>
    <a class="btn btn--block" href="${waUrl(`مرحباً أويا، أرغب بباقة المشجع — ${ctx}.`)}" target="_blank" rel="noopener">${ic("whatsapp")}احجز الباقة</a>
  </div>
  <div class="tier" data-reveal>
    <span class="ico ico--orange">${ic("crown")}</span><h3>باقة VIP</h3>
    <p class="muted" style="margin:0">تجربة فاخرة متكاملة للعائلات ورجال الأعمال.</p>
    <ul>${["مساعدتك في حجز مقاعد الضيافة الرسمية باسمك حسب التوفر", "فندق 5 نجوم بإطلالة على البوسفور", "سيارة خاصة طوال الإقامة", "برنامج سياحي وتسوق مخصص"].map((x) => `<li>${ic("check")}${x}</li>`).join("")}</ul>
    <a class="btn btn--navy btn--block" href="${waUrl(`مرحباً أويا، أرغب بباقة VIP — ${ctx}.`)}" target="_blank" rel="noopener">اطلب عرض VIP</a>
  </div>
</div>
<p class="center muted mt-2" style="font-size:.9rem">${ic("info")} الأسعار تختلف حسب الفئة والتوفر وتاريخ الحجز، ونرسلها لك مكتوبة قبل أي دفع.</p>`;

// ---- 3D stadium & seating categories (illustrative) ----
const SEATS = {
  vip: { label: "الفئة A+\u200E", color: "#F4B740", desc: "منتصف المدرج الرئيسي قرب خط منتصف الملعب: أفضل زاوية لمتابعة المباراة." },
  cat1: { label: "الفئة A", color: "#ED5404", desc: "المدرجات الطولية على جانبي الملعب: رؤية جانبية كاملة لكل اللعب." },
  cat2: { label: "الفئة B", color: "#4F8BC9", desc: "الزوايا وأطراف المدرجات الجانبية: رؤية متوازنة للملعب وسعر أقل." },
  cat3: { label: "الفئة C", color: "#2A9D8F", desc: "المدرجات خلف المرميين: أجواء الجماهير الأكثر حماساً وأقل سعر." },
};
const VENUE_MODEL = {
  sf1: { capacity: "حوالي 47 ألف مقعد", model: { upperRows: 18, closedCorners: true, singleTierEnd: null } },
  sf2: { capacity: "حوالي 42 ألف مقعد", model: { upperRows: 16, closedCorners: true, singleTierEnd: "W" } },
  final: { capacity: "حوالي 53 ألف مقعد", model: { upperRows: 20, closedCorners: true, singleTierEnd: null } },
};
const priceText = (m, k) => (typeof m.prices?.[k] === "number" ? `${Number(m.prices[k]).toLocaleString("en-US")}${CURRENCY.symbol}` : "عند الطلب");
// kit colours for the players on the model pitch (shirt, shorts); unknown finalists get neutral OYA colours
const kit = (k, s0, s1) => (k === "tbd" || k === "tbd2" ? [s0, s1] : [teams[k].stripes[0] === "#FFFFFF" ? "#F4F4F4" : teams[k].stripes[0], teams[k].band || (k === "fcb" ? "#004D98" : teams[k].stripes[1])]);
function stadiumSection({ step = false } = {}) {
  const cfg = {
    wa: "905399334331", currency: CURRENCY.symbol, categories: SEATS,
    matches: scMatches.map((m) => ({ id: m.id, stage: m.stage, teams: `${teams[m.home].name} × ${teams[m.away].name}`, venue: m.venueAr, capacity: VENUE_MODEL[m.id].capacity, prices: m.prices, venueModel: VENUE_MODEL[m.id].model, kits: [kit(m.home, "#ED5404", "#ffffff"), kit(m.away, "#19487E", "#ffffff")] })),
  };
  const m0 = scMatches[0];
  return `
<section class="section stadium-sec" id="stadium" data-stadium>
  <div class="container">
    ${sectionHead({ eyebrow: step ? "الخطوة 2" : `${ic("stadium")} مجسم الملعب`, title: "اجلس في مقعدك… قبل أن تصل إلى الملعب", lead: "ملعب ثلاثي الأبعاد بمدرجاته وجماهيره واللاعبين بألوان الفريقين: اختر مدرجاً من المجسم أو من الخريطة، ثم «شاهد الملعب من مقعدك» واختر الصف والمكان لترى المباراة كما ستراها يوم المباراة.", center: true })}
    <div class="stadium">
      <div class="stadium-bar">
        <div class="stadium-tabs" role="tablist" aria-label="المباراة والملعب">${scMatches.map((m, i) => `<button type="button" role="tab" class="stadium-tab" aria-selected="${i === 0}">${m.stage}<small>${m.venueAr.split(" — ")[0]}</small></button>`).join("")}</div>
        <div class="stadium-views" role="group" aria-label="زاوية الرؤية"><button type="button" data-view="main">${ic("users")}من المنصة الرئيسية</button><button type="button" data-view="goal">${ic("ball")}من خلف المرمى</button><button type="button" data-view="top">${ic("compass")}من الأعلى</button></div>
      </div>
      <div class="stadium-body">
        <div class="stadium-stage">
          <div class="stadium-poster" aria-hidden="true"></div>
          <button type="button" class="stadium-start btn">${ic("stadium")}<span>عرض الملعب ثلاثي الأبعاد</span></button>
          <span class="stadium-loading" aria-hidden="true">جارٍ تحميل المجسم…</span>
          <p class="stadium-nogl">تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز — يمكنك اختيار الفئة من القائمة.</p>
          <div class="stadium-tip" role="status"></div>
          <p class="stadium-venue">${m0.venueAr} • ${VENUE_MODEL[m0.id].capacity}</p>
          <p class="stadium-hint">${ic("refresh")}<span>اسحب للتدوير</span><span class="hint-more"> • اضغط على مدرج أو على الخريطة ثم «شاهد من مقعدك»</span></p>
          <div class="stadium-sheet" aria-live="polite">
            <p><span class="ss-dot"></span><b class="ss-cat"></b><span class="ss-where"></span></p>
            <div class="ss-actions"><button type="button" class="btn btn--sm ss-seat">${ic("eye")}<span>شاهد من مقعدك</span></button><a class="btn btn--wa btn--sm ss-wa" href="#book" target="_blank" rel="noopener">${ic("whatsapp")}<span>اطلب</span></a><button type="button" class="ss-close" aria-label="إغلاق">${ic("x")}</button></div>
          </div>
          <div class="stadium-fx">
            <button type="button" data-zoom="in" aria-label="تكبير">${ic("plus")}</button>
            <button type="button" data-zoom="out" aria-label="تصغير">${ic("minus")}</button>
            <button type="button" data-wave>${ic("waves")}<span>الموجة</span></button>
            <button type="button" data-sound aria-pressed="false" aria-label="تشغيل صوت المدرجات">${ic("volume-x")}${ic("volume")}</button>
          </div>
          <div class="stadium-map" role="group" aria-label="خريطة الملعب من الأعلى: اضغط على مدرج لاختياره"></div>
          <div class="stadium-seatpick">
            <p class="sp-head"><b class="sp-row">الصف</b><span>موقع تقريبي داخل الفئة؛ رقم المقعد النهائي تحدده الجهة المنظمة</span></p>
            <label><span class="sp-lbl">الصف</span><small>الأمام</small><input type="range" min="0" max="100" value="42" data-seat-row aria-label="الصف: من الأمام إلى الخلف"><small>الخلف</small></label>
            <label><span class="sp-lbl">المكان</span><small>الطرف</small><input type="range" min="0" max="100" value="50" data-seat-along aria-label="المكان على طول المدرج"><small>الطرف الآخر</small></label>
          </div>
          <p class="stadium-seatlabel" aria-live="polite"></p>
          <button type="button" class="stadium-exit">${ic("refresh")}<span>عودة للمنظر العام</span></button>
        </div>
        <aside class="stadium-side">
          <div class="stadium-legend" role="group" aria-label="فئات المقاعد">
            ${Object.entries(SEATS).map(([k, c]) => `<button type="button" data-cat="${k}" aria-pressed="false"><span class="dot" style="background:${c.color}"></span><span class="lg-name">${c.label}</span><span class="lg-price">${priceText(m0, k)}</span></button>`).join("")}
          </div>
          <div class="stadium-info" aria-live="polite">
            <p class="si-head"><span class="si-dot"></span><b class="si-cat">اختر مدرجاً</b></p>
            <p class="si-where">اضغط على أي جزء من المدرجات أو على فئة من القائمة، ثم شاهد المباراة من مكانك.</p>
            <p class="si-desc"></p>
            <p class="si-price-row">السعر التقديري للتذكرة: <b class="si-price">—</b></p>
            <div class="si-qty si-price-row"><span>عدد التذاكر</span><div class="qty"><button type="button" class="qty__b" data-q="-1" aria-label="تذكرة أقل">−</button><output class="si-n" aria-live="polite">1</output><button type="button" class="qty__b" data-q="1" aria-label="تذكرة أكثر">+</button></div></div>
            <p class="si-total-row si-price-row">الإجمالي التقديري: <b class="si-total">—</b></p>
            <button type="button" class="btn btn--block si-seat">${ic("eye")}<span>شاهد الملعب من مقعدك</span></button>
            <a class="btn btn--wa btn--block si-wa" href="#book" target="_blank" rel="noopener">${ic("whatsapp")}<span>اطلب هذه الفئة عبر واتساب</span></a>
            <a class="btn btn--ghost btn--block si-next" href="#book">${ic("send")}<span>أكمل طلبك في النموذج</span></a>
            <p class="si-legal">${ic("info")}<span>السعر الرسمي للتذكرة + رسوم خدمة معلنة. لا نبيع التذاكر: نساعدك في شرائها باسمك من القناة الرسمية وحسب التوفر.</span></p>
          </div>
          <p class="stadium-note">${ic("info")} تمثيل توضيحي لتوزيع الفئات؛ المخطط النهائي للمقاعد تحدده الجهة المنظمة لكل ملعب.</p>
        </aside>
      </div>
    </div>
  </div>
  <script type="application/json" class="stadium-data">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>
</section>`;
}

// ---- Fan stay packages: we sell the stay (legal & profitable); tickets are bought officially in the fan's name ----
const STAYS = [
  { id: "sf1", title: "باقة نصف النهائي الأول", sub: "برشلونة × أتلتيكو مدريد • كاديكوي", nights: 3, dates: "1 – 4 فبراير 2027", area: "فندق في كاديكوي أو أوسكودار قرب ملعب المباراة (الجانب الآسيوي)", price: null },
  { id: "sf2", title: "باقة نصف النهائي الثاني", sub: "ريال سوسيداد × ريال مدريد • بشكتاش", nights: 3, dates: "2 – 5 فبراير 2027", area: "فندق في بشكتاش أو تقسيم على بُعد دقائق من الملعب", price: null },
  { id: "final", title: "باقة النهائي", sub: "المباراة النهائية • رامز بارك", nights: 3, dates: "5 – 8 فبراير 2027", area: "فندق في شيشلي أو مسلك قريب من طريق الملعب", price: null },
  { id: "all", title: "باقة البطولة كاملة", sub: "3 مباريات في 6 ليالٍ", nights: 6, dates: "1 – 7 فبراير 2027", area: "فندق مركزي في شيشلي أو بشكتاش يناسب الملاعب الثلاثة", price: null, pop: true },
];
const STAY_INCLUDES = ["استقبال وتوديع من المطار بسيارة خاصة", "نقل خاص إلى الملعب والعودة بعد مباراة الساعة 22:00", "جولة نصف يوم في إسطنبول مع سائق يتحدث العربية", "مساعدة في حجز التذكرة الرسمية باسمك (السعر الرسمي + رسوم خدمة معلنة)", "شريحة اتصال تركية ومتابعة على واتساب"];
function stayPackages() {
  return `
<div class="tiers" data-stagger>
  ${STAYS.map((s) => `
  <div class="tier${s.pop ? " tier--pop" : ""}" data-reveal>
    ${s.pop ? `<span class="badge">التجربة الكاملة</span>` : ""}
    <span class="ico${s.pop ? " ico--glass" : ""}">${ic(s.pop ? "trophy" : "hotel")}</span>
    <h3>${s.title}</h3>
    <p class="${s.pop ? "" : "muted"}" style="margin:0;${s.pop ? "color:#B9CCE0" : ""}">${s.sub}<br><small>${nightsAr(s.nights)} • ${s.dates} (قابلة للتعديل)</small></p>
    <ul><li>${ic("bed")}${s.area}</li>${STAY_INCLUDES.map((x) => `<li>${ic("check")}${x}</li>`).join("")}</ul>
    <div class="price"><small>${s.price ? "يبدأ من / للشخص (دون التذكرة)" : "السعر"}</small><b${s.price ? "" : ' style="font-size:1.05rem"'}>${s.price ? fmt(s.price) : "يُعلن قريباً — سجّل اهتمامك"}</b></div>
    <a class="btn${s.pop ? "" : " btn--navy"} btn--block" href="${waUrl(`مرحباً أويا، أرغب بـ${s.title} (كأس السوبر الإسباني 2027 في إسطنبول).`)}" target="_blank" rel="noopener">${ic("whatsapp")}سجّل اهتمامك</a>
  </div>`).join("")}
</div>
<div class="incl mt-2" data-reveal>
  <div class="yes"><h3>${ic("sparkles")} إضافات اختيارية</h3><ul class="yes">${["رحلة ثلوج إلى أولوداغ في بورصة (فبراير موسم الثلج)", "تذاكر الطيران من مدينتك", "ليلة إضافية قبل المباراة أو بعدها", "جولة البوسفور بالقارب"].map((x) => `<li>${ic("plus")}<span>${x}</span></li>`).join("")}</ul></div>
  <div class="yes"><h3>${ic("ticket")} خدمة التذكرة بشكل نظامي</h3><ul class="yes">${["نحجز التذكرة عبر القناة الرسمية المعتمدة وباسم المشجع", "تدفع السعر الرسمي للتذكرة + رسوم خدمة واضحة", "لا نبيع تذاكر من السوق السوداء أو بأسعار مضاعفة", "إن فضّلت الشراء بنفسك نرشدك خطوة بخطوة مجاناً مع الباقة"].map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div>
</div>
<p class="center muted mt-2" style="font-size:.9rem">${ic("info")} تنتهي البطولة قبل بداية شهر رمضان المبارك المتوقعة (حوالي 8–9 فبراير 2027)، فهي فرصة لرحلة مميزة قبل الشهر الكريم.</p>`;
}

const countdown = () => `
<div class="countdown" data-countdown="${KICKOFF}" aria-label="العد التنازلي لانطلاق البطولة">
  <div><b data-d>—</b><span>يوم</span></div><div><b data-h>—</b><span>ساعة</span></div><div><b data-m>—</b><span>دقيقة</span></div><div><b data-s>—</b><span>ثانية</span></div>
</div>`;

const disclaimer = `<div class="note">${ic("info")}<span>أويا للسياحة وكالة سفر مستقلة، وغير تابعة للاتحاد الإسباني لكرة القدم أو الأندية أو الجهات المنظمة. نساعدك في شراء التذاكر عبر القنوات الرسمية المعتمدة فقط، باسمك وبسعرها الرسمي مع رسوم خدمة معلنة، ونرتّب لك الإقامة والتنقلات. لا نبيع تذاكر من السوق السوداء أو بأسعار مضاعفة.</span></div>`;

const pitch = `<svg class="promo__pitch" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="20" width="560" height="340" rx="6"/><line x1="300" y1="20" x2="300" y2="360"/><circle cx="300" cy="190" r="52"/><rect x="20" y="110" width="80" height="160"/><rect x="500" y="110" width="80" height="160"/><rect x="20" y="150" width="30" height="80"/><rect x="550" y="150" width="30" height="80"/></g></svg>`;

export const superCup = {
  promo() {
    return `
<div class="promo" data-reveal="zoom">
  ${pitch}
  <div class="promo__grid">
    <div>
      <p class="eyebrow">${ic("trophy")} حدث استثنائي في إسطنبول</p>
      <h2 class="h-xl">كأس السوبر الإسباني 2027 <span class="accent" style="color:var(--orange-300)">في إسطنبول</span></h2>
      <p class="lead">برشلونة، ريال مدريد، أتلتيكو مدريد وريال سوسيداد على أرض إسطنبول من 2 إلى 6 فبراير 2027. احجز باقة المشجع مع الفندق والتنقلات، ونساعدك في تذكرتك الرسمية باسمك.</p>
      <div class="btn-row mt-2"><a class="btn" href="{{root}}matches/spanish-super-cup-2027/">${ic("ticket")}<span>تفاصيل التذاكر والباقات</span></a>${waBtn("مرحباً أويا، أرغب بباقة حضور كأس السوبر الإسباني 2027 في إسطنبول.", "احجز عبر واتساب", "btn btn--glass")}</div>
    </div>
    <div>${countdown()}<p style="margin:.8em 0 0;font-size:.85rem;color:#9FB6CF">حتى انطلاق البطولة (حسب المواعيد المعلنة)</p></div>
  </div>
</div>`;
  },
};

export function matchesHub(data) {
  const path = "matches/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "تذاكر المباريات", path }];
  const page = { path, nav: "matches", crumbs, ogImage: "assets/img/og/og-matches.jpg", mbar: { label: "اطلب باقتك", icon: "ticket", msg: "مرحباً أويا، أرغب بباقة حضور مباراة." },
    title: "تذاكر المباريات في إسطنبول: باقات المشجع والتذكرة الرسمية | أويا",
    description: "باقات حضور المباريات في إسطنبول: كأس السوبر الإسباني 2027 وديربيات الدوري التركي والليالي الأوروبية. فندق وتنقلات ومساعدة في شراء تذكرتك الرسمية باسمك." };
  const faq = [
    { q: "كيف أحضر مباراة عن طريق أويا؟", a: "اختر المباراة والفئة وعدد المشجعين من النموذج أو أرسلها لنا على واتساب، فنرسل لك عرض الباقة كتابياً. بعد موافقتك نرتّب الفندق والتنقلات ونساعدك في شراء التذكرة الرسمية باسمك من القناة الرسمية، ثم نرسل لك تفاصيل الاستلام وإرشادات الدخول." },
    { q: "هل التذاكر إلكترونية أم ورقية؟", a: "يعتمد ذلك على الجهة المصدرة لكل مباراة؛ معظم المباريات الكبرى تعتمد التذاكر الرقمية على الهاتف. نوضح لك طريقة الاستلام بالتفصيل قبل الدفع." },
    { q: "هل أحتاج إثبات هوية لدخول الملعب؟", a: "في كثير من المباريات تُصدر التذكرة باسم حاملها ويُطلب جواز السفر أو الهوية عند الدخول، لذلك نطلب منك الأسماء كما في الجواز عند الحجز." },
    { q: "هل يمكن حجز مقاعد متجاورة للعائلة أو المجموعة؟", a: "نعم، نحرص على المقاعد المتجاورة قدر الإمكان، وكلما كان الحجز أبكر كانت فرص المقاعد المتجاورة والفئات المفضلة أكبر." },
    { q: "هل تقدمون باقات تشمل الفندق والطيران؟", a: "نعم، يمكنك اختيار باقة المشجع (فندق + تنقلات + مساعدة في التذكرة الرسمية) أو باقة VIP، مع إمكانية إضافة تذاكر الطيران وبرنامج سياحي في تركيا. وإن كانت تذكرتك معك نرتّب لك الفندق والتنقلات فقط." },
    { q: "هل أنتم الجهة الرسمية لبيع التذاكر؟", a: "لا، أويا للسياحة وكالة سفر مستقلة وليست تابعة للأندية أو الاتحادات. لا نبيع التذاكر ولا نملك مخزوناً منها: تُشترى التذكرة من القناة الرسمية باسمك وبسعرها الرسمي، ودورنا الإقامة والتنقلات ومساعدتك في إجراءات الشراء مقابل رسوم خدمة نوضحها لك مسبقاً." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-matches"), eyebrow: `${ic("ticket")} تذاكر المباريات`, title: "تذاكر المباريات في إسطنبول والعالم", lead: "اختر البطولة أو المباراة: نساعدك في شراء تذكرتك الرسمية باسمك، ونرتّب لك الفندق والتنقلات — وفي كأس السوبر الإسباني 2027 تختار مقعدك على مجسم الملعب قبل أن تحجز.", icon: "ball", page: path,
    chips: [{ icon: "ticket", text: "تذكرة رسمية باسمك" }, { icon: "hotel", text: "باقات مع الفندق" }, { icon: "car", text: "نقل من وإلى الملعب" }],
    actions: `<a class="btn" href="#events">${ic("ticket")}<span>اختر المباراة</span></a>${waBtn("مرحباً أويا، أرغب بالاستفسار عن تذاكر المباريات.", "اسأل عبر واتساب", "btn btn--glass")}` })}

<section class="section" id="events">
  <div class="container">
    ${sectionHead({ eyebrow: "البطولات والمباريات", title: "اختر المباراة التي تريد حضورها", lead: "اضغط على البطولة لترى مبارياتها وتختار مقعدك، أو اسألنا عن أي مباراة أخرى." })}
    ${eventsGrid()}
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "كيف تعمل الخدمة", title: "من الطلب إلى المدرّج في 4 خطوات", center: true })}
    <div class="steps" data-stagger>
      ${[
        { icon: "send", t: "اختر المباراة", d: "حدد المباراة والفئة وعدد المشجعين ونوع الباقة." },
        { icon: "doc", t: "تأكيد التوفر والسعر", d: "نرسل لك العرض مكتوباً مع شروط الاستلام والإلغاء." },
        { icon: "ticket", t: "التذكرة الرسمية باسمك", d: "نساعدك في الشراء من القناة الرسمية بأسماء المشجعين ونرسل لك تفاصيل الاستلام." },
        { icon: "stadium", t: "يوم المباراة", d: "نقل للملعب وإرشادات دخول بالعربية — فقط استمتع." },
      ].map((s) => `<div class="step" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}
    </div>
    <div class="mt-2">${disclaimer}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "باقات المباريات", title: "اختر طريقتك في حضور المباراة", center: true })}
    ${tiers("حضور مباراة")}
  </div>
</section>

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "سجّل طلبك", title: "أرسل طلبك… ونعود إليك بالعرض والتوفر", lead: "نرسل لك التوفر والسعر النهائي في عرض مكتوب قبل أي دفع — دون أي التزام." })}</div>
    <div class="form-card" data-reveal="zoom">${matchForm({ prices: Object.fromEntries(scMatches.map((m) => [m.id, m.prices])) })}</div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن تذاكر المباريات" })}
${ctaBand({ title: "المباراة الكبيرة تستحق رحلة كاملة", lead: "أضف إلى تذكرتك فندقاً مميزاً وجولة في إسطنبول أو برنامجاً في الشمال التركي.", wa: "مرحباً أويا، أرغب بباقة مباراة مع برنامج سياحي." })}`;
  page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page, "CollectionPage"), S.breadcrumbNode(page), S.faqNode(page, faq)].filter(Boolean);
  return page;
}

function evt(m) {
  const h = teams[m.home], a = teams[m.away];
  return {
    id: m.id,
    name: m.home === "tbd" ? "Supercopa de España 2027 — Final (Istanbul)" : `Supercopa de España 2027 — ${m.id === "sf1" ? "Semi-final 1" : "Semi-final 2"}: ${h.en} vs ${a.en}`,
    start: m.start, end: new Date(new Date(m.start).getTime() + 2 * 3600e3).toISOString().replace(".000Z", "Z"),
    venue: m.venue || "Istanbul",
    home: m.home === "tbd" ? null : h.en,
    away: m.home === "tbd" ? null : a.en,
    description: `كأس السوبر الإسباني 2027 في إسطنبول — ${m.stage}${m.home === "tbd" ? "" : `: ${h.name} × ${a.name}`}.`,
    price: minPrice(m), currency: CURRENCY.code,
  };
}

// ticket flow: 1) pick the match  2) pick the seat on the stadium model  3) send the request
const stepNav = `<ol class="tsteps" aria-label="خطوات طلب التذكرة">${[["#pick", "ticket", "اختر المباراة"], ["#stadium", "stadium", "اختر مقعدك"], ["#book", "send", "أرسل طلبك"]].map(([h, i, t], n) => `<li><a href="${h}"><span class="tsteps__n">${n + 1}</span>${ic(i)}<span>${t}</span></a></li>`).join("")}</ol>`;

export function superCupPage(data) {
  const path = "matches/spanish-super-cup-2027/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "تذاكر المباريات", path: "matches/" }, { name: "كأس السوبر الإسباني 2027", path }];
  const page = { path, nav: "matches", crumbs, ogImage: "assets/img/og/og-matches.jpg", mbar: { label: "اطلب باقتك", icon: "ticket", msg: "مرحباً أويا، أرغب بباقة حضور كأس السوبر الإسباني 2027 في إسطنبول." },
    title: "تذاكر كأس السوبر الإسباني 2027 في إسطنبول وباقات المشجع | أويا",
    description: "كأس السوبر الإسباني 2027 في إسطنبول: برشلونة وأتلتيكو، ريال سوسيداد وريال مدريد، والنهائي. باقات مشجع تشمل الفندق والتنقلات ومساعدتك في شراء تذكرتك الرسمية باسمك." };
  const ist = data.packages.filter((p) => ["istanbul-5-days", "istanbul-bursa-7-days", "istanbul-sapanca-bursa-8-days"].includes(p.slug));
  const faq = [
    { q: "أين ومتى تقام كأس السوبر الإسباني 2027؟", a: "وفق ما أعلنه الاتحاد الإسباني لكرة القدم: نصف النهائي الأول (برشلونة × أتلتيكو مدريد) الثلاثاء 2 فبراير 2027 على ملعب شكري سراج أوغلو (Chobani) في كاديكوي، ونصف النهائي الثاني (ريال سوسيداد × ريال مدريد) الأربعاء 3 فبراير على ملعب توبراش في بشكتاش، والنهائي السبت 6 فبراير على ملعب رامز بارك. جميع المباريات الساعة 22:00 بتوقيت إسطنبول." },
    { q: "لماذا تُقام البطولة في إسطنبول وليس في السعودية؟", a: "بحسب ما أُعلن، تتزامن مواعيد البطولة المعتادة مع استضافة السعودية لكأس آسيا 2027، لذلك انتقلت نسخة 2027 إلى إسطنبول، مع الإعلان عن عودتها إلى السعودية لاحقاً." },
    { q: "من هي الفرق المشاركة؟", a: "برشلونة وريال مدريد وأتلتيكو مدريد وريال سوسيداد. وأسفرت القرعة عن مواجهة برشلونة وأتلتيكو مدريد في نصف النهائي الأول، وريال سوسيداد وريال مدريد في نصف النهائي الثاني." },
    { q: "متى أسجّل طلبي؟", a: "كلما كان أبكر كان أفضل؛ مباريات برشلونة وريال مدريد تشهد طلباً عالياً. أرسل طلبك الآن عبر واتساب لنؤكد لك التوفر والسعر النهائي كتابةً." },
    { q: "ماذا لو لم تتوفر التذكرة الرسمية؟", a: "التذاكر تُباع عبر القناة الرسمية وحسب التوفر، ولا يملك أحد غير الجهة المنظمة ضمانها. لذلك نوضّح لك كتابياً قبل أي دفعة ما الذي يُسترد وما لا يُسترد من الباقة إن تعذّر الحصول على التذكرة أو تغيّر موعد المباراة." },
    { q: "أين أسكن في إسطنبول خلال البطولة؟", a: "حسب مباراتك: لنصف النهائي الأول (كاديكوي) تناسبك فنادق الجانب الآسيوي في كاديكوي وأوسكودار، ولنصف النهائي الثاني (بشكتاش) فنادق بشكتاش وتقسيم وشيشلي، وللنهائي (رامز بارك في سارير) فنادق شيشلي وليفنت ومسلك. ولأن المباريات تنتهي قرابة منتصف الليل ننصح بنقل خاص مرتب مسبقاً." },
    { q: "هل أحتاج تأشيرة لدخول تركيا لحضور المباراة؟", a: "يعتمد ذلك على جنسيتك؛ مواطنو كثير من الدول العربية — ومنها دول الخليج — يدخلون تركيا دون تأشيرة لمدة محددة، بينما تحتاج جنسيات أخرى تأشيرة إلكترونية أو من السفارة. أرسل لنا جنسيتك ونخبرك بالمطلوب." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-super-cup"), eyebrow: `${ic("trophy")} إسطنبول • 2–6 فبراير 2027`, title: "تذاكر كأس السوبر الإسباني 2027 في إسطنبول", lead: "الكلاسيكو المحتمل في النهائي، ونجوم الليغا على أرض إسطنبول. احجز باقة إقامة المشجع مع أويا للسياحة، ونساعدك في الحصول على تذكرتك الرسمية باسمك وحسب التوفر — من قلب المدينة المستضيفة.", icon: "trophy", page: path,
    actions: `<a class="btn" href="#pick">${ic("stadium")}<span>اختر مباراتك وفئة مقعدك</span></a>${waBtn("مرحباً أويا، أرغب بباقة حضور كأس السوبر الإسباني 2027 في إسطنبول.", "واتساب", "btn btn--glass")}`,
    extra: `<div class="mt-2" style="max-width:560px">${countdown()}</div>` })}

<section class="section section--tight tsteps-sec">
  <div class="container">${stepNav}</div>
</section>

<section class="section" id="pick" style="padding-top:0">
  <div class="container">
    ${sectionHead({ eyebrow: "الخطوة 1", title: "اختر المباراة", lead: "ثلاث مباريات على ثلاثة ملاعب في إسطنبول، وصافرة البداية 22:00 بتوقيت إسطنبول (20:00 بتوقيت إسبانيا) وفق ما أعلنه الاتحاد الإسباني لكرة القدم." })}
    ${shieldDefs}<div class="grid grid-3 mtk-grid" data-stagger>${scMatches.map((m, i) => matchCard(m, i)).join("")}</div>
    ${hasPrices() ? `<details class="mt-2 sc-prices"><summary>${ic("ticket")} أسعار التذاكر حسب الفئة</summary>${priceTable()}</details>` : ""}
  </div>
</section>

${stadiumSection({ step: true })}

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>
      ${sectionHead({ eyebrow: "الخطوة 3", title: "أرسل طلبك… ونعود إليك بالتوفر والسعر", lead: "اخترت المباراة والفئة على المجسم؟ تجدها هنا جاهزة. نرسل لك التوفر والسعر النهائي في عرض مكتوب قبل أي دفع — دون أي التزام." })}
      ${disclaimer}
    </div>
    <div class="form-card" data-reveal="zoom">${matchForm({ prices: Object.fromEntries(scMatches.map((m) => [m.id, m.prices])) })}</div>
  </div>
</section>

<section class="section section--white">
  <div class="container split">
    <div class="prose" data-reveal>
      <p class="eyebrow">عن البطولة</p>
      <h2 class="h-l" style="margin-top:0">لماذا نسخة 2027 مختلفة؟</h2>
      <p>اعتادت كأس السوبر الإسباني بنظام الفرق الأربعة أن تُقام في السعودية خلال السنوات الأخيرة، لكن نسخة 2027 تنتقل إلى <strong>إسطنبول</strong> بسبب تزامن موعدها مع استضافة السعودية لكأس آسيا 2027، وفق ما أعلنه الاتحاد الإسباني لكرة القدم.</p>
      <p>تجمع البطولة بطل الدوري ووصيفه وبطل الكأس ووصيفه: <strong>برشلونة، ريال مدريد، ريال سوسيداد وأتلتيكو مدريد</strong>. وإن تأهل برشلونة وريال مدريد معاً، فسيكون النهائي <strong>كلاسيكو في إسطنبول</strong>.</p>
      <p>ولأن أويا للسياحة مقرها إسطنبول، نرتّب لك الرحلة كاملة على الأرض: الفندق، الاستقبال، التنقل إلى الملعب، وحتى برنامجاً سياحياً قبل المباراة أو بعدها في إسطنبول وبورصة وسبانجا.</p>
    </div>
    <div data-reveal="right">
      ${clubCards()}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "باقات إقامة المشجع", title: "باقات كأس السوبر الإسباني 2027", center: true, lead: "فندق قريب من ملعب مباراتك، تنقلات خاصة بعد مباريات الساعة 22:00، ومساعدة في التذكرة الرسمية باسمك. كل الباقات قابلة للتعديل." })}
    ${stayPackages()}
  </div>
</section>

<section class="section section--sky">
  <div class="container">
    ${sectionHead({ eyebrow: "دليل المشجع", title: "نصائح لحضور المباراة في إسطنبول" })}
    <div class="features" data-stagger>
      ${[
        { icon: "calendar", title: "احجز مبكراً", text: "مباريات برشلونة وريال مدريد عليها طلب ضخم؛ الحجز المبكر يعني فئات ومقاعد أفضل." },
        { icon: "passport", title: "الأسماء كما في الجواز", text: "قد تُصدر التذاكر بأسماء حامليها، فأرسل الأسماء مطابقة لجوازات السفر." },
        { icon: "car", title: "خطط للتنقل", text: "زحام يوم المباراة كبير في إسطنبول؛ النقل الخاص المرتب مسبقاً يوفر عليك الكثير." },
        { icon: "snow", title: "فبراير بارد", text: "الطقس في إسطنبول بارد وممطر أحياناً في فبراير — احمل معطفاً دافئاً للمدرجات." },
        { icon: "map", title: "اجعلها رحلة", text: "أضف جولة في إسطنبول أو رحلة ثلوج إلى أولوداغ في بورصة قبل المباراة أو بعدها." },
        { icon: "shield", title: "احذر السوق السوداء", text: "لا تشترِ تذاكر من مصادر مجهولة على مواقع التواصل؛ اطلب دائماً تأكيداً مكتوباً." },
      ].map((f) => `<div class="feature" data-reveal><span class="ico">${ic(f.icon)}</span><div><h3>${f.title}</h3><p>${f.text}</p></div></div>`).join("")}
    </div>
  </div>
</section>

${ist.length ? `
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "مباراة + سياحة", title: "اجمع المباراة مع برنامج في تركيا", row: true, after: `<a class="btn btn--ghost" href="{{root}}packages/">كل البرامج ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${ist.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>` : ""}

${faqBlock(faq, { title: "أسئلة شائعة عن السوبر الإسباني 2027" })}
${readFirst(["matches"], data, path, "دليل المشجع")}
${ctaBand({ title: "شاهد الكلاسيكو المحتمل… من إسطنبول", lead: "فندقك وتنقلاتك جاهزة قبل أن تصل، ونساعدك في تذكرتك الرسمية باسمك.", wa: "مرحباً أويا، أرغب بباقة كأس السوبر الإسباني 2027 في إسطنبول." })}`;
  page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), ...scMatches.map((m) => S.eventNode(page, evt(m))), S.faqNode(page, faq)].filter(Boolean);
  return page;
}
