/* OYA — realistic interactive Earth (three.js, MIT; NASA Blue Marble / Black Marble imagery, public domain).
   Day side, city lights on the night side, sun glint on the oceans, clouds, atmosphere,
   and animated flight routes from Istanbul. Lazy: loads only near the viewport, renders only while
   visible and moving, smaller textures on phones, no auto-spin for reduced-motion users. */
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
  let api = null;

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
    if (api) api.focus(id);
  }
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
    const g = t.dataset.group; let firstId = null;
    chips.forEach((c) => { const on = c.dataset.g === g; c.hidden = !on; if (on && !firstId) firstId = c.dataset.id; });
    if (firstId) select(firstId, true);
  }));
  chips.forEach((c) => c.addEventListener("click", () => select(c.dataset.id, true)));

  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); init(); } }, { rootMargin: "300px" });
  io.observe(section);

  async function init() {
    let THREE;
    try { THREE = await import("./vendor/three.module.min.js"); } catch (e) { return; }
    const canvas = section.querySelector(".globe-canvas");
    const mobile = matchMedia("(max-width: 700px)").matches;
    const tex = (n) => `${root}assets/img/earth/${n}`;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // textures are used as-is (already display-ready)

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const FAR = 4.75, NEAR = 4.25; // camera distance: world view vs. Turkey close-up
    camera.position.set(0, 0, FAR);

    const load = (url) => new Promise((res) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; res(t); }, undefined, () => res(null)));
    const [day, night, water, clouds] = await Promise.all([
      load(tex(mobile ? "day-1024.webp" : "day-2048.webp")), load(tex(mobile ? "night-1024.webp" : "night-2048.webp")),
      load(tex("water-1024.webp")), load(tex("clouds-1024.jpg")),
    ]);
    if (!day) return;

    const sun = new THREE.Vector3(-0.8, 0.3, 0.52).normalize(); // light from the upper-left front: dusk line on the right limb
    const seg = mobile ? 72 : 112;
    const tilt = new THREE.Group(), spin = new THREE.Group();
    tilt.add(spin); scene.add(tilt);

    const earthMat = new THREE.ShaderMaterial({
      uniforms: { dayMap: { value: day }, nightMap: { value: night || day }, specMap: { value: water || day }, sunDir: { value: sun } },
      vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `uniform sampler2D dayMap,nightMap,specMap; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vec3 n=normalize(vN); float d=dot(n,sunDir); float dm=smoothstep(-0.16,0.24,d);
          vec3 dayc=texture2D(dayMap,vUv).rgb; vec3 lights=texture2D(nightMap,vUv).rgb;
          vec3 lit=dayc*(0.18+1.05*max(d,0.0));
          vec3 nightc=lights*vec3(1.0,0.74,0.42)*1.9+dayc*0.035;
          vec3 col=mix(nightc,lit,dm);
          float w=texture2D(specMap,vUv).r; vec3 h=normalize(sunDir+vV);
          col+=vec3(1.0,0.9,0.75)*pow(max(dot(n,h),0.0),48.0)*w*0.55*dm;
          float f=pow(1.0-max(dot(n,vV),0.0),2.6); col+=vec3(0.32,0.58,1.0)*f*(0.25+0.75*dm)*0.9;
          gl_FragColor=vec4(col,1.0); }`,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg / 2), earthMat);
    spin.add(earth);

    let cloudMesh = null;
    if (clouds) {
      cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.012, seg, seg / 2), new THREE.ShaderMaterial({
        uniforms: { map: { value: clouds }, sunDir: { value: sun } }, transparent: true, depthWrite: false,
        vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform sampler2D map; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN;
          void main(){ float a=texture2D(map,vUv).r; float d=dot(normalize(vN),sunDir); float dm=smoothstep(-0.2,0.3,d);
            gl_FragColor=vec4(vec3(1.0)*(0.08+0.92*dm),a*(0.18+0.62*dm)); }`,
      }));
      spin.add(cloudMesh);
    }

    // atmosphere: soft blue glow hugging the limb, fading outward (classic back-side fresnel)
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.13, 64, 32), new THREE.ShaderMaterial({
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vN; void main(){ float i=pow(clamp(0.66+dot(vN,vec3(0.0,0.0,1.0)),0.0,1.0),4.0); gl_FragColor=vec4(0.32,0.62,1.0,1.0)*i*1.6; }`,
    })));

    // lat/lng → position on the sphere, matching the equirectangular texture of SphereGeometry
    const toVec = (lat, lng, r = 1) => {
      const phi = ((lng + 180) / 360) * Math.PI * 2, th = ((90 - lat) / 180) * Math.PI;
      return new THREE.Vector3(-Math.cos(phi) * Math.sin(th) * r, Math.cos(th) * r, Math.sin(phi) * Math.sin(th) * r);
    };
    const IST = [41.0082, 28.9784];

    // markers
    const dotGeo = new THREE.SphereGeometry(1, 16, 12);
    const markers = {};
    const mk = (id, loc, color, s) => {
      const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }));
      m.position.copy(toVec(loc[0], loc[1], 1.004)); m.scale.setScalar(s); m.userData.id = id; spin.add(m); return m;
    };
    places.forEach((p) => { markers[p.id] = mk(p.id, p.loc, 0xffd9b0, 0.011); });
    const ist = mk("__ist", IST, 0xffffff, 0.016);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.35, 40), new THREE.MeshBasicMaterial({ color: 0xff8a4c, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    spin.add(ring);
    const placeRing = (loc) => { const v = toVec(loc[0], loc[1], 1.006); ring.position.copy(v); ring.lookAt(v.clone().multiplyScalar(2)); };

    // flight routes from Istanbul (great-circle arcs with a travelling light)
    const arcMat = (sel) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { t: { value: Math.random() }, sel: { value: sel ? 1 : 0 } },
      vertexShader: `varying float vU; void main(){ vU=uv.x; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float t; uniform float sel; varying float vU;
        void main(){ float head=fract(t); float dist=head-vU; float trail=dist>0.0?exp(-dist*9.0):0.0;
          vec3 base=mix(vec3(0.55,0.75,1.0),vec3(1.0,0.55,0.25),sel); float a=mix(0.16,0.42,sel)+trail*mix(0.6,1.0,sel);
          gl_FragColor=vec4(mix(base,vec3(1.0,0.95,0.85),trail*0.6),a); }`,
    });
    const arcs = {};
    const a0 = toVec(IST[0], IST[1]);
    places.filter((p) => p.g !== "tr").forEach((p) => {
      const b = toVec(p.loc[0], p.loc[1]); const ang = a0.angleTo(b); const hgt = 0.06 + ang * 0.22;
      const pts = []; for (let i = 0; i <= 64; i++) { const t = i / 64; const v = new THREE.Vector3().copy(a0).lerp(b, t).normalize(); v.multiplyScalar(1 + Math.sin(Math.PI * t) * hgt); pts.push(v); }
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.0026, 6, false), arcMat(false));
      mesh.userData.speed = 0.12 + Math.random() * 0.08; spin.add(mesh); arcs[p.id] = mesh;
    });

    // orientation helpers: spin brings a longitude to the front, tilt brings its latitude to the centre
    const target = { spin: 0, tilt: 0.3, dist: FAR }; let selected = places[0].id, idle = true;
    const anglesFor = (loc) => { const v = toVec(loc[0], loc[1]); return { spin: -Math.atan2(v.x, v.z), tilt: (loc[0] * Math.PI) / 180 * 0.85 }; };
    const start = anglesFor(IST); spin.rotation.y = start.spin + 0.9; tilt.rotation.x = 0.3;

    api = {
      focus(id) {
        const p = byId[id]; if (!p) return;
        if (markers[selected]) { markers[selected].material.color.set(0xffd9b0); markers[selected].scale.setScalar(0.011); }
        if (arcs[selected]) arcs[selected].material.uniforms.sel.value = 0;
        selected = id;
        markers[id].material.color.set(0xff8a4c); markers[id].scale.setScalar(0.02);
        if (arcs[id]) arcs[id].material.uniforms.sel.value = 1;
        placeRing(p.loc);
        const a = anglesFor(p.g === "tr" ? [(p.loc[0] + IST[0]) / 2, (p.loc[1] + IST[1]) / 2] : [(p.loc[0] + IST[0]) / 2, (p.loc[1] + IST[1]) / 2]);
        const tau = Math.PI * 2; const cur = spin.rotation.y;
        target.spin = cur + ((((a.spin - cur) % tau) + tau + Math.PI) % tau - Math.PI);
        target.tilt = a.tilt; target.dist = p.g === "tr" ? NEAR : FAR; idle = false; kick();
      },
    };

    function resize() {
      const w = canvas.clientWidth || 560, h = canvas.clientHeight || w;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize(); addEventListener("resize", () => { resize(); kick(); }, { passive: true });

    // interaction: drag to rotate, inertia; tap a marker to select it
    let drag = null, vel = 0, touched = false, visible = true, raf = 0, last = performance.now();
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, s: spin.rotation.y, t: tilt.rotation.x, moved: 0 }; vel = 0; touched = true; idle = false; canvas.setPointerCapture(e.pointerId); canvas.classList.add("is-drag"); kick(); });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return; const dx = (e.clientX - drag.x) / 170, dy = (e.clientY - drag.y) / 220;
      drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y));
      const ns = drag.s + dx; vel = ns - spin.rotation.y; spin.rotation.y = ns; target.spin = ns;
      tilt.rotation.x = target.tilt = Math.max(-1.1, Math.min(1.1, drag.t + dy));
    });
    const end = (e) => {
      if (!drag) return; const tap = drag.moved < 6; drag = null; canvas.classList.remove("is-drag");
      if (tap && e && e.clientX !== undefined) {
        const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(Object.values(markers), false)[0];
        if (hit) { const id = hit.object.userData.id; const chip = chips.find((c) => c.dataset.id === id); if (chip && chip.hidden) { const tab = tabs.find((t) => t.dataset.group === chip.dataset.g); if (tab) tab.click(); } select(id, true); }
      }
      kick();
    };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", () => end());

    function frame(now) {
      raf = 0; if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      let moving = !!drag;
      if (!drag) {
        if (Math.abs(vel) > 0.0004) { spin.rotation.y += vel; target.spin = spin.rotation.y; vel *= 0.93; moving = true; }
        else if (idle && !touched && !reduce) { spin.rotation.y += dt * 0.06; target.spin = spin.rotation.y; moving = true; }
        const ds = target.spin - spin.rotation.y, dtl = target.tilt - tilt.rotation.x, dd = target.dist - camera.position.z;
        if (Math.abs(ds) + Math.abs(dtl) + Math.abs(dd) > 0.0008) { spin.rotation.y += ds * 0.07; tilt.rotation.x += dtl * 0.07; camera.position.z += dd * 0.06; moving = true; }
      }
      if (cloudMesh && !reduce) cloudMesh.rotation.y += dt * 0.012;
      if (!reduce) { Object.values(arcs).forEach((m) => { m.material.uniforms.t.value += dt * m.userData.speed; }); ring.scale.setScalar(0.024 + Math.sin(now / 380) * 0.004); moving = true; }
      else ring.scale.setScalar(0.024);
      renderer.render(scene, camera);
      if (moving) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(canvas);
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; kick(); });

    section.classList.add("globe-ready");
    select(selected, false);
    kick();
  }
}
