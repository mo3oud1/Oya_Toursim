// Dev tool: generates favicons, app icons and Open Graph images from the logo SVGs.
// Run: NODE_PATH=$(npm root -g) node _src/tools/make-brand-assets.cjs   (needs Playwright + Chromium)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const R = path.resolve(__dirname, "../..");
const B = (f) => path.join(R, "assets/img/brand", f);
const inner = (f) => { const s = fs.readFileSync(B(f), "utf8"); const vb = s.match(/viewBox="([^"]+)"/)[1]; return { vb, body: s.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "") }; };
const mw = inner("oya-mark-white.svg"), mc = inner("oya-mark.svg");
// favicon.svg (navy rounded square + white mark)
fs.writeFileSync(path.join(R, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0A1F3A"/><svg x="6" y="13" width="52" height="38" viewBox="${mw.vb}">${mw.body}</svg></svg>`);
const fontCss = `@font-face{font-family:A;src:url(file://${R}/assets/fonts/alexandria-arabic.woff2)}@font-face{font-family:A;src:url(file://${R}/assets/fonts/alexandria-latin.woff2);unicode-range:U+0000-00FF}@font-face{font-family:Rx;src:url(file://${R}/assets/fonts/readex-arabic.woff2)}`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (html, w, h, out) => {
    await p.setViewportSize({ width: w, height: h });
    const tmp = path.join(R, "_src/tools/.tmp.html");
    fs.writeFileSync(tmp, `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>${fontCss}*{margin:0;box-sizing:border-box}body{width:${w}px;height:${h}px;overflow:hidden}</style></head><body>${html}</body></html>`);
    await p.goto("file://" + tmp); await p.waitForTimeout(400);
    await p.screenshot({ path: out, omitBackground: false }); fs.unlinkSync(tmp);
  };
  const icon = (s, pad, rx) => `<div style="width:${s}px;height:${s}px;border-radius:${rx}px;background:radial-gradient(120% 90% at 80% 110%,rgba(237,84,4,.5),transparent 55%),linear-gradient(160deg,#0F2C52,#061428);display:grid;place-items:center"><img src="file://${B("oya-mark-white.svg")}" style="width:${s - pad * 2}px"></div>`;
  await shot(icon(32, 3, 7), 32, 32, path.join(R, "favicon-32.png"));
  await shot(icon(180, 26, 0), 180, 180, path.join(R, "apple-touch-icon.png"));
  await shot(icon(192, 26, 0), 192, 192, B("oya-icon-192.png"));
  await shot(icon(512, 70, 0), 512, 512, B("oya-icon-512.png"));
  await shot(icon(512, 120, 0), 512, 512, B("oya-icon-maskable-512.png"));
  await shot(`<div style="width:512px;height:512px;background:#fff;display:grid;place-items:center"><img src="file://${B("oya-logo.svg")}" style="width:420px"></div>`, 512, 512, B("oya-logo-512.png"));
  const og = (title, sub, chip) => `
  <div style="position:relative;width:1200px;height:630px;overflow:hidden;color:#fff;font-family:A;background:radial-gradient(70% 90% at 0% 100%,rgba(237,84,4,.55),transparent 60%),radial-gradient(60% 70% at 100% 0%,rgba(43,107,171,.55),transparent 60%),linear-gradient(135deg,#061428,#0F2C52)">
    <svg style="position:absolute;inset:0" width="1200" height="630"><path d="M-40 560 C 260 540 480 460 700 330 S 1040 110 1260 40" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.5" stroke-dasharray="6 12"/></svg>
    <img src="file://${B("oya-logo-white.svg")}" style="position:absolute;left:70px;top:50%;transform:translateY(-50%);width:330px">
    <div style="position:absolute;right:80px;top:120px;width:640px;text-align:right">
      <div style="display:inline-block;padding:8px 20px;border-radius:999px;background:#D24A02;font-family:Rx;font-size:26px;margin-bottom:26px">${chip}</div>
      <div style="font-size:66px;font-weight:800;line-height:1.25">${title}</div>
      <div style="font-family:Rx;font-size:30px;color:#C9D9EA;margin-top:22px;line-height:1.6">${sub}</div>
    </div>
  </div>`;
  await shot(og("أويا للسياحة<br>كل رحلة… حكاية", "فنادق ومنتجعات • برامج تركيا والعالم<br>طيران • تأشيرات السعودية والخليج", "وكالة سفر في إسطنبول"), 1200, 630, path.join(R, "assets/img/og/og-default.jpg"));
  await shot(og("كأس السوبر الإسباني<br>2027 في إسطنبول", "تذاكر وباقات المشجع مع الفندق والتنقلات<br>2–6 فبراير 2027", "تذاكر المباريات"), 1200, 630, path.join(R, "assets/img/og/og-matches.jpg"));
  await b.close();
  console.log("brand assets done");
})();
