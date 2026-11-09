import { site } from "../site.mjs";
import { ic, ar, esc, strip, sectionHead, faqBlock, ctaBand, pageHero, waBtn, waUrl, packageCard, destCard, visaCard, postCard, featureItem } from "../lib/ui.mjs";
import { tourForm, visaForm } from "../lib/forms.mjs";
import { visaSteps } from "../lib/templates.mjs";
import * as S from "../lib/schema.mjs";
import { finderSection } from "../lib/interactive.mjs";

const g = (page, extra, type = "CollectionPage") => [S.orgNode(), S.websiteNode(), S.webPageNode(page, type), S.breadcrumbNode(page), ...extra].filter(Boolean);
const filterBar = (target, opts) => `<div class="filters" data-filter-group="${target}" role="group" aria-label="تصفية البرامج">${opts.map(([k, l], i) => `<button class="filter" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div><p class="filter-count" data-count-for="${target}" aria-live="polite"></p><div class="empty-state" data-empty-for="${target}"><h3>لا توجد برامج بهذا التصنيف حالياً</h3><p class="muted">أخبرنا بما تبحث عنه ونصمم لك برنامجاً خاصاً.</p><a class="btn btn--wa" href="https://wa.me/905399334331?text=${encodeURIComponent("مرحباً أويا، أرغب ببرنامج مخصص.")}" target="_blank" rel="noopener">اطلب برنامجاً مخصصاً</a></div>`;

/* =================== TURKEY HUB =================== */
export function turkeyHub(data) {
  const path = "turkey-tours/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "السياحة في تركيا", path }];
  const page = { path, nav: "turkey", crumbs,
    title: "السياحة في تركيا: برامج وجولات بالعربي | أويا للسياحة",
    description: "برامج سياحية في إسطنبول وطرابزون وأوزنجول وسبانجا وبورصة وأنطاليا وكابادوكيا مع سائق عربي وفنادق مختارة. صمّم رحلتك واحجز عبر واتساب." };
  const tr = data.packages.filter((p) => p.region === "turkey");
  const faq = [
    { q: "ما أفضل المدن السياحية في تركيا للعائلات؟", a: "إسطنبول للتسوق والمعالم، وطرابزون وأوزنجول للطبيعة والأجواء الباردة، وسبانجا وبورصة للبحيرات والجبال القريبة من إسطنبول، وأنطاليا للمنتجعات والشواطئ. يجمع كثير من العائلات بين إسطنبول ومدينة طبيعية في رحلة واحدة." },
    { q: "كم يوماً تكفي لزيارة تركيا؟", a: "5 أيام تكفي لإسطنبول وحدها، و7–8 أيام لإسطنبول مع بورصة أو سبانجا، و10 أيام أو أكثر للجمع بين إسطنبول والشمال التركي (طرابزون وأوزنجول). ونصمم البرنامج حسب أيامك المتاحة." },
    { q: "ما أفضل وقت للسفر إلى تركيا؟", a: "الربيع (أبريل–يونيو) والخريف (سبتمبر–أكتوبر) مثاليان للطقس المعتدل، والصيف هو موسم العائلات والشمال التركي، بينما الشتاء مناسب لعشاق الثلوج في أولوداغ وأسعار الفنادق فيه أقل عموماً." },
    { q: "ما هو الشمال التركي وما أهم مدنه؟", a: "يُقصد به منطقة البحر الأسود شمال شرق تركيا، وأهم وجهاتها طرابزون وأوزنجول وريزه وهضبة أيدر وسوملا وغيرها، وتشتهر بالغابات والضباب والهضاب الخضراء والأجواء المنعشة صيفاً." },
    { q: "هل الأفضل سائق خاص أم جولات جماعية؟", a: "السائق الخاص يمنح العائلات حرية وخصوصية ومرونة في التوقيت والتوقف، وهو الخيار الأكثر طلباً لدى عملائنا العرب، بينما الجولات الجماعية أوفر لبعض الرحلات اليومية. نوفر الخيارين." },
    { q: "كم تكلفة السفر إلى تركيا لمدة أسبوع؟", a: "تختلف التكلفة حسب الموسم وفئة الفندق وعدد المسافرين ونوع السيارة، لذلك نرسل لك عرض سعر مفصلاً حسب تفاصيل رحلتك بدلاً من رقم عام قد لا يناسبك." },
  ];
  page.body = `
