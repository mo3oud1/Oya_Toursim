// Cabins & bungalows (أكواخ وبنغلات) — the owner adds real cabins from /admin/ (data/cabins.json).
// Cards are drawn in the browser by assets/js/cabins.js so a cabin added in the panel shows without a rebuild;
// area and feature labels live in that script (T("…") strings, translated by the build).
import { ic, esc, sectionHead, faqBlock, ctaBand, pageHero, waBtn } from "../lib/ui.mjs";
import * as S from "../lib/schema.mjs";

const graph = (page, nodes = []) => [S.orgNode(), S.websiteNode(), S.webPageNode(page, "CollectionPage"), S.breadcrumbNode(page), ...nodes].filter(Boolean);

// group = the city page a cabin also appears on
const GROUPS = { sapanca: "سبانجا وكارتبه ومعشوقية", trabzon: "طرابزون وأوزنجول وأيدر" };

// listing block: filters + grid (+ empty state). `group` limits it to one region (city pages).
export function cabinsBlock({ group = "", limit = 0 } = {}) {
  const filters = group ? "" : `
  <div class="cab-filters" role="group" aria-label="تصفية الأكواخ">
    <div class="filters" data-cab-group>
      <button type="button" class="filter" aria-pressed="true" data-v="">الكل</button>
      <button type="button" class="filter" aria-pressed="false" data-v="sapanca">${GROUPS.sapanca}</button>
      <button type="button" class="filter" aria-pressed="false" data-v="trabzon">${GROUPS.trabzon}</button>
    </div>
    <label class="cab-sel"><span>عدد الأشخاص</span><select data-cab-guests><option value="0">أي عدد</option><option value="2">2 أو أكثر</option><option value="4">4 أو أكثر</option><option value="6">6 أو أكثر</option><option value="8">8 أو أكثر</option></select></label>
    <label class="cab-sel"><span>الترتيب</span><select data-cab-sort><option value="">الأحدث</option><option value="price">الأقل سعراً</option><option value="-price">الأعلى سعراً</option></select></label>
  </div>`;
  return `
<div class="cabins" data-cabins data-group="${group}" data-limit="${limit}">
  ${filters}
  <p class="cab-count muted" aria-live="polite"></p>
  <div class="grid grid-3 cab-grid"></div>
  <div class="cab-empty" hidden>
    <span class="ico">${ic("bed")}</span>
    <h3>نضيف الأكواخ المتاحة قريباً</h3>
    <p>أخبرنا بالمنطقة والتواريخ وعدد الأشخاص، ونرسل لك صوراً وأسعار أكواخ متاحة فعلاً.</p>
    ${waBtn("مرحباً أويا، أبحث عن كوخ أو بنغل للإقامة.", "اطلب خيارات عبر واتساب", "btn btn--wa")}
  </div>
  <noscript><p class="muted">لعرض الأكواخ فعّل JavaScript، أو راسلنا على واتساب لنرسل لك الخيارات.</p></noscript>
</div>`;
}

// section for the Sapanca / Trabzon hotel pages (hidden by the script while the region has no cabins)
export function cabinsSection(group) {
  return `
<section class="section section--white cab-sec" data-cab-sec hidden>
  <div class="container">
    ${sectionHead({ eyebrow: "أكواخ وبنغلات", title: `أكواخ وبنغلات في ${GROUPS[group]}`, lead: "أكواخ نتعامل معها مباشرة، بصورها الحقيقية وسعر الليلة. اختر الكوخ ونؤكد لك التوفر كتابةً قبل الدفع.", row: true, after: `<a class="btn btn--ghost" href="{{root}}cabins/">كل الأكواخ ${ic("arrow", "i-flip")}</a>` })}
    ${cabinsBlock({ group, limit: 6 })}
  </div>
</section>`;
}

