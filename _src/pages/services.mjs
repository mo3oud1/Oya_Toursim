import { site } from "../site.mjs";
import { heroPhoto } from "../content/hero-photos.mjs";
import { ic, esc, media, photoImg, toneFor, sectionHead, faqBlock, ctaBand, pageHero, waBtn, waUrl, featureItem, destCard } from "../lib/ui.mjs";
import { flightForm, hotelForm, cityList } from "../lib/forms.mjs";
import * as S from "../lib/schema.mjs";
import { cabinsBlock } from "./cabins.mjs";

const g = (page, extra) => [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.breadcrumbNode(page), ...extra].filter(Boolean);

/* =================== FLIGHTS =================== */
export function flightsPage() {
  const path = "flights/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "تذاكر طيران", path }];
  const page = { path, nav: "flights", crumbs,
    title: "حجز تذاكر طيران من إسطنبول وإليها بأنسب الخيارات | أويا",
    description: "احجز تذاكر طيرانك من إسطنبول إلى الرياض وجدة وبغداد وأربيل ودبي وطرابزون والعالم بأسعار تنافسية ودعم بالعربية. أرسل وجهتك وتاريخك عبر واتساب." };
  const routes = [
    ["إسطنبول", "الرياض", "4 ساعات تقريباً"], ["إسطنبول", "جدة", "3 ساعات و45 دقيقة تقريباً"], ["إسطنبول", "الدمام", "4 ساعات تقريباً"], ["إسطنبول", "المدينة المنورة", "3 ساعات و30 دقيقة تقريباً"],
    ["إسطنبول", "دبي", "4 ساعات و15 دقيقة تقريباً"], ["إسطنبول", "الدوحة", "4 ساعات تقريباً"], ["إسطنبول", "الكويت", "3 ساعات و30 دقيقة تقريباً"], ["إسطنبول", "مسقط", "5 ساعات تقريباً"],
    ["إسطنبول", "بغداد", "3 ساعات تقريباً"], ["إسطنبول", "أربيل", "ساعتان و30 دقيقة تقريباً"], ["إسطنبول", "عمّان", "ساعتان تقريباً"], ["إسطنبول", "القاهرة", "ساعتان و15 دقيقة تقريباً"],
    ["إسطنبول", "طرابزون", "ساعة و45 دقيقة تقريباً"], ["إسطنبول", "أنطاليا", "ساعة و20 دقيقة تقريباً"], ["إسطنبول", "تبليسي", "ساعتان و15 دقيقة تقريباً"], ["إسطنبول", "باكو", "3 ساعات تقريباً"],
  ];
  const faq = [
    { q: "متى أحجز للحصول على أفضل سعر لتذكرة الطيران؟", a: "كقاعدة عامة، الحجز المبكر قبل عدة أسابيع يمنحك خيارات وأسعاراً أفضل، خصوصاً في مواسم الصيف والأعياد والعطلات المدرسية. أرسل لنا تواريخك ونقارن لك الخيارات المتاحة على أكثر من شركة." },
    { q: "ما الفرق بين مطار إسطنبول ومطار صبيحة؟", a: "مطار إسطنبول (IST) يقع في الجانب الأوروبي ويخدم أغلب الرحلات الدولية والخطوط التركية، بينما مطار صبيحة كوكجن (SAW) في الجانب الآسيوي وتعمل منه شركات منخفضة التكلفة مثل بيغاسوس. اختيار المطار يؤثر على وقت الوصول لفندقك، ونرشدك للأنسب." },
    { q: "كم وزن الأمتعة المسموح؟", a: "يختلف وزن الأمتعة حسب شركة الطيران وفئة التذكرة؛ بعض الأسعار الاقتصادية لا تشمل حقيبة الشحن. نوضح لك الوزن المسموح كتابياً قبل الإصدار، ويمكن إضافة وزن إضافي عند الحاجة." },
    { q: "هل يمكن تعديل التذكرة أو إلغاؤها بعد الحجز؟", a: "يعتمد ذلك على شروط التذكرة التي تختارها؛ بعض الأسعار مرنة وتسمح بالتعديل برسوم، وبعضها غير قابل للاسترداد. نبيّن لك الشروط قبل الدفع، ونتولى عنك إجراءات التعديل إن احتجت." },
    { q: "هل توفرون حجز طيران لملف التأشيرة؟", a: "نعم، يمكننا تجهيز حجز طيران مؤكد مبدئي ضمن ملف التأشيرة وفق ما تطلبه السفارة أو مركز التأشيرات، ثم إصدار التذكرة النهائية بعد صدور التأشيرة." },
    { q: "كم مدة الطيران من إسطنبول إلى طرابزون؟", a: "حوالي ساعة و45 دقيقة على الرحلات المباشرة، وتسيّر عدة شركات تركية رحلات يومية بين إسطنبول وطرابزون، مما يجعلها الطريقة الأسرع للوصول إلى الشمال التركي." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-flights"), eyebrow: "تذاكر طيران", title: "حجز تذاكر طيران من إسطنبول وإليها", lead: "رحلات دولية وداخلية على أغلب شركات الطيران: إلى السعودية والخليج والعراق والشام ومصر والمغرب العربي وأوروبا وآسيا — مع مقارنة الخيارات ودعم بالعربية حتى الإقلاع.", icon: "takeoff", page: path,
    chips: [{ icon: "search", text: "مقارنة بين شركات الطيران" }, { icon: "suitcase", text: "توضيح الأمتعة والشروط" }, { icon: "refresh", text: "مساعدة في التعديل والتغيير" }] })}

