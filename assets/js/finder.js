/* OYA — Trip Finder: 4 quick questions → best-matching programs (vanilla, ~3KB) */
(function () {
  "use strict";
  var sec = document.querySelector("[data-finder]");
  if (!sec) return;
  var root = sec.getAttribute("data-root") || "./";
  var WA = document.documentElement.getAttribute("data-wa") || "905399334331";
  var data = JSON.parse(sec.querySelector(".finder-data").textContent);
  var TT = (function () { try { return JSON.parse((document.getElementById("oya-t") || {}).textContent || "{}"); } catch (e) { return {}; } })();
  var T = function (s, a) { var r = TT[s] || s; return a ? r.replace(/\{(\d+)\}/g, function (m, i) { return a[i]; }) : r; };
  var SEP = document.documentElement.getAttribute("dir") === "rtl" ? "، " : ", ";
  var steps = [].slice.call(sec.querySelectorAll(".finder__step"));
  var result = sec.querySelector(".finder__result");
  var bar = sec.querySelector(".finder__progress span");
  var labels = {}, answers = {}, cur = 0;
  var RANGE = { short: [3, 5], mid: [6, 8], long: [9, 12], xl: [13, 30] };

  function show(i) {
    steps.forEach(function (s, j) { s.hidden = j !== i; if (j === i) { s.classList.remove("is-in"); void s.offsetWidth; s.classList.add("is-in"); } });
    result.hidden = i < steps.length;
    if (i >= steps.length) { result.classList.remove("is-in"); void result.offsetWidth; result.classList.add("is-in"); }
    bar.style.transform = "scaleX(" + Math.min(1, i / steps.length) + ")";
    cur = i;
    var focusEl = i < steps.length ? steps[i].querySelector(".finder__opt") : result.querySelector("a, button");
    if (focusEl && sec.contains(document.activeElement)) focusEl.focus({ preventScroll: true });
  }
  function score(p) {
    var s = 0, tags = " " + p.tags.join(" ") + " ";
    if (answers.who && answers.who !== "any") s += tags.indexOf(" " + answers.who + " ") > -1 ? 4 : 0;
    if (answers.who === "honeymoon" && tags.indexOf(" family ") > -1 && tags.indexOf(" honeymoon ") === -1) s -= 1;
    if (answers.vibe) s += tags.indexOf(" " + answers.vibe + " ") > -1 ? 4 : 0;
    var r = RANGE[answers.days];
    if (r) s += p.d >= r[0] && p.d <= r[1] ? 3 : Math.abs(p.d - (p.d < r[0] ? r[0] : r[1])) <= 2 ? 1 : -1;
    if (answers.where && answers.where !== "any") s += p.r === answers.where ? 3 : -4;
    if (p.f) s += 0.5;
    return s;
  }
  function render() {
    var list = data.map(function (p) { return { p: p, s: score(p) }; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
    sec.querySelector(".finder__cards").innerHTML = list.map(function (x, i) {
      var p = x.p;
      return '<a class="finder__card" href="' + root + "packages/" + p.s + '/">' +
        (i === 0 ? '<span class="badge" style="position:static;align-self:flex-start">' + T("الأنسب لك") + "</span>" : "") +
        "<b>" + p.t + "</b><small>" + (p.dl || T("{0} أيام", [p.d])) + " • " + p.c + "</small><span>" + p.sum + "</span></a>";
    }).join("");
    var msg = T("مرحباً أويا، استخدمت مكتشف الرحلات وهذه اختياراتي:") + "\n" +
      Object.keys(labels).map(function (k) { return "• " + labels[k]; }).join("\n") +
      "\n" + T("البرامج المقترحة: {0}", ["\n• " + list.map(function (x) { return x.p.t; }).join("\n• ")]);
    sec.querySelector(".finder__wa").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  }
  sec.addEventListener("click", function (e) {
    var opt = e.target.closest(".finder__opt");
    if (opt) {
      answers[opt.dataset.k] = opt.dataset.v;
      labels[opt.dataset.k] = opt.textContent.trim();
      [].forEach.call(opt.parentNode.children, function (b) { b.setAttribute("aria-pressed", b === opt ? "true" : "false"); });
      if (cur + 1 >= steps.length) render();
      show(cur + 1);
      return;
    }
    if (e.target.closest(".finder__back")) show(Math.max(0, cur - 1));
    if (e.target.closest(".finder__restart")) { answers = {}; labels = {}; [].forEach.call(sec.querySelectorAll(".finder__opt"), function (b) { b.removeAttribute("aria-pressed"); }); show(0); }
  });
})();