${pageHero({ crumbs, eyebrow: "السياحة في تركيا", title: "السياحة في تركيا مع أويا: اختر وجهتك", lead: "ثماني وجهات مختارة، وبرامج يوماً بيوم، وسائقون يتحدثون العربية، وفنادق تناسب العائلات والأزواج — من إسطنبول إلى الشمال التركي والمتوسط وكابادوكيا.", icon: "mosque", page: path,
    chips: [{ icon: "pin", text: `${ar(data.destinations.length)} وجهات` }, { icon: "route", text: `${ar(tr.length)} برنامجاً جاهزاً` }, { icon: "car", text: "سائق يتحدث العربية" }],
    actions: `${waBtn("مرحباً أويا، أرغب ببرنامج سياحي في تركيا.", "صمّم رحلتي")}<a class="btn btn--glass" href="#programs">${ic("route")}<span>البرامج الجاهزة</span></a>` })}

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "الوجهات", title: "وجهات تركيا الأكثر طلباً", lead: "اضغط على أي وجهة لتعرف أبرز معالمها وأفضل وقت لزيارتها وأين تقيم، والبرامج التي تشملها." })}
    <div class="grid grid-4" data-stagger>${data.destinations.map((d) => `<div style="aspect-ratio:3/4;display:grid">${destCard(d, path, { count: data.packages.filter((p) => (p.dest || []).includes(d.slug)).length })}</div>`).join("")}</div>
  </div>
</section>

<section class="section section--white" id="programs">
  <div class="container">
    ${sectionHead({ eyebrow: "برامج يوماً بيوم", title: "برامج سياحية في تركيا", lead: "برامج جاهزة لكل الأذواق والميزانيات، وكلها قابلة للتعديل.", row: true, after: `<a class="btn btn--ghost" href="{{root}}packages/">كل البرامج ${ic("arrow", "i-flip")}</a>` })}
    ${filterBar("tr-grid", [["all", "الكل"], ["family", "عائلي"], ["honeymoon", "شهر عسل"], ["nature", "طبيعة"], ["city", "مدن"], ["luxury", "فاخر"], ["budget", "اقتصادي"], ["winter", "شتوي"]])}
    <div class="grid grid-3" id="tr-grid">${tr.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="prose" data-reveal>
      <p class="eyebrow">دليل سريع</p>
      <h2 class="h-l" style="margin-top:0">كيف تخطط لرحلتك في تركيا؟</h2>
      <p><strong>إسطنبول</strong> هي البداية الطبيعية لمعظم الرحلات: معالم تاريخية، تسوق، رحلات في البوسفور ومطاعم لكل الأذواق. ومنها يسهل الوصول برّاً إلى <a href="{{root}}turkey-tours/sapanca/">سبانجا</a> و<a href="{{root}}turkey-tours/bursa/">بورصة</a> في يوم أو يومين.</p>
      <p>إن كنت تبحث عن الطبيعة والأجواء الباردة صيفاً فاتجه إلى <strong>الشمال التركي</strong>: <a href="{{root}}turkey-tours/trabzon/">طرابزون</a> و<a href="{{root}}turkey-tours/uzungol/">أوزنجول</a> وهضاب ريزه — والطيران الداخلي من إسطنبول لا يتجاوز ساعتين تقريباً.</p>
      <p>ولعشاق البحر والمنتجعات <a href="{{root}}turkey-tours/antalya/">أنطاليا</a> و<a href="{{root}}turkey-tours/bodrum/">بودروم</a>، أما تجربة المناطيد الشهيرة فمكانها <a href="{{root}}turkey-tours/cappadocia/">كابادوكيا</a>.</p>
    </div>
    <div class="features" style="grid-template-columns:1fr" data-stagger>
      ${[
        { icon: "car", title: "سائق خاص يتحدث العربية", text: "حرية في التوقيت والتوقف وخصوصية للعائلة طوال الجولات." },
        { icon: "hotel", title: "فنادق مختارة بعناية", text: "مواقع مناسبة للعائلات وقريبة من الخدمات والمطاعم الحلال." },
        { icon: "plane", title: "طيران داخلي منسّق", text: "نربط رحلاتك الداخلية ببرنامجك لتوفير الوقت." },
        { icon: "whatsapp", title: "متابعة يومية", text: "فريقنا معك على واتساب طوال الرحلة لأي طلب أو تعديل." },
      ].map((f) => featureItem(f)).join("")}
    </div>
  </div>
</section>

<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "برنامج مخصص", title: "صمّم رحلتك في تركيا", lead: "اختر الوجهة وعدد الأيام ومستوى الرحلة، ونرسل لك برنامجاً مقترحاً مع الأسعار." })}</div>
    <div class="form-card" data-reveal="zoom">${tourForm()}</div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن السياحة في تركيا" })}
