/* OYA — immersive 3D stadium & seating categories (three.js, MIT)
   Illustrative model: two-tier bowl, roof, floodlit pitch, a seated crowd tinted by ticket category,
   "see it from your seat" camera, Mexican wave, camera flashes, scrolling LED boards, big screens and an
   optional synthesized crowd ambience. Lazy: desktop loads near the viewport, touch devices on tap.
   Renders only while visible; lighter crowd on phones; calm, static version for reduced-motion users. */
const root = document.querySelector("[data-stadium]");
if (root) {
  const cfg = JSON.parse(root.querySelector(".stadium-data").textContent);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const startBtn = root.querySelector(".stadium-start");
  let started = false;
  const hasGL = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };
  const start = () => {
    if (started) return; started = true;
    if (!hasGL()) { root.classList.add("is-failed", "no-3d"); return; }
    root.classList.add("is-loading"); init().catch(() => { root.classList.remove("is-loading"); root.classList.add("is-failed", "no-3d"); });
  };
  if (startBtn) startBtn.addEventListener("click", start);

  // ---------- lite mode: the category list, match tabs and ticket count work without the 3D model
  // (before it loads on phones, and on devices without WebGL). Once the model is ready it takes over.
  const TL = (s, a) => { try { const t = JSON.parse((document.getElementById("oya-t") || {}).textContent || "{}"); s = t[s] || s; } catch (e) {} return a ? s.replace(/\{(\d)\}/g, (m, i) => a[i]) : s; };
  const NUM_LOC0 = { ru: "ru-RU", tr: "tr-TR", pt: "pt-BR" }[document.documentElement.lang] || "en-US";
  const lite = { idx: 0, cat: null, qty: 1, pendingCat: null, pendingTab: null };
  const litePanel = root.querySelector(".stadium-info");
  const is3D = () => root.classList.contains("is-ready");
  const litePrice = (k) => { const p = cfg.matches[lite.idx].prices || {}; return typeof p[k] === "number" && p[k] > 0 ? p[k] : null; };
  const liteMoney = (v) => (v ? `${v.toLocaleString(NUM_LOC0)}${cfg.currency}` : TL("عند الطلب"));
  function liteDraw() {
    root.querySelectorAll(".stadium-legend button").forEach((b) => { b.querySelector(".lg-price").textContent = liteMoney(litePrice(b.dataset.cat)); b.setAttribute("aria-pressed", b.dataset.cat === lite.cat ? "true" : "false"); });
    const n = root.querySelector(".si-n"); if (n) n.textContent = lite.qty;
    if (!lite.cat || !litePanel) return;
    const c = cfg.categories[lite.cat], m = cfg.matches[lite.idx], v = litePrice(lite.cat);
    litePanel.querySelector(".si-dot").style.background = c.color;
    litePanel.querySelector(".si-cat").textContent = c.label;
    litePanel.querySelector(".si-where").textContent = m.venue;
    litePanel.querySelector(".si-desc").textContent = c.desc;
    litePanel.querySelector(".si-price").textContent = liteMoney(v);
    const tot = litePanel.querySelector(".si-total"); if (tot) tot.textContent = liteMoney(v ? v * lite.qty : null);
    litePanel.querySelector(".si-wa").href = `https://wa.me/${cfg.wa}?text=${encodeURIComponent(TL("مرحباً أويا، أرغب بتذاكر {0} ({1}) — {2}: {3}، كأس السوبر الإسباني 2027. عدد التذاكر: {4} — الإجمالي التقديري: {5}.", [c.label, m.venue, m.stage, m.teams, lite.qty, liteMoney(v ? v * lite.qty : null)]))}`;
    litePanel.classList.add("is-on");
    syncForm(lite.idx, lite.cat, lite.qty);
  }
  root.querySelectorAll(".stadium-legend button").forEach((b) => b.addEventListener("click", () => {
    if (is3D()) return;
    lite.cat = b.dataset.cat; liteDraw();
    if (!started && coarse) { lite.pendingCat = b.dataset.cat; }
  }));
  root.querySelectorAll(".stadium-tab").forEach((t, i) => t.addEventListener("click", () => {
    if (is3D()) return;
    lite.idx = i;
    root.querySelectorAll(".stadium-tab").forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
    const ven = root.querySelector(".stadium-venue"); if (ven) ven.textContent = `${cfg.matches[i].venue} • ${cfg.matches[i].capacity}`;
    lite.pendingTab = i; liteDraw(); syncForm(i, lite.cat, lite.qty);
  }));
  root.querySelectorAll(".qty__b").forEach((b) => b.addEventListener("click", () => { if (is3D()) return; lite.qty = Math.min(10, Math.max(1, lite.qty + Number(b.dataset.q))); liteDraw(); }));
  if (window.oyaPrices) window.oyaPrices.then((db) => { const sc = db && db.superCup && db.superCup.matches; if (!sc || is3D()) return; cfg.matches.forEach((m) => { if (sc[m.id]) m.prices = sc[m.id]; }); if (db.currency && db.currency.symbol) cfg.currency = db.currency.symbol; liteDraw(); });
  // the request form below follows what the visitor picks on the stadium (match, category, number of tickets)
  const scForm = document.querySelector("form[data-sc-form]");
  function syncForm(mi, cat, n) {
    if (!scForm) return;
    const setSel = (name, key) => {
      const sel = scForm.querySelector(`select[name="${name}"]`); if (!sel || !key) return;
      const map = (sel.getAttribute("data-sc-map") || "").split(","), opts = [...sel.options].filter((o) => o.value !== "");
      const o = opts[map.indexOf(key)]; if (o && sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); }
    };
    setSel("match", cfg.matches[mi] && cfg.matches[mi].id); setSel("category", cat);
    const q = scForm.querySelector('select[name="qty"]');
    if (q && n) { const o = [...q.options].find((x) => x.value === String(n)); if (o && q.value !== o.value) { q.value = o.value; q.dispatchEvent(new Event("change", { bubbles: true })); } }
  }
  document.querySelectorAll("[data-pick-match]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const t = root.querySelectorAll(".stadium-tab")[Number(a.dataset.pickMatch)];
    if (t && t.getAttribute("aria-selected") !== "true") t.click(); else if (!is3D()) { lite.idx = Number(a.dataset.pickMatch); syncForm(lite.idx, lite.cat, lite.qty); }
    root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    start();
  }));
  if (!coarse) {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "200px" });
    io.observe(root);
  }

  async function init() {
    const THREE = await import("./vendor/three.module.min.js");
    const stage = root.querySelector(".stadium-stage");
    const canvas = document.createElement("canvas");
    canvas.className = "stadium-canvas";
    canvas.setAttribute("aria-label", T("مجسم ثلاثي الأبعاد للملعب يوضح فئات المقاعد ويعرض المنظر من المقعد"));
    canvas.setAttribute("role", "img");
    stage.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071426, 260, 560);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.3, 1400);
    const U = { time: { value: 0 }, wave: { value: 0 }, idle: { value: reduce ? 0 : 1 } };

    // ---------- lights: night match under floodlights ----------
    scene.add(new THREE.HemisphereLight(0xa9c2ea, 0x0b1220, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-80, 170, 120); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffd7b0, 0.6); fill.position.set(120, 100, -140); scene.add(fill);
    const pitchLight = new THREE.PointLight(0xf4f8ff, 1.4, 260, 1.2); pitchLight.position.set(0, 70, 0); scene.add(pitchLight);

    // ---------- ground & pitch ----------
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ color: 0x0a1626, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; scene.add(ground);
    const pitchTex = makePitchTexture(THREE);
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(122, 84), new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.85, emissive: 0xffffff, emissiveMap: pitchTex, emissiveIntensity: 0.26 }));
    pitch.rotation.x = -Math.PI / 2; scene.add(pitch);
    addGoals(THREE, scene);

    // ---------- materials ----------
    const CAT = cfg.categories;
    const mats = {};
    Object.keys(CAT).forEach((k) => { mats[k] = new THREE.MeshStandardMaterial({ color: new THREE.Color(CAT[k].color), roughness: 0.75, metalness: 0.05, emissive: new THREE.Color(CAT[k].color), emissiveIntensity: 0.08 }); });
    const concrete = new THREE.MeshStandardMaterial({ color: 0x2a3443, roughness: 0.95 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xdfe7f2, roughness: 0.35, metalness: 0.3, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
    const trussMat = new THREE.MeshStandardMaterial({ color: 0xaab6c6, roughness: 0.5, metalness: 0.4 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
    const glowTex = radialTexture(THREE);
    const ledTex = ledTexture(THREE);

    // crowd materials: Lambert + per-instance colour + a vertex hook for the wave and idle movement
    const crowdHook = (sh) => {
      sh.uniforms.uTime = U.time; sh.uniforms.uWave = U.wave; sh.uniforms.uIdle = U.idle;
      sh.vertexShader = "attribute float aAng;\nattribute float aPh;\nuniform float uTime;\nuniform float uWave;\nuniform float uIdle;\nvarying float vWave;\n" +
        sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
          float wc = pow(max(sin(aAng - uTime * 2.1), 0.0), 7.0);
          vWave = wc * uWave;
          transformed.y += wc * 1.15 * uWave + sin(uTime * 2.6 + aPh * 6.2831) * 0.035 * uIdle;
          transformed.xz *= 1.0 + wc * 0.15 * uWave;`);
      // fans in the crest light up (scarves / phone lights), so the wave reads from far away
      sh.fragmentShader = "varying float vWave;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.97, 0.9), clamp(vWave * 0.7, 0.0, 0.7));`);
    };
    const bodyMat = new THREE.MeshLambertMaterial(); bodyMat.onBeforeCompile = crowdHook;
    const headMat = new THREE.MeshLambertMaterial(); headMat.onBeforeCompile = crowdHook;
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.82, 0.36).translate(0, 0.41, 0);
    const headGeo = new THREE.SphereGeometry(0.155, coarse ? 6 : 8, coarse ? 4 : 6).translate(0, 1.0, 0);
    const CLOTH = [0x1d2a44, 0xe8ecf2, 0x15181d, 0xb8322a, 0x2d5fa8, 0xe0b23a, 0x6b7280, 0x6d2233, 0x2f6b45, 0xd9682a, 0xf4f4f4, 0x23314d].map((c) => new THREE.Color(c));
    const SKIN = [0xe2b48f, 0xc98e66, 0x9a6544, 0xf0c9a5, 0x7a4b30].map((c) => new THREE.Color(c));

    const sharedMats = new Set([...Object.values(mats), concrete, roofMat, trussMat, lightMat, bodyMat, headMat]);
    let stadium = new THREE.Group(); scene.add(stadium);
    let pickables = [], crowd = null, flashes = null, boards = [], screens = [], seatsWorld = [];
    let radiusMax = 300;

    function profileShape(rows, tread, riser, h0, back = 2) {
      const s = new THREE.Shape();
      s.moveTo(0, 0); s.lineTo(0, h0);
      let x = 0, y = h0;
      for (let i = 0; i < rows; i++) { x += tread; s.lineTo(x, y); y += riser; s.lineTo(x, y); }
      x += back; s.lineTo(x, y); s.lineTo(x, 0); s.lineTo(0, 0);
      return { shape: s, depth: x, top: y, rows, tread, riser, h0 };
    }
    function standMesh(prof, length, mat) {
      const g = new THREE.ExtrudeGeometry(prof.shape, { depth: length, bevelEnabled: false });
      g.translate(0, 0, -length / 2);
      const m = new THREE.Mesh(g, mat); m.userData.prof = prof; m.userData.len = length; return m;
    }
    function place(mesh, side, offset, along) {
      const A = { N: Math.PI / 2, S: -Math.PI / 2, E: 0, W: Math.PI };
      mesh.rotation.y = A[side];
      if (side === "N") mesh.position.set(along, 0, -(34 + offset));
      if (side === "S") mesh.position.set(-along, 0, 34 + offset);
      if (side === "E") mesh.position.set(52.5 + offset, 0, -along);
      if (side === "W") mesh.position.set(-(52.5 + offset), 0, along);
    }

    // seated spectators on every tread of a stand (sampled; empty seats left at random)
    const density = coarse ? { sp: 1.5, rowStep: 2, empty: 0.2 } : { sp: 0.95, rowStep: 1, empty: 0.14 };
    let C = null; // crowd accumulator during a build
    function seatCrowd(m, cat) {
      const { prof, len } = m.userData; m.updateMatrix();
      const v = new THREE.Vector3(), cc = new THREE.Color(CAT[cat].color);
      for (let r = 0; r < prof.rows; r += density.rowStep) {
        for (let z = -len / 2 + 0.6; z <= len / 2 - 0.6; z += density.sp) {
          if (Math.random() < density.empty) continue;
          v.set((r + 0.5) * prof.tread, prof.h0 + r * prof.riser, z + (Math.random() - 0.5) * 0.18).applyMatrix4(m.matrix);
          C.pos.push(v.x, v.y, v.z); C.rot.push(m.rotation.y);
          const cl = CLOTH[(Math.random() * CLOTH.length) | 0].clone().lerp(cc, 0.42);
          C.col.push(cl.r, cl.g, cl.b);
          const sk = SKIN[(Math.random() * SKIN.length) | 0]; C.skin.push(sk.r, sk.g, sk.b);
        }
      }
    }
    function makeCrowd() {
      const n = C.pos.length / 3;
      const body = new THREE.InstancedMesh(bodyGeo, bodyMat, n), head = new THREE.InstancedMesh(headGeo, headMat, n);
      const o = new THREE.Object3D(), ang = new Float32Array(n), ph = new Float32Array(n), col = new THREE.Color();
      for (let i = 0; i < n; i++) {
        o.position.set(C.pos[i * 3], C.pos[i * 3 + 1], C.pos[i * 3 + 2]); o.rotation.set(0, C.rot[i], 0); o.scale.setScalar(0.92 + Math.random() * 0.16); o.updateMatrix();
        body.setMatrixAt(i, o.matrix); head.setMatrixAt(i, o.matrix);
        body.setColorAt(i, col.setRGB(C.col[i * 3], C.col[i * 3 + 1], C.col[i * 3 + 2]));
        head.setColorAt(i, col.setRGB(C.skin[i * 3], C.skin[i * 3 + 1], C.skin[i * 3 + 2]));
        ang[i] = Math.atan2(C.pos[i * 3 + 2], C.pos[i * 3]); ph[i] = Math.random();
      }
      for (const im of [body, head]) {
        im.geometry = im.geometry.clone();
        im.geometry.setAttribute("aAng", new THREE.InstancedBufferAttribute(ang, 1));
        im.geometry.setAttribute("aPh", new THREE.InstancedBufferAttribute(ph, 1));
        im.frustumCulled = false; stadium.add(im);
      }
      // camera flashes: a few hundred points twinkling in the crowd
      const fN = Math.min(coarse ? 160 : 420, n), fp = new Float32Array(fN * 3), fa = new Float32Array(fN);
      for (let i = 0; i < fN; i++) { const j = (Math.random() * n) | 0; fp[i * 3] = C.pos[j * 3]; fp[i * 3 + 1] = C.pos[j * 3 + 1] + 1.35; fp[i * 3 + 2] = C.pos[j * 3 + 2]; fa[i] = Math.random(); }
      const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.BufferAttribute(fp, 3)); fg.setAttribute("aPh", new THREE.BufferAttribute(fa, 1));
      const fm = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: U.time, uOn: { value: reduce ? 0 : 1 } },
        vertexShader: `attribute float aPh; uniform float uTime; uniform float uOn; varying float vA;
          void main(){ float k = floor(uTime * 6.0 + aPh * 97.0); float r = fract(sin(k * 12.9898 + aPh * 78.233) * 43758.5453);
            vA = step(0.965, r) * uOn; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = vA * clamp(900.0 / -mv.z, 2.0, 14.0); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(0.92, 0.96, 1.0, a * vA); }`,
      });
      flashes = new THREE.Points(fg, fm); flashes.frustumCulled = false; stadium.add(flashes);
      crowd = { body, head, n, pos: Float32Array.from(C.pos) };
    }

    // ---------- players: two teams in a 4-3-3 in their kit colours, a referee and the ball ----------
    let players = null;
    const FORM = [[-49, 0], [-36, -22], [-38, -7], [-38, 7], [-36, 22], [-22, -14], [-24, 0], [-22, 14], [-8, -20], [-6, 0], [-8, 20]];
    function buildPlayers(match) {
      const kits = (match && match.kits) || [["#ED5404", "#ffffff"], ["#19487E", "#ffffff"]];
      const list = [];
      [1, -1].forEach((side, ti) => FORM.forEach(([x, z], i) => list.push({ bx: x * side, bz: z * side, side, gk: i === 0, shirt: i === 0 ? (ti ? "#F2C230" : "#2FA84F") : kits[ti][0], shorts: i === 0 ? "#1b1f27" : kits[ti][1], ph: Math.random() * 6.28, run: i ? 1 : 0.25 })));
      list.push({ bx: 0, bz: 8, side: 0, ref: true, shirt: "#111111", shorts: "#111111", ph: 1, run: 1 });
      const n = list.length;
      const mk = (geo, color) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color }), n); m.frustumCulled = false; stadium.add(m); return m; };
      const torso = mk(new THREE.CylinderGeometry(0.27, 0.23, 0.72, 8).translate(0, 1.2, 0), 0xffffff);
      const shorts = mk(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 8).translate(0, 0.72, 0), 0xffffff);
      const legs = mk(new THREE.BoxGeometry(0.34, 0.6, 0.2).translate(0, 0.3, 0), 0xffffff);
      const head = mk(new THREE.SphereGeometry(0.15, 8, 6).translate(0, 1.72, 0), 0xffffff);
      const col = new THREE.Color();
      list.forEach((p, i) => {
        torso.setColorAt(i, col.set(p.shirt)); shorts.setColorAt(i, col.set(p.shorts)); legs.setColorAt(i, col.set(p.shirt).lerp(new THREE.Color(0x222222), 0.35));
        head.setColorAt(i, SKIN[i % SKIN.length]);
      });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x444444 }));
      stadium.add(ball);
      players = { list, parts: [torso, shorts, legs, head], ball, o: new THREE.Object3D() };
      movePlayers(0);
    }
    function movePlayers(t) {
      if (!players) return;
      const { list, parts, ball, o } = players;
      // the ball wanders over the pitch; both teams shift towards it, the nearest players press it
      const bx = 30 * Math.sin(t * 0.11) + 9 * Math.sin(t * 0.37), bz = 20 * Math.sin(t * 0.15 + 1) + 6 * Math.sin(t * 0.5);
      ball.position.set(bx, 0.2 + Math.abs(Math.sin(t * 2.2)) * 0.25, bz);
      list.forEach((p, i) => {
        let x, z;
        if (p.ref) { x = bx - 9; z = bz + 7; }
        else if (p.gk) { x = p.bx; z = Math.max(-4, Math.min(4, bz * 0.12)); }
        else {
          x = p.bx + bx * 0.45 + Math.sin(t * 0.6 + p.ph) * 2.2 * p.run; z = p.bz * 0.85 + bz * 0.25 + Math.cos(t * 0.5 + p.ph) * 2 * p.run;
          const dx = bx - x, dz = bz - z, d = Math.hypot(dx, dz);
          if (d < 13) { const k = (13 - d) / 13 * 0.75; x += dx * k; z += dz * k; }
        }
        x = Math.max(-51, Math.min(51, x)); z = Math.max(-33, Math.min(33, z));
        o.position.set(x, Math.abs(Math.sin(t * 7 + p.ph)) * 0.05 * p.run, z);
        o.rotation.set(0, Math.atan2(bx - x, bz - z), 0); o.scale.setScalar(1.12); o.updateMatrix();
        parts.forEach((m) => m.setMatrixAt(i, o.matrix));
      });
      parts.forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    }

    function build(v, match) {
      scene.remove(stadium);
      stadium.traverse((o) => {
        if (o.geometry && o.geometry !== bodyGeo && o.geometry !== headGeo) o.geometry.dispose();
        if (o.material && !sharedMats.has(o.material)) { if (o.material.map && o.material.map !== pitchTex && o.material.map !== glowTex) o.material.map.dispose(); o.material.dispose(); }
        if (o.isInstancedMesh) o.dispose();
      });
      selected = null; players = null; hiddenSeats = [];
      stadium = new THREE.Group(); pickables = []; boards = []; screens = []; C = { pos: [], rot: [], col: [], skin: [] };
      const off = 8;
      const lower = profileShape(20, 0.85, 0.42, 1.4);
      const upper = profileShape(v.upperRows, 0.85, 0.6, 3.2);
      const upOff = off + lower.depth + 1.2, upBase = lower.top + 2.2;
      const add = (prof, len, cat, side, offset, along, y, info, flags = {}) => {
        const m = standMesh(prof, len, mats[cat]); place(m, side, offset, along); m.position.y += y;
        m.userData = { ...m.userData, cat, info, ...flags }; stadium.add(m); pickables.push(m); seatCrowd(m, cat); return m;
      };
      const sideName = { S: T("الجهة الرئيسية"), N: T("الجهة المقابلة"), E: T("خلف المرمى الشرقي"), W: T("خلف المرمى الغربي") };
      const LOW = T("المدرج السفلي"), UP = T("المدرج العلوي"), MID = T("الوسط"), EDGE = T("الطرف"), CORNER = T("الزاوية");
      for (const side of ["S", "N"]) {
        const main = side === "S";
        [[-37.5, 30, "wing"], [0, 45, "center"], [37.5, 30, "wing"]].forEach(([al, len, part]) => {
          const lc = part === "center" ? (main ? "vip" : "cat1") : main ? "cat1" : "cat2";
          const uc = part === "center" ? "cat1" : "cat2";
          add(lower, len - 0.6, lc, side, off, al, 0, `${sideName[side]} • ${LOW} • ${part === "center" ? MID : EDGE}`, { center: part === "center" });
          add(upper, len - 0.6, uc, side, upOff, al, upBase, `${sideName[side]} • ${UP} • ${part === "center" ? MID : EDGE}`, { upper: true, center: part === "center" });
        });
      }
      for (const side of ["E", "W"]) {
        const single = v.singleTierEnd === side;
        [[-17, 33], [17, 33]].forEach(([al, len]) => {
          add(lower, len - 0.6, "cat3", side, off + 2, al, 0, `${sideName[side]} • ${LOW}`);
          if (!single) add(upper, len - 0.6, "cat3", side, upOff + 2, al, upBase, `${sideName[side]} • ${UP}`, { upper: true });
        });
      }
      const fan = (prof, radius, y, cat, info, quad, slices = 12, flags = {}) => {
        const [sx, sz] = { NE: [1, -1], NW: [-1, -1], SE: [1, 1], SW: [-1, 1] }[quad];
        const da = Math.PI / 2 / slices;
        for (let i = 0; i < slices; i++) {
          const a = (i + 0.5) * da, dx = sx * Math.sin(a), dz = sz * Math.cos(a);
          const m = standMesh(prof, (radius + prof.depth) * da * 1.1, mats[cat]);
          m.rotation.y = Math.atan2(-dz, dx);
          m.position.set(sx * 52.5 + dx * radius, y, sz * 34 + dz * radius);
          m.userData = { ...m.userData, cat, info, slice: i, slices, ...flags }; stadium.add(m); pickables.push(m); seatCrowd(m, cat);
        }
      };
      if (v.closedCorners) {
        for (const q of ["NE", "NW", "SE", "SW"]) {
          fan(lower, off + 1, 0, "cat2", `${CORNER} • ${LOW}`, q);
          if (!(v.singleTierEnd && q.includes(v.singleTierEnd))) fan(upper, upOff + 1, upBase, "cat3", `${CORNER} • ${UP}`, q, 12, { upper: true });
        }
      }
      // fascia between tiers + pitch-side LED ribbons (scrolling)
      for (const side of ["S", "N", "E", "W"]) {
        const len = side === "S" || side === "N" ? 104 : 66;
        const band = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, len), side === "S" ? new THREE.MeshStandardMaterial({ color: 0x0f2c52, emissive: 0x2b6bab, emissiveIntensity: 0.35 }) : concrete);
        place(band, side, off + lower.depth + 0.6, 0); band.position.y = lower.top + 1.1; stadium.add(band);
        const t = ledTex.clone(); t.needsUpdate = true; t.repeat.set(len / 26, 1);
        const led = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.95), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
        place(led, side, 4.4, 0); led.position.y = 0.5; led.rotation.y += -Math.PI / 2; stadium.add(led);
        boards.push(t);
      }
      // roof canopies, floodlight strips with glow, back walls
      const roofH = upBase + upper.top + 5;
      const roofDepth = upper.depth + 10;
      const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xfff3dc, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.85 });
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
        const step = coarse ? 11 : 7;
        for (let a = -len / 2 + 4; a <= len / 2 - 4; a += step) {
          const s = new THREE.Sprite(glowMat); place(s, side, upOff - 6.4, a); s.rotation.set(0, 0, 0); s.position.y = roofH - 1; s.scale.setScalar(7.5); stadium.add(s);
        }
      }
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, roofH + 6, 12), concrete);
        p.position.set(sx * (52.5 + upOff + upper.depth * 0.7), (roofH + 6) / 2, sz * (34 + upOff + upper.depth * 0.7)); stadium.add(p);
      }
      // giant screens above both ends
      for (const side of ["E", "W"]) {
        const sc = screenTexture(THREE, match);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(20, 7.5), new THREE.MeshBasicMaterial({ map: sc, toneMapped: false }));
        place(scr, side, upOff + upper.depth * 0.55, 0); scr.position.y = (v.singleTierEnd === side ? upBase + 6 : roofH - 5); scr.rotation.y += -Math.PI / 2;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 8.5, 21), concrete); place(frame, side, upOff + upper.depth * 0.55 + 0.4, 0); frame.position.y = scr.position.y;
        stadium.add(frame, scr); screens.push(sc);
      }
      makeCrowd();
      buildPlayers(match);
      scene.add(stadium);
      radiusMax = 52.5 + upOff + upper.depth + 150;
    }

    // ---------- camera: orbit + "from your seat" ----------
    const target = new THREE.Vector3(0, 6, 0);
    let az = -0.65, pol = 0.86, rad = 215, auto = !reduce;
    let mode = "orbit", seat = null, yaw = 0, pitchA = -0.18, fly = null;
    const orbitPos = () => new THREE.Vector3(target.x + rad * Math.sin(pol) * Math.sin(az), target.y + rad * Math.cos(pol), target.z + rad * Math.sin(pol) * Math.cos(az));
    function updateCam() {
      if (mode === "orbit") { camera.position.copy(orbitPos()); camera.lookAt(target); }
      else if (mode === "seat" && seat) {
        camera.position.copy(seat.pos);
        const dir = new THREE.Vector3(Math.sin(seat.baseYaw + yaw) * Math.cos(pitchA), Math.sin(pitchA), Math.cos(seat.baseYaw + yaw) * Math.cos(pitchA));
        camera.lookAt(seat.pos.clone().add(dir));
        mapCone();
      }
    }
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function flyTo(toPos, toLook, toFov, done, opt = {}) {
      const fromPos = camera.position.clone(), fromLook = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(60).add(fromPos);
      fly = { t0: performance.now(), dur: reduce ? 1 : opt.dur || 1900, arc: opt.arc !== false, fromPos, toPos, fromLook, toLook, fromFov: camera.fov, toFov, done };
    }
    let seatRow = 0.42, seatAlong = 0.5, hiddenSeats = [];
    function seatFor(m) {
      const { prof, len } = m.userData; m.updateMatrixWorld();
      const r = Math.round((prof.rows - 1) * seatRow);
      const local = new THREE.Vector3((r + 0.5) * prof.tread, prof.h0 + r * prof.riser + 1.32, (seatAlong - 0.5) * Math.max(0, len - 2));
      const pos = local.clone().applyMatrix4(m.matrixWorld);
      const look = new THREE.Vector3(pos.x * 0.12, 0.5, pos.z * 0.12);
      return { pos, look, row: r + 1, rows: prof.rows, baseYaw: Math.atan2(look.x - pos.x, look.z - pos.z), basePitch: Math.atan2(look.y - pos.y, Math.hypot(look.x - pos.x, look.z - pos.z)) };
    }
    function emptySeat(p) { // free the chosen seat (and the one next to it) so the view isn't blocked
      if (!crowd) return;
      hiddenSeats.forEach(([i, mb, mh]) => { crowd.body.setMatrixAt(i, mb); crowd.head.setMatrixAt(i, mh); }); hiddenSeats = [];
      const m4 = new THREE.Matrix4().makeScale(0, 0, 0);
      for (let i = 0; i < crowd.n; i++) {
        const dx = crowd.pos[i * 3] - p.x, dy = crowd.pos[i * 3 + 1] - (p.y - 1.32), dz = crowd.pos[i * 3 + 2] - p.z;
        if (dx * dx + dz * dz < 7.5 && dy < 0.3 && dy > -1.6) {
          const mb = new THREE.Matrix4(), mh = new THREE.Matrix4(); crowd.body.getMatrixAt(i, mb); crowd.head.getMatrixAt(i, mh); hiddenSeats.push([i, mb, mh]);
          crowd.body.setMatrixAt(i, m4); crowd.head.setMatrixAt(i, m4);
        }
      }
      crowd.body.instanceMatrix.needsUpdate = true; crowd.head.instanceMatrix.needsUpdate = true;
    }

    // ---------- picking & UI ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const panel = root.querySelector(".stadium-info");
    const tip = root.querySelector(".stadium-tip");
    const seatBtn = root.querySelector(".si-seat");
    const exitBtn = root.querySelector(".stadium-exit");
    const seatLabel = root.querySelector(".stadium-seatlabel");
    const sheet = root.querySelector(".stadium-sheet");
    const waveBtn = root.querySelector("[data-wave]");
    const soundBtn = root.querySelector("[data-sound]");
    let hovered = null, selected = null, matchIdx = 0;
    function pick(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object : null;
    }
    const NUM_LOC = { ru: "ru-RU", tr: "tr-TR", pt: "pt-BR" }[document.documentElement.lang] || "en-US";
    const priceNum = (k) => { const p = cfg.matches[matchIdx].prices || {}; return typeof p[k] === "number" && p[k] > 0 ? p[k] : null; };
    const priceOf = (k) => { const v = priceNum(k); return v ? `${v.toLocaleString(NUM_LOC)}${cfg.currency}` : T("عند الطلب"); };
    // number of tickets + estimated total in the info panel
    let qty = 1, lastPick = null;
    const qOut = root.querySelector(".si-n"), totalEl = root.querySelector(".si-total");
    function waHref(m) {
      const k = m.userData.cat, c = CAT[k], match = cfg.matches[matchIdx], v = priceNum(k);
      const total = v ? `${(v * qty).toLocaleString(NUM_LOC)}${cfg.currency}` : T("عند الطلب");
      const where = mode !== "orbit" && seat && m === selected ? `${m.userData.info} • ${T("الصف {0} تقريباً", [seat.row])}` : m.userData.info;
      return `https://wa.me/${cfg.wa}?text=${encodeURIComponent(T("مرحباً أويا، أرغب بتذاكر {0} ({1}) — {2}: {3}، كأس السوبر الإسباني 2027. عدد التذاكر: {4} — الإجمالي التقديري: {5}.", [c.label, where, match.stage, match.teams, qty, total]))}`;
    }
    function refreshTotal() {
      if (qOut) qOut.textContent = qty;
      if (!lastPick) return;
      const v = priceNum(lastPick.userData.cat);
      if (totalEl) totalEl.textContent = v ? `${(v * qty).toLocaleString(NUM_LOC)}${cfg.currency}` : T("عند الطلب");
      panel.querySelector(".si-wa").href = waHref(lastPick);
      syncForm(matchIdx, lastPick.userData.cat, qty);
      if (sheet) sheet.querySelector(".ss-wa").href = panel.querySelector(".si-wa").href;
    }
    root.querySelectorAll(".qty__b").forEach((b) => b.addEventListener("click", () => { qty = Math.min(10, Math.max(1, qty + Number(b.dataset.q))); refreshTotal(); }));
    // live prices from data/prices.json (edited from /admin/)
    if (window.oyaPrices) window.oyaPrices.then((db) => {
      const sc = db && db.superCup && db.superCup.matches; if (!sc) return;
      cfg.matches.forEach((m) => { if (sc[m.id]) m.prices = sc[m.id]; });
      if (db.currency && db.currency.symbol) cfg.currency = db.currency.symbol;
      root.querySelectorAll(".stadium-legend button").forEach((b) => { b.querySelector(".lg-price").textContent = priceOf(b.dataset.cat); });
      if (lastPick) { panel.querySelector(".si-price").textContent = priceOf(lastPick.userData.cat); refreshTotal(); }
    });
    function showInfo(m) {
      const k = m.userData.cat, c = CAT[k], match = cfg.matches[matchIdx];
      panel.querySelector(".si-dot").style.background = c.color;
      panel.querySelector(".si-cat").textContent = c.label;
      panel.querySelector(".si-where").textContent = m.userData.info;
      panel.querySelector(".si-desc").textContent = c.desc;
      panel.querySelector(".si-price").textContent = priceOf(k);
      lastPick = m; refreshTotal();
      panel.classList.add("is-on");
      if (sheet) {
        sheet.querySelector(".ss-dot").style.background = c.color;
        sheet.querySelector(".ss-cat").textContent = c.label;
        sheet.querySelector(".ss-where").textContent = m.userData.info;
        sheet.querySelector(".ss-wa").href = panel.querySelector(".si-wa").href;
        sheet.classList.add("is-on");
        // phones: make sure the stage (and this sheet) is not hidden below the sticky bar
        if (matchMedia("(max-width: 1023px)").matches) { const sr = stage.getBoundingClientRect(); if (sr.bottom > innerHeight - 76 || sr.top < 56) stage.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }
      }
      root.querySelectorAll(".stadium-legend button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === k ? "true" : "false"));
    }
    function select(m) {
      if (selected) selected.material = mats[selected.userData.cat];
      selected = m;
      if (m) { m.material = mats[m.userData.cat].clone(); m.material.emissiveIntensity = 0.9; showInfo(m); auto = false; }
      drawMap();
    }
    function enterSeat(m) {
      if (!m) return;
      select(m); seatAlong = 0.5; seat = seatFor(m); emptySeat(seat.pos);
      yaw = 0; pitchA = seat.basePitch;
      if (selected) selected.material = mats[selected.userData.cat]; // natural colours from the seat
      mode = "flying"; auto = false; root.classList.add("is-seat");
      const sr = stage.getBoundingClientRect();
      if (sr.top < 60 || sr.bottom > innerHeight) stage.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      seatText(m); seatUI(m);
      flyTo(seat.pos, seat.look, coarse ? 68 : 60, () => { mode = "seat"; exitBtn.focus({ preventScroll: true }); drawMap(); });
      wave(1.4); if (audio) audio.roar();
    }
    // move inside the chosen stand: row (front ↔ back) and position (along the stand); the view follows
    const pickUI = root.querySelector(".stadium-seatpick");
    const rowIn = pickUI && pickUI.querySelector("[data-seat-row]"), alongIn = pickUI && pickUI.querySelector("[data-seat-along]");
    const rowOut = pickUI && pickUI.querySelector(".sp-row");
    function seatText(m) {
      seatLabel.textContent = T("منظرك من: {0} — {1}", [CAT[m.userData.cat].label, m.userData.info]) + " • " + T("الصف {0}", [seat.row]);
      if (rowOut) rowOut.textContent = T("الصف {0} من {1}", [seat.row, seat.rows]);
      refreshTotal();
    }
    function seatUI(m) {
      if (!pickUI) return;
      rowIn.value = Math.round(seatRow * 100); alongIn.value = Math.round(seatAlong * 100);
      alongIn.closest("label").hidden = m.userData.slices > 0;
    }
    function reseat() {
      if (!selected || mode === "orbit") return;
      seat = seatFor(selected); emptySeat(seat.pos); seatText(selected);
      if (mode === "seat") { mode = "flying"; flyTo(seat.pos, seat.pos.clone().add(new THREE.Vector3(Math.sin(seat.baseYaw + yaw) * Math.cos(pitchA), Math.sin(pitchA), Math.cos(seat.baseYaw + yaw) * Math.cos(pitchA))), camera.fov, () => { mode = "seat"; drawMap(); }, { dur: 420, arc: false }); }
    }
    if (rowIn) {
      rowIn.addEventListener("input", () => { seatRow = rowIn.value / 100; reseat(); });
      alongIn.addEventListener("input", () => { seatAlong = alongIn.value / 100; reseat(); });
    }

    // ---------- minimap: the stadium from above, click a stand to choose it; "you are here" in the seat view ----------
    const mapEl = root.querySelector(".stadium-map");
    let mapScale = 1;
    function drawMap() {
      if (!mapEl) return;
      const ext = radiusMax - 150, S = 100 / ext; mapScale = S;
      const P = (v) => `${(v.x * S).toFixed(1)},${(v.z * S).toFixed(1)}`;
      let svg = `<rect x="${-52.5 * S}" y="${-34 * S}" width="${105 * S}" height="${68 * S}" rx="1.5" fill="#2f7d3a"/><line x1="0" y1="${-34 * S}" x2="0" y2="${34 * S}" stroke="rgba(255,255,255,.6)" stroke-width=".6"/><circle r="${9 * S}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".6"/>`;
      pickables.forEach((m, i) => {
        const { prof, len } = m.userData; m.updateMatrixWorld();
        const pts = [[0, -len / 2], [prof.depth, -len / 2], [prof.depth, len / 2], [0, len / 2]].map(([x, z]) => P(new THREE.Vector3(x, 0, z).applyMatrix4(m.matrixWorld))).join(" ");
        svg += `<polygon data-i="${i}" points="${pts}" fill="${CAT[m.userData.cat].color}"${m === selected ? ' class="is-sel"' : ""}/>`;
      });
      if (mode !== "orbit" && seat) svg += `<g class="sm-you" transform="translate(${(seat.pos.x * S).toFixed(1)} ${(seat.pos.z * S).toFixed(1)})"><path class="sm-cone" d="M0 0 L-9 -26 A27 27 0 0 1 9 -26 Z"/><circle r="3.2"/></g>`;
      mapEl.innerHTML = `<svg viewBox="-104 -104 208 208" aria-hidden="true">${svg}</svg>`;
      mapCone();
    }
    function mapCone() {
      const g = mapEl && mapEl.querySelector(".sm-you"); if (!g || !seat) return;
      const a = (seat.baseYaw + yaw) * 180 / Math.PI; // yaw 0 looks towards +z; the cone points to -y in the map
      g.setAttribute("transform", `translate(${(seat.pos.x * mapScale).toFixed(1)} ${(seat.pos.z * mapScale).toFixed(1)}) rotate(${(180 - a).toFixed(1)})`);
    }
    if (mapEl) mapEl.addEventListener("click", (e) => {
      const poly = e.target.closest("polygon"); if (!poly) return;
      const m = pickables[Number(poly.dataset.i)]; if (!m) return;
      if (mode === "seat") { if (selected) selected.material = mats[selected.userData.cat]; selected = m; showInfo(m); seat = seatFor(m); emptySeat(seat.pos); yaw = 0; pitchA = seat.basePitch; seatText(m); seatUI(m); mode = "flying"; flyTo(seat.pos, seat.look, camera.fov, () => { mode = "seat"; drawMap(); }, { dur: 900, arc: false }); }
      else { select(m); drawMap(); }
    });

    function exitSeat() {
      mode = "flying"; root.classList.remove("is-seat");
      az = -0.65; pol = 0.86; rad = 215;
      flyTo(orbitPos(), target.clone(), 42, () => { mode = "orbit"; if (selected) { selected.material = mats[selected.userData.cat].clone(); selected.material.emissiveIntensity = 0.9; } drawMap(); refreshTotal(); });
    }
    let waveUntil = 0;
    function wave(delay = 0) { if (reduce) return; setTimeout(() => { waveUntil = performance.now() + 9000; if (audio) audio.roar(); }, delay * 1000); }

    root.querySelectorAll(".stadium-legend button").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.cat; const m = pickables.find((p) => p.userData.cat === k && (p.userData.center || k === "cat3" || k === "cat2")) || pickables.find((p) => p.userData.cat === k);
      pickables.forEach((p) => { p.material = mats[p.userData.cat]; });
      pickables.filter((p) => p.userData.cat === k).forEach((p) => { p.material = mats[k].clone(); p.material.emissiveIntensity = 0.75; });
      if (m) { selected = m; showInfo(m); }
      drawMap();
    }));
    const sit = () => enterSeat(selected || pickables.find((p) => p.userData.cat === "vip"));
    if (seatBtn) seatBtn.addEventListener("click", sit);
    if (sheet) { sheet.querySelector(".ss-seat").addEventListener("click", sit); sheet.querySelector(".ss-close").addEventListener("click", () => { sheet.classList.remove("is-on"); select(null); panel.classList.remove("is-on"); }); }
    if (exitBtn) exitBtn.addEventListener("click", exitSeat);
    if (waveBtn) waveBtn.addEventListener("click", () => wave(0));
    const tabs = [...root.querySelectorAll(".stadium-tab")];
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
      matchIdx = i; selected = null; panel.classList.remove("is-on"); if (sheet) sheet.classList.remove("is-on");
      if (mode !== "orbit") { mode = "orbit"; root.classList.remove("is-seat"); camera.fov = 42; camera.updateProjectionMatrix(); }
      build(cfg.matches[i].venueModel, cfg.matches[i]); drawMap(); syncForm(i, null, qty);
      root.querySelector(".stadium-venue").textContent = `${cfg.matches[i].venue} • ${cfg.matches[i].capacity}`;
      root.querySelectorAll(".stadium-legend button").forEach((b) => { b.querySelector(".lg-price").textContent = priceOf(b.dataset.cat); });
      updateCam();
    }));

    // pointer: orbit (or look around from the seat), tap to pick, wheel/pinch to zoom
    const pts = new Map(); let moved = 0, pinch0 = 0, rad0 = rad, fov0 = 60;
    canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); moved = 0; auto = false; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); rad0 = rad; fov0 = camera.fov; } });
    canvas.addEventListener("pointermove", (e) => {
      if (pts.has(e.pointerId)) {
        const prev = pts.get(e.pointerId); pts.set(e.pointerId, e);
        if (pts.size === 2) {
          const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          if (mode === "seat") { camera.fov = Math.min(75, Math.max(28, fov0 * (pinch0 / d))); camera.updateProjectionMatrix(); }
          else rad = Math.min(radiusMax, Math.max(60, rad0 * (pinch0 / d)));
        } else if (mode === "seat") {
          yaw = Math.max(-1.6, Math.min(1.6, yaw - (e.clientX - prev.clientX) * 0.004));
          pitchA = Math.max(-0.75, Math.min(0.35, pitchA + (e.clientY - prev.clientY) * 0.003));
        } else if (mode === "orbit") { az -= (e.clientX - prev.clientX) * 0.006; if (e.pointerType !== "touch") pol = Math.min(1.32, Math.max(0.42, pol - (e.clientY - prev.clientY) * 0.004)); }
        moved += Math.abs(e.clientX - prev.clientX) + Math.abs(e.clientY - prev.clientY); updateCam();
      } else if (!coarse && mode === "orbit") {
        const m = pick(e.clientX, e.clientY);
        if (m !== hovered) { hovered = m; canvas.style.cursor = m ? "pointer" : "grab"; if (m) { tip.textContent = `${CAT[m.userData.cat].label} — ${m.userData.info}`; tip.classList.add("is-on"); } else tip.classList.remove("is-on"); }
        if (m) { const r = stage.getBoundingClientRect(); tip.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top - 14}px)`; }
      }
    });
    const up = (e) => { pts.delete(e.pointerId); if (moved < 6 && e.type === "pointerup" && mode === "orbit") { const m = pick(e.clientX, e.clientY); select(m); } };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    const zoom = (dir) => {
      auto = false;
      if (mode === "seat") { camera.fov = Math.min(75, Math.max(28, camera.fov * (1 + dir * 0.08))); camera.updateProjectionMatrix(); }
      else if (mode === "orbit") { rad = Math.min(radiusMax, Math.max(60, rad * (1 + dir * 0.1))); updateCam(); }
    };
    canvas.addEventListener("wheel", (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); zoom(Math.sign(e.deltaY)); }, { passive: false });
    root.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => zoom(b.dataset.zoom === "in" ? -1 : 1)));
    root.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.view; auto = false;
      if (mode !== "orbit") { root.classList.remove("is-seat"); }
      if (v === "main") { az = 0.0; pol = 1.28; rad = 80; } else if (v === "goal") { az = Math.PI / 2; pol = 1.24; rad = 92; } else { az = -0.65; pol = 0.5; rad = 230; }
      mode = "flying"; flyTo(orbitPos(), target.clone(), 42, () => { mode = "orbit"; updateCam(); });
    }));
    canvas.addEventListener("keydown", (e) => { if (e.key === "Escape" && mode === "seat") exitSeat(); });

    // ---------- optional crowd ambience (Web Audio, synthesized: no file to download) ----------
    let audio = null;
    if (soundBtn) soundBtn.addEventListener("click", () => {
      if (!audio) audio = crowdAudio();
      const on = soundBtn.getAttribute("aria-pressed") !== "true";
      soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
      soundBtn.setAttribute("aria-label", on ? T("إيقاف صوت المدرجات") : T("تشغيل صوت المدرجات"));
      on ? audio.on() : audio.off();
    });

    // ---------- render loop (only while visible) ----------
    let onScreen = true, visible = true, raf = 0, last = performance.now(), skip = false;
    const soundOn = () => audio && soundBtn.getAttribute("aria-pressed") === "true";
    const sync = () => { visible = onScreen && !document.hidden; if (soundOn()) { visible ? audio.on() : audio.off(true); } kick(); };
    new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; document.documentElement.classList.toggle("stadium-on", onScreen); sync(); }, { threshold: 0.05 }).observe(stage);
    document.addEventListener("visibilitychange", sync);
    function frame(now) {
      raf = 0; if (!visible) return;
      raf = requestAnimationFrame(frame);
      if (coarse && (skip = !skip)) return; // ~30 fps on phones
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      U.time.value += dt;
      U.wave.value += ((now < waveUntil ? 1 : 0) - U.wave.value) * Math.min(1, dt * 2.5);
      if (!reduce) { boards.forEach((t) => { t.offset.x = (t.offset.x + dt * 0.035) % 1; }); movePlayers(U.time.value); }
      if (fly) {
        const t = Math.min(1, (now - fly.t0) / fly.dur), k = ease(t);
        const p = fly.fromPos.clone().lerp(fly.toPos, k); p.y += Math.sin(Math.PI * k) * (mode === "flying" && fly.arc ? 22 : 0);
        camera.position.copy(p); camera.lookAt(fly.fromLook.clone().lerp(fly.toLook, k));
        camera.fov = fly.fromFov + (fly.toFov - fly.fromFov) * k; camera.updateProjectionMatrix();
        if (t >= 1) { const d = fly.done; fly = null; d && d(); updateCam(); }
      } else if (auto && mode === "orbit") { az += dt * 0.11; updateCam(); }
      renderer.render(scene, camera);
    }
    function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    build(cfg.matches[0].venueModel, cfg.matches[0]);
    resize(); updateCam(); drawMap(); kick();
    canvas.tabIndex = -1;
    root.classList.remove("is-loading"); root.classList.add("is-ready");
    // carry over what the visitor already chose in lite mode
    qty = lite.qty; if (lite.idx && tabs[lite.idx]) tabs[lite.idx].click();
    if (lite.cat) { const lb = root.querySelector(`.stadium-legend button[data-cat="${lite.cat}"]`); if (lb) lb.click(); } else refreshTotal();
    if (!reduce) setTimeout(() => wave(0), 1800);
    window.__oyaStadium = { enterSeat: (cat) => enterSeat(pickables.find((p) => p.userData.cat === cat && p.userData.center) || pickables.find((p) => p.userData.cat === cat)), wave }; // used by tests
  }
}

/* ---------- helpers ---------- */
function makePitchTexture(THREE) {
  const W = 1220, H = 840, s = 10;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? "#2f7d3a" : "#2a7134"; g.fillRect(i * (W / 18), 0, W / 18 + 1, H); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.04})`; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  g.strokeStyle = "rgba(255,255,255,.92)"; g.lineWidth = 2.4;
  const ox = ((122 - 105) / 2) * s, oy = ((84 - 68) / 2) * s, L = 105 * s, Wd = 68 * s;
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
  for (const [cx, cy] of [[ox, oy], [ox + L, oy], [ox, oy + Wd], [ox + L, oy + Wd]]) { g.beginPath(); g.arc(cx, cy, 1 * s, 0, Math.PI * 2); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function addGoals(THREE, scene) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const netM = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, wireframe: true });
  for (const sx of [-1, 1]) {
    const x = sx * 52.5;
    for (const z of [-3.66, 3.66]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.44, 8), m); p.position.set(x, 1.22, z); scene.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.32, 8), m); bar.rotation.x = Math.PI / 2; bar.position.set(x, 2.44, 0); scene.add(bar);
    const net = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32, 6, 8, 18), netM); net.position.set(x + sx * 1, 1.22, 0); scene.add(net);
    for (const z of [-34, 34]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), m); f.position.set(x, 0.75, z); scene.add(f); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ color: 0xed5404, side: THREE.DoubleSide })); fl.position.set(x + 0.25 * -sx, 1.35, z); scene.add(fl); }
  }
}
function radialTexture(THREE) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.18, "rgba(255,246,224,.85)"); r.addColorStop(0.45, "rgba(255,236,200,.22)"); r.addColorStop(1, "rgba(255,236,200,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const TT = (() => { try { return JSON.parse(document.getElementById("oya-t")?.textContent || "{}"); } catch { return {}; } })();
const T = (s, a) => { const r = TT[s] || s; return a ? r.replace(/\{(\d+)\}/g, (m, i) => a[i]) : r; };
function ledTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 48;
  const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, 48); bg.addColorStop(0, "#0b1d36"); bg.addColorStop(1, "#06111f");
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 48);
  g.font = "700 26px 'Readex Pro', 'Segoe UI', Tahoma, sans-serif"; g.textBaseline = "middle"; g.direction = "rtl";
  const parts = [["OYA TOURISM", "#ED5404"], [T("كل رحلة… حكاية"), "#ffffff"], ["ISTANBUL 2027", "#FF8A4C"], [T("أويا للسياحة"), "#ffffff"]];
  let x = 1000;
  for (const [txt, col] of parts) { g.fillStyle = col; g.textAlign = "right"; g.fillText(txt, x, 25); x -= g.measureText(txt).width + 36; g.fillStyle = "#4F8BC9"; g.fillText("•", x + 18, 25); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
function screenTexture(THREE, match) {
  const c = document.createElement("canvas"); c.width = 768; c.height = 288;
  const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 768, 288); bg.addColorStop(0, "#0a1f3a"); bg.addColorStop(1, "#19487e");
  g.fillStyle = bg; g.fillRect(0, 0, 768, 288);
  g.fillStyle = "#ED5404"; g.fillRect(0, 0, 768, 10);
  g.direction = "rtl"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#FF8A4C"; g.font = "700 30px 'Readex Pro', Tahoma, sans-serif"; g.fillText(match ? match.stage : T("كأس السوبر الإسباني 2027"), 384, 62);
  g.fillStyle = "#ffffff"; g.font = "800 56px 'Alexandria', 'Readex Pro', Tahoma, sans-serif"; g.fillText(match ? match.teams : "", 384, 150);
  g.fillStyle = "#B9CCE0"; g.font = "500 26px 'Readex Pro', Tahoma, sans-serif"; g.fillText(T("إسطنبول • فبراير 2027 • أويا للسياحة"), 384, 232);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Synthesized stadium ambience: low crowd murmur + slow swells + rhythmic claps; roar() for big moments
function crowdAudio() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return { on() {}, off() {}, roar() {} };
  const ac = new AC(), master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const len = ac.sampleRate * 4, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let b = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = (b + 0.035 * w) / 1.035; d[i] = b * 3.2 + w * 0.06; } }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 650; bp.Q.value = 0.55;
  const body = ac.createGain(); body.gain.value = 0.55;
  const lfo = ac.createOscillator(), lfoG = ac.createGain(); lfo.frequency.value = 0.11; lfoG.gain.value = 0.16; lfo.connect(lfoG).connect(body.gain);
  src.connect(bp).connect(body).connect(master); src.start(); lfo.start();
  let clapT = 0;
  function claps() { // "clap — clap — clap" bursts every few seconds
    const now = ac.currentTime; if (now < clapT) return; clapT = now + 6 + Math.random() * 6;
    for (let i = 0; i < 6; i++) {
      const s = ac.createBufferSource(); s.buffer = buf; const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1400;
      const g = ac.createGain(); const t = now + 0.2 + i * 0.52; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      s.connect(hp).connect(g).connect(master); s.start(t, Math.random() * 3, 0.15);
    }
  }
  const timer = setInterval(() => { if (master.gain.value > 0.01) claps(); }, 1000);
  return {
    on() { ac.resume(); master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.8); },
    off(soft) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + (soft ? 0.3 : 0.6)); setTimeout(() => { if (master.gain.value < 0.02) ac.suspend(); }, 900); },
    roar() { const t = ac.currentTime; bp.frequency.cancelScheduledValues(t); bp.frequency.linearRampToValueAtTime(1150, t + 0.6); bp.frequency.linearRampToValueAtTime(650, t + 3.5); body.gain.cancelScheduledValues(t); body.gain.linearRampToValueAtTime(1.1, t + 0.6); body.gain.linearRampToValueAtTime(0.55, t + 3.8); },
    destroy() { clearInterval(timer); ac.close(); },
  };
}
