/* Cabins & bungalows. The build writes the cards into the page (readable without scripts and by search engines).
   This script runs the photo galleries, the filters and the photo viewer, then reads data/cabins.json for what
   the owner changed in /admin/ since the last build: a new cabin, a removed one, a new price.
   Labels are T("…") strings that the build translates per page. */
(function () {
  "use strict";
  var d = document, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var TT = (function () { try { return JSON.parse((d.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s, a) { s = TT[s] || s; return a ? s.replace(/\{(\d)\}/g, function (m, i) { return a[i]; }) : s; };
  var lang = d.documentElement.lang, isAr = lang === "ar";
  var meta = d.querySelector('meta[name="oya-prices"]');
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
  var note = function (c) { if (isAr) return c.note || ""; var i = c.i18n || {}; return (i[lang] && i[lang].note) || (i.en && i.en.note) || ""; };
  var num = function (n) { return Number(n).toLocaleString({ ru: "ru-RU", tr: "tr-TR", pt: "pt-BR" }[lang] || "en-US"); };
  var priceOf = function (c) { return typeof c.price === "number" && c.price > 0 ? c.price : 0; };
  var guestsOf = function (c) { return Math.max(1, Math.min(99, parseInt(c.guests, 10) || 2)); };
  var G = function (el) { (window.__oyaGallery || gallery)(el); };

  function priceBox(c, cur) {
    var p = priceOf(c);
    return '<div class="price"><small>' + (p ? T("لليلة الواحدة") : T("السعر")) + "</small><b" + (p ? "" : ' class="price__ask"') + ">" +
      (p ? num(p) + '<span class="cur">' + esc(cur) + "</span>" : esc(T("حسب الموسم — اطلب عرضك"))) + "</b></div>";
  }
  // a cabin added in the panel after the last build (its own page appears with the next build)
  function card(c, cur) {
    var area = AREAS[c.area], photos = (c.photos || []).filter(Boolean);
    var msg = T("مرحباً أويا، أرغب بحجز «{0}» ({1}). التواريخ وعدد الأشخاص:", [c.name, area[0]]);
    var feats = (c.features || []).filter(function (f) { return FEAT[f]; }).slice(0, 6);
    return '<article class="cab" data-reveal data-id="' + esc(c.id) + '" data-group="' + area[1] + '" data-guests="' + guestsOf(c) + '" data-price="' + priceOf(c) + '">' +
      '<div class="cab__media"' + (photos.length > 1 ? ' tabindex="0" role="group" aria-roledescription="carousel" aria-label="' + esc(T("صورة أخرى")) + '"' : "") + '>' + (photos.length ? photos.map(function (p, i) {
        return '<img ' + (i ? 'data-src="' : 'class="is-on" src="') + esc(root + p) + '" alt="' + esc(c.name + " — " + area[0]) + '" loading="lazy" decoding="async">';
      }).join("") : '<span class="cab__noimg" aria-hidden="true"></span>') +
      (photos.length > 1 ? '<button type="button" dir="ltr" class="cab__nav cab__l" aria-label="' + esc(T("صورة أخرى")) + '">‹</button><button type="button" dir="ltr" class="cab__nav cab__r" aria-label="' + esc(T("صورة أخرى")) + '">›</button><span class="cab__n">1 / ' + photos.length + "</span>" : "") +
      '<span class="cab__area">' + esc(area[0]) + "</span></div>" +
      '<div class="cab__body"><h3 translate="no">' + esc(c.name) + "</h3>" +
      '<p class="cab__specs"><span>' + T("غرف النوم: {0}", [Math.max(1, Math.min(50, parseInt(c.rooms, 10) || 1))]) + "</span><span>" + T("الأشخاص: حتى {0}", [guestsOf(c)]) + "</span></p>" +
      (feats.length ? '<ul class="cab__feats">' + feats.map(function (f) { return "<li>" + esc(FEAT[f]) + "</li>"; }).join("") + "</ul>" : "") +
      (note(c) ? '<p class="cab__note">' + esc(note(c)) + "</p>" : "") +
      '<div class="cab__foot">' + priceBox(c, cur) +
      '<a class="btn btn--wa btn--sm" href="https://wa.me/' + WA + "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + esc(T("احجز")) + "</a></div>" +
      "</div></article>";
  }

  $$(".cab").forEach(G);
  viewer();
  var blocks = $$("[data-cabins]");
  if (!blocks.length) return;
  blocks.forEach(setup);

  var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
  fetch(root + "data/cabins.json?v=" + Math.floor(Date.now() / 60000), { cache: "no-cache", signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    .then(function (db) {
      if (!db || !Array.isArray(db.cabins)) return; // no fresh data: the cards from the build stay as they are
      var all = db.cabins.filter(function (c) { return c && typeof c === "object" && c.active !== false && c.name && c.id && AREAS[c.area]; })
        .map(function (c) { if (!Array.isArray(c.photos)) c.photos = []; if (!Array.isArray(c.features)) c.features = []; return c; });
      var cur = String(db.currency || "$").replace(/[<>&"']/g, "").slice(0, 4) || "$";
      blocks.forEach(function (b) { sync(b, all, cur); });
    });

  function setup(b) {
    var fixed = b.getAttribute("data-group") || "", limit = +b.getAttribute("data-limit") || 0;
    var grid = b.querySelector(".cab-grid"), empty = b.querySelector(".cab-empty"), count = b.querySelector(".cab-count");
    var gBtns = $$("[data-cab-group] button", b), gSel = b.querySelector("[data-cab-guests]"), sSel = b.querySelector("[data-cab-sort]");
    var group = fixed, P = function (el) { return +el.getAttribute("data-price") || 0; };
    $$(".cab", grid).forEach(function (el, i) { el.setAttribute("data-i", i); });
    function draw() {
      var min = gSel ? +gSel.value : 0, sort = sSel ? sSel.value : "", cards = $$(".cab", grid);
      var list = cards.filter(function (el) { return (!group || el.getAttribute("data-group") === group) && (!min || +el.getAttribute("data-guests") >= min); });
      list.sort(function (a, z) {
        if (sort === "price") return (P(a) || 1e12) - (P(z) || 1e12);
        if (sort === "-price") return P(z) - P(a);
        return a.getAttribute("data-i") - z.getAttribute("data-i");
      });
      if (limit) list = list.slice(0, limit);
      cards.forEach(function (el) { el.hidden = list.indexOf(el) < 0; });
      list.forEach(function (el) { grid.appendChild(el); });
      if (empty) empty.hidden = list.length > 0;
      if (count) count.textContent = list.length ? T("عدد الأكواخ: {0}", [list.length]) : "";
      var sec = b.closest("[data-cab-sec]"); if (sec) sec.hidden = !list.length;
    }
    b.__draw = draw;
    gBtns.forEach(function (x) { x.addEventListener("click", function () { group = x.getAttribute("data-v"); gBtns.forEach(function (y) { y.setAttribute("aria-pressed", y === x ? "true" : "false"); }); draw(); }); });
    gSel && gSel.addEventListener("change", draw); sSel && sSel.addEventListener("change", draw);
    draw();
  }

  // bring the cards in line with the panel's latest data
  function sync(b, all, cur) {
    var fixed = b.getAttribute("data-group") || "", grid = b.querySelector(".cab-grid");
    var have = {}, seen = {}, tmp = d.createElement("div"), fresh = false;
    $$(".cab", grid).forEach(function (el) { have[el.getAttribute("data-id")] = el; });
    all.forEach(function (c, i) {
      if (fixed && AREAS[c.area][1] !== fixed) return;
      var el = have[c.id];
      if (!el) { tmp.innerHTML = card(c, cur); el = tmp.firstChild; grid.appendChild(el); G(el); fresh = true; }
      else if (+el.getAttribute("data-price") !== priceOf(c)) {
        el.setAttribute("data-price", priceOf(c));
        var box = el.querySelector(".price"); if (box) box.outerHTML = priceBox(c, cur);
      }
      el.setAttribute("data-guests", guestsOf(c)); el.setAttribute("data-i", i); seen[c.id] = 1;
    });
    Object.keys(have).forEach(function (id) { if (!seen[id] && have[id].parentNode) have[id].parentNode.removeChild(have[id]); });
    b.__draw();
    if (!fresh) return;
    if (window.__oyaReveal) window.__oyaReveal(grid);
    else $$("[data-reveal]", grid).forEach(function (x) { x.classList.add("is-in"); });
  }

  // cabin page: a photo opens large, with arrows, keys and swipe
  function viewer() {
    var links = $$(".cabp__photos a"); if (!links.length || !window.HTMLDialogElement) return;
    var k = 0, many = links.length > 1, dlg = d.createElement("dialog"), rtl = d.documentElement.dir === "rtl";
    dlg.className = "lbox";
    dlg.innerHTML = '<img alt="">' + '<button type="button" class="lbox__btn lbox__x" aria-label="' + esc(T("إغلاق")) + '">×</button>' +
      (many ? '<button type="button" dir="ltr" class="lbox__btn lbox__l" aria-label="' + esc(T("صورة أخرى")) + '">‹</button><button type="button" dir="ltr" class="lbox__btn lbox__r" aria-label="' + esc(T("صورة أخرى")) + '">›</button><span class="lbox__n"></span>' : "");
    d.body.appendChild(dlg);
    var img = dlg.querySelector("img"), n = dlg.querySelector(".lbox__n");
    function show(i) {
      k = (i + links.length) % links.length; var a = links[k], th = a.querySelector("img");
      img.src = a.href; img.alt = th ? th.alt : ""; if (n) n.textContent = (k + 1) + " / " + links.length;
    }
    var step = function (fwd) { if (many) show(k + (fwd ? 1 : -1)); };
    links.forEach(function (a, i) { a.addEventListener("click", function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); show(i); dlg.showModal(); }); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest(".lbox__x")) dlg.close();
      else if (e.target.closest(".lbox__l")) step(rtl);      // the left arrow moves forward in Arabic
      else if (e.target.closest(".lbox__r")) step(!rtl);
    });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") step(rtl); if (e.key === "ArrowRight") step(!rtl); });
    var x0 = null, y0 = 0;
    dlg.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" || e.target.closest("button")) return; x0 = e.clientX; y0 = e.clientY; });
    dlg.addEventListener("pointerup", function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) step((dx < 0) !== rtl); });
    dlg.addEventListener("pointercancel", function () { x0 = null; });
  }

  // plain fallback when the shared gallery script is missing
  function gallery(card) {
    var imgs = $$(".cab__media img", card); if (imgs.length < 2) return;
    var i = 0, n = card.querySelector(".cab__n");
    function go(s) { imgs[i].classList.remove("is-on"); i = (i + s + imgs.length) % imgs.length; if (imgs[i].dataset.src) { imgs[i].src = imgs[i].dataset.src; imgs[i].removeAttribute("data-src"); } imgs[i].classList.add("is-on"); if (n) n.textContent = (i + 1) + " / " + imgs.length; }
    var rtl = getComputedStyle(card).direction === "rtl";
    card.querySelector(".cab__l").addEventListener("click", function () { go(rtl ? 1 : -1); });
    card.querySelector(".cab__r").addEventListener("click", function () { go(rtl ? -1 : 1); });
  }
})();