${ctaBand({})}`;
  page.schemaGraph = g(page, [S.itemListNode(page, data.destinations.map((d) => ({ path: `turkey-tours/${d.slug}/`, name: d.name }))), S.faqNode(page, faq)]);
  return page;
}

/* =================== WORLD HUB =================== */
export function worldHub(data) {
  const path = "world-tours/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "السياحة خارج تركيا", path }];
  const page = { path, nav: "world", crumbs,
    title: "رحلات سياحية من إسطنبول إلى العالم | أويا للسياحة",
    description: "برامج من تركيا إلى جورجيا وأذربيجان والبوسنة وماليزيا وبالي وتايلاند والمالديف ومصر وأوزبكستان مع الفنادق والجولات والتأشيرة. اطلب عرضك الآن." };
  const w = data.packages.filter((p) => p.region === "world");
  const faq = [
    { q: "هل تشمل البرامج تذاكر الطيران من إسطنبول؟", a: "أسعار البرامج تُحسب عادةً دون الطيران الدولي لتمنحك حرية الاختيار، ويمكننا إضافة تذاكر الطيران من إسطنبول أو من مدينتك في نفس العرض." },
    { q: "هل تساعدون في تأشيرة الوجهة؟", a: "نعم، نوضح لك متطلبات الدخول حسب جنسيتك وبلد إقامتك، ونساعدك في التأشيرات الإلكترونية أو ملفات السفارات عند الحاجة، مع العلم أن قرار المنح يعود للجهات الرسمية." },
    { q: "ما أقرب وجهة سياحية من إسطنبول؟", a: "جورجيا وأذربيجان والبوسنة من أقرب الوجهات وأكثرها طلباً، فالطيران إليها يستغرق ساعتين إلى ثلاث ساعات تقريباً، وتتميز بالطبيعة والأسعار المعقولة." },
    { q: "ما أفضل وجهة لشهر العسل انطلاقاً من تركيا؟", a: "المالديف وبالي للرومانسية الاستوائية، وتايلاند وماليزيا للتنوع بين المدن والجزر، وجورجيا لمحبي الجبال والطبيعة. نقترح عليك الأنسب حسب الموسم والميزانية." },
    { q: "هل يمكن السفر برّاً من طرابزون إلى باتومي؟", a: "نعم، باتومي في جورجيا قريبة من الحدود التركية شرق طرابزون، ويمكن ترتيب الرحلة برّاً ضمن برنامج يجمع الشمال التركي وجورجيا، بشرط استيفاء متطلبات دخول جورجيا حسب جنسيتك." },
  ];
  page.body = `
