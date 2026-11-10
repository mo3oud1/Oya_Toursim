import { site } from "../site.mjs";
import { heroPhoto } from "../content/hero-photos.mjs";
import { ic, esc, sectionHead, faqBlock, ctaBand, pageHero, waBtn, waUrl, packageCard, nightsAr } from "../lib/ui.mjs";
import { readFirst } from "../lib/templates.mjs";
import { matchForm } from "../lib/forms.mjs";
import * as S from "../lib/schema.mjs";

// ---- Event data (edit here when official kick-off times / venues / prices are announced) ----
const teams = {
  fcb: { name: "برشلونة", en: "FC Barcelona", short: "FCB", c1: "#19487E", c2: "rgba(255,255,255,.22)" },
  atm: { name: "أتلتيكو مدريد", en: "Atlético de Madrid", short: "ATM", c1: "#143A68", c2: "rgba(255,255,255,.22)" },
  rma: { name: "ريال مدريد", en: "Real Madrid", short: "RMA", c1: "#2B6BAB", c2: "rgba(255,255,255,.22)" },
  rso: { name: "ريال سوسيداد", en: "Real Sociedad", short: "RSO", c1: "#0F2C52", c2: "rgba(255,255,255,.22)" },
  tbd: { name: "الفائز من نصف النهائي", en: "TBD", short: "?", c1: "#19487E", c2: "#ED5404" },
};
// Ticket prices per category — fill the numbers from the owner's price list (null = «اطلب السعر»).
const CURRENCY = { symbol: "$", code: "USD" };
const CATS = [["cat3", "الفئة الثالثة"], ["cat2", "الفئة الثانية"], ["cat1", "الفئة الأولى"], ["vip", "VIP / ضيافة"]];
export const scMatches = [
  { id: "sf1", stage: "نصف النهائي الأول", date: "2027-02-02", dateAr: "الثلاثاء 2 فبراير 2027 • 22:00", home: "fcb", away: "atm", start: "2027-02-02T22:00:00+03:00", venue: "Chobani Stadyumu (Fenerbahçe Şükrü Saracoğlu), Kadıköy", venueAr: "ملعب شكري سراج أوغلو (Chobani) — كاديكوي", form: "نصف النهائي: برشلونة × أتلتيكو مدريد (2 فبراير)",
    prices: { cat3: null, cat2: null, cat1: null, vip: null } },
  { id: "sf2", stage: "نصف النهائي الثاني", date: "2027-02-03", dateAr: "الأربعاء 3 فبراير 2027 • 22:00", home: "rso", away: "rma", start: "2027-02-03T22:00:00+03:00", venue: "Tüpraş Stadium, Beşiktaş", venueAr: "ملعب توبراش (Tüpraş) — بشكتاش", form: "نصف النهائي: ريال مدريد × ريال سوسيداد (3 فبراير)",
    prices: { cat3: null, cat2: null, cat1: null, vip: null } },
  { id: "final", stage: "المباراة النهائية", date: "2027-02-06", dateAr: "السبت 6 فبراير 2027 • 22:00", home: "tbd", away: "tbd", start: "2027-02-06T22:00:00+03:00", venue: "RAMS Park (Ali Sami Yen Sports Complex), Sarıyer", venueAr: "ملعب رامز بارك (RAMS Park) — سارير", form: "النهائي (6 فبراير)",
    prices: { cat3: null, cat2: null, cat1: null, vip: null } },
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
  <tbody>${scMatches.map((m) => `<tr><td><strong>${m.stage}</strong><br><small class="muted">${teams[m.home].name} × ${teams[m.away].name}</small></td>${CATS.map(([k]) => `<td>${typeof m.prices?.[k] === "number" ? `<b class="pt">${fmt(m.prices[k])}</b>` : `<span class="muted">عند الطلب</span>`}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>
<p class="muted mt-1" style="font-size:.85rem">الأسعار للتذكرة الواحدة وتخضع للتوفر وقت التأكيد، وتُرسل لك مكتوبة قبل الدفع.</p>`;
}

const crest = (t) => `<span class="team__crest" style="--c1:${t.c1};--c2:${t.c2};${t.dark ? "color:#1b1b1b;" : ""}">${t.short}</span>`;
function matchCard(m, { compact = false } = {}) {
  const h = teams[m.home], a = teams[m.away];
  const msg = `مرحباً أويا للسياحة، أرغب بباقة حضور كأس السوبر الإسباني 2027: ${m.stage} — ${h.name} × ${a.name} (${m.dateAr}).`;
  return `
<article class="match" data-reveal>
  <div class="match__top"><span>${ic("trophy")} كأس السوبر الإسباني 2027 • ${m.stage}</span><span class="status">تذكرة رسمية باسمك</span></div>
  <div class="match__teams">
    <div class="team">${crest(h)}<b>${h.name}</b></div>
    <span class="vs">VS</span>
    <div class="team">${crest(a)}<b>${a.name}</b></div>
  </div>
  <div class="match__info">
    <span>${ic("calendar")}${m.dateAr}</span>
    <span>${ic("stadium")}${m.venueAr}</span><span>${ic("clock")}صافرة البداية 22:00 بتوقيت إسطنبول</span>
  </div>
  <div class="match__foot">
    ${minPrice(m) !== null ? `<div class="price"><small>يبدأ من / للتذكرة</small><b>${fmt(minPrice(m))}</b></div>` : `<div class="price"><small>الفئات</small><b style="font-size:1rem">الأولى • الثانية • الثالثة • VIP</b></div>`}
    <a class="btn btn--sm" href="${waUrl(msg)}" target="_blank" rel="noopener">${ic("ticket")}<span>احجز</span></a>
  </div>
</article>`;
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
  vip: { label: "VIP / الضيافة", color: "#F4B740", desc: "وسط الجهة الرئيسية: أفضل زاوية رؤية ومقاعد مريحة وخدمات ضيافة حسب ما يوفره المنظمون." },
  cat1: { label: "الفئة الأولى", color: "#ED5404", desc: "الجوانب الطولية قرب منتصف الملعب: رؤية جانبية كاملة لكل اللعب، الخيار الأنسب لمتابعة المباراة." },
  cat2: { label: "الفئة الثانية", color: "#4F8BC9", desc: "أطراف الجوانب والزوايا والمدرج العلوي الجانبي: رؤية جيدة وسعر أقل." },
  cat3: { label: "الفئة الثالثة", color: "#2A9D8F", desc: "خلف المرمى: أجواء الجماهير الأكثر حماساً وبأقل سعر، والرؤية من طرف الملعب." },
};
const VENUE_MODEL = {
  sf1: { capacity: "حوالي 47 ألف مقعد", model: { upperRows: 18, closedCorners: true, singleTierEnd: null } },
  sf2: { capacity: "حوالي 42 ألف مقعد", model: { upperRows: 16, closedCorners: true, singleTierEnd: "W" } },
  final: { capacity: "حوالي 53 ألف مقعد", model: { upperRows: 20, closedCorners: true, singleTierEnd: null } },
};
const priceText = (m, k) => (typeof m.prices?.[k] === "number" ? `${Number(m.prices[k]).toLocaleString("en-US")} ${CURRENCY.symbol}` : "عند الطلب");
function stadiumSection() {
  const cfg = {
    wa: "905399334331", currency: CURRENCY.symbol, categories: SEATS,
    matches: scMatches.map((m) => ({ stage: m.stage, teams: `${teams[m.home].name} × ${teams[m.away].name}`, venue: m.venueAr, capacity: VENUE_MODEL[m.id].capacity, prices: m.prices, venueModel: VENUE_MODEL[m.id].model })),
  };
  const m0 = scMatches[0];
  return `
<section class="section stadium-sec" id="stadium" data-stadium>
  <div class="container">
    ${sectionHead({ eyebrow: `${ic("stadium")} مجسم الملعب`, title: "اجلس في مقعدك… قبل أن تصل إلى الملعب", lead: "ملعب ثلاثي الأبعاد مليء بالجماهير: اضغط على أي مدرج لترى فئته وسعره، ثم «شاهد الملعب من مقعدك» لتجلس مكانك وتشاهد الملعب كما ستراه يوم المباراة — وجرّب الموجة وصوت المدرجات.", center: true })}
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
          <p class="stadium-hint">${ic("refresh")}<span>اسحب للتدوير</span><span class="hint-more"> • اضغط على مدرج ثم «شاهد من مقعدك»</span></p>
          <div class="stadium-sheet" aria-live="polite">
            <p><span class="ss-dot"></span><b class="ss-cat"></b><span class="ss-where"></span></p>
            <div class="ss-actions"><button type="button" class="btn btn--sm ss-seat">${ic("eye")}<span>شاهد من مقعدك</span></button><a class="btn btn--wa btn--sm ss-wa" href="#book" target="_blank" rel="noopener">${ic("whatsapp")}<span>احجز</span></a><button type="button" class="ss-close" aria-label="إغلاق">${ic("x")}</button></div>
          </div>
          <div class="stadium-fx">
            <button type="button" data-zoom="in" aria-label="تكبير">${ic("plus")}</button>
            <button type="button" data-zoom="out" aria-label="تصغير">${ic("minus")}</button>
            <button type="button" data-wave>${ic("waves")}<span>الموجة</span></button>
            <button type="button" data-sound aria-pressed="false" aria-label="تشغيل صوت المدرجات">${ic("volume-x")}${ic("volume")}</button>
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
            <p class="si-price-row">السعر: <b class="si-price">—</b></p>
            <button type="button" class="btn btn--block si-seat">${ic("eye")}<span>شاهد الملعب من مقعدك</span></button>
            <a class="btn btn--wa btn--block si-wa" href="#book" target="_blank" rel="noopener">${ic("whatsapp")}<span>احجز هذه الفئة</span></a>
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
  const others = [
    { icon: "stadium", title: "ديربيات إسطنبول", text: "أجواء لا تُنسى في مباريات غلطة سراي وفنربخشة وبشكتاش ضمن الدوري التركي.", tag: "حسب الجدول" },
    { icon: "trophy", title: "الليالي الأوروبية في إسطنبول", text: "مباريات الأندية التركية في البطولات الأوروبية على ملاعب إسطنبول.", tag: "حسب القرعة" },
    { icon: "globe", title: "مباريات حول العالم", text: "نساعدك في تذاكر مباريات كبرى في أوروبا والخليج مع الطيران والفندق.", tag: "حسب الطلب" },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-matches"), eyebrow: "تذاكر المباريات • جديد في أويا", title: "تذاكر المباريات… احضر المباراة وعِش الحكاية", lead: "من كأس السوبر الإسباني 2027 في إسطنبول إلى ديربيات الدوري التركي والليالي الأوروبية — نؤمّن لك المقعد والفندق والتنقلات في باقة واحدة.", icon: "ball", page: path,
    chips: [{ icon: "ticket", text: "تذكرة رسمية باسمك" }, { icon: "hotel", text: "باقات مع الفندق" }, { icon: "car", text: "نقل من وإلى الملعب" }],
    actions: `<a class="btn" href="#book">${ic("ticket")}<span>اطلب باقتك</span></a>${waBtn("مرحباً أويا، أرغب بالاستفسار عن تذاكر المباريات.", "اسأل عبر واتساب", "btn btn--glass")}` })}

<section class="section">
  <div class="container">${superCup.promo()}</div>
</section>

<section class="section" style="padding-top:0">
  <div class="container">
    ${sectionHead({ eyebrow: "جدول البطولة", title: "مباريات كأس السوبر الإسباني 2027", lead: "الجدول وفق ما أعلنه الاتحاد الإسباني لكرة القدم، مع الملعب وموعد الانطلاق لكل مباراة.", row: true, after: `<a class="btn btn--ghost" href="{{root}}matches/spanish-super-cup-2027/">الدليل الكامل ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${scMatches.map((m) => matchCard(m)).join("")}</div>
    <p class="muted mt-1" style="font-size:.85rem">المواعيد والملاعب وفق ما أعلنه الاتحاد الإسباني لكرة القدم: صافرة البداية 22:00 بتوقيت إسطنبول (20:00 بتوقيت إسبانيا).</p>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "باقات المباريات", title: "اختر طريقتك في حضور المباراة", center: true })}
    ${tiers("حضور مباراة")}
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "مباريات أخرى", title: "مباريات أخرى حسب الطلب" })}
    <div class="grid grid-3" data-stagger>
      ${others.map((o) => `<div class="svc" data-reveal><span class="chip chip--orange" style="align-self:flex-start">${o.tag}</span><span class="ico">${ic(o.icon)}</span><h3>${o.title}</h3><p>${o.text}</p><a class="link-arrow" href="${waUrl(`مرحباً أويا، أرغب بحضور: ${o.title}.`)}" target="_blank" rel="noopener">اسأل عن الباقة ${ic("arrow")}</a></div>`).join("")}
    </div>
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

