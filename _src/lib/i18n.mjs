// Build-time translation of the rendered Arabic site into other languages.
//
// The Arabic pages stay the single source of truth. For every other locale the builder renders the same page,
// then this module replaces every Arabic "unit" with its translation from _src/i18n/<lang>.json:
//   • text units  — the text of a block element, inline tags kept as numbered placeholders: "يتحدث <g1>العربية</g1>"
//   • attributes  — alt, title, aria-label, placeholder, meta content, data-* … (plain strings)
//   • WhatsApp / mailto messages inside links (URL-decoded, translated, re-encoded)
//   • JSON blocks (structured data and the data the scripts read)
// Units are identified by a short hash of the Arabic text, so a changed Arabic sentence shows up as "missing"
// in the build report instead of silently keeping an outdated translation.
import crypto from "node:crypto";

const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
export const hasAr = (s) => AR.test(String(s || ""));
export const idOf = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);

const INLINE = new Set("a abbr b bdi bdo br cite code data dfn em i kbd mark q s samp small span strong sub sup time u var wbr img".split(" "));
const ATOMIC = new Set(["br", "wbr", "img"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#x27": "'", nbsp: " " };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (m, e) => ENT[e]);
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TOKEN = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<svg\b[^>]*>[\s\S]*?<\/svg>|<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^>]*)?\/?>|[^<]+|</g;
const PH = /<(\/?)([gx])(\d+)(\/?)>/g;

// Placeholders the translator must keep exactly ({0}, {1} … in script strings)
export const placeholders = (s) => (String(s).match(/<\/?[gx]\d+\/?>|\{\d+\}/g) || []).sort().join(" ");

// layout preview before translations exist (I18N_FAKE=1): Latin/Cyrillic stand-in words of similar length
const FAKE_WORDS = {
  ru: "путешествие Стамбул отель программа виза день экскурсия семья море город трансфер".split(" "),
  tr: "yolculuk İstanbul otel program vize gün gezi aile deniz şehir transfer".split(" "),
  pt: "viagem Istambul hotel programa visto dia passeio família mar cidade traslado".split(" "),
  en: "journey Istanbul hotel program visa day tour family sea city transfer".split(" "),
};
export function pseudo(key, lang) {
  const w = FAKE_WORDS[lang] || FAKE_WORDS.en;
  let i = 0;
  return key.replace(/[\u0600-\u06FF]+/g, () => w[i++ % w.length]).replace(/،/g, ",").replace(/؟/g, "?").replace(/؛/g, ";").replace(/←/g, "→");
}

