/* Owner-edited catalogues (data/events.json, data/flights.json, data/hotels.json — edited from /admin/).
   Events and flight routes are already in the page as built; they are redrawn here only when the live file
   differs (data-sig), so something added in the panel shows without a rebuild. Hotels are drawn here only.
   Labels are T("…") strings that the build translates per page. */
(function () {
  "use strict";
  var ev = document.querySelector("[data-events]"), fl = document.querySelector("[data-flights]"), ho = [].slice.call(document.querySelectorAll("[data-hotels]"));
  if (!ev && !fl && !ho.length) return;
  var TT = (function () { try { return JSON.parse((document.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s, a) { s = TT[s] || s; return a ? s.replace(/\{(\d)\}/g, function (m, i) { return a[i]; }) : s; };
  var lang = document.documentElement.lang, isAr = lang === "ar", rtl = document.documentElement.dir === "rtl";
  var meta = document.querySelector('meta[name="oya-prices"]');
  var root = meta ? meta.content.replace(/data\/prices\.json$/, "") : "./";
  var home = root + (isAr ? "" : lang + "/");
  var WA = "905399334331";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString({ ru: "ru-RU", tr: "tr-TR", pt: "pt-BR" }[lang] || "en-US"); };
  var wa = function (msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); };
  var ICONS = { ball: 1, trophy: 1, stadium: 1, globe: 1, ticket: 1, whatsapp: 1, plane: 1 };
  var icon = function (n) { if (!ICONS[n]) n = "ball"; var u = document.querySelector("use[href*='icons.svg#']"); var base = u ? u.getAttribute("href").split("#")[0] : root + "assets/img/icons.svg"; return '<svg class="i" aria-hidden="true" focusable="false"><use href="' + base + "#" + n + '"/></svg>'; };
  var sig = function (list, keys) { var h = 0, s = JSON.stringify(list.map(function (x) { return keys.map(function (k) { return x[k] == null ? null : x[k]; }); })); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h >>> 0); };
  // owner text: Arabic, English, and (for older entries) other languages; falls back to English then Arabic
  // tr: this language's own wording (or English), never Arabic on a translated page; txt: falls back to Arabic
  var tr = function (o, f) { if (isAr) return o[f] || ""; var i = o.i18n || {}; return (i[lang] && i[lang][f]) || (i.en && i.en[f]) || o[f + "En"] || ""; };
  var txt = function (o, f) { return tr(o, f) || o[f] || ""; };
  var reveal = function (box) { if (window.__oyaReveal) window.__oyaReveal(box); else [].slice.call(box.querySelectorAll("[data-reveal]")).forEach(function (x) { x.classList.add("is-in"); }); };
  // the currency chosen in the panel (data/prices.json)
  var curP = null, currency = function () { return curP || (curP = get("prices.json").then(function (d) { return (d && d.currency && d.currency.symbol) || "$"; })); };
  function get(file) {
    var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
    return fetch(root + "data/" + file + "?v=" + Math.floor(Date.now() / 60000), { cache: "no-cache", signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  /* ---------- events ---------- */
  var EKEYS = ["id", "title", "tag", "text", "link", "photo", "icon", "priceFrom", "featured", "active", "i18n"];
  if (ev) Promise.all([get("events.json"), currency()]).then(function (x) { var db = x[0], cur = x[1];
    var all = db && Array.isArray(db.events) ? db.events.filter(function (e) { return e && typeof e === "object"; }) : null; if (!all || sig(all, EKEYS) === ev.getAttribute("data-sig")) return;
    ev.innerHTML = all.filter(function (e) { return e && e.active !== false && e.title; }).map(function (e) {
      var link = e.link ? home + String(e.link).replace(/^\/+/, "") : "", title = txt(e, "title"), tag = txt(e, "tag"), text = txt(e, "text");
      var price = typeof e.priceFrom === "number" && e.priceFrom > 0;
      var go = link ? '<a class="btn btn--sm evt__go" href="' + esc(link) + '">' + icon("ticket") + "<span>" + esc(T("التذاكر والمقاعد")) + "</span></a>"
        : '<a class="btn btn--wa btn--sm evt__go" href="' + esc(wa(T("مرحباً أويا، أرغب بحضور: {0}.", [title]))) + '" target="_blank" rel="noopener">' + icon("whatsapp") + "<span>" + esc(T("اسأل عن التذاكر")) + "</span></a>";
      return '<article class="evt' + (e.featured ? " evt--featured" : "") + '" data-reveal><div class="evt__media">' +
        (e.photo ? '<img src="' + esc(root + e.photo) + '" alt="" loading="lazy" decoding="async">' : '<span class="evt__art">' + icon(e.icon || "ball") + "</span>") +
        (tag ? '<span class="evt__tag">' + esc(tag) + "</span>" : "") + '</div><div class="evt__body"><h3>' + (link ? '<a class="cover" href="' + esc(link) + '">' + esc(title) + "</a>" : esc(title)) + "</h3>" +
        (text ? "<p>" + esc(text) + "</p>" : "") + '<div class="evt__foot">' +
        (price ? '<div class="price"><small>' + esc(T("يبدأ من / للتذكرة")) + "</small><b>" + num(e.priceFrom) + '<span class="cur">' + esc(cur) + "</span></b></div>" : "") + go + "</div></div></article>";
    }).join("");
    reveal(ev);
  });

  /* ---------- flight routes ---------- */
  var AIRPORTS = {
    IST: T("إسطنبول"), SAW: T("إسطنبول (صبيحة)"), ESB: T("أنقرة"), TZX: T("طرابزون"), AYT: T("أنطاليا"), ADB: T("إزمير"), BJV: T("بودروم"), DLM: T("دالامان"), NAV: T("كابادوكيا"), YEI: T("بورصة"),
    RUH: T("الرياض"), JED: T("جدة"), DMM: T("الدمام"), MED: T("المدينة المنورة"), TIF: T("الطائف"), AHB: T("أبها"), TUU: T("تبوك"), ELQ: T("القصيم"),
    DXB: T("دبي"), AUH: T("أبوظبي"), SHJ: T("الشارقة"), DOH: T("الدوحة"), KWI: T("الكويت"), BAH: T("البحرين"), MCT: T("مسقط"),
    BGW: T("بغداد"), EBL: T("أربيل"), BSR: T("البصرة"), NJF: T("النجف"), ISU: T("السليمانية"), AMM: T("عمّان"), BEY: T("بيروت"), DAM: T("دمشق"), ALP: T("حلب"),
    CAI: T("القاهرة"), HRG: T("الغردقة"), CMN: T("الدار البيضاء"), RAK: T("مراكش"), TUN: T("تونس"), ALG: T("الجزائر"), MJI: T("طرابلس"), KRT: T("الخرطوم"),
    TBS: T("تبليسي"), BUS: T("باتومي"), GYD: T("باكو"), TAS: T("طشقند"), KUL: T("كوالالمبور"),
    LHR: T("لندن"), CDG: T("باريس"), FRA: T("فرانكفورت"), MUC: T("ميونخ"), AMS: T("أمستردام"), MAD: T("مدريد"), BCN: T("برشلونة"), FCO: T("روما"), VIE: T("فيينا")
  };
  function dur(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (isAr) { var hs = h === 0 ? "" : h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h <= 10 ? h + " ساعات" : h + " ساعة", ms = !m ? "" : m === 1 ? "دقيقة" : m === 2 ? "دقيقتان" : m <= 10 ? m + " دقائق" : m + " دقيقة"; return [hs, ms].filter(Boolean).join(" و") + " تقريباً"; }
    return h && m ? T("حوالي {0} س {1} د", [h, m]) : h ? T("حوالي {0} س", [h]) : T("حوالي {0} د", [m]);
  }
  var FKEYS = ["id", "from", "to", "mins", "price", "active"];
  if (fl) Promise.all([get("flights.json"), currency()]).then(function (x) { var db = x[0], cur = x[1];
    // Arabic pages keep the built tiles unless the panel changed them; other languages always draw them in their language
    var all = db && Array.isArray(db.routes) ? db.routes.filter(function (r) { return r && typeof r === "object"; }) : null; if (!all || (isAr && sig(all, FKEYS) === fl.getAttribute("data-sig"))) return;
    fl.innerHTML = all.filter(function (r) { return r && r.active !== false && AIRPORTS[r.from] && AIRPORTS[r.to]; }).map(function (r) {
      var a = AIRPORTS[r.from], b = AIRPORTS[r.to];
      return '<a class="ctile" data-reveal href="' + esc(wa(T("مرحباً أويا، أرغب بحجز طيران من {0} إلى {1}.", [a, b]))) + '" target="_blank" rel="noopener"><span class="ico">' + icon("plane") + "</span><div><b>" + esc(a) + (rtl ? " ← " : " → ") + esc(b) + "</b><span>" + (r.mins ? esc(dur(r.mins)) : "") + "</span></div>" +
        (typeof r.price === "number" && r.price > 0 ? '<span class="ctile__price">' + esc(T("من {0}", [num(r.price) + cur])) + "</span>" : "") + "</a>";
    }).join("");
    reveal(fl);
  });

  /* ---------- selected hotels ---------- */
  var CITIES = { istanbul: T("إسطنبول"), trabzon: T("طرابزون"), uzungol: T("أوزنجول"), sapanca: T("سبانجا"), antalya: T("أنطاليا"), bursa: T("بورصة"), bodrum: T("بودروم"), cappadocia: T("كابادوكيا") };
  var KIND = { hotel: T("فندق"), resort: T("منتجع"), apartment: T("شقق فندقية"), villa: T("فيلا") };
  var HFEAT = {
    pool: T("مسبح"), indoorpool: T("مسبح داخلي"), spa: T("سبا"), sea: T("إطلالة بحرية"), bosphorus: T("إطلالة على البوسفور"), lake: T("إطلالة على البحيرة"),
    breakfast: T("فطور"), family: T("مناسب للعائلات"), conservative: T("مناسب للعائلات المحافظة"), kids: T("أنشطة للأطفال"), center: T("في وسط المدينة"),
    beach: T("شاطئ خاص"), allinc: T("شامل كل شيء"), parking: T("موقف سيارات"), wifi: T("إنترنت")
  };
  function hotelCard(h, cur) {
    var city = CITIES[h.city] || "", photos = (h.photos || []).filter(Boolean), price = typeof h.price === "number" && h.price > 0;
    var nst = Math.max(0, Math.min(5, parseInt(h.stars, 10) || 0)), stars = nst > 0 ? '<span class="cab__stars" aria-label="' + esc(T("{0} نجوم", [nst])) + '">' + new Array(nst + 1).join("★") + "</span>" : "";
    var feats = (h.features || []).filter(function (f) { return HFEAT[f]; }).slice(0, 6);
    var msg = T("مرحباً أويا، أرغب بحجز فندق «{0}» ({1}). التواريخ وعدد الأشخاص:", [h.name, city]);
    return '<article class="cab" data-reveal><div class="cab__media"' + (photos.length > 1 ? ' tabindex="0" role="group" aria-roledescription="carousel" aria-label="' + esc(T("صورة أخرى")) + '"' : "") + '>' + (photos.length ? photos.map(function (p, i) {
      return '<img ' + (i ? 'data-src="' : 'src="') + esc(root + p) + '" alt="' + esc(h.name + " — " + city) + '" loading="lazy" decoding="async">';
    }).join("") : '<span class="cab__noimg" aria-hidden="true"></span>') +
      (photos.length > 1 ? '<button type="button" dir="ltr" class="cab__nav cab__l" aria-label="' + esc(T("صورة أخرى")) + '">‹</button><button type="button" dir="ltr" class="cab__nav cab__r" aria-label="' + esc(T("صورة أخرى")) + '">›</button><span class="cab__n">1 / ' + photos.length + "</span>" : "") +
      '<span class="cab__area">' + esc(city) + "</span></div>" +
      '<div class="cab__body"><h3 translate="no">' + esc(h.name) + "</h3>" +
      '<p class="cab__specs"><span>' + esc(KIND[h.kind] || KIND.hotel) + "</span>" + stars + (tr(h, "area") ? "<span>" + esc(tr(h, "area")) + "</span>" : "") + "</p>" +
      (feats.length ? '<ul class="cab__feats">' + feats.map(function (f) { return "<li>" + esc(HFEAT[f]) + "</li>"; }).join("") + "</ul>" : "") +
      (tr(h, "note") ? '<p class="cab__note">' + esc(tr(h, "note")) + "</p>" : "") +
      '<div class="cab__foot"><div class="price"><small>' + (price ? T("لليلة الواحدة") : T("السعر")) + "</small><b" + (price ? "" : ' class="price__ask"') + ">" +
      (price ? num(h.price) + '<span class="cur">' + esc(cur) + "</span>" : esc(T("حسب الموسم — اطلب عرضك"))) + "</b></div>" +
      '<a class="btn btn--wa btn--sm" href="' + esc(wa(msg)) + '" target="_blank" rel="noopener">' + esc(T("احجز")) + "</a></div></div></article>";
  }
  function gallery(card) {
    var imgs = [].slice.call(card.querySelectorAll(".cab__media img")); if (imgs.length < 2) return;
    var i = 0, n = card.querySelector(".cab__n");
    function go(d) { imgs[i].hidden = true; i = (i + d + imgs.length) % imgs.length; imgs[i].hidden = false; n.textContent = (i + 1) + " / " + imgs.length; }
    card.querySelector(".cab__l").addEventListener("click", function () { go(rtl ? 1 : -1); });
    card.querySelector(".cab__r").addEventListener("click", function () { go(rtl ? -1 : 1); });
  }
  if (ho.length) Promise.all([get("hotels.json"), currency()]).then(function (x) { var db = x[0], cur0 = x[1];
    var all = (db && Array.isArray(db.hotels) ? db.hotels : []).filter(function (h) { return h && typeof h === "object" && h.active !== false && h.name; });
    var cur = cur0;
    ho.forEach(function (b) {
      var city = b.getAttribute("data-city") || "", limit = +b.getAttribute("data-limit") || 0, grid = b.querySelector(".cab-grid");
      var list = all.filter(function (h) { return !city || h.city === city; }); if (limit) list = list.slice(0, limit);
      grid.innerHTML = list.map(function (h) { return hotelCard(h, cur); }).join("");
      var sec = b.closest("[data-hotels-sec]"); if (sec) sec.hidden = !list.length;
      [].slice.call(grid.querySelectorAll(".cab")).forEach(window.__oyaGallery || gallery); reveal(grid);
    });
  });
})();