${pageHero({ crumbs, eyebrow: "السياحة خارج تركيا", title: "رحلات من إسطنبول إلى أجمل وجهات العالم", lead: "جورجيا وأذربيجان والبوسنة القريبة، وماليزيا وبالي وتايلاند والمالديف البعيدة، ومصر وأوزبكستان — برامج متكاملة مع الفنادق والجولات والمساعدة في التأشيرة.", icon: "globe", page: path,
    chips: [{ icon: "globe", text: `${ar(w.length)} وجهات` }, { icon: "passport", text: "مساعدة في التأشيرات" }, { icon: "takeoff", text: "الطيران عند الطلب" }] })}
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "الوجهات", title: "برامج خارج تركيا", lead: "اختر وجهتك واطّلع على البرنامج كاملاً يوماً بيوم." })}
    ${filterBar("w-grid", [["all", "الكل"], ["family", "عائلي"], ["honeymoon", "شهر عسل"], ["nature", "طبيعة"], ["beach", "شواطئ"], ["city", "مدن"], ["budget", "اقتصادي"], ["luxury", "فاخر"]])}
    <div class="grid grid-3" id="w-grid">${w.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>
<section class="section section--white">
  <div class="container split">
    <div data-reveal>
      ${sectionHead({ eyebrow: "قبل أن تسافر", title: "التأشيرة أولاً… ونحن معك", lead: "متطلبات الدخول تختلف حسب الجنسية وبلد الإقامة. أرسل لنا جنسيتك ونوع إقامتك في تركيا، ونخبرك بما تحتاجه لكل وجهة." })}
      <div class="btn-row"><a class="btn btn--navy" href="{{root}}visas/">${ic("passport")}<span>التأشيرات الدولية</span></a>${waBtn("مرحباً أويا، أرغب بمعرفة متطلبات تأشيرة وجهة سياحية.", "اسأل عن تأشيرتك")}</div>
    </div>
    <div class="form-card" data-reveal="zoom">${tourForm()}</div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن الرحلات خارج تركيا" })}
${ctaBand({})}`;
  page.schemaGraph = g(page, [S.itemListNode(page, w.map((p) => ({ path: `packages/${p.slug}/`, name: p.title }))), S.faqNode(page, faq)]);
  return page;
}

/* =================== PACKAGES HUB =================== */
export function packagesHub(data) {
  const path = "packages/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "البرامج السياحية", path }];
  const page = { path, nav: "turkey", crumbs,
    title: "عروض وبكجات سياحية في تركيا والعالم يوماً بيوم | أويا",
    description: "برامج سياحية يوماً بيوم: إسطنبول وطرابزون وبورصة وسبانجا وأنطاليا، وجورجيا وأذربيجان وماليزيا، للعائلات وشهر العسل. اختر برنامجك واحجز عبر واتساب." };
  const all = [...data.packages].sort((a, b) => (a.region === b.region ? 0 : a.region === "turkey" ? -1 : 1));
  const faq = [
    { q: "ماذا تشمل الباقة السياحية؟", a: "تختلف حسب البرنامج، وتشمل عادةً الاستقبال والتوديع من المطار، الإقامة في فنادق مع الإفطار، الجولات بسيارة خاصة مع سائق يتحدث العربية. تجد قائمة «يشمل / لا يشمل» واضحة في صفحة كل برنامج." },
    { q: "هل تشمل الباقة تذاكر الطيران الدولية؟", a: "لا تشملها افتراضياً، ويمكن إضافتها في العرض نفسه من مدينتك أو من إسطنبول." },
    { q: "هل يمكن تعديل البرنامج حسب رغبتي؟", a: "نعم بالكامل: عدد الأيام، ترتيب المدن، فئة الفنادق، نوع السيارة، وإضافة أنشطة خاصة." },
    { q: "هل السعر للشخص أم للعائلة؟", a: "نرسل لك عرض سعر مفصلاً حسب عدد المسافرين والغرف ونوع السيارة، ونوضح فيه إن كان السعر للشخص أو للمجموعة كاملة." },
    { q: "ما سياسة الإلغاء؟", a: "تعتمد على الفنادق والخدمات المحجوزة والموسم، ونرسلها لك مكتوبة مع العرض قبل أي دفع حتى تكون على علم كامل." },
    { q: "متى يجب أن أحجز لموسم الصيف والأعياد؟", a: "يُنصح بالحجز قبل أسابيع كافية، خصوصاً للفلل والشاليهات في سبانجا وطرابزون وأوزنجول، لأن الطلب عليها يرتفع كثيراً في الصيف والأعياد." },
  ];
  page.body = `
${pageHero({ crumbs, eyebrow: "البرامج السياحية", title: "عروض وبرامج سياحية يوماً بيوم", lead: "برامج مدروسة داخل تركيا وخارجها لكل الأذواق: عائلية، شهر عسل، طبيعة، مدن، شتوية وفاخرة — وكلها قابلة للتعديل.", icon: "route", page: path,
    chips: [{ icon: "route", text: `${ar(all.length)} برنامجاً` }, { icon: "refresh", text: "تعديل كامل حسب رغبتك" }, { icon: "car", text: "سائق يتحدث العربية" }],
    actions: `<a class="btn" href="#finder">${ic("sparkles")}<span>ساعدني في الاختيار</span></a>` })}
${finderSection(data, { compact: true })}
<section class="section">
  <div class="container">
    ${filterBar("all-grid", [["all", "الكل"], ["turkey", "داخل تركيا"], ["world", "خارج تركيا"], ["family", "عائلي"], ["honeymoon", "شهر عسل"], ["nature", "طبيعة"], ["luxury", "فاخر"], ["budget", "اقتصادي"], ["winter", "شتوي"], ["beach", "شواطئ"]])}
    <div class="grid grid-3" id="all-grid">${all.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>
<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "برنامج خاص بك", title: "لم تجد ما يناسبك؟", lead: "أخبرنا بما تحب ونصمم لك برنامجاً جديداً بالكامل — المدن، الأيام، الفنادق، والأنشطة." })}</div>
    <div class="form-card" data-reveal="zoom">${tourForm()}</div>
  </div>