export class Translator {
  /** @param {string} lang  @param {Record<string,string>} dict id → translation  @param {(obj:any)=>void} [ldHook] */
  constructor(lang, dict = {}, { ldHook, collect } = {}) {
    this.lang = lang;
    this.dict = dict;
    this.ldHook = ldHook;
    this.collect = collect; // Map id → { ar, kind, pages:Set } when building the source catalogue
    this.fake = process.env.I18N_FAKE === "1";
    this.missing = new Map();
    this.bad = new Map();
    this.page = "";
  }
  lookup(key, kind) {
    const id = idOf(key);
    if (this.collect) {
      const e = this.collect.get(id) || { ar: key, kind, pages: new Set(), n: 0 };
      e.pages.add(this.page); e.n++;
      this.collect.set(id, e);
    }
    const t = this.dict[id];
    if (t == null || t === "") { this.missing.set(id, key); return this.fake ? pseudo(key, this.lang) : null; }
    if (placeholders(t) !== placeholders(key)) { this.bad.set(id, key); return null; }
    return t;
  }
  // a plain string (attribute, message, JSON value): leading/trailing whitespace is kept outside the unit
  str(s, kind = "attr") {
    if (!hasAr(s)) return s;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    const t = this.lookup(m[2], kind);
    return t == null ? s : m[1] + t + m[3];
  }
  attrs(tag) {
    const msg = /(wa\.me\/|mailto:)[^"]*[?&](text|subject|body)=/.test(tag);
    if (!hasAr(tag) && !msg) return tag;
    return tag.replace(/(\s)([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g, (all, sp, name, val) => {
      if (name === "href" || name === "src") return msg || hasAr(val) ? `${sp}${name}="${this.url(val)}"` : all;
      if (!hasAr(val)) return all;
      return `${sp}${name}="${escAttr(this.str(decode(val), "attr"))}"`;
    });
  }
  // wa.me ?text= and mailto: ?subject=&body= messages
  url(val) {
    const raw = decode(val);
    const q = raw.indexOf("?");
    if (q < 0 || !/[?&](text|subject|body)=/.test(raw)) return val;
    const base = raw.slice(0, q);
    const params = raw.slice(q + 1).split("&").map((kv) => {
      const i = kv.indexOf("=");
      if (i < 0) return kv;
      const k = kv.slice(0, i);
      let v;
      try { v = decodeURIComponent(kv.slice(i + 1)); } catch { return kv; }
      if (!hasAr(v)) return kv;
      return `${k}=${encodeURIComponent(this.str(v, "message"))}`;
    });
    return escAttr(`${base}?${params.join("&")}`);
  }
  json(text, isLd) {
    let obj;
    try { obj = JSON.parse(text); } catch { return text; }
    const walk = (v) => {
      if (typeof v === "string") return hasAr(v) ? (/<[a-z][^>]*>/i.test(v) ? this.html(v) : this.str(v, "json")) : v;
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === "object") { for (const k of Object.keys(v)) v[k] = walk(v[k]); return v; }
      return v;
    };
    // script string tables are { arabic: arabic } — translate the values only
    obj = walk(obj);
    if (isLd && this.ldHook) this.ldHook(obj);
    return JSON.stringify(obj).replace(/</g, "\\u003c");
  }

  html(html) {
    const out = [];
    let buf = [];
    let skip = null; // element marked translate="no": copied as is
    const flush = () => { if (buf.length) { out.push(this.run(buf)); buf = []; } };
    for (const m of html.matchAll(TOKEN)) {
      const raw = m[0];
      if (skip) {
        out.push(raw);
        const t = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(raw);
        if (t && t[2].toLowerCase() === skip.name && !/\/>$/.test(raw)) { skip.depth += t[1] ? -1 : 1; if (skip.depth === 0) skip = null; }
        continue;
      }
      if (raw.startsWith("<!--") || /^<style/i.test(raw)) { flush(); out.push(raw); continue; }
      if (/^<script/i.test(raw)) {
        flush();
        const sm = /^(<script\b[^>]*>)([\s\S]*?)(<\/script>)$/i.exec(raw);
        const isJson = /type="application\/(ld\+)?json"/i.test(sm[1]);
        const isLd = /ld\+json/i.test(sm[1]);
        out.push(isJson && (hasAr(sm[2]) || (isLd && this.ldHook)) ? sm[1] + this.json(sm[2], isLd) + sm[3] : raw);
        continue;
      }
      if (/^<svg/i.test(raw)) { buf.push({ t: "atom", raw }); continue; }
      if (raw[0] === "<" && raw.length > 1) {
        const t = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(raw);
        const close = !!t[1], name = t[2].toLowerCase();
        const tag = close ? raw : this.attrs(raw);
        if (!close && /\stranslate="no"/.test(raw)) {
          flush(); out.push(tag);
          if (!/\/>$/.test(raw) && !ATOMIC.has(name) && name !== "input" && name !== "meta" && name !== "link") skip = { name, depth: 1 };
          continue;
        }
        if (INLINE.has(name)) {
          if (ATOMIC.has(name) || /\/>$/.test(raw)) buf.push({ t: "atom", raw: tag });
          else buf.push({ t: close ? "close" : "open", name, raw: tag });
        } else { flush(); out.push(tag); }
        continue;
      }
      buf.push({ t: "text", raw });
    }
    flush();
    return out.join("");
  }

  // one run of text + inline elements between two block boundaries
  run(items) {
    if (!items.some((x) => x.t === "text" && hasAr(x.raw))) return items.map((x) => x.raw).join("");
    // pair inline tags; unmatched ones split the run
    const pair = new Array(items.length).fill(-1);
    const stack = [];
    items.forEach((x, i) => {
      if (x.t === "open") stack.push(i);
      else if (x.t === "close") {
        for (let k = stack.length - 1; k >= 0; k--) if (items[stack[k]].name === x.name) { pair[i] = stack[k]; pair[stack[k]] = i; stack.length = k; break; }
      }
    });
    const parts = [];
    let cur = [];
    items.forEach((x, i) => {
      if ((x.t === "open" || x.t === "close") && pair[i] < 0) { parts.push(cur, [x]); cur = []; } else cur.push(x);
    });
    parts.push(cur);
    if (parts.length > 1) return parts.map((p) => (p.length === 1 && (p[0].t === "open" || p[0].t === "close") ? p[0].raw : this.run(p))).join("");
    // sibling inline elements with only whitespace between them (chips, button rows, "day / number") are separate units
    const top = [];
    let onlyWs = true;
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      if (x.t === "text") { if (x.raw.trim()) { onlyWs = false; break; } continue; }
      if (x.t === "atom") { top.push([i, i]); continue; }
      if (x.t === "open") { top.push([i, pair[i]]); i = pair[i]; }
    }
    if (onlyWs && top.length === 1 && top[0][1] > top[0][0]) { // a single wrapper: look inside it
      const [a, b] = top[0];
      const raw = (x) => x.map((y) => y.raw).join("");
      return raw(items.slice(0, a + 1)) + this.run(items.slice(a + 1, b)) + raw(items.slice(b));
    }
    if (onlyWs && top.length >= 2) {
      let res = "", i = 0;
      for (const [a, b] of top) {
        res += items.slice(i, a).map((x) => x.raw).join("");
        const sl = items.slice(a, b + 1);
        res += sl.length > 1 ? this.run(sl) : sl[0].raw;
        i = b + 1;
      }
      return res + items.slice(i).map((x) => x.raw).join("");
    }
    return this.unit(items, pair);
  }

  unit(items, pair) {
    const isWs = (x) => x.t === "text" && !x.raw.trim();
    const textIdx = items.map((x, i) => (x.t === "text" && x.raw.trim() ? i : -1)).filter((i) => i >= 0);
    let s = textIdx[0], e = textIdx[textIdx.length - 1];
    for (let changed = true; changed;) {
      changed = false;
      for (let i = s; i <= e; i++) {
        if (pair[i] >= 0 && pair[i] < s) { s = pair[i]; changed = true; }
        if (pair[i] > e) { e = pair[i]; changed = true; }
      }
    }
    // peel wrappers that enclose the whole unit, atoms and whitespace at the edges
    for (let changed = true; changed;) {
      changed = false;
      while (s < e && (items[s].t === "atom" || isWs(items[s]))) { s++; changed = true; }
      while (e > s && (items[e].t === "atom" || isWs(items[e]))) { e--; changed = true; }
      if (items[s].t === "open" && pair[s] === e) { s++; e--; changed = true; }
    }
    const core = items.slice(s, e + 1);
    if (!core.some((x) => x.t === "text" && hasAr(x.raw))) return items.map((x) => x.raw).join("");
    // whitespace at the unit's edges stays outside
    const first = core[0], last = core[core.length - 1];
    const lead = first.t === "text" ? /^\s*/.exec(first.raw)[0] : "";
    const trail = last.t === "text" ? /\s*$/.exec(last.raw)[0] : "";
    const map = {}; const num = new Map(); let n = 0;
    let key = "";
    core.forEach((x, k) => {
      const i = s + k;
      if (x.t === "text") {
        let r = x.raw;
        if (k === 0) r = r.slice(lead.length);
        if (k === core.length - 1 && trail) r = r.slice(0, r.length - trail.length);
        key += decode(r);
      } else if (x.t === "atom") { n++; map[`x${n}`] = x.raw; key += `<x${n}/>`; }
      else if (x.t === "open") { n++; num.set(i, n); map[`o${n}`] = x.raw; key += `<g${n}>`; }
      else { const p = num.get(pair[i]); map[`c${p}`] = x.raw; key += `</g${p}>`; }
    });
    key = key.replace(/\s+/g, " ").trim();
    const before = items.slice(0, s).map((x) => x.raw).join("") + lead;
    const after = trail + items.slice(e + 1).map((x) => x.raw).join("");
    const t = this.lookup(key, "text");
    if (t == null) return items.map((x) => x.raw).join("");
    const body = t.split(PH);
    let res = "";
    for (let i = 0; i < body.length; i += 5) {
      res += escText(body[i]);
      if (i + 4 < body.length) {
        const [slash, kind, no, self] = body.slice(i + 1, i + 5);
        res += kind === "x" ? map[`x${no}`] : slash ? map[`c${no}`] : map[`o${no}`];
        void self;
      }
    }
    return before + res + after;
  }
}
