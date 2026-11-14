// Page shell: <head>, header (mega menus), drawer, footer, floating actions
import { site, nav } from "../site.mjs";
import fs from "node:fs";
import path from "node:path";
import { esc, ic, waUrl, ROOT_DIR } from "./ui.mjs";

// Share image (WhatsApp/Facebook/X previews): explicit page.ogImage, else the page's hero photo crop, else default
function ogFor(page) {
  if (page.ogImage) return page.ogImage;
  const m = /class="page-hero__bg"><img[^>]*?src="\{\{root\}\}assets\/img\/photos\/([\w-]+)\.webp"/.exec(page.body || "");
  if (m && fs.existsSync(path.join(ROOT_DIR, "assets/img/og", `${m[1]}.jpg`))) return `assets/img/og/${m[1]}.jpg`;
  return "assets/img/og/og-default.jpg";
}

const abs = (p) => `${site.url}/${p}`;

// "Hotels" menu: hotels by city, cabins, family hotels — with a cabins card
function megaHotels(data) {
  const hs = (data.hotels || []);
  return `
<div class="mega mega--hotels" role="region" aria-label="فنادق ومنتجعات">
  <div>
    <h4>فنادق حسب المدينة</h4>
    <ul class="cols-2" style="display:grid">
      ${hs.filter((h) => h.slug !== "family-friendly").map((h) => `<li><a href="{{root}}hotels/${h.slug}/">${ic("pin")}<span>فنادق ${esc(h.city)}</span></a></li>`).join("")}
      <li><a href="{{root}}hotels/family-friendly/">${ic("family")}<span>فنادق محافظة للعائلات</span></a></li>
      <li><a href="{{root}}hotels/"><b>كل الفنادق والمنتجعات</b></a></li>
    </ul>
  </div>
  <a class="mega-feature mega-feature--cabins" href="{{root}}cabins/">
    <b>${ic("cabin")} أكواخ وبنغلات</b>
    <span>بيوت خشبية بجاكوزي ومدفأة ومسبح في سبانجا وطرابزون — بصور حقيقية وسعر الليلة.</span>
    <span class="mega-feature__go">تصفّح الأكواخ ${ic("arrow", "i-flip")}</span>
  </a>
</div>`;
}
// "More" menu: everything that is not hotels, cabins or flights, in four clear groups
function megaMore(data) {
  const g = (k) => (data.visas || []).filter((v) => v.group === k);
  const li = (href, label, icon) => `<li><a href="{{root}}${href}">${icon ? ic(icon) : ""}<span>${label}</span></a></li>`;
  return `
<div class="mega mega--more" role="region" aria-label="المزيد">
  <div>
    <h4>رحلات وبرامج</h4>
    <ul>
      ${li("turkey-tours/", "السياحة في تركيا", "map")}
      ${li("packages/", "البرامج السياحية", "route")}
      ${li("world-tours/", "رحلات خارج تركيا", "globe")}
      ${li("day-trips/", "جولات يومية", "compass")}
      ${li("transfers/", "استقبال المطار والتنقلات", "car")}
    </ul>
  </div>
  <div>
    <h4>التأشيرات</h4>
    <ul>
      ${li("turkey-visa/", "تأشيرة تركيا للعرب", "passport")}
      ${li("saudi-visa/", "تأشيرات السعودية", "mosque")}
      ${li("gcc-visas/", "تأشيرات الخليج", "passport")}
      ${li("visas/", "تأشيرات دولية", "globe")}
    </ul>
  </div>
  <div>
    <h4>مباريات وعروض</h4>
    <ul>
      ${li("matches/spanish-super-cup-2027/", "كأس السوبر الإسباني 2027", "trophy")}
      ${li("matches/", "تذاكر المباريات", "ball")}
      ${li("offers/", "العروض الموسمية", "sparkles")}
    </ul>
  </div>
  <div>
    <h4>أويا</h4>
    <ul>
      ${li("about/", "من نحن", "")}
      ${li("blog/", "المدونة", "")}
      ${li("faq/", "الأسئلة الشائعة", "")}
      ${li("contact/", "تواصل معنا", "")}
    </ul>
  </div>
</div>`;
}