<section class="section" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "سجّل طلبك", title: "أرسل طلبك… ونعود إليك بالعرض والتوفر", lead: "لكأس السوبر نبلغك فور فتح البيع الرسمي، ولبقية المباريات نرسل لك المتاح مع عرض مكتوب — دون أي التزام." })}</div>
    <div class="form-card" data-reveal="zoom">${matchForm()}</div>
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
    { q: "متى أسجّل طلبي؟", a: "كلما كان أبكر كان أفضل؛ مباريات برشلونة وريال مدريد تشهد طلباً عالياً. سجّل اهتمامك الآن عبر واتساب لنبلغك بالأسعار والتوفر فور فتح البيع الرسمي." },
    { q: "ماذا لو لم تتوفر التذكرة الرسمية؟", a: "التذاكر تُباع عبر القناة الرسمية وحسب التوفر، ولا يملك أحد غير الجهة المنظمة ضمانها. لذلك نوضّح لك كتابياً قبل أي دفعة ما الذي يُسترد وما لا يُسترد من الباقة إن تعذّر الحصول على التذكرة أو تغيّر موعد المباراة." },
    { q: "أين أسكن في إسطنبول خلال البطولة؟", a: "حسب مباراتك: لنصف النهائي الأول (كاديكوي) تناسبك فنادق الجانب الآسيوي في كاديكوي وأوسكودار، ولنصف النهائي الثاني (بشكتاش) فنادق بشكتاش وتقسيم وشيشلي، وللنهائي (رامز بارك في سارير) فنادق شيشلي وليفنت ومسلك. ولأن المباريات تنتهي قرابة منتصف الليل ننصح بنقل خاص مرتب مسبقاً." },
    { q: "هل أحتاج تأشيرة لدخول تركيا لحضور المباراة؟", a: "يعتمد ذلك على جنسيتك؛ مواطنو كثير من الدول العربية — ومنها دول الخليج — يدخلون تركيا دون تأشيرة لمدة محددة، بينما تحتاج جنسيات أخرى تأشيرة إلكترونية أو من السفارة. أرسل لنا جنسيتك ونخبرك بالمطلوب." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-super-cup"), eyebrow: `${ic("trophy")} إسطنبول • 2–6 فبراير 2027`, title: "تذاكر كأس السوبر الإسباني 2027 في إسطنبول", lead: "الكلاسيكو المحتمل في النهائي، ونجوم الليغا على أرض إسطنبول. احجز باقة إقامة المشجع مع أويا للسياحة، ونساعدك في الحصول على تذكرتك الرسمية باسمك عند فتح البيع وحسب التوفر — من قلب المدينة المستضيفة.", icon: "trophy", page: path,
    actions: `<a class="btn" href="#book">${ic("ticket")}<span>سجّل اهتمامك بالباقة</span></a>${waBtn("مرحباً أويا، أرغب بباقة حضور كأس السوبر الإسباني 2027 في إسطنبول.", "واتساب", "btn btn--glass")}`,
    extra: `<div class="mt-2" style="max-width:560px">${countdown()}</div>` })}

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "المباريات", title: "جدول مباريات السوبر الإسباني في إسطنبول", lead: "ثلاث مباريات في خمسة أيام — يمكنك حضور مباراة واحدة أو البطولة كاملة." })}
    <div class="grid grid-3" data-stagger>${scMatches.map((m) => matchCard(m)).join("")}</div>
    <div class="table-wrap mt-2" data-reveal><table class="table"><thead><tr><th>المرحلة</th><th>المواجهة</th><th>التاريخ</th><th>المدينة</th></tr></thead><tbody>
      ${scMatches.map((m) => `<tr><td><strong>${m.stage}</strong></td><td>${teams[m.home].name} × ${teams[m.away].name}</td><td>${m.dateAr}</td><td>إسطنبول</td></tr>`).join("")}
    </tbody></table></div>
    <p class="muted mt-1" style="font-size:.85rem">المواعيد والملاعب وفق ما أعلنه الاتحاد الإسباني لكرة القدم: صافرة البداية 22:00 بتوقيت إسطنبول (20:00 بتوقيت إسبانيا).</p>
    ${hasPrices() ? `<h3 class="h-l mt-3" id="prices">أسعار التذاكر حسب الفئة</h3>${priceTable()}` : ""}
  </div>
