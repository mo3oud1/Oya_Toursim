/* OYA — interactive destination globe (COBE, MIT). Lazy: loads only when the section approaches the viewport.
   Renders only while visible; no auto-spin for reduced-motion users. */
const section = document.querySelector("[data-globe]");
if (section) {
  const root = section.getAttribute("data-root") || "./";
  const places = JSON.parse(section.querySelector(".globe-data").textContent);
  const byId = Object.fromEntries(places.map((p) => [p.id, p]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const card = section.querySelector(".globe-card");
  const chips = [...section.querySelectorAll(".globe-chip")];
  const tabs = [...section.querySelectorAll(".globe-tab")];
  const WA = document.documentElement.getAttribute("data-wa") || "905399334331";
  let focus = null; // [phi, theta]
  const toAngles = (lat, lng) => [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];

  function select(id, fromUser) {
    const p = byId[id]; if (!p) return;
    chips.forEach((c) => c.setAttribute("aria-selected", c.dataset.id === id ? "true" : "false"));
    card.querySelector(".globe-card__en").textContent = p.en;
    card.querySelector(".globe-card__name").textContent = p.name;
    card.querySelector(".globe-card__text").innerHTML = p.text;
    const go = card.querySelector(".globe-card__go");
    go.href = root + p.url; go.querySelector("span").textContent = p.cta;
    card.querySelector(".globe-card__wa").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("مرحباً أويا، أرغب برحلة إلى " + p.name + ".");
    if (fromUser && !reduce) { card.classList.remove("is-swap"); void card.offsetWidth; card.classList.add("is-swap"); }
    focus = toAngles(p.loc[0], p.loc[1]);
    if (api) api.markers(id);
  }
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
    const g = t.dataset.group; let firstId = null;
    chips.forEach((c) => { const on = c.dataset.g === g; c.hidden = !on; if (on && !firstId) firstId = c.dataset.id; });
    if (firstId) select(firstId, true);
  }));
  chips.forEach((c) => c.addEventListener("click", () => select(c.dataset.id, true)));

  let api = null;
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); init(); } }, { rootMargin: "300px" });
  io.observe(section);

  async function init() {
    let createGlobe;
    try { ({ default: createGlobe } = await import("./vendor/cobe.esm.js")); } catch (e) { return; }
    const canvas = section.querySelector(".globe-canvas");
    const mobile = matchMedia("(max-width: 700px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    const size = Math.round(Math.min(560, canvas.clientWidth || 560)); // draw at the displayed size, not larger
    const IST = [41.0082, 28.9784];
    const base = (selected) => places.map((p) => ({ location: p.loc, size: p.id === selected ? 0.09 : p.id === "istanbul" ? 0.07 : 0.04, color: p.id === selected ? [1, 0.55, 0.25] : undefined }));
    let touched = false, phi = 4.4, theta = 0.35, dragX = null, dragPhi = 0, velocity = 0, visible = true, raf = 0, selected = places[0].id;
    let globe;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr, width: size, height: size, phi, theta, dark: 1, diffuse: 1.2, scale: 1,
        mapSamples: mobile ? 8000 : 12000, mapBrightness: 5.5, mapBaseBrightness: 0.02,
        baseColor: [0.22, 0.42, 0.66], markerColor: [0.93, 0.33, 0.02], glowColor: [0.17, 0.42, 0.67],
        markers: base(selected),
        arcs: places.filter((p) => p.g !== "tr").map((p) => ({ from: IST, to: p.loc })),
        arcColor: [1, 0.6, 0.35], arcWidth: 0.6, arcHeight: 0.25, markerElevation: 0.01,
      });
    } catch (e) { return; }
    section.classList.add("globe-ready");
    api = { markers: (id) => { selected = id; globe.update({ markers: base(id) }); kick(); } };

    function frame() {
      raf = 0;
      if (!visible) return;
      let moving = false;
      if (dragX === null) {
        if (focus) {
          const tau = Math.PI * 2;
          const dp = ((focus[0] - phi) % tau + tau + Math.PI) % tau - Math.PI;
          phi += dp * 0.08; theta += (focus[1] * 0.85 - theta) * 0.08;
          if (Math.abs(dp) < 0.002 && Math.abs(focus[1] * 0.85 - theta) < 0.002) focus = null; else moving = true;
        } else if (Math.abs(velocity) > 0.0005) { phi += velocity; velocity *= 0.94; moving = true; }
        else if (!reduce && !touched) { phi += 0.0025; moving = true; }
      } else moving = true;
      globe.update({ phi, theta });
      if (moving) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(canvas);

    canvas.addEventListener("pointerdown", (e) => { touched = true; dragX = e.clientX; dragPhi = phi; velocity = 0; focus = null; canvas.setPointerCapture(e.pointerId); canvas.classList.add("is-drag"); kick(); });
    canvas.addEventListener("pointermove", (e) => { if (dragX === null) return; const np = dragPhi + (e.clientX - dragX) / 160; velocity = np - phi; phi = np; });
    const end = () => { dragX = null; canvas.classList.remove("is-drag"); kick(); };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    select(selected, false);
    kick();
  }
}
