# OYA Tourism — Content schema & writing guide

All site content lives in `_src/content/*.mjs` as ES modules with a **default export array**.
`node _src/build.mjs` turns them into static HTML at the repo root.

## Global rules (every writer must follow)

1. **Language:** Modern Standard Arabic, warm, confident, easy to read, friendly to Gulf, Levant, Iraqi and
   Egyptian readers. Short paragraphs (2–4 sentences). No English inside Arabic sentences except proper
   names when useful (e.g. "أوزنجول (Uzungöl)").
2. **Brand:** "أويا للسياحة" (OYA Tourism), Istanbul-based. Tagline «كل رحلة… حكاية». Services: flight tickets,
   hotels & resorts (most requested), tours inside and outside Turkey, international visas, GCC visas,
   all Saudi visa types, football match tickets. Contact is via WhatsApp (+90 539 933 43 31) and
   e-mail info@oyatourism.com.
3. **Honesty — mandatory:**
   - Never invent prices, discounts, customer counts, years of experience, awards, licence numbers or reviews.
     Package `priceFrom` stays `null` unless the owner provides a price.
   - Visa facts: state only what the research supports; when a rule/fee can change write it cautiously
     (e.g. «وفق آخر تحديث معلن، وقد تتغير الرسوم — نؤكدها لك عند الطلب»). Never promise approval.
     Always make clear that the decision belongs to the embassy/authority.
   - Do not claim official partnership with any government, club, league or federation.
4. **SEO:** each page has a unique `seo.title` (≤ 60 chars, ends with "| أويا" or "– أويا للسياحة" when it fits)
   and `seo.description` (≤ 155 chars, includes a call to action). Use the primary keyword in `h1`, in the
   first paragraph, and naturally in one `h2`-level heading. Include spelling variants naturally
   (طرابزون/طربزون, أوزنجول/اوزنجول, سبانجا/صبنجة, بورصة/بورصا) in body text or FAQs, never stuffed.
5. **Internal links:** inside HTML strings write links as `<a href="{{root}}packages/istanbul-5-days/">…</a>`.
   `{{root}}` is replaced with the correct relative prefix. Always end paths with `/`.
6. **HTML allowed in text fields:** `<strong>`, `<em>`, `<a>`, `<br>`. Paragraph arrays are plain strings
   (no `<p>`). Long-form `body` fields (blog) may use `<h2 id="…">`, `<h3>`, `<p>`, `<ul><li>`, `<ol>`,
   `<table>`, `<blockquote>`.
7. **Strings:** use double-quoted JS strings or template literals; escape properly. The file must import
   cleanly: `node --input-type=module -e "import('./_src/content/FILE.mjs').then(m=>console.log(m.default.length))"`.
8. **Images:** each item has `img` (a key, file will be `assets/img/photos/<img>.webp`) and `imgPrompt`
   (English prompt for an AI image generator). Prompt style: *photorealistic travel photography,
   natural colors, golden-hour or soft daylight, cinematic composition, no text, no logos, no watermarks,
   landscape 3:2*. Describe the real landmark accurately. People (if any) are modestly dressed families or
   couples seen from behind or at a distance, no faces in close-up.
9. **Icons** available: plane takeoff hotel bed map compass passport ticket ball trophy stadium phone mail pin
   calendar users user star check shield clock headset globe mosque car wifi coffee camera sun snow mountain
   balloon palm cable lake ship tower flame bridge pyramid temple island castle towers burj dome heart wallet
   sparkles suitcase doc crown family ring award route tag.

## URL map (fixed — use these exact slugs)

| Section | URL |
|---|---|
| Home | `/` |
| Flights | `flights/` |
| Hotels & resorts | `hotels/` |
| Turkey hub | `turkey-tours/` |
| Turkey destinations | `turkey-tours/{istanbul,trabzon,uzungol,bursa,sapanca,antalya,cappadocia,bodrum}/` |
| Outside Turkey hub | `world-tours/` |
| Packages hub | `packages/` |
| Packages | `packages/<slug>/` (slugs below) |
| International visas hub | `visas/` → `visas/{schengen,uk,usa,canada}/` |
| GCC visas hub | `gcc-visas/` → `gcc-visas/{uae,qatar,oman,bahrain,kuwait,gcc-unified}/` |
| Saudi visas hub | `saudi-visa/` → `saudi-visa/{tourist,umrah,family-visit,personal-visit,business,transit,gcc-residents}/` |
| Match tickets | `matches/` → `matches/spanish-super-cup-2027/` |
| Blog | `blog/` → `blog/<slug>/` |
| About / Contact / FAQ | `about/`, `contact/`, `faq/` |