</section>
${faqBlock(faq, { title: "أسئلة شائعة عن البرامج والباقات" })}
${ctaBand({})}`;
  page.schemaGraph = g(page, [S.itemListNode(page, all.map((p) => ({ path: `packages/${p.slug}/`, name: p.title }))), S.faqNode(page, faq)]);
  return page;
}

/* =================== VISA HUBS =================== */
const HUBS = {
  saudi: {
    path: "saudi-visa/", name: "تأشيرات السعودية", icon: "mosque",
    title: "تأشيرة السعودية من تركيا: سياحية وعمرة وزيارة | أويا",
    description: "نساعدك في تأشيرة السعودية من تركيا: السياحية، العمرة، الزيارة العائلية والشخصية، الأعمال، الترانزيت وتأشيرة المقيمين في الخليج. استشرنا عبر واتساب.",
    h1: "تأشيرات السعودية بجميع أنواعها من تركيا",
    lead: "سياحة، عمرة، زيارة عائلية أو شخصية، أعمال أو ترانزيت — نحدد لك التأشيرة المناسبة، ونجهز ملفك، ونتابع طلبك حتى الصدور، ونرتب لك الطيران والفنادق في مكة والمدينة.",
    faq: [
      { q: "ما التأشيرة المناسبة لي لزيارة السعودية؟", a: "يعتمد ذلك على هدف الزيارة وجنسيتك: للسياحة والعمرة خارج موسم الحج غالباً التأشيرة السياحية لمن تشملهم شروطها، وللعمرة تأشيرة العمرة، ولزيارة الأقارب الزيارة العائلية، وللأعمال تأشيرة زيارة الأعمال. أرسل لنا تفاصيلك ونحدد لك الأنسب." },
      { q: "هل يمكن أداء العمرة بالتأشيرة السياحية؟", a: "وفق الأنظمة المعلنة، تتيح التأشيرة السياحية أداء العمرة خارج موسم الحج مع حجز موعد العمرة عبر تطبيق «نسك». نؤكد لك آخر التحديثات قبل السفر." },
      { q: "هل يستطيع المقيم في تركيا الحصول على تأشيرة السعودية؟", a: "يعتمد ذلك على جنسيته ونوع التأشيرة؛ فالمواطنون الأتراك ضمن الدول المؤهلة للتأشيرة السياحية الإلكترونية، بينما تخضع الجنسيات الأخرى لشروط مختلفة. تواصل معنا بجنسيتك ونوع إقامتك لنخبرك بالخيارات." },
      { q: "كم يستغرق إصدار التأشيرة؟", a: "تختلف المدة حسب نوع التأشيرة؛ التأشيرات الإلكترونية تصدر عادةً بسرعة، بينما تحتاج تأشيرات الزيارة العائلية والأعمال وقتاً أطول. نعطيك تقديراً واقعياً عند فتح الطلب." },
      { q: "هل تضمنون الموافقة على التأشيرة؟", a: "لا يمكن لأي جهة خدمات ضمان الموافقة، فالقرار للسلطات السعودية وحدها. دورنا تجهيز ملف صحيح ومكتمل ومتابعته لرفع فرص القبول وتجنب الأخطاء." },
    ],
  },
  gcc: {
    path: "gcc-visas/", name: "تأشيرات دول الخليج", icon: "burj",
    title: "فيزا دبي وتأشيرات دول الخليج من تركيا | أويا",
    description: "تأشيرات الإمارات (دبي) وقطر وعُمان والبحرين والكويت من إسطنبول لمختلف الجنسيات، مع متابعة التأشيرة الخليجية الموحدة. أرسل جوازك عبر واتساب لمعرفة أهليتك.",
    h1: "تأشيرات دول مجلس التعاون الخليجي",
    lead: "فيزا دبي والإمارات، قطر، عُمان، البحرين والكويت — نحدد لك نوع التأشيرة المناسب لجنسيتك، ونقدم الطلب ونتابعه، ونرتب الطيران والفندق إن رغبت.",
    faq: [
      { q: "كم يستغرق إصدار فيزا دبي؟", a: "تصدر التأشيرات السياحية الإماراتية عادةً خلال أيام عمل قليلة عند اكتمال المستندات، وقد تختلف المدة حسب الجنسية والموسم. نعطيك تقديراً دقيقاً عند فتح الطلب." },
      { q: "هل يستطيع السوري أو العراقي المقيم في تركيا الحصول على فيزا دبي؟", a: "يمكن التقديم لمختلف الجنسيات، لكن المتطلبات وفرص القبول تختلف حسب الجنسية والملف. أرسل لنا صورة جوازك ونوع إقامتك لنقيّم الطلب قبل التقديم." },
      { q: "ما الفرق بين فيزا 30 يوماً و60 يوماً؟", a: "الفرق في مدة الإقامة المسموحة داخل الدولة، وتوجد خيارات دخول واحد أو متعدد. نختار معك النوع المناسب لمدة رحلتك." },
      { q: "متى تبدأ التأشيرة الخليجية الموحدة؟", a: "تابع صفحة التأشيرة الخليجية الموحدة لدينا لآخر المستجدات المعلنة؛ ونبلغ المسجلين لدينا فور الإعلان الرسمي عن بدء التقديم." },
      { q: "هل تضمنون الموافقة؟", a: "لا، القرار للجهات الرسمية في كل دولة. دورنا تجهيز الطلب بشكل صحيح ومتابعته وإبلاغك بالنتيجة فور صدورها." },
    ],
  },
  intl: {
    path: "visas/", name: "التأشيرات الدولية", icon: "globe",
    title: "فيزا شنغن وبريطانيا وأمريكا وكندا من تركيا | أويا",
    description: "نجهز ملف تأشيرتك لشنغن وبريطانيا وأمريكا وكندا من إسطنبول: تعبئة الطلب، الحجوزات، التأمين ومراجعة الأوراق. استشر خبيرنا عبر واتساب الآن.",
    h1: "التأشيرات الدولية: شنغن وبريطانيا وأمريكا وكندا",
    lead: "نساعد المقيمين في تركيا والمواطنين الأتراك في تجهيز ملفات التأشيرات الدولية: تعبئة الاستمارات، حجوزات الفندق والطيران، تأمين السفر، الترجمة ومراجعة المستندات قبل الموعد.",
    faq: [
      { q: "هل يمكن للمقيم في تركيا التقديم على فيزا شنغن من إسطنبول؟", a: "نعم في الغالب، إذا كانت لديك إقامة سارية في تركيا يقبلها مركز التأشيرات للدولة المعنية. تختلف الشروط بين الدول ونوع الإقامة، ونراجع وضعك قبل البدء." },
      { q: "ما الأوراق المطلوبة لفيزا شنغن؟", a: "عادةً: جواز سفر ساري، استمارة الطلب، صور حديثة، إثبات الإقامة، كشف حساب بنكي، إثبات العمل أو الدراسة، حجز فندق وطيران، وتأمين سفر. التفاصيل في صفحة تأشيرة شنغن." },
      { q: "هل تحجزون مواعيد مراكز التأشيرات؟", a: "مواعيد مراكز التأشيرات الرسمية مجانية وتُحجز عبر مواقعها الرسمية، ونحن نرشدك في خطوات الحجز ونجهز ملفك بالكامل. لا نبيع «مواعيد مضمونة» ولا ننصح بالتعامل مع من يدّعي ذلك." },
      { q: "هل تضمنون الموافقة على التأشيرة؟", a: "لا، القرار للسفارة أو القنصلية وحدها. دورنا رفع جودة الملف وتجنب الأخطاء الشائعة التي تسبب الرفض." },
      { q: "هل تساعدون في التأشيرات الإلكترونية السهلة؟", a: "نعم، مثل تأشيرات أذربيجان وبعض وجهات آسيا وغيرها حسب جنسيتك، ونربطها ببرامجنا السياحية خارج تركيا." },
    ],
  },
};
export function visaHub(group, data) {
  const H = HUBS[group];
  const list = data.visas.filter((v) => v.group === group);
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: H.name, path: H.path }];
  const page = { path: H.path, nav: "visas", crumbs, title: H.title, description: H.description };
  const comparison = group !== "intl" ? `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "مقارنة سريعة", title: `مقارنة ${H.name}`, lead: "ملخص عام للمساعدة على الاختيار، والتفاصيل الدقيقة في صفحة كل تأشيرة." })}
    <div class="table-wrap" data-reveal><table class="table"><thead><tr><th>التأشيرة</th>${(list[0]?.facts || []).slice(0, 3).map((f) => `<th>${esc(f.k)}</th>`).join("")}<th></th></tr></thead><tbody>
      ${list.map((v) => `<tr><td><strong>${esc(v.name)}</strong></td>${(v.facts || []).slice(0, 3).map((f) => `<td>${strip(f.v)}</td>`).join("")}<td><a class="link-arrow" href="{{root}}${H.path}${v.slug}/">التفاصيل ${ic("arrow")}</a></td></tr>`).join("")}
    </tbody></table></div>
  </div>