<section class="section section--tight" id="book" style="margin-top:-56px;position:relative;z-index:3">
  <div class="container"><div class="form-card" data-reveal="zoom"><div class="form-head"><span class="ico ico--orange">${ic("takeoff")}</span><div><h2 class="h-l mb-0" style="font-size:1.4rem">ابحث عن رحلتك</h2><p class="muted mb-0" style="font-size:.95rem">املأ التفاصيل ويصلك أفضل خيار متاح عبر واتساب.</p></div></div>${flightForm()}${cityList()}</div></div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "وجهات رئيسية", title: "رحلات من إسطنبول إلى أهم الوجهات", lead: "اضغط على الوجهة لإرسال طلب سريع عبر واتساب. المدد الزمنية تقريبية للرحلات المباشرة." })}
    <div class="grid grid-4" data-stagger>
      ${routes.map(([a, b, t]) => `<a class="ctile" data-reveal href="${waUrl(`مرحباً أويا، أرغب بحجز طيران من ${a} إلى ${b}.`)}" target="_blank" rel="noopener"><span class="ico">${ic("plane")}</span><div><b>${a} ← ${b}</b><span>${t}</span></div></a>`).join("")}
    </div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "ما نقدمه", title: "خدمات الطيران في أويا" })}
    <div class="grid grid-3" data-stagger>
      ${[
        { icon: "takeoff", t: "تذاكر دولية", d: "ذهاب وعودة أو اتجاه واحد إلى معظم مدن العالم، على الشركات النظامية والاقتصادية." },
        { icon: "map", t: "رحلات داخلية في تركيا", d: "إسطنبول إلى طرابزون، أنطاليا، كابادوكيا، بودروم، إزمير وغيرها — مع ربطها ببرنامجك السياحي." },
        { icon: "users", t: "حجوزات العائلات والمجموعات", d: "تنسيق المقاعد معاً، وجبات الأطفال، وحجوزات المجموعات الكبيرة والشركات." },
        { icon: "suitcase", t: "أمتعة ومقاعد وخدمات إضافية", d: "إضافة وزن، اختيار المقاعد، الوجبات الخاصة وطلب المساعدة الخاصة في المطار." },
        { icon: "doc", t: "حجز للتأشيرة", d: "حجز مبدئي مؤكد لملف التأشيرة ثم إصدار التذكرة بعد الموافقة." },
        { icon: "refresh", t: "تعديل وتغيير الحجوزات", d: "نتولى التواصل مع شركة الطيران لتغيير الموعد أو الاسم وفق شروط التذكرة." },
      ].map((s) => `<div class="svc" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}
    </div>
    <div class="mt-3" data-reveal>
      <p class="muted" style="margin-bottom:10px">نحجز على أغلب شركات الطيران، ومنها على سبيل المثال:</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${["الخطوط التركية", "بيغاسوس", "AJet", "الخطوط السعودية", "طيران ناس", "فلاي دبي", "طيران الإمارات", "القطرية", "الكويتية", "العراقية", "الملكية الأردنية", "مصر للطيران", "طيران الجزيرة", "العربية للطيران"].map((x) => `<span class="chip">${x}</span>`).join("")}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div data-reveal>
      ${sectionHead({ eyebrow: "دليل سريع", title: "مطار إسطنبول أم مطار صبيحة؟", lead: "لإسطنبول مطاران دوليان كبيران، واختيار المطار المناسب يوفر عليك وقتاً وتكلفة في التنقل." })}
      <div class="note">${ic("info")}<span>إذا كان فندقك في تقسيم أو السلطان أحمد غالباً يكون مطار إسطنبول أنسب، وإذا كنت ستقيم في الجانب الآسيوي أو تتجه إلى سبانجا قد يكون صبيحة أقرب. نرتب لك الاستقبال من أي مطار.</span></div>
    </div>
    <div class="table-wrap" data-reveal="right"><table class="table">
      <thead><tr><th></th><th>مطار إسطنبول (IST)</th><th>مطار صبيحة (SAW)</th></tr></thead>
      <tbody>
        <tr><td><strong>الموقع</strong></td><td>الجانب الأوروبي (شمال المدينة)</td><td>الجانب الآسيوي (جنوب شرق المدينة)</td></tr>
        <tr><td><strong>الشركات</strong></td><td>الخطوط التركية ومعظم الشركات الدولية</td><td>بيغاسوس وAJet وشركات اقتصادية</td></tr>
        <tr><td><strong>يناسب</strong></td><td>تقسيم، شيشلي، السلطان أحمد، البوسفور</td><td>الجانب الآسيوي، سبانجا، بورصة برّاً</td></tr>
      </tbody></table></div>
  </div>
</section>

${faqBlock(faq, { title: "أسئلة شائعة عن حجز الطيران" })}
${ctaBand({ title: "وجهتك القادمة على بُعد رسالة", wa: "مرحباً أويا، أرغب بحجز تذكرة طيران." })}`;
  page.schemaGraph = g(page, [S.serviceNode(page, { name: "حجز تذاكر طيران", type: "Flight booking", description: page.description }), S.faqNode(page, faq)]);
  return page;
}

/* =================== HOTELS =================== */
export function hotelsPage(data) {
  const path = "hotels/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "فنادق ومنتجعات", path }];
  const page = { path, nav: "hotels", crumbs,
    title: "حجز فنادق ومنتجعات في تركيا للعائلات والأزواج | أويا",
    description: "فنادق إسطنبول وطرابزون وأوزنجول وسبانجا وأنطاليا: منتجعات، شقق فندقية، شاليهات وفلل بمسبح خاص للعائلات وشهر العسل. أرسل تواريخك واحصل على عرضك." };
  // Five stay types only: chalets have their own cabins section, conservative hotels have their own city card
  const types = [
    { icon: "star", t: "فنادق 4 و5 نجوم", img: "hotels-istanbul", d: "في أفضل المواقع: تقسيم، نيشانتاشي، البوسفور والسلطان أحمد — مع إطلالات مميزة.", tone: "svc--dark", cls: "b-hero" },
    { icon: "sun", t: "منتجعات شاملة كل شيء", img: "hotels-antalya", d: "منتجعات أنطاليا وبودروم للعائلات مع مسابح وأنشطة للأطفال.", cls: "b-3" },
    { icon: "users", t: "شقق فندقية للعائلات", img: "hero-hotels", d: "مساحات واسعة ومطابخ وغرف متعددة — مثالية للإقامات الطويلة.", cls: "b-3" },
    { icon: "heart", t: "فلل بمسبح خاص", img: "hotels-trabzon", d: "خصوصية تامة في سبانجا وطرابزون وبورصة للعائلات وشهر العسل.", cls: "b-3" },
    { icon: "balloon", t: "فنادق الكهوف", img: "hero-turkey", d: "تجربة فريدة في كابادوكيا مع إطلالة على المناطيد عند الشروق.", cls: "b-3" },
  ];
  // Best areas shown on each city card (same wording as the old area table, so translations carry over)
  const areas = {
    istanbul: ["تقسيم وشيشلي ونيشانتاشي", "السلطان أحمد والفاتح", "البوسفور (بشكتاش وأورتاكوي)"],
    trabzon: ["وسط المدينة وميدان"],
    sapanca: ["حول البحيرة ومعشوقية"],
    antalya: ["لارا، بيليك، كيمير وألانيا"],
  };
  const faq = [
    { q: "ما أفضل منطقة للسكن في إسطنبول للعائلات العربية؟", a: "تقسيم وشيشلي من أكثر المناطق طلباً لقربها من التسوق والمطاعم والمواصلات، والسلطان أحمد مناسبة لمن يركز على المعالم التاريخية، بينما تمنحك فنادق البوسفور أجواء هادئة وإطلالات مميزة. نرشح لك الأنسب حسب برنامجك." },
    { q: "هل توجد فنادق محافظة أو مناسبة للعائلات في تركيا؟", a: "نعم، تتوفر فنادق ومنتجعات تراعي خصوصية العائلات، بعضها بمسابح منفصلة أو فلل بمسابح خاصة، خصوصاً في أنطاليا وسبانجا وطرابزون. أخبرنا بمتطلباتك ونختار لك ما يناسبها." },
    { q: "هل أسعاركم أرخص من مواقع الحجز؟", a: "نقارن لك الخيارات بأمانة؛ في كثير من الحالات نقدم أسعاراً منافسة أو قيمة أفضل عند دمج الفندق مع التنقلات والبرنامج، وأحياناً يكون السعر مقارباً، لكنك تحصل مع أويا على متابعة شخصية بالعربية وحل أي مشكلة مع الفندق." },
    { q: "ما الفرق بين الفندق والشقة الفندقية؟", a: "الفندق يقدم خدمات يومية كاملة كالتنظيف والإفطار والاستقبال، بينما الشقة الفندقية توفر مساحة أكبر ومطبخاً وغرفاً متعددة بخدمات أخف — وهي مثالية للعائلات الكبيرة والإقامات الطويلة." },
    { q: "هل توفرون فللاً بمسبح خاص في طرابزون وسبانجا؟", a: "نعم، نوفر فللاً وبنغلات بمسابح خاصة في سبانجا ومعشوقية وطرابزون وبورصة، ويُنصح بالحجز المبكر في الصيف والأعياد لأن الطلب عليها مرتفع." },
    { q: "هل تحجزون فنادق خارج تركيا؟", a: "نعم، نحجز فنادق في مكة المكرمة والمدينة المنورة، دبي، جورجيا، أذربيجان، ماليزيا وغيرها، ونربطها بتذاكر الطيران والتأشيرة عند الحاجة." },
  ];
  page.body = `
${pageHero({ crumbs, ...heroPhoto("hero-hotels"), eyebrow: `${ic("star")} الخدمة الأكثر طلباً`, title: "حجز فنادق ومنتجعات في تركيا للعائلات والأزواج", lead: "من فنادق البوسفور الفاخرة إلى فلل سبانجا بمسابحها الخاصة وأكواخ أوزنجول — نختار لك الإقامة المناسبة ونتحقق من كل تفصيل قبل أن تصل.", icon: "hotel", page: path,
    chips: [{ icon: "check-circle", text: "تأكيد حجز مكتوب" }, { icon: "headset", text: "متابعة مع الفندق بالعربية" }, { icon: "heart", text: "خيارات لشهر العسل والعائلات" }] })}

<section class="section section--tight" id="book" style="margin-top:-56px;position:relative;z-index:3">
  <div class="container"><div class="form-card" data-reveal="zoom"><div class="form-head"><span class="ico ico--orange">${ic("bed")}</span><div><h2 class="h-l mb-0" style="font-size:1.4rem">احصل على عروض الفنادق</h2><p class="muted mb-0" style="font-size:.95rem">أرسل الوجهة والتواريخ ونرسل لك خيارات مختارة بالصور والأسعار.</p></div></div>${hotelForm()}</div></div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "حسب الوجهة", title: "فنادق في أجمل مدن تركيا" })}
    <div class="grid grid-3 hcities" data-stagger>${(data.hotels || []).map((h) => `<a class="dest" href="{{root}}hotels/${h.slug}/" data-reveal>${media({ img: h.img, prompt: h.imgPrompt, alt: h.h1, ratio: "", page: path, tone: h.destination ? toneFor(h.destination) : "gulf" })}<div class="dest__body"><h3>${h.slug === "family-friendly" ? "فنادق محافظة" : "فنادق " + esc(h.city)}</h3><span class="en">${esc(h.cityEn)}</span>${areas[h.slug] ? `<ul class="dest__areas">${areas[h.slug].map((x) => `<li>${ic("pin")}${x}</li>`).join("")}</ul>` : ""}<p>${esc(h.intro)}</p></div></a>`).join("")}</div>
  </div>
</section>

<section class="section section--white cab-sec" data-cab-sec hidden>
  <div class="container">
    ${sectionHead({ eyebrow: `${ic("cabin")} أكواخ وبنغلات`, title: "كوخ خشبي بين الغابات… بصور حقيقية", lead: "أكواخ نتعامل معها مباشرة في سبانجا وطرابزون: جاكوزي ومدفأة ومسبح وإطلالة. اختر كوخك ونؤكد لك التوفر كتابةً.", row: true, after: `<a class="btn btn--ghost" href="{{root}}cabins/">كل الأكواخ ${ic("arrow", "i-flip")}</a>` })}
    ${cabinsBlock({ limit: 3, filters: false })}
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "أنواع الإقامة", title: "إقامة تناسب حكايتك", lead: "سواء كانت رحلة عائلية طويلة أو شهر عسل أو رحلة عمل — لدينا الخيار المناسب." })}
    <div class="bento" data-stagger>
      ${types.map((t) => `<div class="svc svc--photo ${t.cls || ""}" data-reveal><div class="svc__bg" aria-hidden="true">${photoImg(t.img, { alt: "", sizes: (t.cls || "").includes("b-hero") ? "(max-width: 1040px) 92vw, 620px" : "(max-width: 1040px) 46vw, 320px", max: 1024 })}</div><span class="ico">${ic(t.icon)}</span><h3>${t.t}</h3><p>${t.d}</p><a class="link-arrow" href="${waUrl(`مرحباً أويا، أرغب بعروض: ${t.t}.`)}" target="_blank" rel="noopener" style="position:relative;z-index:3">اطلب عروضاً ${ic("arrow")}</a></div>`).join("")}
    </div>
  </div>
</section>

<section class="section section--navy on-dark">
  <div class="container">
    ${sectionHead({ eyebrow: "لماذا تحجز فندقك مع أويا؟", title: "أكثر من مجرد حجز", center: true })}
    <div class="features features--4" data-stagger>
      ${[
        { icon: "search", title: "نختار ولا نكدّس", text: "نرسل لك خيارات قليلة مختارة بعناية بدلاً من مئات النتائج المربكة." },
        { icon: "check-circle", title: "نتحقق من التفاصيل", text: "الإطلالة، نوع الأسرّة، الإفطار، المسبح، وسياسة الأطفال — قبل التأكيد." },
        { icon: "doc", title: "تأكيد مكتوب", text: "تصلك تفاصيل الحجز وسياسة الإلغاء بوضوح قبل الدفع." },
        { icon: "headset", title: "نحل المشكلات", text: "إذا طرأ أي أمر في الفندق نتواصل معهم نيابةً عنك وبلغتهم." },
      ].map((f) => featureItem({ ...f, tone: "ico--glass" })).join("")}
    </div>
  </div>
</section>

${faqBlock(faq, { title: "أسئلة شائعة عن حجز الفنادق" })}
${ctaBand({ title: "فندقك المثالي ينتظرك", wa: "مرحباً أويا، أرغب بحجز فندق." })}`;
  page.schemaGraph = g(page, [S.serviceNode(page, { name: "حجز فنادق ومنتجعات في تركيا", type: "Hotel booking", description: page.description, areaServed: "TR" }), S.faqNode(page, faq)]);
  return page;
}