Package slugs — Turkey: `istanbul-5-days`, `istanbul-bursa-7-days`, `istanbul-sapanca-bursa-8-days`,
`trabzon-uzungol-7-days`, `black-sea-10-days`, `istanbul-trabzon-10-days`, `turkey-family-12-days`,
`turkey-honeymoon-9-days`, `cappadocia-3-days`, `antalya-7-days`, `grand-turkey-14-days`,
`istanbul-uludag-winter-6-days`.
World: `georgia-7-days`, `azerbaijan-6-days`, `bosnia-7-days`, `malaysia-9-days`, `bali-9-days`,
`thailand-9-days`, `maldives-5-days`, `egypt-8-days`, `uzbekistan-7-days`.

## Schemas

### destinations.mjs (Turkey destinations)
```js
{
  slug: "istanbul", name: "إسطنبول", nameEn: "Istanbul", icon: "mosque",
  img: "dest-istanbul", imgPrompt: "…",
  seo: { title: "…", description: "…" },
  h1: "…", tagline: "short 4–8 word hook for cards",
  intro: "lead paragraph (1–2 sentences)",
  overview: ["paragraph", "paragraph", "paragraph"],          // 3–4 paragraphs, 250–400 words total
  facts: [ { k: "أفضل وقت للزيارة", v: "…" }, { k: "المدة المقترحة", v: "…" }, { k: "أقرب مطار", v: "…" }, { k: "تبعد عن إسطنبول", v: "…" } ],
  highlights: [ { name: "…", text: "1–2 sentences", icon: "camera" } ],   // 8–12 attractions
  dayTours: [ { name: "…", text: "…" } ],                     // 3–6 (optional)
  stayAreas: [ { name: "…", text: "who it suits + why" } ],   // 3–5
  tips: [ "…" ],                                                // 4–6 practical tips
  packages: [ "istanbul-5-days", … ],                           // related package slugs
  faq: [ { q: "…", a: "…" } ]                                    // 5–7 real search questions
}
```

### packages-turkey.mjs / packages-world.mjs
```js
{
  slug: "istanbul-5-days", region: "turkey" | "world",
  dest: ["istanbul"],                  // Turkey destination slugs (turkey only, may be [])
  country: "تركيا",                    // or "جورجيا" etc.
  tags: ["family","honeymoon","budget","luxury","friends","winter","nature","city","beach"],
  title: "برنامج إسطنبول 5 أيام",       // card title
  h1: "…", seo: { title: "…", description: "…" },
  days: 5, nights: 4, cities: ["إسطنبول"],
  priceFrom: null, priceNote: "حسب الموسم وفئة الفندق",
  img: "pkg-istanbul-5-days", imgPrompt: "…", icon: "mosque",
  badge: "الأكثر طلباً" | null, featured: true | false,
  summary: "1–2 sentence card summary",
  intro: ["paragraph", "paragraph"],    // 120–220 words
  highlights: ["…"],                    // 5–8 bullet highlights
  itinerary: [ { day: 1, title: "…", text: "3–5 sentences describing the day", stops: ["…","…"] } ],  // one per day — complete
  includes: ["…"], excludes: ["…"],
  hotels: [ { city: "إسطنبول", nights: 4, text: "suggested areas / categories" } ],
  notes: ["…"],
  faq: [ { q: "…", a: "…" } ]            // 3–5
}
```

### visas.mjs
```js
{
  slug: "tourist", group: "saudi" | "gcc" | "intl",
  name: "التأشيرة السياحية السعودية", short: "سياحية", stamp: "SA", icon: "passport",
  img: "visa-saudi-tourist", imgPrompt: "…",
  seo: { title: "…", description: "…" }, h1: "…",
  intro: "lead (1–2 sentences)",
  facts: [ { k: "نوع الدخول", v: "…" }, { k: "مدة الإقامة", v: "…" }, { k: "الصلاحية", v: "…" }, { k: "مدة الإنجاز", v: "…" } ],
  overview: ["paragraph", …],           // 2–4 paragraphs
  who: ["who can apply …"],
  types: [ { name: "…", text: "…" } ],  // optional sub-types
  docs: ["required document …"],
  notes: ["important caution …"],
  faq: [ { q: "…", a: "…" } ]            // 4–6
}
```

### posts.mjs (blog)
```js
{
  slug: "best-time-to-visit-turkey", title: "…", h1: "…",
  seo: { title: "…", description: "…" },
  excerpt: "…", date: "2026-11-09", readMins: 7, category: "دليل السفر", icon: "sun",
  img: "blog-best-time-to-visit-turkey", imgPrompt: "…",
  body: `<p>…</p><h2 id="…">…</h2>…`,     // 900–1500 words, real headings, internal links with {{root}}
  faq: [ { q: "…", a: "…" } ],
  related: ["packages/istanbul-5-days/", "turkey-tours/istanbul/"]
}
```
