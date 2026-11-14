/* Cabins & bungalows — cards drawn from data/cabins.json (edited from /admin/), so a cabin added in the panel
   shows without a rebuild. Labels are T("…") strings that the build translates per page. */
(function () {
  "use strict";
  var blocks = [].slice.call(document.querySelectorAll("[data-cabins]"));
  if (!blocks.length) return;
  var TT = (function () { try { return JSON.parse((document.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s, a) { s = TT[s] || s; return a ? s.replace(/\{(\d)\}/g, function (m, i) { return a[i]; }) : s; };
  var isAr = document.documentElement.lang === "ar";
  var meta = document.querySelector('meta[name="oya-prices"]');
  var root = meta ? meta.content.replace(/data\/prices\.json$/, "") : "./";
  var WA = "905399334331";
  var AREAS = {
    sapanca: [T("سبانجا"), "sapanca"], masukiye: [T("معشوقية"), "sapanca"], kartepe: [T("كارتبه"), "sapanca"],
    uzungol: [T("أوزنجول"), "trabzon"], trabzon: [T("طرابزون"), "trabzon"], ayder: [T("أيدر"), "trabzon"]
  };
  var FEAT = {
    pool: T("مسبح خاص"), heated: T("مسبح مدفأ"), jacuzzi: T("جاكوزي"), fireplace: T("مدفأة حطب"), lake: T("إطلالة على البحيرة"),
    mountain: T("إطلالة جبلية"), forest: T("بين الغابات"), garden: T("حديقة خاصة"), bbq: T("منطقة شواء"), kitchen: T("مطبخ مجهّز"),
    breakfast: T("فطور"), wifi: T("إنترنت"), parking: T("موقف سيارات"), family: T("مناسب للعائلات"), couples: T("مناسب للأزواج")
  };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  // the description in this language (written in the panel), or English; never Arabic on a translated page
  var note = function (c) { if (isAr) return c.note || ""; var i = c.i18n || {}; return (i[document.documentElement.lang] && i[document.documentElement.lang].note) || (i.en && i.en.note) || ""; };
  var num = function (n) { return Number(n).toLocaleString({ ru: "ru-RU", tr: "tr-TR", pt: "pt-BR" }[document.documentElement.lang] || "en-US"); };

  function card(c, cur) {
    var area = AREAS[c.area] || [c.area || "", ""], photos = (c.photos || []).filter(Boolean);
    var price = typeof c.price === "number" && c.price > 0;
    var msg = T("مرحباً أويا، أرغب بحجز «{0}» ({1}). التواريخ وعدد الأشخاص:", [c.name, area[0]]);
    var feats = (c.features || []).filter(function (f) { return FEAT[f]; }).slice(0, 6);
    return '<article class="cab" data-reveal>' +
      '<div class="cab__media"' + (photos.length > 1 ? ' tabindex="0" role="group" aria-roledescription="carousel" aria-label="' + esc(T("صورة أخرى")) + '"' : "") + '>' + (photos.length ? photos.map(function (p, i) {
        return '<img ' + (i ? 'data-src="' : 'src="') + esc(root + p) + '" alt="' + esc(c.name + " — " + area[0]) + '" loading="lazy" decoding="async">';
      }).join("") : '<span class="cab__noimg" aria-hidden="true"></span>') +
      (photos.length > 1 ? '<button type="button" dir="ltr" class="cab__nav cab__l" aria-label="' + esc(T("صورة أخرى")) + '">‹</button><button type="button" dir="ltr" class="cab__nav cab__r" aria-label="' + esc(T("صورة أخرى")) + '">›</button><span class="cab__n">1 / ' + photos.length + "</span>" : "") +
      '<span class="cab__area">' + esc(area[0]) + "</span></div>" +
      '<div class="cab__body"><h3 translate="no">' + esc(c.name) + "</h3>" +
      '<p class="cab__specs"><span>' + T("غرف النوم: {0}", [Math.max(1, Math.min(50, parseInt(c.rooms, 10) || 1))]) + "</span><span>" + T("الأشخاص: حتى {0}", [Math.max(1, Math.min(99, parseInt(c.guests, 10) || 2))]) + "</span></p>" +
      (feats.length ? '<ul class="cab__feats">' + feats.map(function (f) { return "<li>" + esc(FEAT[f]) + "</li>"; }).join("") + "</ul>" : "") +
      (note(c) ? '<p class="cab__note">' + esc(note(c)) + "</p>" : "") +
      '<div class="cab__foot"><div class="price"><small>' + (price ? T("لليلة الواحدة") : T("السعر")) + "</small><b" + (price ? "" : ' class="price__ask"') + ">" +
      (price ? num(c.price) + '<span class="cur">' + esc(cur) + "</span>" : esc(T("حسب الموسم — اطلب عرضك"))) + "</b></div>" +
      '<a class="btn btn--wa btn--sm" href="https://wa.me/' + WA + "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + esc(T("احجز")) + "</a></div>" +
      "</div></article>";
  }

  var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
  fetch(root + "data/cabins.json?v=" + Math.floor(Date.now() / 60000), { cache: "no-cache", signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    .then(function (db) {
      var list0 = db && Array.isArray(db.cabins) ? db.cabins : [];
      var all = list0.filter(function (c) { return c && typeof c === "object" && c.active !== false && c.name; }).map(function (c) { if (!Array.isArray(c.photos)) c.photos = []; if (!Array.isArray(c.features)) c.features = []; return c; });
      var cur = (db && db.currency) || "$";
      blocks.forEach(function (b) { setup(b, all, cur); });
    });

  function setup(b, all, cur) {
    var fixed = b.getAttribute("data-group") || "", limit = +b.getAttribute("data-limit") || 0;
    var grid = b.querySelector(".cab-grid"), empty = b.querySelector(".cab-empty"), count = b.querySelector(".cab-count");
    var gBtns = [].slice.call(b.querySelectorAll("[data-cab-group] button")), gSel = b.querySelector("[data-cab-guests]"), sSel = b.querySelector("[data-cab-sort]");
    var group = fixed;
    function draw() {
      var min = gSel ? +gSel.value : 0, sort = sSel ? sSel.value : "";
      var list = all.filter(function (c) { return (!group || (AREAS[c.area] || [])[1] === group) && (!min || (c.guests || 0) >= min); });
      if (sort) list = list.slice().sort(function (a, z) { var pa = a.price || Infinity, pz = z.price || Infinity; return sort === "price" ? pa - pz : (z.price || 0) - (a.price || 0); });
      if (limit) list = list.slice(0, limit);
      grid.innerHTML = list.map(function (c) { return card(c, cur); }).join("");
      if (empty) empty.hidden = list.length > 0;
      if (count) count.textContent = list.length ? T("عدد الأكواخ: {0}", [list.length]) : "";
      var sec = b.closest("[data-cab-sec]"); if (sec) sec.hidden = !list.length;
      [].slice.call(grid.querySelectorAll(".cab")).forEach(window.__oyaGallery || gallery);
      if (window.__oyaReveal) window.__oyaReveal(grid);
      else [].slice.call(grid.querySelectorAll("[data-reveal]")).forEach(function (x) { x.classList.add("is-in"); });
    }
    gBtns.forEach(function (x) { x.addEventListener("click", function () { group = x.getAttribute("data-v"); gBtns.forEach(function (y) { y.setAttribute("aria-pressed", y === x ? "true" : "false"); }); draw(); }); });
    gSel && gSel.addEventListener("change", draw); sSel && sSel.addEventListener("change", draw);
    draw();
  }
  function gallery(card) {
    var imgs = [].slice.call(card.querySelectorAll(".cab__media img")); if (imgs.length < 2) return;
    var i = 0, n = card.querySelector(".cab__n");
    function go(d) { imgs[i].hidden = true; i = (i + d + imgs.length) % imgs.length; imgs[i].hidden = false; n.textContent = (i + 1) + " / " + imgs.length; }
    var rtl = getComputedStyle(card).direction === "rtl"; // the left arrow moves forward in Arabic, back in other languages
    card.querySelector(".cab__l").addEventListener("click", function () { go(rtl ? 1 : -1); });
    card.querySelector(".cab__r").addEventListener("click", function () { go(rtl ? -1 : 1); });
  }
})();
