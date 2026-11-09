// Page shell: <head>, header (mega menus), drawer, footer, floating actions
import { site, nav } from "../site.mjs";
import { esc, ic, waUrl } from "./ui.mjs";

const abs = (p) => `${site.url}/${p}`;

function megaTurkey(data) {
  const ds = data.destinations || [];
  return `
<div class="mega" role="region" aria-label="رحلات تركيا">
  <div>
    <h4>وجهات داخل تركيا</h4>
    <ul class="cols-2" style="display:grid">
      ${ds.map((d) => `<li><a href="{{root}}turkey-tours/${d.slug}/">${esc(d.name)}<small>${esc(d.tagline || "")}</small></a></li>`).join("")}
      <li><a href="{{root}}turkey-tours/"><b>كل وجهات تركيا ←</b></a></li>
    </ul>
  </div>
  <div class="mega-feature">
    <b>برامج سياحية متكاملة</b>
    <span>برامج يوم بيوم لإسطنبول، طرابزون، بورصة وكابادوكيا مع سائق يتحدث العربية.</span>
    <a href="{{root}}packages/">تصفّح البرامج</a>
    ${(data.extras || []).filter((x) => x.kind !== "offer").length ? `<span style="position:relative;display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${(data.extras || []).filter((x) => x.kind !== "offer").map((x) => `<a href="{{root}}${x.path}" style="font-size:.85rem;padding:.3em .7em">${esc(x.h1.split(":")[0].split(" في ")[0])}</a>`).join("")}</span>` : ""}
  </div>
</div>`;
}
function megaVisas(data) {
  const g = (k) => (data.visas || []).filter((v) => v.group === k);
  const col = (title, base, list, hub) => `<div><h4>${title}</h4><ul>${list.map((v) => `<li><a href="{{root}}${base}${v.slug}/">${esc(v.name)}</a></li>`).join("")}<li><a href="{{root}}${hub}"><b>عرض الكل ←</b></a></li></ul></div>`;
  return `
<div class="mega" style="grid-template-columns:repeat(3,1fr);width:min(900px,92vw)" role="region" aria-label="التأشيرات">
  ${col("تأشيرات السعودية", "saudi-visa/", g("saudi"), "saudi-visa/")}
  ${col("تأشيرات الخليج", "gcc-visas/", g("gcc"), "gcc-visas/")}
  ${col("تأشيرات دولية", "visas/", g("intl"), "visas/")}
</div>`;
}

function header(page, data) {
  const items = nav.map((n) => {
    const active = page.nav === n.key;
    if (n.mega) {
      return `<li class="has-mega${active ? " is-active" : ""}"><button class="nav-trigger" type="button" aria-expanded="false">${n.label}${ic("chevron")}</button>${n.mega === "turkey" ? megaTurkey(data) : megaVisas(data)}</li>`;
    }
    return `<li><a href="{{root}}${n.href}"${active ? ' aria-current="page"' : ""}>${n.label}${n.isNew ? '<span class="tag-new">جديد</span>' : ""}</a></li>`;
  }).join("");
  return `
<header class="site-header${page.lightHeader ? " is-light" : ""}">
  <div class="container">
    <a class="brand" href="{{root}}" aria-label="${site.name} — الصفحة الرئيسية">
      <img class="logo-light" src="{{root}}assets/img/brand/oya-lockup-white.svg" alt="${site.name} OYA Tourism" width="208" height="46">
      <img class="logo-dark" src="{{root}}assets/img/brand/oya-lockup.svg" alt="" width="208" height="46" aria-hidden="true">
    </a>
    <nav class="nav" aria-label="القائمة الرئيسية"><ul>${items}</ul></nav>
    <div class="header-cta">
      <a class="btn btn--wa btn--sm" href="${waUrl("مرحباً أويا للسياحة، أرغب بالاستفسار.")}" target="_blank" rel="noopener">${ic("whatsapp")}<span>واتساب</span></a>
    </div>
    <button class="menu-btn" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="drawer">${ic("menu")}</button>
  </div>
</header>`;
}

function drawer(page, data) {
  const ds = data.destinations || [];
  const g = (k) => (data.visas || []).filter((v) => v.group === k);
  const link = (href, label, key) => `<li><a href="{{root}}${href}"${page.nav === key ? ' aria-current="page"' : ""}>${label}</a></li>`;
  return `
<div class="drawer" id="drawer">
  <div class="drawer__scrim" data-close-drawer></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="القائمة">
    <div class="drawer__head"><img src="{{root}}assets/img/brand/oya-lockup.svg" alt="${site.name}" width="180" height="40"><button class="drawer__close" type="button" data-close-drawer aria-label="إغلاق القائمة">${ic("x")}</button></div>
    <div class="drawer__body">
      <ul>
        ${link("", "الرئيسية", "home")}
        <li><details><summary>رحلات تركيا ${ic("chevron")}</summary><ul>${ds.map((d) => `<li><a href="{{root}}turkey-tours/${d.slug}/">${esc(d.name)}</a></li>`).join("")}<li><a href="{{root}}turkey-tours/">كل وجهات تركيا</a></li><li><a href="{{root}}packages/">البرامج السياحية</a></li></ul></details></li>
        ${link("world-tours/", "رحلات خارج تركيا", "world")}
        ${link("flights/", "تذاكر طيران", "flights")}
        ${link("hotels/", "فنادق ومنتجعات", "hotels")}
        <li><details><summary>التأشيرات ${ic("chevron")}</summary><ul>
          <li><a href="{{root}}saudi-visa/"><b>تأشيرات السعودية</b></a></li>${g("saudi").map((v) => `<li><a href="{{root}}saudi-visa/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
          <li><a href="{{root}}gcc-visas/"><b>تأشيرات الخليج</b></a></li>${g("gcc").map((v) => `<li><a href="{{root}}gcc-visas/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
          <li><a href="{{root}}visas/"><b>تأشيرات دولية</b></a></li>${g("intl").map((v) => `<li><a href="{{root}}visas/${v.slug}/">${esc(v.name)}</a></li>`).join("")}
        </ul></details></li>
        ${(data.extras || []).length ? `<li><details><summary>خدمات وعروض ${ic("chevron")}</summary><ul>${data.extras.map((x) => `<li><a href="{{root}}${x.path}">${esc(x.h1.split(":")[0])}</a></li>`).join("")}<li><a href="{{root}}offers/">كل العروض الموسمية</a></li></ul></details></li>` : ""}
        ${link("matches/", 'تذاكر المباريات <span class="tag-new">جديد</span>', "matches")}
        ${link("blog/", "المدونة", "blog")}
        ${link("about/", "من نحن", "about")}
        ${link("contact/", "تواصل معنا", "contact")}
      </ul>
    </div>
    <div class="drawer__foot">
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
        <li><a href="{{root}}flights/">تذاكر طيران</a></li><li><a href="{{root}}hotels/">فنادق ومنتجعات</a></li><li><a href="{{root}}turkey-tours/">السياحة في تركيا</a></li><li><a href="{{root}}world-tours/">السياحة خارج تركيا</a></li><li><a href="{{root}}packages/">البرامج السياحية</a></li><li><a href="{{root}}matches/">تذاكر المباريات</a></li>${(data.extras || []).map((x) => `<li><a href="{{root}}${x.path}">${esc(x.h1.split(":")[0])}</a></li>`).join("")}
      </ul></div>
      <div><h3>وجهات تركيا</h3><ul>${ds.map((d) => `<li><a href="{{root}}turkey-tours/${d.slug}/">${esc(d.name)}</a></li>`).join("")}</ul></div>
      <div><h3>التأشيرات</h3><ul>
        <li><a href="{{root}}saudi-visa/">تأشيرات السعودية</a></li><li><a href="{{root}}saudi-visa/umrah/">تأشيرة العمرة</a></li><li><a href="{{root}}saudi-visa/tourist/">التأشيرة السياحية السعودية</a></li><li><a href="{{root}}gcc-visas/">تأشيرات الخليج</a></li><li><a href="{{root}}gcc-visas/uae/">تأشيرة الإمارات</a></li><li><a href="{{root}}visas/schengen/">تأشيرة شنغن</a></li><li><a href="{{root}}visas/">التأشيرات الدولية</a></li>
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
    </div>
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

export function renderPage(page, data, assetsVer) {
  const url = abs(page.path);
  const ogImg = abs(page.ogImage || "assets/img/og/og-default.jpg");
  const title = page.title;
  const graph = page.schemaGraph || [];
  return `<!doctype html>
<html lang="ar" dir="rtl" data-wa="${site.whatsapp}" data-email="${site.email}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${page.noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1"}">
<link rel="alternate" hreflang="ar" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#0A1F3A">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${site.name} | ${site.nameEn}">
<meta property="og:locale" content="ar_AR">
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
<link rel="preload" href="{{root}}assets/fonts/alexandria-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{{root}}assets/fonts/readex-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{{root}}assets/css/main.css?v=${assetsVer}">
<script>document.documentElement.classList.add("js");setTimeout(function(){if(!window.__oyaReady)document.documentElement.classList.add("reveal-all")},2500);</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>
${site.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${site.ga4}");</script>` : ""}
</head>
<body class="page-${page.nav || "x"}">
<a class="skip" href="#main">تخطَّ إلى المحتوى</a>
<div class="progress" aria-hidden="true"></div>
${header(page, data)}
${drawer(page, data)}
<main id="main">
${page.body}
</main>
${footer(data, page)}
${vendorScripts(page)}<script src="{{root}}assets/js/main.js?v=${assetsVer}" defer></script>
<script src="{{root}}assets/js/motion.js?v=${assetsVer}" defer></script>
${/data-finder/.test(page.body) ? `<script src="{{root}}assets/js/finder.js?v=${assetsVer}" defer></script>` : ""}
${/data-globe/.test(page.body) ? `<script type="module" src="{{root}}assets/js/globe.js?v=${assetsVer}"></script>` : ""}
</body>
</html>`;
}