// Language menu: links to the same page in every language. Names are in their own language (translate="no").
function langMenu(page, L) {
  if (page.noLocale) return "";
  return `
    <div class="lang" data-lang>
      <button class="lang__btn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="اللغة">${ic("globe")}<span translate="no">${L.short}</span>${ic("chevron")}</button>
      <ul class="lang__menu">${site.locales.map((l) => `<li><a href="{{site}}${l.prefix}${page.path}" hreflang="${l.code}" lang="${l.code}" translate="no"${l.code === L.code ? ' aria-current="true"' : ""}>${l.name}</a></li>`).join("")}</ul>
    </div>`;
}

function header(page, data, L) {
  const primary = ["hotels", "cabins", "flights"];
  const items = nav.map((n) => {
    const active = page.nav === n.key || (n.key === "more" && !primary.includes(page.nav) && page.nav !== "home");
    if (n.mega) {
      return `<li class="has-mega${active ? " is-active" : ""}${n.icon ? " nav-main" : " nav-more"}"><button class="nav-trigger" type="button" aria-expanded="false">${n.icon ? ic(n.icon, "nav-ico") : ""}<span>${n.label}</span>${ic("chevron")}</button>${n.mega === "hotels" ? megaHotels(data) : megaMore(data)}</li>`;
    }
    return `<li class="nav-main"><a href="{{root}}${n.href}"${active ? ' aria-current="page"' : ""}>${n.icon ? ic(n.icon, "nav-ico") : ""}<span>${n.label}</span></a></li>`;
  }).join("");
  return `
<header class="site-header${page.lightHeader ? " is-light" : ""}">
  <div class="container">
    <a class="brand" href="{{root}}" aria-label="${site.name} — الصفحة الرئيسية">
      <img class="logo-light" src="{{root}}assets/img/brand/oya-lockup-white.svg" alt="${site.name} OYA Tourism" width="208" height="46">
      <img class="logo-dark" src="{{root}}assets/img/brand/oya-lockup.svg" alt="" width="208" height="46" aria-hidden="true">
    </a>
    <nav class="nav" aria-label="القائمة الرئيسية"><ul>${items}</ul></nav>
    ${langMenu(page, L)}
    <div class="header-cta">
      <a class="btn btn--wa btn--sm" href="${waUrl("مرحباً أويا للسياحة، أرغب بالاستفسار.")}" target="_blank" rel="noopener">${ic("whatsapp")}<span>واتساب</span></a>
    </div>
    <button class="menu-btn" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="drawer">${ic("menu")}</button>
  </div>
</header>`;
}

