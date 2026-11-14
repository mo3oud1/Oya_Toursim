// Round country flags for the visa cards (inline SVG, 60×60 square crops, no external images)
const zig = (x0, x1, n, h = 60) => { let p = `0,0 ${x0},0`; const s = h / n; for (let i = 0; i < n; i++) p += ` ${x1},${(i + .5) * s} ${x0},${(i + 1) * s}`; return p + ` 0,${h}`; };
const star = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .4 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join(" ");
const leafR = [[0,-1],[.13,-.74],[.27,-.82],[.22,-.38],[.42,-.6],[.47,-.47],[.68,-.55],[.6,-.3],[.75,-.25],[.43,.03],[.5,.16],[.06,.11],[.06,.48]];
const leaf = (cx, cy, s) => [...leafR, ...leafR.slice().reverse().map(([x, y]) => [-x, y])].map(([x, y]) => `${(cx + x * s).toFixed(1)},${(cy + y * s).toFixed(1)}`).join(" ");
export const FLAG = {
  SA: `<rect width="60" height="60" fill="#006c35"/><path d="M14 24c4-3 6 2 9-1s5 2 8-1 5 2 9-1 4 1 6-1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M15 38h28l3-2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M15 36v4" stroke="#fff" stroke-width="2"/>`,
  AE: `<rect width="60" height="20" fill="#00732f"/><rect y="20" width="60" height="20" fill="#fff"/><rect y="40" width="60" height="20" fill="#000"/><rect width="18" height="60" fill="#ef3340"/>`,
  QA: `<rect width="60" height="60" fill="#8a1538"/><polygon points="${zig(17, 25, 9)}" fill="#fff"/>`,
  BH: `<rect width="60" height="60" fill="#ce1126"/><polygon points="${zig(18, 28, 5)}" fill="#fff"/>`,
  KW: `<rect width="60" height="20" fill="#007a3d"/><rect y="20" width="60" height="20" fill="#fff"/><rect y="40" width="60" height="20" fill="#ce1126"/><polygon points="0,0 17,20 17,40 0,60" fill="#000"/>`,
  OM: `<rect width="60" height="60" fill="#db161b"/><rect x="19" width="41" height="20" fill="#fff"/><rect x="19" y="40" width="41" height="20" fill="#008000"/><path d="M6 8l7 7M13 8l-7 7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="9.5" cy="11.5" r="2.2" fill="#fff"/>`,
  EU: `<rect width="60" height="60" fill="#003399"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<polygon points="${star(30 + 17 * Math.sin(a), 30 - 17 * Math.cos(a), 3.6)}" fill="#ffcc00"/>`; }).join("")}`,
  UK: `<svg viewBox="15 0 30 30" width="60" height="60"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" stroke-width="2"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>`,
  US: `${Array.from({ length: 13 }, (_, i) => `<rect y="${(i * 60 / 13).toFixed(2)}" width="60" height="${(60 / 13 + .05).toFixed(2)}" fill="${i % 2 ? "#fff" : "#b22234"}"/>`).join("")}<rect width="30" height="32.3" fill="#3c3b6e"/>${Array.from({ length: 20 }, (_, i) => `<circle cx="${4 + (i % 5) * 5.5 + (Math.floor(i / 5) % 2) * 2.75}" cy="${4.5 + Math.floor(i / 5) * 7.5}" r="1.2" fill="#fff"/>`).join("")}`,
  CA: `<rect width="60" height="60" fill="#fff"/><rect width="12" height="60" fill="#d80621"/><rect x="48" width="12" height="60" fill="#d80621"/><polygon points="${leaf(30, 30, 15)}" fill="#d80621"/>`,
};
FLAG.GCC = ["SA", "AE", "QA", "KW", "BH", "OM"].map((c, i) => `<svg x="${(i % 3) * 20}" y="${Math.floor(i / 3) * 30}" width="20" height="30" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">${FLAG[c]}</svg>`).join("") + `<path d="M20 0v60M40 0v60M0 30h60" stroke="#fff" stroke-width="1.5"/>`;
export const flag = (code) => FLAG[code] ? `<svg class="flag" viewBox="0 0 60 60" aria-hidden="true" focusable="false">${FLAG[code]}</svg>` : "";
