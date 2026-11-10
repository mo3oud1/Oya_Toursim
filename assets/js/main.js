/* OYA Tourism — interactions & motion (no dependencies) */
(function () {
  "use strict";
  var d = document, w = window;
  w.__oyaReady = true;
  var root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = root.getAttribute("data-wa") || "905399334331";
  var EMAIL = root.getAttribute("data-email") || "info@oyatourism.com";
  // UI strings: T(arabic, [args]) gives this page's language (table #oya-t, translated at build time)
  var TT = (function () { try { return JSON.parse((d.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s, a) { var r = TT[s] || s; return a ? r.replace(/\{(\d+)\}/g, function (m, i) { return a[i]; }) : r; };
  var SEP = root.getAttribute("dir") === "rtl" ? "، " : ", ";
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  var header = $(".site-header");
  var progress = $(".progress");
  var toTop = $(".to-top");
  var lastY = w.scrollY, ticking = false;
  function onScroll() {
    var y = w.scrollY;
    if (header) {
      header.classList.toggle("is-solid", y > 24);
      var goingDown = y > lastY && y > 420;
      var menuOpen = $(".has-mega.is-open");
      header.classList.toggle("is-hidden", goingDown && !menuOpen);
    }
    if (progress) {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    }
    if (toTop) toTop.classList.toggle("is-on", y > 900);
    parallax(y);
    lastY = y; ticking = false;
  }
  w.addEventListener("scroll", function () { if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- Hero parallax ---------- */
  var far = $(".skyline-far"), near = $(".skyline-near"), moon = $(".hero__moon"), heroCopy = $(".hero__copy");
  function parallax(y) {
    if (reduce || y > 1200 || w.gsap) return;
    if (far) far.style.transform = "translate3d(0," + (y * 0.12) + "px,0)";
    if (near) near.style.transform = "translate3d(0," + (y * 0.05) + "px,0)";
    if (moon) moon.style.translate = "0 " + (y * 0.3) + "px";
    if (heroCopy) { heroCopy.style.transform = "translate3d(0," + (y * 0.18) + "px,0)"; heroCopy.style.opacity = String(Math.max(0, 1 - y / 700)); }
  }
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { w.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Mega menus ---------- */
  $$(".has-mega").forEach(function (li) {
    var btn = $(".nav-trigger", li), t;
    function open() { clearTimeout(t); $$(".has-mega.is-open").forEach(function (o) { if (o !== li) { o.classList.remove("is-open"); $(".nav-trigger", o).setAttribute("aria-expanded", "false"); } }); li.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
    function close() { t = setTimeout(function () { li.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }, 160); }
    li.addEventListener("mouseenter", function () { clearTimeout(t); t = setTimeout(open, 90); }); // hover intent
    li.addEventListener("mouseleave", close);
    btn.addEventListener("click", function (e) { e.preventDefault(); li.classList.contains("is-open") ? (li.classList.remove("is-open"), btn.setAttribute("aria-expanded", "false")) : open(); });
    // keyboard: close when focus leaves the menu (WCAG 1.4.13)
    li.addEventListener("focusout", function (e) { if (!li.contains(e.relatedTarget)) { li.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); } });
  });
  function closeMegas(returnFocus) {
    $$(".has-mega.is-open").forEach(function (o) {
      var b = $(".nav-trigger", o); o.classList.remove("is-open"); b.setAttribute("aria-expanded", "false");
      if (returnFocus && o.contains(d.activeElement)) b.focus();
    });
  }
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMegas(true); closeDrawer(); } });
  d.addEventListener("click", function (e) { if (!e.target.closest(".has-mega")) closeMegas(false); });

  /* ---------- Mobile drawer (focus contained with `inert` on the page behind) ---------- */
  var drawer = $(".drawer"), menuBtn = $(".menu-btn");
  var behind = function () { return $$("body > header, body > main, body > footer, body > .mbar, body > .fab-wa, body > .to-top, body > .skip"); };
  // language menu
  $$("[data-lang]").forEach(function (box) {
    var b = $(".lang__btn", box);
    function set(on) { box.classList.toggle("is-open", on); b.setAttribute("aria-expanded", on ? "true" : "false"); }
    b.addEventListener("click", function (e) { e.stopPropagation(); set(!box.classList.contains("is-open")); });
    d.addEventListener("click", function (e) { if (!box.contains(e.target)) set(false); });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") { set(false); b.focus(); } });
    box.addEventListener("focusout", function (e) { if (e.relatedTarget && !box.contains(e.relatedTarget)) set(false); });
  });
  function openDrawer() { if (!drawer) return; drawer.classList.add("is-open"); d.body.classList.add("no-scroll"); behind().forEach(function (el) { el.inert = true; }); menuBtn && menuBtn.setAttribute("aria-expanded", "true"); var c = $(".drawer__close", drawer); c && c.focus(); }
  function closeDrawer() { if (!drawer || !drawer.classList.contains("is-open")) return; drawer.classList.remove("is-open"); d.body.classList.remove("no-scroll"); behind().forEach(function (el) { el.inert = false; }); menuBtn && (menuBtn.setAttribute("aria-expanded", "false"), menuBtn.focus()); }
  menuBtn && menuBtn.addEventListener("click", openDrawer);
  $$("[data-close-drawer]").forEach(function (b) { b.addEventListener("click", closeDrawer); });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in w && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    // stagger children
    $$("[data-stagger]").forEach(function (g) { $$("[data-reveal]", g).forEach(function (el, i) { el.style.setProperty("--rd", (i % 8) * 0.08 + "s"); }); });
  } else { revealEls.forEach(function (el) { el.classList.add("is-in"); }); }

  /* ---------- Counters ---------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in w) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), start = performance.now(), dur = reduce ? 1 : 1600;
        (function step(now) {
          var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(end * e).toLocaleString("en-US");
          if (p < 1) w.requestAnimationFrame(step);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Tabs (booking widget) ---------- */
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$("[role=tab]", wrap);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var p = d.getElementById(t.getAttribute("aria-controls"));
        if (p) { p.hidden = !on; if (on) { p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); } }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowLeft") n = tabs[(i + 1) % tabs.length];
        if (k === "ArrowRight") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    var hash = w.location.hash.replace("#", "");
    var pre = hash && $("[role=tab][data-key='" + hash + "']", wrap);
    if (pre) {
      select(pre);
      // the widget sits below the hero: bring it (and the chosen tab) into view
      w.addEventListener("load", function () { wrap.scrollIntoView({ block: "start" }); if (pre.scrollIntoView) pre.scrollIntoView({ block: "nearest", inline: "center" }); });
    }
  });

  /* ---------- Dates: no past dates; return >= depart ---------- */
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var iso = today.toISOString().slice(0, 10);
  $$("input[type=date]").forEach(function (inp) { if (!inp.min) inp.min = iso; });
  $$("[data-date-pair]").forEach(function (form) {
    var a = $("[data-date-start]", form), b = $("[data-date-end]", form);
    if (a && b) a.addEventListener("change", function () { b.min = a.value || iso; if (b.value && b.value < a.value) b.value = a.value; });
  });
  $$("[data-oneway]").forEach(function (r) {
    r.addEventListener("change", function () {
      var form = r.closest("form"), ret = form && $("[data-return]", form);
      if (ret) { var one = r.value === T("ذهاب فقط"); ret.closest(".field").style.display = one ? "none" : ""; if (one) ret.value = ""; }
    });
  });

  /* ---------- WhatsApp / e-mail inquiry forms ---------- */
  function collect(form) {
    var lines = [], seen = {};
    $$("input, select, textarea", form).forEach(function (el) {
      if (!el.name || el.type === "submit" || el.type === "hidden") return;
      if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
      var v = (el.value || "").trim();
      if (!v) return;
      var label = el.getAttribute("data-label") || el.name;
      if (el.type === "checkbox") { seen[label] = (seen[label] ? seen[label] + SEP : "") + v; return; }
      lines.push("• " + label + ": " + v);
    });
    Object.keys(seen).forEach(function (k) { lines.push("• " + k + ": " + seen[k]); });
    return lines;
  }
  function message(form) {
    var intro = form.getAttribute("data-intro") || T("مرحباً أويا للسياحة، أرغب بالاستفسار:");
    var lines = collect(form);
    var page = d.title.split("|")[0].trim();
    return intro + "\n" + lines.join("\n") + "\n\n" + T("(من صفحة: {0})", [page]);
  }
  /* Inline validation in Arabic (Baymard: specific, adjacent error messages; never clear user input) */
  function validate(form) {
    var first = null;
    $$("[required]", form).forEach(function (el) {
      var f = el.closest(".field"), bad = !el.value || !el.value.trim();
      if (f) f.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad && !first) first = el;
    });
    var a = $("[data-date-start]", form), b = $("[data-date-end]", form);
    if (a && b && a.value && b.value && b.value < a.value) {
      var fb = b.closest(".field");
      if (fb) { fb.classList.add("is-invalid"); var er = $(".err", fb); if (!er) { er = d.createElement("span"); er.className = "err"; fb.appendChild(er); } er.textContent = T("يجب أن يكون هذا التاريخ بعد تاريخ البداية"); }
      b.setAttribute("aria-invalid", "true");
      if (!first) first = b;
    }
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }
    return !first;
  }
  function draftKey(form, i) { return "oya-draft:" + location.pathname + ":" + i; }
  function store(fn) { try { return fn(w.localStorage); } catch (e) { return null; } }

  $$("form[data-wa]").forEach(function (form, fi) {
    var key = draftKey(form, fi);
    // restore draft (per-visitor convenience)
    var saved = store(function (ls) { return JSON.parse(ls.getItem(key) || "null"); });
    if (saved) $$("input, select, textarea", form).forEach(function (el) {
      if (!el.name || !(el.name in saved)) return;
      if (el.type === "radio" || el.type === "checkbox") el.checked = saved[el.name] === el.value; else if (!el.value || el.tagName === "SELECT") el.value = saved[el.name];
    });
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f && f.classList.contains("is-invalid") && e.target.value.trim()) { f.classList.remove("is-invalid"); e.target.setAttribute("aria-invalid", "false"); }
      var data = {};
      $$("input, select, textarea", form).forEach(function (el) { if (el.name && ((el.type !== "radio" && el.type !== "checkbox") || el.checked)) data[el.name] = el.value; });
      store(function (ls) { ls.setItem(key, JSON.stringify(data)); });
    });
    form.addEventListener("change", function (e) { form.dispatchEvent(new Event("input", { bubbles: true })); });

    var done = $(".form-done", form), lastMsg = "";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      lastMsg = message(form);
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lastMsg);
      // NB: passing "noopener" makes window.open return null, so open plainly and detach the opener ourselves
      var win = w.open(url, "_blank");
      if (win) { try { win.opener = null; } catch (err) {} } else { w.location.href = url; }
      if (done) done.classList.add("is-on");
      store(function (ls) { ls.removeItem(key); }); // the request was sent: do not keep personal details in the browser
      if (w.gtag) w.gtag("event", "generate_lead", { method: "whatsapp", form: form.getAttribute("data-intro") });
    });
    var copy = $("[data-copy]", form);
    copy && copy.addEventListener("click", function () {
      var t = lastMsg || message(form);
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { copy.textContent = T("تم النسخ ✓"); });
    });
    var mail = $("[data-mail]", form);
    mail && mail.addEventListener("click", function () {
      if (!validate(form)) return;
      var subj = form.getAttribute("data-intro") || T("استفسار من الموقع");
      w.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subj.replace(/[:،]+\s*$/, "")) + "&body=" + encodeURIComponent(message(form));
    });
  });

  /* Prefill selects from links: data-prefill="select-id" data-prefill-value="option value"
     (the value is its own attribute, so it is translated exactly like the option it selects) */
  $$("[data-prefill]").forEach(function (a) {
    a.addEventListener("click", function () {
      var parts = a.getAttribute("data-prefill").split("|"), sel = d.getElementById(parts[0]);
      if (sel) { sel.value = a.getAttribute("data-prefill-value") || parts[1]; sel.dispatchEvent(new Event("change")); }
    });
  });

  /* ---------- Filters ---------- */
  $$("[data-filter-group]").forEach(function (group) {
    var target = d.getElementById(group.getAttribute("data-filter-group"));
    if (!target) return;
    var items = $$("[data-tags]", target);
    var id = group.getAttribute("data-filter-group");
    var countEl = d.querySelector("[data-count-for='" + id + "']"), empty = d.querySelector("[data-empty-for='" + id + "']");
    function count(n) { if (countEl) countEl.textContent = T("عرض {0} من {1} برنامجاً", [n.toLocaleString("en-US"), items.length.toLocaleString("en-US")]); if (empty) empty.classList.toggle("is-on", n === 0); }
    count(items.length);
    $$(".filter", group).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filter", group).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var f = b.getAttribute("data-filter"), n = 0;
        items.forEach(function (it, i) {
          var show = f === "all" || (" " + it.getAttribute("data-tags") + " ").indexOf(" " + f + " ") > -1;
          it.classList.toggle("is-filtered-out", !show);
          if (show) { n++; it.classList.add("is-in"); }
          if (show && !reduce && !w.Flip) { it.style.animation = "none"; void it.offsetWidth; it.style.animation = "fadeup .55s var(--ease) both"; it.style.animationDelay = (i % 6) * 0.05 + "s"; }
        });
        count(n);
        if (w.ScrollTrigger) w.ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- Rails ---------- */
  $$("[data-rail]").forEach(function (wrap) {
    var rail = $(".rail", wrap); if (!rail) return;
    var step = function () { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 18 : 300; };
    var prev = $("[data-rail-prev]", wrap), next = $("[data-rail-next]", wrap);
    // RTL: scrollLeft is negative going "forward" (to the left)
    next && next.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    prev && prev.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
  });

  /* ---------- Countdown ---------- */
  $$("[data-countdown]").forEach(function (el) {
    var target = new Date(el.getAttribute("data-countdown")).getTime();
    var parts = { d: $("[data-d]", el), h: $("[data-h]", el), m: $("[data-m]", el), s: $("[data-s]", el) };
    function fmt(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var dd = Math.floor(diff / 864e5), hh = Math.floor(diff / 36e5) % 24, mm = Math.floor(diff / 6e4) % 60, ss = Math.floor(diff / 1e3) % 60;
      parts.d && (parts.d.textContent = dd); parts.h && (parts.h.textContent = fmt(hh)); parts.m && (parts.m.textContent = fmt(mm)); parts.s && (parts.s.textContent = fmt(ss));
      if (diff > 0) setTimeout(tick, 1000);
    }
    tick();
  });

  /* ---------- Card tilt (pointer devices) ---------- */
  if (!reduce && w.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 6) + "deg) translateY(-6px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    /* Magnetic primary buttons (GSAP version in motion.js) */
    if (!w.gsap) $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Home hero: cinematic destination photos. Decorative crossfade; extra slides load after the page,
   auto-advance pauses off-screen / in background tabs / for reduced motion, and a pause button is always available. */
(function () {
  var h = document.querySelector("[data-hero-slides]");
  if (!h) return;
  var TT = (function () { try { return JSON.parse((document.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s) { return TT[s] || s; };
  var slides = [].slice.call(h.querySelectorAll(".hero__slide"));
  var dots = [].slice.call(h.querySelectorAll(".hero__dot"));
  var loc = h.querySelector(".hero__loc span"), btn = h.querySelector(".hero__pause");
  if (slides.length < 2) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i = 0, timer = 0, paused = reduce, visible = true, loaded = false, D = 7000;
  function loadAll() {
    if (loaded) return; loaded = true;
    slides.forEach(function (s) { var im = s.querySelector("img[data-src]"); if (im) { im.srcset = im.getAttribute("data-srcset"); im.src = im.getAttribute("data-src"); im.removeAttribute("data-src"); } });
  }
  function schedule() { clearTimeout(timer); if (!paused && visible) timer = setTimeout(function () { show(i + 1); }, D); }
  function show(n) {
    loadAll();
    n = (n + slides.length) % slides.length;
    var prev = i; i = n;
    var s = slides[n], im = s.querySelector("img"), done = false;
    var go = function () {
      if (done) return; done = true;
      slides[prev].classList.remove("is-on"); dots[prev].removeAttribute("aria-current");
      s.classList.add("is-on"); dots[n].setAttribute("aria-current", "true");
      var span = document.createElement("span"); span.textContent = s.getAttribute("data-loc"); loc.replaceWith(span); loc = span;
      schedule();
    };
    if (im && !im.complete) { im.addEventListener("load", go, { once: true }); setTimeout(go, 1500); } else go();
  }
  dots.forEach(function (d, n) { d.addEventListener("click", function () { if (n !== i) show(n); else schedule(); }); });
  function setPaused(p) {
    paused = p; h.classList.toggle("is-paused", p);
    btn.setAttribute("aria-pressed", p ? "true" : "false");
    btn.setAttribute("aria-label", p ? T("تشغيل عرض الصور") : T("إيقاف عرض الصور"));
    schedule();
  }
  btn.addEventListener("click", function () { setPaused(!paused); });
  var onScreen = true;
  function sync() { visible = onScreen && !document.hidden; schedule(); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(h);
  document.addEventListener("visibilitychange", sync);
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 1200); };
  window.addEventListener("load", function () { idle(loadAll); });
  setPaused(paused);
})();