export function cabinsPage() {
  const path = "cabins/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "فنادق ومنتجعات", path: "hotels/" }, { name: "أكواخ وبنغلات", path }];
  const page = { path, nav: "hotels", crumbs,
    title: "أكواخ وبنغلات في سبانجا وطرابزون وأوزنجول | أويا",
    description: "أكواخ وبنغلات خشبية في سبانجا وكارتبه ومعشوقية وطرابزون وأوزنجول بصور حقيقية وسعر الليلة: مسبح أو جاكوزي أو مدفأة وإطلالة. احجز عبر واتساب." };
  const faq = [
    { q: "هل الصور حقيقية للكوخ نفسه؟", a: "نعم، نعرض صور الكوخ الذي نحجزه لك. وإن تغيّر شيء في الكوخ قبل وصولك نخبرك به قبل التأكيد." },
    { q: "هل السعر المعروض نهائي؟", a: "السعر المعروض لليلة الواحدة ويتغيّر حسب الموسم وأيام الأسبوع وعدد الليالي. نرسل لك السعر النهائي مكتوباً مع التوفر قبل أي دفع." },
    { q: "هل المسبح خاص ومدفأ؟", a: "يختلف ذلك من كوخ لآخر. نوضّح لك في العرض إن كان المسبح أو الجاكوزي خاصاً بالكوخ، وهل هو مدفأ في الشتاء." },
    { q: "هل يمكن ترتيب الاستقبال والسيارة؟", a: "نعم، نرتّب الاستقبال من المطار والتنقل بسيارة خاصة مع سائق، وجولات يومية في المنطقة." },
  ];
  page.body = `
${pageHero({ crumbs, eyebrow: "فنادق ومنتجعات • أكواخ وبنغلات", title: "أكواخ وبنغلات في سبانجا وطرابزون وأوزنجول", lead: "بيوت خشبية بين الغابات والبحيرات: جاكوزي ومدفأة ومسبح خاص وإطلالة. اختر الكوخ من الصور الحقيقية، ونؤكد لك التوفر والسعر كتابةً.", icon: "bed", img: "hotels-sapanca", alt: "بنغل خشبي بين الأشجار في سبانجا",
  chips: [{ icon: "check-circle", text: "صور حقيقية لكل كوخ" }, { icon: "check-circle", text: "سعر الليلة واضح" }, { icon: "check-circle", text: "استقبال وسيارة خاصة عند الطلب" }],
  actions: `<a class="btn" href="#list">${ic("bed")}<span>تصفّح الأكواخ</span></a>${waBtn("مرحباً أويا، أبحث عن كوخ أو بنغل للإقامة.", "واتساب", "btn btn--glass")}` })}

<section class="section" id="list">
  <div class="container">
    ${sectionHead({ eyebrow: "اختر كوخك", title: "الأكواخ والبنغلات المتاحة", lead: "صفِّ حسب المنطقة وعدد الأشخاص، ثم اضغط «احجز» لترسل لنا طلبك على واتساب." })}
    ${cabinsBlock()}
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "كيف تحجز", title: "من الصورة إلى المفتاح في 3 خطوات", center: true })}
    <div class="steps" data-stagger>
      <div class="step" data-reveal><span class="ico">${ic("bed")}</span><h3>اختر الكوخ</h3><p>من الصور والمواصفات وسعر الليلة.</p></div>
      <div class="step" data-reveal><span class="ico">${ic("whatsapp")}</span><h3>أرسل التواريخ</h3><p>عدد الليالي والأشخاص، ونؤكد التوفر والسعر النهائي كتابةً.</p></div>
      <div class="step" data-reveal><span class="ico">${ic("check-circle")}</span><h3>استلم كوخك</h3><p>مع استقبال من المطار وسيارة خاصة إن رغبت.</p></div>
    </div>
  </div>
</section>

${faqBlock(faq, { title: "أسئلة عن الأكواخ والبنغلات" })}
${ctaBand({ title: "ما وجدت الكوخ المناسب؟", lead: "أخبرنا بما تبحث عنه، ونرسل لك خيارات أخرى متاحة في تواريخك.", wa: "مرحباً أويا، أبحث عن كوخ أو بنغل للإقامة." })}`;
  page.schemaGraph = graph(page, [S.serviceNode(page, { name: "أكواخ وبنغلات في تركيا", type: "Lodging reservation", description: page.description, areaServed: "TR" }), S.faqNode(page, faq)]);
  return page;
}
