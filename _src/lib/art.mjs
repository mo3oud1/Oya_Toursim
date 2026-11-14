// Procedural Istanbul skyline + flight path for the home hero (pure SVG, ~6KB)
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const f = (n) => Math.round(n * 10) / 10;

function minaret(x, base, top, w = 7) {
  const bal1 = top + (base - top) * 0.32, bal2 = top + (base - top) * 0.55;
  return `M${f(x - w / 2)} ${base}V${f(top + 18)}L${f(x)} ${f(top)}L${f(x + w / 2)} ${f(top + 18)}V${base}Z` +
    `M${f(x - w)} ${f(bal1)}h${f(w * 2)}v3.5h${f(-w * 2)}Z` + (base - top > 120 ? `M${f(x - w)} ${f(bal2)}h${f(w * 2)}v3.5h${f(-w * 2)}Z` : "");
}
function dome(cx, y, rx, ry, finial = true) {
  return `M${f(cx - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(y)}Z` + (finial ? `M${f(cx - 1.2)} ${f(y - ry)}h2.4v${f(-Math.max(8, ry * 0.35))}h-2.4Z` : "");
}
const rect = (x, y, w, h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;

function houses(x0, x1, base, minH, maxH, lights) {
  let d = "", x = x0;
  while (x < x1) {
    const w = 18 + rnd() * 34, h = minH + rnd() * (maxH - minH);
    d += rect(x, base - h, w, h);
    if (rnd() > 0.55) d += `M${f(x - 2)} ${f(base - h)}L${f(x + w / 2)} ${f(base - h - 10 - rnd() * 8)}L${f(x + w + 2)} ${f(base - h)}Z`;
    // windows
    for (let wy = base - h + 8; wy < base - 10; wy += 13) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9) if (rnd() > 0.72) lights.push(rect(wx, wy, 3.4, 4.6));
    }
    x += w + 1 + rnd() * 4;
  }
  return d;
}
function cypress(x, base, h) { return `M${f(x)} ${f(base - h)}C${f(x + 7)} ${f(base - h * 0.6)} ${f(x + 7)} ${f(base - h * 0.2)} ${f(x + 1)} ${base}H${f(x - 1)}C${f(x - 7)} ${f(base - h * 0.2)} ${f(x - 7)} ${f(base - h * 0.6)} ${f(x)} ${f(base - h)}Z`; }

export function skylineNear() {
  seed = 11;
  const B = 260; const lights = [];
  let d = rect(0, 236, 1440, 24);
  d += houses(0, 205, 240, 26, 62, lights);
  // Hagia Sophia
  d += rect(250, 196, 140, 44) + rect(230, 212, 180, 28);
  d += dome(320, 196, 60, 40) + dome(262, 212, 26, 16, false) + dome(378, 212, 26, 16, false);
  d += rect(268, 186, 104, 10);
  d += minaret(226, 236, 74) + minaret(414, 236, 74) + minaret(246, 236, 92, 6.5) + minaret(394, 236, 92, 6.5);
  d += houses(432, 600, 240, 22, 54, lights);
  d += cypress(612, 240, 54) + cypress(626, 240, 44);
  // Blue Mosque (Sultan Ahmed)
  d += rect(650, 200, 220, 40) + rect(700, 170, 120, 30);
  d += dome(760, 170, 56, 44) + dome(705, 186, 30, 22, false) + dome(815, 186, 30, 22, false) + dome(676, 200, 16, 12, false) + dome(844, 200, 16, 12, false);
  d += minaret(636, 236, 52) + minaret(884, 236, 52) + minaret(662, 236, 74, 6.5) + minaret(858, 236, 74, 6.5) + minaret(604, 236, 96, 6) + minaret(916, 236, 96, 6);
  d += houses(930, 1092, 240, 24, 66, lights);
  // Galata tower
  d += `M1112 240L1115 128H1145L1148 240Z` + rect(1106, 120, 48, 9) + `M1104 120L1130 66L1156 120Z` + rect(1128.6, 56, 2.8, 12);
  d += houses(1162, 1240, 240, 24, 52, lights);
  // Bosphorus bridge
  const bridge = `<path d="M1262 236V112h12v124zM1428 236V112h12v124z"/><path d="M1268 116C1320 200 1380 200 1434 116" fill="none" stroke="currentColor" stroke-width="3"/><path d="M1240 214H1440v6H1240z"/><path d="M1290 160V214M1310 180V214M1330 190V214M1350 194V214M1370 194V214M1390 188V214M1410 172V214" stroke="currentColor" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 1440 ${B}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><g fill="currentColor"><path d="${d}"/>${bridge}</g><path class="window-lights" d="${lights.join("")}"/></svg>`;
}