</section>` : `
<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "وجهات أسهل", title: "تأشيرات إلكترونية ووجهات قريبة", lead: "بعض الوجهات تتيح تأشيرات إلكترونية أو دخولاً ميسّراً لجنسيات معينة. المتطلبات تختلف حسب الجنسية، فراسلنا لنتأكد لك." })}
    <div style="display:flex;flex-wrap:wrap;gap:10px" data-reveal>${["جورجيا", "أذربيجان", "البوسنة والهرسك", "ماليزيا", "إندونيسيا", "تايلاند", "مصر", "أوزبكستان", "المالديف"].map((x) => `<a class="chip" style="font-size:1rem;padding:.55em 1.1em" href="${waUrl(`مرحباً أويا، ما متطلبات دخول ${x} لجنسيتي؟`)}" target="_blank" rel="noopener">${ic("passport")}${x}</a>`).join("")}</div>
  </div>
</section>`;
  page.body = `
${pageHero({ crumbs, eyebrow: "مركز التأشيرات في أويا", title: H.h1, lead: H.lead, icon: H.icon, page: H.path,
    chips: [{ icon: "passport", text: `${ar(list.length)} أنواع تأشيرات` }, { icon: "doc", text: "تجهيز ومراجعة الملف" }, { icon: "whatsapp", text: "متابعة حتى الصدور" }],
    actions: `${waBtn(`مرحباً أويا، أرغب بالاستفسار عن ${H.name}.`, "استشارة مجانية عبر واتساب")}<a class="btn btn--glass" href="#book">${ic("send")}<span>ابدأ طلبك</span></a>` })}
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "اختر تأشيرتك", title: H.name, lead: "اختر نوع التأشيرة لمعرفة الشروط والمستندات والمدة، أو أرسل لنا هدف زيارتك ونحدد لك الأنسب." })}
    <div class="grid grid-3" data-stagger>${list.map((v) => visaCard(v, H.path, H.path)).join("")}</div>
  </div>
