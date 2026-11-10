// Guide: Türkiye entry visa for Arab travellers.
// Every rule below is taken from the Turkish Ministry of Foreign Affairs pages listed in SOURCES
// (read on site.turkeyVisaReviewed). Ordinary passports, tourist visits. No fees are quoted on purpose.
import { site } from "../site.mjs";
import { heroPhoto } from "../content/hero-photos.mjs";
import { ic, esc, sectionHead, faqBlock, ctaBand, pageHero, waBtn } from "../lib/ui.mjs";
import { visaForm } from "../lib/forms.mjs";
import * as S from "../lib/schema.mjs";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const arDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${AR_MONTHS[m - 1]} ${y}`; };

const SOURCES = [
  ["وزارة الخارجية التركية — معلومات التأشيرة للأجانب (لكل دولة)", "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa"],
  ["وزارة الخارجية التركية — معلومات عامة عن التأشيرات", "https://www.mfa.gov.tr/general-information-about-turkish-visas.en.mfa"],
  ["الموقع الرسمي للتأشيرة الإلكترونية (e-Visa)", "https://www.evisa.gov.tr"],
  ["نظام الطلب المسبق لتأشيرة القنصلية", "https://www.visa.gov.tr"],
];

// 1) Visa-free (ordinary passports)
const D180 = "حتى 90 يوماً خلال أي 180 يوماً";
const D6M = "حتى 90 يوماً خلال ستة أشهر من تاريخ أول دخول، للسياحة والعبور";
const FREE = [
  ["السعودية", D180], ["الإمارات", D180], ["البحرين", D180], ["عُمان", D180],
  ["الكويت", "حتى 90 يوماً خلال آخر 180 يوماً"],
  ["قطر", D6M], ["الأردن", D6M], ["لبنان", D6M],
  ["تونس", "حتى 90 يوماً"], ["المغرب", "حتى 90 يوماً"],
];
// 2) The rule depends on age
const DOCS4 = "تأشيرة أو إقامة سارية من دول شنغن أو أمريكا أو بريطانيا أو أيرلندا";
const BY_AGE = [
  { n: "الجزائر", free: "أقل من 15 عاماً وأكبر من 50 عاماً: حتى 90 يوماً خلال أي 180 يوماً للزيارات السياحية", visa: "من 15 إلى 50 عاماً", evisa: `لمن عمره بين 15 و18 أو بين 35 و50 ويحمل ${DOCS4}: دخول واحد لمدة شهر` },
  { n: "العراق", free: "أقل من 15 عاماً وأكبر من 50 عاماً: حتى 90 يوماً خلال أي 180 يوماً", visa: "من 15 إلى 50 عاماً", evisa: `لمن يحمل ${DOCS4}، وبشروط إضافية: دخول واحد لمدة شهر` },
  { n: "ليبيا", free: "أقل من 16 عاماً وأكبر من 45 عاماً: حتى 90 يوماً خلال أي 180 يوماً للزيارات السياحية", visa: "من 16 إلى 45 عاماً", evisa: `لمن يحمل ${DOCS4}: دخول واحد لمدة شهر` },
  { n: "مصر", free: "لا إعفاء لحاملي الجواز العادي", visa: "جميع الأعمار", evisa: `أقل من 15 عاماً أو أكبر من 45 عاماً: تأشيرة إلكترونية دون شرط إضافي. من 15 إلى 45 عاماً: تأشيرة إلكترونية 30 يوماً بدخول واحد لمن يحمل ${DOCS4}، ويسافر على الخطوط التركية أو AJet أو بيغاسوس أو مصر للطيران أو إير كايرو` },
];
// 3) Visa required before travel
const PRE = "تأشيرة مطلوبة قبل السفر.";
const NEED = [
  ["اليمن", `${PRE} تأشيرة إلكترونية بدخول واحد لمدة شهر لمن يحمل ${DOCS4}؛ وغير ذلك عبر القنصلية.`],
  ["فلسطين", `${PRE} تأشيرة إلكترونية 30 يوماً بدخول واحد لمن يحمل ${DOCS4}، وبشروط إضافية؛ وغير ذلك عبر القنصلية.`],
  ["سوريا", PRE],
  ["السودان", PRE],
  ["موريتانيا", PRE],
  ["الصومال", PRE],
  ["جيبوتي", PRE],
  ["جزر القمر", PRE],
];

const RULES = [
  { icon: "passport", t: "صلاحية جواز السفر", d: "يجب أن يبقى جوازك صالحاً 60 يوماً على الأقل بعد مدة الإقامة المسموحة لك. مثال: من يدخل بإعفاء 90 يوماً يحتاج جوازاً صالحاً 150 يوماً على الأقل يوم الدخول. وتنصح الخارجية التركية بصلاحية 6 أشهر." },
  { icon: "calendar", t: "90 يوماً خلال 180 يوماً", d: "مدة الإقامة بالتأشيرة أو بالإعفاء لا تتجاوز 90 يوماً خلال كل 180 يوماً، والقاعدة تسري على جميع الأجانب. الخروج والعودة لا يبدآن عدّاً جديداً، وحمل جوازين لا يضاعف المدة." },
  { icon: "pin", t: "القاعدة تتبع جواز السفر", d: "ما يحدد حاجتك للتأشيرة هو جنسية جوازك لا بلد إقامتك. وما يتيح التأشيرة الإلكترونية لبعض الجنسيات هو تأشيرة أو إقامة سارية من دول شنغن أو أمريكا أو بريطانيا أو أيرلندا تحديداً." },
  { icon: "doc", t: "وثائق السفر", d: "حاملو وثائق السفر (غير جوازات السفر) يحتاجون تأشيرة من البعثات التركية قبل السفر، مهما كانت قاعدة البلد الذي أصدر الوثيقة." },
  { icon: "suitcase", t: "السياحة والتجارة فقط", d: "التأشيرة الإلكترونية صالحة للسياحة والتجارة فقط. العمل والدراسة والإقامة الطويلة لها تأشيرات تصدر من السفارات والقنصليات التركية." },
  { icon: "shield", t: "قبل أن تدفع", d: "التأشيرة لا تضمن الدخول، فالقرار النهائي لسلطات الحدود. ورسوم التأشيرة لا تُسترد عند الرفض، ويُشترط تأمين صحي يغطي مدة إقامتك. وتنصح الخارجية التركية بالتقديم قبل شهر على الأقل من السفر." },
];

const STEPS = [
  { icon: "whatsapp", t: "أرسل بياناتك الأساسية", d: "جنسية جواز السفر، وعمر كل مسافر، وبلد الإقامة، وهل لديك تأشيرة أو إقامة من شنغن أو أمريكا أو بريطانيا أو أيرلندا." },
  { icon: "search", t: "نحدد القاعدة التي تنطبق عليك", d: "نراجع حالتك على المصدر الرسمي ونخبرك بوضوح: دخول بلا تأشيرة، أو تأشيرة إلكترونية، أو تأشيرة من القنصلية." },
  { icon: "doc", t: "نرتّب الطلب معك", d: "إن احتجت تأشيرة إلكترونية نساعدك في تعبئة الطلب على الموقع الرسمي ومراجعة الاسم ورقم الجواز والتواريخ حرفاً حرفاً. وإن كانت من القنصلية نجهّز معك حجوزات الفندق والطيران التي يطلبها الملف." },
  { icon: "takeoff", t: "ثم نرتّب رحلتك", d: "الفندق والاستقبال من المطار والبرنامج السياحي بسيارة خاصة وسائق يتحدث العربية." },
];

export function turkeyVisaPage(data) {
  const path = "turkey-visa/";
  const reviewed = site.turkeyVisaReviewed || site.visasReviewed;
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "السياحة في تركيا", path: "turkey-tours/" }, { name: "تأشيرة تركيا", path }];
  const page = { path, nav: "turkey", crumbs, modified: reviewed,
    title: "تأشيرة تركيا للعرب: الدول المعفاة والتأشيرة الإلكترونية",
    description: "هل تحتاج تأشيرة لدخول تركيا؟ جدول واضح لكل جنسية عربية: الدول المعفاة ومدة الإقامة، وشروط العمر، والتأشيرة الإلكترونية، وصلاحية الجواز، من المصدر الرسمي.",
    mbar: { label: "اسأل الآن", icon: "passport", msg: "مرحباً أويا للسياحة، أرغب بمعرفة متطلبات دخول تركيا لجنسيتي." } };
  const waAsk = "مرحباً أويا للسياحة، أرغب بمعرفة متطلبات دخول تركيا. جنسيتي: … عمري: … بلد إقامتي: …";
  const faq = [
    { q: "هل يحتاج السعودي تأشيرة لدخول تركيا؟", a: "لا. حاملو الجواز السعودي العادي معفون من التأشيرة حتى 90 يوماً خلال أي 180 يوماً، ومثلهم مواطنو الإمارات والبحرين وعُمان. ويلزم أن يكون الجواز صالحاً 150 يوماً على الأقل يوم الدخول." },
    { q: "هل يحتاج المصري تأشيرة لدخول تركيا؟", a: "نعم. حاملو الجواز المصري العادي يحتاجون تأشيرة. من هم دون 15 عاماً أو فوق 45 عاماً يحصلون على التأشيرة الإلكترونية دون شرط إضافي، ومن هم بين 15 و45 عاماً يحصلون عليها إن كانت لديهم تأشيرة أو إقامة سارية من شنغن أو أمريكا أو بريطانيا أو أيرلندا وسافروا على شركات طيران محددة. وغير ذلك يكون التقديم عبر القنصلية." },
    { q: "أنا مقيم في السعودية أو الإمارات وجنسيتي غير معفاة، هل تعفيني الإقامة؟", a: "لا. القاعدة تتبع جنسية جواز السفر لا بلد الإقامة. الوثائق التي تتيح التأشيرة الإلكترونية لبعض الجنسيات هي تأشيرة أو إقامة سارية من دول شنغن أو أمريكا أو بريطانيا أو أيرلندا. أرسل لنا جنسيتك وعمرك لنحدد لك الطريق المتاح." },
    { q: "كم يجب أن تكون صلاحية جواز السفر لدخول تركيا؟", a: "60 يوماً على الأقل بعد مدة الإقامة المسموحة لك. من يدخل بإعفاء أو تأشيرة مدتها 90 يوماً يحتاج 150 يوماً، ومن يدخل بتأشيرة 30 يوماً يحتاج 90 يوماً. والأحوط أن تكون الصلاحية 6 أشهر كما تنصح الخارجية التركية." },
    { q: "هل أستطيع البقاء 90 يوماً ثم الخروج والعودة مباشرة؟", a: "لا. المدة القصوى 90 يوماً خلال كل 180 يوماً، وتُحسب كل أيامك في تركيا خلال آخر 180 يوماً. من يريد البقاء أكثر يتقدم بطلب إقامة قصيرة لدى إدارة الهجرة في تركيا." },
    { q: "ما الفرق بين التأشيرة الإلكترونية وتأشيرة القنصلية؟", a: "التأشيرة الإلكترونية تُطلب عبر الإنترنت من موقع evisa.gov.tr للجنسيات المؤهلة، وهي للسياحة والتجارة فقط. تأشيرة القنصلية (الملصقة) يبدأ طلبها من نظام visa.gov.tr ثم موعد في القنصلية التركية، وهي لمن لا تنطبق عليه شروط التأشيرة الإلكترونية أو لأغراض أخرى كالعمل والدراسة." },
    { q: "هل تساعدني أويا في تأشيرة تركيا؟", a: "نعم. نخبرك أولاً بالقاعدة التي تنطبق على جنسيتك وعمرك، ثم نساعدك في تعبئة طلب التأشيرة الإلكترونية بشكل صحيح أو في تجهيز حجوزات ملف القنصلية، ونرتّب بعدها الفندق والاستقبال والبرنامج. نحن وكالة سفر خاصة، والقرار للسلطات التركية وحدها." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-turkey-visa"), eyebrow: `دليل دخول تركيا • آخر مراجعة ${arDate(reviewed)}`, title: "تأشيرة تركيا للعرب: الدول المعفاة والتأشيرة الإلكترونية",
    lead: "هل تحتاج تأشيرة لدخول تركيا؟ الجواب يتبع جنسية جواز سفرك، وعمرك أحياناً. جمعنا لك القاعدة لكل جنسية عربية من موقع وزارة الخارجية التركية في جداول واضحة.", icon: "passport", page: path,
    chips: [{ icon: "check-circle", text: `${FREE.length} جنسيات عربية بلا تأشيرة` }, { icon: "calendar", text: "حتى 90 يوماً" }, { icon: "shield", text: "المصدر: الخارجية التركية" }],
    actions: `${waBtn(waAsk, "اسأل عن جنسيتك")}<a class="btn btn--glass" href="#nationalities">${ic("doc")}<span>جدول الجنسيات</span></a>` })}

<section class="section section--tight">
  <div class="container"><dl class="kv" data-stagger>
    <div data-reveal><dt>${ic("check-circle")}بدون تأشيرة</dt><dd>${FREE.length} جنسيات عربية</dd></div>
    <div data-reveal><dt>${ic("calendar")}أقصى إقامة سياحية</dt><dd>90 يوماً خلال 180 يوماً</dd></div>
    <div data-reveal><dt>${ic("passport")}صلاحية الجواز</dt><dd>60 يوماً بعد مدة الإقامة</dd></div>
    <div data-reveal><dt>${ic("globe")}التأشيرة الإلكترونية</dt><dd>للسياحة والتجارة فقط</dd></div>
  </dl></div>
</section>

<section class="section" id="nationalities" style="padding-top:0">
  <div class="container">
    ${sectionHead({ eyebrow: "حسب جنسية الجواز", title: "هل تحتاج تأشيرة لدخول تركيا؟", lead: "القواعد لحاملي جوازات السفر العادية وللزيارات السياحية. ابحث عن جنسيتك في إحدى المجموعات الثلاث." })}

    <div class="tvgroup" data-reveal>
      <h3 class="tvgroup__t"><span class="tvbadge tvbadge--ok">${ic("check-circle")}بدون تأشيرة</span> دول عربية معفاة من تأشيرة تركيا</h3>
      <ul class="tvcards tvcards--ok">${FREE.map(([n, d]) => `<li class="tvcard"><b>${n}</b><span>${d}</span></li>`).join("")}</ul>
    </div>

    <div class="tvgroup" data-reveal>
      <h3 class="tvgroup__t"><span class="tvbadge tvbadge--age">${ic("users")}حسب العمر</span> جنسيات تختلف قاعدتها حسب العمر</h3>
      <div class="table-wrap"><table class="table"><thead><tr><th>الجنسية</th><th>معفى من التأشيرة</th><th>يحتاج تأشيرة</th><th>التأشيرة الإلكترونية (e-Visa)</th></tr></thead><tbody>
        ${BY_AGE.map((r) => `<tr><td><strong>${r.n}</strong></td><td>${r.free}</td><td>${r.visa}</td><td>${r.evisa}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="tvnote">${ic("info")}<span>من يحتاج تأشيرة ولا تنطبق عليه شروط التأشيرة الإلكترونية يتقدم عبر القنصلية التركية.</span></p>
    </div>

    <div class="tvgroup" data-reveal>
      <h3 class="tvgroup__t"><span class="tvbadge tvbadge--visa">${ic("passport")}تأشيرة مسبقة</span> جنسيات تحتاج تأشيرة قبل السفر</h3>
      <ul class="tvcards tvcards--visa">${NEED.map(([n, d]) => `<li class="tvcard${d.length > 40 ? " tvcard--wide" : ""}"><b>${n}</b><span>${d}</span></li>`).join("")}</ul>
      <p class="tvnote">${ic("info")}<span>يبدأ طلب التأشيرة من نظام الطلب المسبق الرسمي visa.gov.tr، وهو يحوّلك إلى التأشيرة الإلكترونية إن استوفيت شروطها، أو إلى موعد في القنصلية.</span></p>
    </div>

    <div class="note note--warn" data-reveal>${ic("alert")}<span>أنظمة التأشيرات تتغير وفق مبدأ المعاملة بالمثل، وقد تختلف قواعد الجوازات الدبلوماسية والخاصة وسائقي الشاحنات. تحقق من المصدر الرسمي قبل شراء تذكرتك، أو أرسل لنا جنسيتك لنؤكد لك القاعدة السارية.</span></div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "قواعد عامة", title: "قواعد تنطبق على كل المسافرين إلى تركيا" })}
    <div class="grid grid-3" data-stagger>${RULES.map((r) => `<div class="svc" data-reveal><span class="ico ico--orange">${ic(r.icon)}</span><h3>${r.t}</h3><p>${r.d}</p></div>`).join("")}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "كيف نساعدك", title: "من السؤال عن التأشيرة حتى الوصول إلى الفندق", center: true })}
    <div class="steps" data-stagger>${STEPS.map((s) => `<div class="step" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>
    <p class="center muted mt-2" style="font-size:.92rem">${ic("info")} أويا للسياحة وكالة سفر خاصة وليست جهة حكومية. رسوم التأشيرة الرسمية تُدفع للجهة الرسمية، وقرار منح التأشيرة والدخول يعود للسلطات التركية وحدها.</p>
  </div>
</section>

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "اسأل الآن", title: "أرسل جنسيتك ونؤكد لك المطلوب", lead: "اكتب جنسية جواز السفر وبلد الإقامة وموعد السفر. إن كانت لديك تأشيرة أو إقامة من شنغن أو أمريكا أو بريطانيا أو أيرلندا فاذكرها في الملاحظات مع أعمار المسافرين." })}</div>
    <div class="form-card" data-reveal="zoom">${visaForm({ visa: "دخول تركيا: هل أحتاج تأشيرة؟", options: [{ group: "دخول تركيا", items: ["دخول تركيا: هل أحتاج تأشيرة؟", "التأشيرة الإلكترونية لتركيا (e-Visa)", "تأشيرة تركيا من القنصلية"] }] })}</div>
  </div>
</section>

<section class="section section--tight">
  <div class="container narrow">
    <div class="srcbox" data-reveal>
      <p class="srcbox__date">${ic("calendar")}<span>آخر مراجعة لمعلومات هذه الصفحة: <time datetime="${reviewed}">${arDate(reviewed)}</time></span></p>
      <p class="srcbox__t">المصادر الرسمية — تحقّق منها دائماً قبل السفر:</p>
      <ul>${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener external">${t} ${ic("arrow")}</a></li>`).join("")}</ul>
      <p class="srcbox__n">أويا للسياحة وكالة سفر خاصة ولا تتبع أياً من هذه الجهات. المعلومات هنا للإرشاد العام ولا تغني عن المصدر الرسمي.</p>
    </div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن تأشيرة تركيا" })}

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "الخطوة التالية", title: "رتّب رحلتك إلى تركيا" })}
    <div class="grid grid-4" data-stagger>
      ${[["route", "برنامج تركيا 7 أيام", "أسبوع بفندق واحد في إسطنبول", "packages/turkey-7-days/"], ["map", "البرامج السياحية", "برامج جاهزة يوماً بيوم", "packages/"], ["hotel", "فنادق ومنتجعات", "إسطنبول وطرابزون وأنطاليا", "hotels/"], ["takeoff", "تذاكر طيران", "من مدينتك إلى تركيا", "flights/"]].map(([i, t, d, h]) => `<a class="ctile" data-reveal href="{{root}}${h}"><span class="ico">${ic(i)}</span><div><b>${t}</b><span>${d}</span></div></a>`).join("")}
    </div>
  </div>
</section>
${ctaBand({ title: "جوازك جاهز؟ لنرتّب الرحلة", lead: "أخبرنا بجنسيتك وتواريخك وعدد المسافرين، ونرسل لك ما تحتاجه للدخول وعرضاً للرحلة.", wa: waAsk })}`;
  page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), S.faqNode(page, faq)].filter(Boolean);
  return page;
}
