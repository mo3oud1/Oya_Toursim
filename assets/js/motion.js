/* OYA Tourism — decision-focused motion (light by design)
   Rule: motion only where it helps the visitor choose, compare or book.
   GSAP is loaded only on pages that need it (hero parallax, itinerary, filters). */
(function () {
  "use strict";
  var d = document, w = window;
  var reduce = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = w.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* 1) SELECT — spotlight affordance on clickable cards only (rAF-throttled) */
  if (fine && !reduce) {
    $$(".card, .dest, .vcard, .tier, .match, a.ctile").concat($$(".svc").filter(function (el) { return el.querySelector("a.cover"); })).forEach(function (el) {
      el.classList.add("spot");
      var raf = 0, x = 0, y = 0;
      el.addEventListener("pointermove", function (e) {
        x = e.clientX; y = e.clientY;
        if (raf) return;
        raf = w.requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          el.style.setProperty("--mx", (x - r.left) + "px");
          el.style.setProperty("--my", (y - r.top) + "px");
          raf = 0;
        });
      }, { passive: true });
    });
  }

  /* 2) BOOK — guide the eye to the form when a "book" anchor is used */
  d.addEventListener("click", function (e) {
    var a = e.target.closest('a[href$="#book"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname) return;
    var target = d.getElementById("book");
    if (!target) return;
    var card = target.querySelector(".form-card, .booker") || target;
    setTimeout(function () {
      card.classList.remove("is-focus"); void card.offsetWidth; card.classList.add("is-focus");
      var first = card.querySelector("input, select");
      if (first) first.focus({ preventScroll: true });
    }, reduce ? 0 : 450);
  });

  if (!w.gsap || reduce) return;
  var gsap = w.gsap;
  d.documentElement.classList.add("has-gsap");

  /* 3) Brand moment — light hero parallax (transform only, scrubbed) */
  var hero = d.querySelector(".hero");
  if (hero && w.ScrollTrigger) {
    gsap.registerPlugin(w.ScrollTrigger);
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 } })
      .to(".skyline-far", { yPercent: 14, ease: "none" }, 0)
      .to(".hero__copy", { y: 80, opacity: 0, ease: "none" }, 0);
  }

  /* 4) COMPARE — itinerary reading progress (day-by-day programs) */
  if (w.ScrollTrigger) {
    gsap.registerPlugin(w.ScrollTrigger);
    $$(".itinerary").forEach(function (list) {
      var line = d.createElement("span");
      line.className = "itinerary__progress";
      list.appendChild(line);
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 65%", end: "bottom 55%", scrub: 0.3 } });
    });
  }

  /* 5) COMPARE — filters reflow with GSAP Flip so visitors see what changed */
  if (w.Flip) {
    gsap.registerPlugin(w.Flip);
    $$("[data-filter-group]").forEach(function (group) {
      var grid = d.getElementById(group.getAttribute("data-filter-group"));
      if (!grid) return;
      group.addEventListener("click", function (e) {
        if (!e.target.closest(".filter")) return;
        var items = $$("[data-tags]", grid);
        var state = w.Flip.getState(items);
        // main.js toggles classes in its own click handler (runs first); animate on next frame
        w.requestAnimationFrame(function () {
          w.Flip.from(state, {
            duration: 0.45, ease: "power2.out", absolute: true, scale: false,
            onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }); },
            onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: 0.2 }); },
          });
        });
      }, true);
    });
  }
})();
