/* OYA — interactive 3D stadium & seating categories (three.js, MIT)
   Illustrative model: two-tier stands, roof, floodlit pitch; stands coloured by ticket category.
   Lazy: desktop loads when the section is near; touch devices load on tap. Renders only while visible. */
const root = document.querySelector("[data-stadium]");
if (root) {
  const cfg = JSON.parse(root.querySelector(".stadium-data").textContent);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const startBtn = root.querySelector(".stadium-start");
  let started = false;
  const start = () => { if (started) return; started = true; root.classList.add("is-loading"); init().catch(() => root.classList.add("is-failed")); };
  if (startBtn) startBtn.addEventListener("click", start);
  if (!coarse) {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "200px" });
    io.observe(root);
  }

  async function init() {
    const THREE = await import("./vendor/three.module.min.js");
    const stage = root.querySelector(".stadium-stage");
    const canvas = document.createElement("canvas");
    canvas.className = "stadium-canvas";
    canvas.setAttribute("aria-label", "مجسم ثلاثي الأبعاد للملعب يوضح فئات المقاعد");
    canvas.setAttribute("role", "img");
    stage.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071426, 260, 520);
    const camera = new THREE.PerspectiveCamera(42, 1, 1, 1200);

    // ---------- lights: night match under floodlights ----------
    scene.add(new THREE.HemisphereLight(0x9fb8e0, 0x0b1220, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-80, 160, 120); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffd7b0, 0.55); fill.position.set(120, 90, -140); scene.add(fill);

    // ---------- ground & pitch ----------
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x0a1626, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; scene.add(ground);
    const pitchTex = makePitchTexture(THREE);
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(122, 84), new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: pitchTex, emissiveIntensity: 0.22 }));
    pitch.rotation.x = -Math.PI / 2; scene.add(pitch);
    addGoals(THREE, scene);

    // ---------- materials per category ----------
    const CAT = cfg.categories; // {vip:{color,label}, cat1..}
    const mats = {};
    Object.keys(CAT).forEach((k) => { mats[k] = new THREE.MeshStandardMaterial({ color: new THREE.Color(CAT[k].color), roughness: 0.75, metalness: 0.05, emissive: new THREE.Color(CAT[k].color), emissiveIntensity: 0.08 }); });
    const concrete = new THREE.MeshStandardMaterial({ color: 0x2a3443, roughness: 0.95 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xdfe7f2, roughness: 0.35, metalness: 0.3, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
    const trussMat = new THREE.MeshStandardMaterial({ color: 0xaab6c6, roughness: 0.5, metalness: 0.4 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
    const boardMat = new THREE.MeshBasicMaterial({ color: 0xed5404 });

    let stadium = new THREE.Group(); scene.add(stadium);
    let pickables = [];

    function profileShape(rows, tread, riser, h0, back = 2) {
      const s = new THREE.Shape();
      s.moveTo(0, 0); s.lineTo(0, h0);
      let x = 0, y = h0;
      for (let i = 0; i < rows; i++) { x += tread; s.lineTo(x, y); y += riser; s.lineTo(x, y); }
      x += back; s.lineTo(x, y); s.lineTo(x, 0); s.lineTo(0, 0);
      return { shape: s, depth: x, top: y };
    }
    function standMesh(prof, length, mat) {
      const g = new THREE.ExtrudeGeometry(prof.shape, { depth: length, bevelEnabled: false });
      g.translate(0, 0, -length / 2);
      return new THREE.Mesh(g, mat);
    }
    // place a mesh so its "depth" axis points away from the pitch
    function place(mesh, side, offset, along) {
      const A = { N: Math.PI / 2, S: -Math.PI / 2, E: 0, W: Math.PI };
      mesh.rotation.y = A[side];
      if (side === "N") mesh.position.set(along, 0, -(34 + offset));
      if (side === "S") mesh.position.set(-along, 0, 34 + offset);
      if (side === "E") mesh.position.set(52.5 + offset, 0, -along);
      if (side === "W") mesh.position.set(-(52.5 + offset), 0, along);
    }
    function corner(mesh, quad, d) {
      const A = { NE: Math.PI / 4, NW: (3 * Math.PI) / 4, SW: (-3 * Math.PI) / 4, SE: -Math.PI / 4 };
      const sx = quad.includes("E") ? 1 : -1, sz = quad.includes("N") ? -1 : 1;
      mesh.rotation.y = A[quad];
      mesh.position.set(sx * (52.5 + d), 0, sz * (34 + d));
    }

    function build(v) {
      scene.remove(stadium); stadium.traverse((o) => o.geometry && o.geometry.dispose());
      stadium = new THREE.Group(); pickables = [];
      const off = 8;                       // distance stands → pitch lines
      const lower = profileShape(20, 0.85, 0.42, 1.4);
      const upper = profileShape(v.upperRows, 0.85, 0.6, 3.2);
      const upOff = off + lower.depth + 1.2, upBase = lower.top + 2.2;
      const add = (prof, len, cat, side, offset, along, y, info) => {
        const m = standMesh(prof, len, mats[cat]); place(m, side, offset, along); m.position.y += y;
        m.userData = { cat, info }; stadium.add(m); pickables.push(m); return m;
      };
      const sideName = { S: "الجهة الرئيسية", N: "الجهة المقابلة", E: "خلف المرمى الشرقي", W: "خلف المرمى الغربي" };
      // long sides: wing / centre / wing  ×  lower / upper
      for (const side of ["S", "N"]) {
        const main = side === "S";
        [[-37.5, 30, "wing"], [0, 45, "center"], [37.5, 30, "wing"]].forEach(([al, len, part]) => {
          const lc = part === "center" ? (main ? "vip" : "cat1") : main ? "cat1" : "cat2";
          const uc = part === "center" ? "cat1" : "cat2";
          add(lower, len - 0.6, lc, side, off, al, 0, `${sideName[side]} • المدرج السفلي • ${part === "center" ? "الوسط" : "الطرف"}`);
          add(upper, len - 0.6, uc, side, upOff, al, upBase, `${sideName[side]} • المدرج العلوي • ${part === "center" ? "الوسط" : "الطرف"}`);
        });
      }
      // ends (behind the goals)
      for (const side of ["E", "W"]) {
        const single = v.singleTierEnd === side;
        [[-17, 33], [17, 33]].forEach(([al, len]) => {
          add(lower, len - 0.6, "cat3", side, off + 2, al, 0, `${sideName[side]} • المدرج السفلي`);
          if (!single) add(upper, len - 0.6, "cat3", side, upOff + 2, al, upBase, `${sideName[side]} • المدرج العلوي`);
        });
      }
      // corners: curved bowl made of fan slices pivoting on each pitch corner
      const fan = (prof, radius, y, cat, info, quad, slices = 12) => {
        const [sx, sz] = { NE: [1, -1], NW: [-1, -1], SE: [1, 1], SW: [-1, 1] }[quad];
        const da = Math.PI / 2 / slices;
        for (let i = 0; i < slices; i++) {
          const a = (i + 0.5) * da, dx = sx * Math.sin(a), dz = sz * Math.cos(a);
          const m = standMesh(prof, (radius + prof.depth) * da * 1.1, mats[cat]);
          m.rotation.y = Math.atan2(-dz, dx);
          m.position.set(sx * 52.5 + dx * radius, y, sz * 34 + dz * radius);
          m.userData = { cat, info }; stadium.add(m); pickables.push(m);
        }
      };
      if (v.closedCorners) {
        for (const q of ["NE", "NW", "SE", "SW"]) {
          fan(lower, off + 1, 0, "cat2", "الزاوية • المدرج السفلي", q);
          if (!(v.singleTierEnd && q.includes(v.singleTierEnd))) fan(upper, upOff + 1, upBase, "cat3", "الزاوية • المدرج العلوي", q);
        }
      }
      // fascia between tiers (VIP boxes band) + LED boards
      for (const side of ["S", "N", "E", "W"]) {
        const len = side === "S" || side === "N" ? 104 : 66;
        const band = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, len), side === "S" ? new THREE.MeshStandardMaterial({ color: 0x0f2c52, emissive: 0x2b6bab, emissiveIntensity: 0.35 }) : concrete);
        place(band, side, off + lower.depth + 0.6, 0); band.position.y = lower.top + 1.1; stadium.add(band);
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, len), boardMat);
        place(led, side, 4.5, 0); led.position.y = 0.45; stadium.add(led);
      }
      // roof canopies + floodlight strips
      const roofH = upBase + upper.top + 5;
      const roofDepth = upper.depth + 10;
      for (const side of ["S", "N", "E", "W"]) {
        const len = side === "S" || side === "N" ? 118 : 82;
        if (v.singleTierEnd === side) continue;
        const roof = new THREE.Mesh(new THREE.BoxGeometry(roofDepth, 0.4, len), roofMat);
        place(roof, side, upOff + roofDepth / 2 - 6, 0); roof.position.y = roofH; stadium.add(roof);
        const edge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, len), trussMat);
        place(edge, side, upOff - 6, 0); edge.position.y = roofH; stadium.add(edge);
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, len - 6), lightMat);
        place(strip, side, upOff - 6.2, 0); strip.position.y = roofH - 0.6; stadium.add(strip);
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, roofH, len), concrete);
        place(back, side, upOff + upper.depth + 0.6, 0); back.position.y = roofH / 2; stadium.add(back);
      }
      // corner pylons
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, roofH + 6, 12), concrete);
        p.position.set(sx * (52.5 + upOff + upper.depth * 0.7), (roofH + 6) / 2, sz * (34 + upOff + upper.depth * 0.7)); stadium.add(p);
      }
      scene.add(stadium);
      radiusMax = 52.5 + upOff + upper.depth + 140;
    }

    // ---------- orbit camera (lightweight, no extra library) ----------
    const target = new THREE.Vector3(0, 6, 0);
    let az = -0.65, pol = 0.86, rad = 215, radiusMax = 300, auto = !reduce, dirty = true;
    function updateCam() {
      camera.position.set(target.x + rad * Math.sin(pol) * Math.sin(az), target.y + rad * Math.cos(pol), target.z + rad * Math.sin(pol) * Math.cos(az));
      camera.lookAt(target); dirty = true;
    }
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
    }
    new ResizeObserver(resize).observe(stage);

    // ---------- picking & UI ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const panel = root.querySelector(".stadium-info");
    const tip = root.querySelector(".stadium-tip");
    let hovered = null, selected = null, matchIdx = 0;
    const setGlow = (m, v) => { if (m) { m.material = m.material.clone(); m.material.emissiveIntensity = v; } };
    function pick(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object : null;
    }
    function showInfo(m) {
      const k = m.userData.cat, c = CAT[k], match = cfg.matches[matchIdx];
      const price = match.prices && typeof match.prices[k] === "number" ? `${match.prices[k].toLocaleString("en-US")} ${cfg.currency}` : "عند الطلب";
      panel.querySelector(".si-dot").style.background = c.color;
      panel.querySelector(".si-cat").textContent = c.label;
      panel.querySelector(".si-where").textContent = m.userData.info;
      panel.querySelector(".si-desc").textContent = c.desc;
      panel.querySelector(".si-price").textContent = price;
      panel.querySelector(".si-wa").href = `https://wa.me/${cfg.wa}?text=${encodeURIComponent(`مرحباً أويا، أرغب بـ${c.label} (${m.userData.info}) — ${match.stage}: ${match.teams}، كأس السوبر الإسباني 2027.`)}`;
      panel.classList.add("is-on");
      root.querySelectorAll(".stadium-legend button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === k ? "true" : "false"));
    }
    function select(m) {
      if (selected) { selected.material = mats[selected.userData.cat]; }
      selected = m;
      if (m) { m.material = mats[m.userData.cat].clone(); m.material.emissiveIntensity = 0.9; showInfo(m); auto = false; }
      dirty = true;
    }
    // legend → highlight a whole category
    root.querySelectorAll(".stadium-legend button").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.cat; const m = pickables.find((p) => p.userData.cat === k);
      pickables.forEach((p) => { p.material = mats[p.userData.cat]; });
      pickables.filter((p) => p.userData.cat === k).forEach((p) => { p.material = mats[k].clone(); p.material.emissiveIntensity = 0.75; });
      if (m) { selected = null; showInfo(m); }
      dirty = true;
    }));
    // venue tabs
    const tabs = [...root.querySelectorAll(".stadium-tab")];
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
      matchIdx = i; selected = null; panel.classList.remove("is-on");
      build(cfg.matches[i].venueModel);
      root.querySelector(".stadium-venue").textContent = `${cfg.matches[i].venue} • ${cfg.matches[i].capacity}`;
      root.querySelectorAll(".stadium-legend button").forEach((b) => { const p = cfg.matches[i].prices || {}; b.querySelector(".lg-price").textContent = typeof p[b.dataset.cat] === "number" ? `${p[b.dataset.cat].toLocaleString("en-US")} ${cfg.currency}` : "عند الطلب"; });
      dirty = true;
    }));

    // pointer: drag to orbit, tap to pick, wheel/pinch to zoom
    const pts = new Map(); let downX = 0, downY = 0, moved = 0, pinch0 = 0, rad0 = rad;
    canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); downX = e.clientX; downY = e.clientY; moved = 0; auto = false; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); rad0 = rad; } });
    canvas.addEventListener("pointermove", (e) => {
      if (pts.has(e.pointerId)) {
        const prev = pts.get(e.pointerId); pts.set(e.pointerId, e);
        if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); rad = Math.min(radiusMax, Math.max(60, rad0 * (pinch0 / d))); }
        else { az -= (e.clientX - prev.clientX) * 0.006; pol = Math.min(1.32, Math.max(0.42, pol - (e.clientY - prev.clientY) * 0.004)); }
        moved += Math.abs(e.clientX - prev.clientX) + Math.abs(e.clientY - prev.clientY); updateCam(); kick();
      } else if (!coarse) {
        const m = pick(e.clientX, e.clientY);
        if (m !== hovered) { hovered = m; canvas.style.cursor = m ? "pointer" : "grab"; if (m) { tip.textContent = `${CAT[m.userData.cat].label} — ${m.userData.info}`; tip.classList.add("is-on"); } else tip.classList.remove("is-on"); }
        if (m) { const r = stage.getBoundingClientRect(); tip.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top - 14}px)`; }
      }
    });
    const up = (e) => { pts.delete(e.pointerId); if (moved < 6 && e.type === "pointerup") { const m = pick(e.clientX, e.clientY); select(m); } };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); rad = Math.min(radiusMax, Math.max(60, rad * (1 + Math.sign(e.deltaY) * 0.08))); auto = false; updateCam(); kick(); }, { passive: false });
    root.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.view; auto = false;
      if (v === "main") { az = 0.0; pol = 1.28; rad = 80; } else if (v === "goal") { az = Math.PI / 2; pol = 1.24; rad = 92; } else { az = -0.65; pol = 0.5; rad = 230; }
      updateCam(); kick();
    }));

    // ---------- render loop (only while visible) ----------
    let visible = true, raf = 0;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(stage);
    function frame() {
      raf = 0; if (!visible) return;
      if (auto) { az += 0.0018; updateCam(); }
      if (dirty) { renderer.render(scene, camera); dirty = false; }
      if (auto) raf = requestAnimationFrame(frame);
    }
    function kick() { dirty = true; if (!raf) raf = requestAnimationFrame(frame); }

    build(cfg.matches[0].venueModel);
    resize(); updateCam(); kick();
    canvas.tabIndex = -1;
    if (!document.activeElement || document.activeElement === document.body || document.activeElement === startBtn) canvas.focus({ preventScroll: true });
    root.classList.remove("is-loading"); root.classList.add("is-ready");
  }
}

/* ---------- helpers ---------- */
function makePitchTexture(THREE) {
  const W = 1220, H = 840, s = 10; // 10 px per metre, 122×84 m incl. run-off
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? "#2f7d3a" : "#2a7134"; g.fillRect(i * (W / 18), 0, W / 18 + 1, H); }
  g.strokeStyle = "rgba(255,255,255,.92)"; g.lineWidth = 2.4;
  const ox = (122 - 105) / 2 * s, oy = (84 - 68) / 2 * s, L = 105 * s, Wd = 68 * s;
  g.strokeRect(ox, oy, L, Wd);
  g.beginPath(); g.moveTo(ox + L / 2, oy); g.lineTo(ox + L / 2, oy + Wd); g.stroke();
  g.beginPath(); g.arc(ox + L / 2, oy + Wd / 2, 9.15 * s, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(ox + L / 2, oy + Wd / 2, 3, 0, Math.PI * 2); g.fill();
  for (const dir of [0, 1]) {
    const x0 = dir ? ox + L : ox, sgn = dir ? -1 : 1;
    g.strokeRect(dir ? x0 - 16.5 * s : x0, oy + Wd / 2 - 20.16 * s, 16.5 * s, 40.32 * s);
    g.strokeRect(dir ? x0 - 5.5 * s : x0, oy + Wd / 2 - 9.16 * s, 5.5 * s, 18.32 * s);
    g.beginPath(); g.arc(x0 + sgn * 11 * s, oy + Wd / 2, 2.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x0 + sgn * 11 * s, oy + Wd / 2, 9.15 * s, dir ? Math.PI - 0.93 : -0.93, dir ? Math.PI + 0.93 : 0.93); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function addGoals(THREE, scene) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  for (const sx of [-1, 1]) {
    const x = sx * 52.5;
    for (const z of [-3.66, 3.66]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.44, 8), m); p.position.set(x, 1.22, z); scene.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.32, 8), m); bar.rotation.x = Math.PI / 2; bar.position.set(x, 2.44, 0); scene.add(bar);
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })); net.position.set(x + sx * 1, 1.22, 0); scene.add(net);
  }
}