</section>

${stadiumSection()}

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
      <div class="team-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        ${["fcb", "rma", "atm", "rso"].map((k) => `<div class="svc" style="align-items:center;text-align:center;padding:22px">${crest(teams[k])}<b style="font-family:var(--ff-display)">${teams[k].name}</b><span class="muted ltr" style="font-size:.8rem">${teams[k].en}</span></div>`).join("")}
      </div>
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

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>
      ${sectionHead({ eyebrow: "احجز الآن", title: "سجّل طلب التذاكر", lead: "اختر المباراة والفئة والباقة، وسنعود إليك بالتوفر والسعر مكتوباً." })}
      ${disclaimer}
    </div>
    <div class="form-card" data-reveal="zoom">${matchForm()}</div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن السوبر الإسباني 2027" })}
${readFirst(["matches"], data, path, "دليل المشجع")}
${ctaBand({ title: "شاهد الكلاسيكو المحتمل… من إسطنبول", lead: "مقعدك، فندقك وتنقلاتك — جاهزة قبل أن تصل.", wa: "مرحباً أويا، أرغب بباقة كأس السوبر الإسباني 2027 في إسطنبول." })}`;
  page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), ...scMatches.map((m) => S.eventNode(page, evt(m))), S.faqNode(page, faq)].filter(Boolean);
  return page;
}