</section>
${comparison}
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "كيف نعمل", title: "4 خطوات واضحة", center: true })}
    <div class="steps" data-stagger>${visaSteps.map((s) => `<div class="step" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>
    <div class="note mt-2">${ic("info")}<span>أويا للسياحة جهة خدمات سفر مستقلة تساعدك في تجهيز الطلبات ومتابعتها، وليست جهة حكومية أو مركز تأشيرات رسمياً. قرار منح التأشيرة يعود للسلطات المختصة، والرسوم والشروط قابلة للتغيير ونؤكدها لك عند الطلب.</span></div>
  </div>
</section>
<section class="section section--white" id="book">
  <div class="container split">
    <div data-reveal>${sectionHead({ eyebrow: "ابدأ الآن", title: "اطلب تأشيرتك", lead: "أرسل بياناتك الأساسية، ويتواصل معك مختص التأشيرات لتأكيد الأهلية والمتطلبات والمدة." })}</div>
    <div class="form-card" data-reveal="zoom">${visaForm()}</div>
  </div>
</section>
${faqBlock(H.faq, { title: `أسئلة شائعة عن ${H.name}` })}
${ctaBand({ title: "أوراقك علينا… ورحلتك عليك", wa: `مرحباً أويا، أرغب بالاستفسار عن ${H.name}.` })}`;
  page.schemaGraph = g(page, [S.serviceNode(page, { name: H.name, type: "Visa assistance", description: H.description }), S.itemListNode(page, list.map((v) => ({ path: `${H.path}${v.slug}/`, name: v.name }))), S.faqNode(page, H.faq)]);
  return page;
}

/* =================== BLOG HUB =================== */
export function blogHub(data) {
  const path = "blog/";
  const crumbs = [{ name: "الرئيسية", path: "" }, { name: "المدونة", path }];
  const page = { path, nav: "blog", crumbs,
    title: "دليل السفر إلى تركيا ونصائح السياحة | مدونة أويا",
    description: "مقالات عملية عن السياحة في تركيا والعالم: البرامج، التكاليف، أفضل الأوقات، الفنادق والتأشيرات وتذاكر المباريات. اقرأ وخطط لرحلتك القادمة." };
  page.body = `
${pageHero({ crumbs, eyebrow: "المدونة", title: "مدونة أويا للسفر والسياحة", lead: "أدلة عملية مكتوبة بخبرة محلية من إسطنبول: متى تسافر، كم تكلف الرحلة، ماذا تزور، وكيف تجهز تأشيرتك.", icon: "doc", page: path })}
<section class="section"><div class="container"><div class="grid grid-3" data-stagger>${data.posts.map((p) => postCard(p, path)).join("")}</div></div></section>
${ctaBand({})}`;
  page.schemaGraph = g(page, [S.itemListNode(page, data.posts.map((p) => ({ path: `blog/${p.slug}/`, name: p.title })))]);
  return page;
}