function drawer(page, data, L) {
  const ds = data.destinations || [];
  const g = (k) => (data.visas || []).filter((v) => v.group === k);
  const link = (href, label, key) => `<li><a href="{{root}}${href}"${page.nav === key ? ' aria-current="page"' : ""}>${label}</a></li>`;
  return `
<div class="drawer" id="drawer">
  <div class="drawer__scrim" data-close-drawer></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="القائمة">
    <div class="drawer__head"><img src="{{root}}assets/img/brand/oya-lockup.svg" alt="${site.name}" width="180" height="40"><button class="drawer__close" type="button" data-close-drawer aria-label="إغلاق القائمة">${ic("x")}</button></div>
    <div class="drawer__body">
      <div class="drawer__tiles">
        <a class="drawer__tile" href="{{root}}hotels/"${page.nav === "hotels" ? ' aria-current="page"' : ""}>${ic("hotel")}<span>فنادق ومنتجعات</span></a>
        <a class="drawer__tile" href="{{root}}cabins/"${page.nav === "cabins" ? ' aria-current="page"' : ""}>${ic("cabin")}<span>أكواخ وبنغلات</span></a>
        <a class="drawer__tile" href="{{root}}flights/"${page.nav === "flights" ? ' aria-current="page"' : ""}>${ic("takeoff")}<span>تذاكر طيران</span></a>
      </div>
      <ul>
        ${link("", "الرئيسية", "home")}
        ${(data.hotels || []).length ? `<li><details><summary>فنادق حسب المدينة ${ic("chevron")}</summary><ul>${data.hotels.map((h) => `<li><a href="{{root}}hotels/${h.slug}/">${h.slug === "family-friendly" ? "فنادق محافظة للعائلات" : "فنادق " + esc(h.city)}</a></li>`).join("")}</ul></details></li>` : ""}
        <li><details><summary>رحلات وبرامج ${ic("chevron")}</summary><ul><li><a href="{{root}}turkey-tours/"><b>السياحة في تركيا</b></a></li>${ds.map((d) => `<li><a href="{{root}}turkey-tours/${d.slug}/">${esc(d.name)}</a></li>`).join("")}<li><a href="{{root}}packages/"><b>البرامج السياحية</b></a></li><li><a href="{{root}}world-tours/"><b>رحلات خارج تركيا</b></a></li></ul></details></li>
        <li><details><summary>التأشيرات ${ic("chevron")}</summary><ul>
          <li><a href="{{root}}turkey-visa/"><b>تأشيرة تركيا للعرب</b></a></li>
          <li><a href="{{root}}saudi-visa/"><b>تأشيرات السعودية</b></a></li>${g("saudi").map((v) => `<li><a href="{{root}}saudi-visa/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
          <li><a href="{{root}}gcc-visas/"><b>تأشيرات الخليج</b></a></li>${g("gcc").map((v) => `<li><a href="{{root}}gcc-visas/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
          <li><a href="{{root}}visas/"><b>تأشيرات دولية</b></a></li>${g("intl").map((v) => `<li><a href="{{root}}visas/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
        </ul></details></li>
        ${(data.extras || []).length ? `<li><details><summary>خدمات وعروض ${ic("chevron")}</summary><ul>${data.extras.map((x) => `<li><a href="{{root}}${x.path}">${esc(x.navLabel || x.h1.split(":")[0])}</a></li>`).join("")}<li><a href="{{root}}offers/">كل العروض الموسمية</a></li></ul></details></li>` : ""}
        ${link("matches/", "تذاكر المباريات", "matches")}
        ${link("blog/", "المدونة", "blog")}
        ${link("about/", "من نحن", "about")}
        ${link("faq/", "الأسئلة الشائعة", "faq")}
        ${link("contact/", "تواصل معنا", "contact")}
      </ul>
    </div>
    <div class="drawer__foot">
      ${page.noLocale ? "" : `<nav class="drawer__langs" aria-label="اللغة">${ic("globe")}${site.locales.map((l) => `<a href="{{site}}${l.prefix}${page.path}" hreflang="${l.code}" lang="${l.code}" translate="no"${l.code === L.code ? ' aria-current="true"' : ""}>${l.name}</a>`).join("")}</nav>`}
      <a class="btn btn--wa btn--block" href="${waUrl("مرحباً أويا للسياحة، أرغب بالاستفسار.")}" target="_blank" rel="noopener">${ic("whatsapp")}<span>تواصل عبر واتساب</span></a>
      <a class="btn btn--ghost btn--block" href="tel:${site.phoneIntl}">${ic("phone")}<span class="ltr">${site.phoneDisplay}</span></a>
    </div>
  </div>
</div>`;
}

function footer(data, page) {
  const ds = data.destinations || [];
  const s = site.socials;
  const socials = [["instagram", s.instagram, "إنستغرام"], ["facebook", s.facebook, "فيسبوك"], ["tiktok", s.tiktok, "تيك توك"], ["youtube", s.youtube, "يوتيوب"], ["snap", s.snap, "سناب شات"]].filter((x) => x[1]);
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="{{root}}assets/img/brand/oya-logo-white.svg" alt="${site.name} — OYA Tourism" width="124" height="120" loading="lazy">
        <p>${site.name} — وكالة سياحة وسفر في إسطنبول. تذاكر طيران، فنادق ومنتجعات، برامج سياحية داخل تركيا وخارجها، وتأشيرات السعودية والخليج والعالم. ${site.tagline}</p>
        <div class="socials">
          <a href="${waUrl("")}" target="_blank" rel="noopener" aria-label="واتساب">${ic("whatsapp")}</a>
          <a href="mailto:${site.email}" aria-label="البريد الإلكتروني">${ic("mail")}</a>
          ${socials.map(([k, u, l]) => `<a href="${u}" target="_blank" rel="noopener me" aria-label="${l}">${ic(k)}</a>`).join("")}
        </div>
      </div>
      <div><h3>خدماتنا</h3><ul>
        <li><a href="{{root}}flights/">تذاكر طيران</a></li><li><a href="{{root}}hotels/">فنادق ومنتجعات</a></li><li><a href="{{root}}turkey-tours/">السياحة في تركيا</a></li><li><a href="{{root}}world-tours/">السياحة خارج تركيا</a></li><li><a href="{{root}}packages/">البرامج السياحية</a></li><li><a href="{{root}}matches/">تذاكر المباريات</a></li><li><a href="{{root}}matches/spanish-super-cup-2027/">كأس السوبر الإسباني 2027</a></li>${(data.extras || []).map((x) => `<li><a href="{{root}}${x.path}">${esc(x.navLabel || x.h1.split(":")[0])}</a></li>`).join("")}<li><a href="{{root}}offers/">العروض الموسمية</a></li>
      </ul></div>
      <div><h3>وجهات تركيا</h3><ul>${ds.map((d) => `<li><a href="{{root}}turkey-tours/${d.slug}/">${esc(d.name)}</a></li>`).join("")}</ul></div>
      <div><h3>التأشيرات</h3><ul>
        <li><a href="{{root}}saudi-visa/">تأشيرات السعودية</a></li><li><a href="{{root}}saudi-visa/umrah/">تأشيرة العمرة</a></li><li><a href="{{root}}saudi-visa/tourist/">التأشيرة السياحية السعودية</a></li><li><a href="{{root}}gcc-visas/">تأشيرات الخليج</a></li><li><a href="{{root}}gcc-visas/uae/">تأشيرة الإمارات</a></li><li><a href="{{root}}visas/schengen/">تأشيرة شنغن</a></li><li><a href="{{root}}visas/">التأشيرات الدولية</a></li><li><a href="{{root}}turkey-visa/">تأشيرة تركيا للعرب</a></li>
      </ul></div>
      <div><h3>تواصل معنا</h3><ul class="footer-contact">
        <li>${ic("whatsapp")}<a href="${waUrl("")}" target="_blank" rel="noopener"><span class="ltr">${site.phoneDisplay}</span></a></li>
        <li>${ic("mail")}<a href="mailto:${site.email}">${site.email}</a></li>
        <li>${ic("pin")}<span>${site.addressLine || `${site.city}، ${site.country}`}</span></li>
        <li>${ic("clock")}<span>${site.hours}</span></li>
        ${site.tursab ? `<li>${ic("shield")}<span>رخصة TÜRSAB رقم ${esc(site.tursab)}</span></li>` : ""}
      </ul>
      <ul style="margin-top:14px"><li><a href="{{root}}about/">من نحن</a></li><li><a href="{{root}}faq/">الأسئلة الشائعة</a></li><li><a href="{{root}}blog/">المدونة</a></li><li><a href="{{root}}contact/">اتصل بنا</a></li></ul></div>
    </div>
    <div class="footer-big" aria-hidden="true">OYA TOURISM</div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> ${site.name} — OYA Tourism. جميع الحقوق محفوظة.</span>
      <span><a href="{{root}}privacy/">سياسة الخصوصية</a> · <a href="{{root}}terms/">الشروط والأحكام</a> · <a href="{{root}}sitemap.xml">خريطة الموقع</a></span>
    <span class="footer-note">الصور في الموقع توضيحية، ومعلومات التأشيرات عامة ونؤكدها لك وقت التقديم.</span></div>
  </div>
</footer>
<a class="fab-wa" href="${waUrl("مرحباً أويا للسياحة، أرغب بالاستفسار.")}" target="_blank" rel="noopener" aria-label="تواصل عبر واتساب">${ic("whatsapp")}</a>
<button class="to-top" type="button" aria-label="العودة للأعلى">${ic("arrow-up")}</button>
<nav class="mbar" aria-label="تواصل سريع">
  <a href="tel:${site.phoneIntl}">${ic("phone")}اتصال</a>
  <a class="wa" href="${waUrl("مرحباً أويا للسياحة، أرغب بالاستفسار.")}" target="_blank" rel="noopener">${ic("whatsapp")}واتساب</a>
  ${page.mbar ? `<a class="go" href="${waUrl(page.mbar.msg)}" target="_blank" rel="noopener">${ic(page.mbar.icon || "sparkles")}${page.mbar.label}</a>` : `<a class="go" href="${/id="book"/.test(page.body) ? "#book" : "{{root}}#book"}">${ic("sparkles")}${/id="book"/.test(page.body) ? "احجز الآن" : "احجز رحلتك"}</a>`}
</nav>`;
}

function vendorScripts(page) {
  const st = /class="itinerary/.test(page.body); // GSAP only where motion serves a decision
  const flip = false; // filters use a cheap CSS transition (INP budget)
  if (!st && !flip) return "";
  return `<script src="{{root}}assets/js/vendor/gsap.min.js?v=3.15.1" defer></script>\n` +
    (st ? `<script src="{{root}}assets/js/vendor/ScrollTrigger.min.js?v=3.15.1" defer></script>\n` : "") +
    (flip ? `<script src="{{root}}assets/js/vendor/Flip.min.js?v=3.15.1" defer></script>\n` : "");
}

// Strings the scripts show (T("…") in assets/js/*.js), shipped per page as a small table the build translates
const JS_T = {};
for (const f of ["main", "finder", "globe", "stadium", "cabins"]) {
  const src = fs.readFileSync(path.join(ROOT_DIR, "assets/js", `${f}.js`), "utf8");
  JS_T[f] = [...new Set([...src.matchAll(/\bT\("((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)))];
}
function jsStrings(page) {
  const used = ["main", /data-finder/.test(page.body) && "finder", /data-globe/.test(page.body) && "globe", /data-stadium/.test(page.body) && "stadium", /data-cabins/.test(page.body) && "cabins"].filter(Boolean);
  const table = Object.fromEntries(used.flatMap((f) => JS_T[f]).map((s) => [s, s]));
  return `<script type="application/json" id="oya-t">${JSON.stringify(table).replace(/</g, "\\u003c")}</script>`;
}

export function renderPage(page, data, assetsVer, lang = "ar") {
  const L = site.locales.find((l) => l.code === lang) || site.locales[0];
  const url = abs(L.prefix + page.path);
  const ogImg = abs(ogFor(page));
  const title = page.title;
  const graph = page.schemaGraph || [];
  // Photos for search engines: the page's hero photo becomes primaryImageOfPage, and Service nodes get an image
  const heroKey = (/class="page-hero__bg"><img[^>]*?src="\{\{root\}\}assets\/img\/photos\/([\w-]+)\.webp"/.exec(page.body || "") || [])[1];
  if (heroKey) {
    const img = abs(`assets/img/photos/${heroKey}.webp`);
    graph.forEach((n) => {
      if (/WebPage|CollectionPage|AboutPage|ContactPage|FAQPage/.test(n["@type"]) && !n.primaryImageOfPage) n.primaryImageOfPage = { "@type": "ImageObject", url: img, width: 1536, height: 1024 };
      if (n["@type"] === "Service" && !n.image) n.image = img;
    });
  }
  // hreflang: the same page in every language (pages marked noLocale exist in Arabic only)
  const alts = Object.fromEntries((page.noLocale ? [site.locales[0]] : site.locales).map((l) => [l.code, abs(l.prefix + page.path)]));
  const fonts = L.code === "ar" ? ["alexandria-arabic", "readex-arabic"] : L.code === "ru" ? ["readex-latin", "manrope-cyrillic"] : ["alexandria-latin", "readex-latin"];
  return `<!doctype html>
<html lang="${L.code}" dir="${L.dir}" data-wa="${site.whatsapp}" data-email="${site.email}">
<head>
<meta charset="utf-8">
${site.gtm ? `<script async src="https://www.googletagmanager.com/gtm.js?id=${site.gtm}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());</script>
` : ""}<meta name="oya-prices" content="{{site}}data/prices.json">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${page.noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1"}">
${Object.entries(alts).map(([code, href]) => `<link rel="alternate" hreflang="${code}" href="${href}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${alts[site.locales[0].code] || url}">
<meta name="theme-color" content="#0A1F3A">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${L.code === "ar" ? `${site.name} | ${site.nameEn}` : site.nameEn}">
<meta property="og:locale" content="${L.og}">
${page.noLocale ? "" : site.locales.filter((l) => l.code !== L.code).map((l) => `<meta property="og:locale:alternate" content="${l.og}">`).join("\n")}
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogTitle || title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImg}">
${site.gscVerification ? `<meta name="google-site-verification" content="${esc(site.gscVerification)}">` : ""}
<link rel="icon" href="{{root}}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{{root}}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{{root}}apple-touch-icon.png">
<link rel="manifest" href="{{root}}site.webmanifest">
${(() => { // preload the LCP photo (page hero, or the home hero's first slide) so it starts downloading with the CSS
    const m = /<img[^>]*?src="(\{\{root\}\}assets\/img\/photos\/[\w-]+\.webp)"[^>]*?srcset="([^"]+)"[^>]*?fetchpriority="high"/.exec(page.body || "");
    return m ? `<link rel="preload" as="image" href="${m[1]}" imagesrcset="${m[2]}" imagesizes="100vw" fetchpriority="high">\n` : "";
  })()}${fonts.map((f) => `<link rel="preload" href="{{root}}assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n")}
<link rel="stylesheet" href="{{root}}assets/css/main.css?v=${assetsVer}">
<script>document.documentElement.classList.add("js");setTimeout(function(){if(!window.__oyaReady)document.documentElement.classList.add("reveal-all")},2500);</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>
${site.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${site.ga4}");</script>` : ""}
</head>
<body class="page-${page.nav || "x"} lang-${L.code}">
${site.gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${site.gtm}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>` : ""}
<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
<div class="progress" aria-hidden="true"></div>
${header(page, data, L)}
${drawer(page, data, L)}
<main id="main">
${page.body}
</main>
${footer(data, page)}
${jsStrings(page)}
${vendorScripts(page)}<script src="{{root}}assets/js/main.js?v=${assetsVer}" defer></script>
<script src="{{root}}assets/js/motion.js?v=${assetsVer}" defer></script>
${/data-finder/.test(page.body) ? `<script src="{{root}}assets/js/finder.js?v=${assetsVer}" defer></script>` : ""}
${/data-globe/.test(page.body) ? `<script type="module" src="{{root}}assets/js/globe.js?v=${assetsVer}"></script>` : ""}
${/data-stadium/.test(page.body) ? `<script type="module" src="{{root}}assets/js/stadium.js?v=${assetsVer}"></script>` : ""}
${/data-cabins/.test(page.body) ? `<script src="{{root}}assets/js/cabins.js?v=${assetsVer}" defer></script>` : ""}
</body>
</html>`;
}