export function skylineFar() {
  seed = 97;
  const lights = [];
  let d = `M0 210C120 190 240 196 360 184S600 170 720 182 960 196 1080 176 1320 150 1440 170V260H0Z`;
  d += houses(0, 420, 214, 18, 46, lights);
  // Süleymaniye
  d += rect(460, 172, 130, 40) + dome(525, 172, 48, 36) + dome(478, 184, 20, 14, false) + dome(572, 184, 20, 14, false);
  d += minaret(446, 212, 70, 5.5) + minaret(604, 212, 70, 5.5) + minaret(466, 212, 92, 5) + minaret(584, 212, 92, 5);
  d += houses(620, 960, 206, 16, 42, lights);
  // Yeni Cami
  d += rect(980, 168, 90, 30) + dome(1025, 168, 34, 26) + minaret(970, 198, 92, 5) + minaret(1080, 198, 92, 5);
  d += houses(1090, 1250, 196, 14, 38, lights);
  // Çamlıca on the hill
  d += rect(1290, 130, 90, 26) + dome(1335, 130, 34, 28) + minaret(1272, 156, 40, 5) + minaret(1398, 156, 40, 5) + minaret(1286, 156, 58, 4.5) + minaret(1384, 156, 58, 4.5);
  return `<svg viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/><path class="window-lights" style="opacity:.45" d="${lights.join("")}"/></svg>`;
}

// Hero airliner: rises out of the photo side, recedes into the sky and fades; its contrail draws behind it and
// dissolves, then the flight repeats (15 s cycle). Stays on the photo side (left in RTL, mirrored for LTR in CSS)
// so it never crosses the headline; hidden for reduced motion and on phones.
export function flightSvg() {
  const p = "M-80 610 C 140 550 330 440 560 250";
  // 15 s loop: wait 0.6 s → fly 5.4 s → contrail dissolves → rest
  const t = 'dur="15s" begin="0.6s" repeatCount="1" fill="freeze"'; // one flight per visit
  // top-view airliner (nose towards +x)
  const plane = "M30 0 C30 -1.6 28.4 -2.6 26 -2.6 L9 -2.6 L-3 -17 L-8 -17 L1 -2.6 L-13 -2.6 L-18 -8 L-21.5 -8 L-18.5 0 L-21.5 8 L-18 8 L-13 2.6 L1 2.6 L-8 17 L-3 17 L9 2.6 L26 2.6 C28.4 2.6 30 1.6 30 0 Z";
  return `<svg class="hero__flight" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs><linearGradient id="hero-trail" gradientUnits="userSpaceOnUse" x1="-80" y1="610" x2="560" y2="250"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient></defs>
  <path class="flight-trail" pathLength="1" d="${p}" stroke="url(#hero-trail)" stroke-dasharray="1 1" stroke-dashoffset="1" opacity="0">
    <animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;0.001;0.36;1" calcMode="spline" keySplines="0 0 1 1;.45 .05 .55 .95;0 0 1 1" ${t}/>
    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.36;0.56;1" ${t}/>
    <animate attributeName="stroke-width" values="2.4;2.4;2.4;9;9" keyTimes="0;0.02;0.36;0.56;1" ${t}/>
  </path>
  <g class="flight-plane" opacity="0">
    <animateMotion ${t} rotate="auto" keyPoints="0;0;1;1" keyTimes="0;0.001;0.36;1" calcMode="spline" keySplines="0 0 1 1;.45 .05 .55 .95;0 0 1 1"><mpath href="#hero-fp"/></animateMotion>
    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.3;0.37;1" ${t}/>
    <g><animateTransform attributeName="transform" type="scale" values="1.15;1.15;0.42;0.42" keyTimes="0;0.001;0.36;1" ${t}/><path d="${plane}"/></g>
  </g>
  <path id="hero-fp" d="${p}" fill="none"/>
</svg>`;
}
