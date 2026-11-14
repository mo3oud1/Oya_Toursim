import { site } from "../site.mjs";
import { ic, ar, sectionHead, faqBlock, ctaBand, packageCard, destCard, visaCard, postCard, waBtn, featureItem, photoSources, photoImg, registerImage } from "../lib/ui.mjs";
import { booker, cityList } from "../lib/forms.mjs";
import { flightSvg } from "../lib/art.mjs";
import * as S from "../lib/schema.mjs";
import { superCup } from "./matches.mjs";
import { globeSection, finderSection } from "../lib/interactive.mjs";

export function homePage(data) {
  const path = "";
  const page = {
    path, nav: "home",
    title: "أويا للسياحة | شركة سياحة في إسطنبول للعرب — فنادق وبرامج وتأشيرات",
    description: "أويا للسياحة في إسطنبول: فنادق ومنتجعات، برامج سياحية في تركيا وخارجها، تذاكر طيران، تأشيرات السعودية والخليج وشنغن، وتذاكر المباريات. احجز عبر واتساب.",
  };
  const featured = data.packages.filter((p) => p.featured).slice(0, 6);
  const visasBy = (g) => data.visas.filter((v) => v.group === g);
  const counts = { tr: data.packages.filter((p) => p.region === "turkey").length, world: data.packages.filter((p) => p.region === "world").length, visas: data.visas.filter((v) => v.status !== "not-launched").length, dest: data.destinations.length };
  const faq = [
    { q: "هل فريقكم يتحدث العربية؟", a: "نعم، فريق أويا للسياحة يتواصل معك بالعربية من أول رسالة حتى عودتك، ونوفّر في البرامج السياحية سائقين يتحدثون العربية لتكون رحلتك مريحة دون أي حاجز لغوي." },
    { q: "كيف أحجز معكم؟", a: "أرسل لنا وجهتك وتواريخك وعدد المسافرين عبر واتساب أو من نموذج الحجز في الموقع، فنرسل لك عرضاً مكتوباً واضحاً بالتفاصيل. بعد موافقتك نؤكد الحجوزات ونوضح لك طرق الدفع المتاحة وسياسة الإلغاء قبل أي دفع." },
    { q: "هل توفرون استقبالاً من مطار إسطنبول وسائقاً خاصاً؟", a: "نعم، نرتب الاستقبال من مطار إسطنبول (IST) أو مطار صبيحة (SAW) وجميع المطارات التركية، مع سيارة خاصة وسائق يتحدث العربية للتنقلات والجولات." },
    { q: "هل يمكن تصميم برنامج خاص لعائلتي؟", a: "بالتأكيد. كل برامجنا قابلة للتعديل: عدد الأيام، المدن، فئة الفنادق ونوع السيارة. أخبرنا بأعمار الأطفال واهتماماتكم ونصمم برنامجاً يناسبكم." },
    { q: "هل يمكنني الحجز وأنا خارج تركيا؟", a: "نعم، يمكنك إتمام كل شيء عن بُعد عبر واتساب والبريد الإلكتروني: الفندق، البرنامج، الطيران والتأشيرة، وتصلك التأكيدات مكتوبة قبل السفر." },
    { q: "هل تساعدون في التأشيرات حتى لو لم أحجز رحلة معكم؟", a: "نعم، خدمة التأشيرات مستقلة: نساعدك في تأشيرات السعودية بجميع أنواعها، تأشيرات دول الخليج، وتأشيرات شنغن وبريطانيا وأمريكا وكندا، مع العلم أن قرار المنح يعود للجهات الرسمية." },
  ];
  const services = [
    { cls: "b-hero svc--dark", img: "hero-hotels", icon: "hotel", title: "فنادق ومنتجعات", text: "فنادق 5 نجوم، منتجعات شاملة كل شيء، شقق فندقية وفلل بمسبح خاص في إسطنبول وطرابزون وسبانجا وأنطاليا — مختارة لتناسب العائلات والأزواج.", href: "hotels/", badge: "الأكثر طلباً", art: "bed" },
    { cls: "b-3", img: "hero-flights", icon: "takeoff", title: "تذاكر طيران", text: "رحلات من وإلى إسطنبول والعالم بأفضل الخيارات المتاحة.", href: "flights/" },
    { cls: "b-3", img: "hero-turkey", icon: "map", title: "السياحة في تركيا", text: "برامج يوماً بيوم مع سائق يتحدث العربية، ومرشد عند الطلب.", href: "turkey-tours/" },
    { cls: "b-3", img: "hero-world", icon: "globe", title: "خارج تركيا", text: "جورجيا، أذربيجان، البوسنة، ماليزيا وغيرها.", href: "world-tours/" },
    { cls: "b-3 svc--orange", img: "hero-matches", icon: "ball", title: "تذاكر المباريات", text: "السوبر الإسباني 2027 في إسطنبول ومباريات كبرى.", href: "matches/" },
    { cls: "b-4", img: "hero-saudi", icon: "mosque", title: "تأشيرات السعودية", text: "سياحية، عمرة، زيارة عائلية وشخصية، أعمال وترانزيت.", href: "saudi-visa/" },
    { cls: "b-4", img: "hero-gcc", icon: "passport", title: "تأشيرات الخليج", text: "الإمارات، قطر، عُمان، البحرين والكويت.", href: "gcc-visas/" },
    { cls: "b-4", img: "visa-schengen", icon: "globe", title: "تأشيرات دولية", text: "شنغن، بريطانيا، أمريكا وكندا — تجهيز ملف كامل.", href: "visas/" },
  ];

  // Cinematic hero: real-looking destination photos crossfading with a slow drift (decorative; first slide is the LCP image)
  const SLIDES = [
    { img: "hero-about", loc: "إسطنبول، تركيا", fx: "32% 50%" },
    { img: "hero-turkey", loc: "كابادوكيا، تركيا", fx: "30% 40%" },
    { img: "dest-uzungol", loc: "أوزنجول، طرابزون", fx: "35% 50%" },
    { img: "hero-world", loc: "جزر المالديف", fx: "25% 50%" },
    { img: "hero-saudi", loc: "العُلا، السعودية", fx: "28% 60%" },
  ];
  page.body = `
<section class="hero hero--photo" data-hero-slides>
  <div class="hero__slides" aria-hidden="true">
    ${SLIDES.map((sl, i) => { const src = photoSources(sl.img); if (!src) return ""; registerImage(sl.img, "", "");
      return `<div class="hero__slide${i === 0 ? " is-on" : ""}" data-loc="${sl.loc}" style="--fx:${sl.fx}">${i === 0
        ? `<img src="${src.src}" srcset="${src.srcset}" sizes="100vw" alt="" width="1536" height="1024" fetchpriority="high" decoding="async">`
        : `<img data-src="${src.src}" data-srcset="${src.srcset}" sizes="100vw" alt="" width="1536" height="1024" decoding="async">`}</div>`; }).join("")}
  </div>
  ${flightSvg()}
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="eyebrow fade-in" style="--d:.05s">${ic("pin")} شركة سياحة وسفر في إسطنبول</p>
      <h1 class="h-display"><span class="split-line"><span>رحلتك إلى تركيا والعالم</span></span> <span class="split-line"><span>تبدأ من <span class="accent">إسطنبول</span></span></span></h1>
      <p class="lead fade-in" style="--d:.45s">فنادق ومنتجعات مختارة، برامج سياحية يوماً بيوم، تذاكر طيران، تأشيرات السعودية والخليج والعالم، وتذاكر المباريات الكبرى — كلها في مكان واحد، وبخدمة عربية من أول رسالة. <strong style="color:#fff">${site.tagline}</strong></p>
      <div class="btn-row fade-in" style="--d:.5s;margin-bottom:6px"><a class="btn" href="#book">${ic("sparkles")}<span>ابدأ الحجز</span></a><a class="btn btn--glass" href="#finder">${ic("compass")}<span>ساعدني في اختيار وجهتي</span></a></div>
      <div class="hero__chips fade-in" style="--d:.55s">
        <span class="chip chip--dark">${ic("headset")}فريق يتحدث العربية</span>
        <span class="chip chip--dark">${ic("car")}سائق يتحدث العربية وسيارة خاصة</span>
        <span class="chip chip--dark">${ic("shield")}عروض مكتوبة وواضحة قبل الدفع</span>
      </div>
    </div>
  </div>
  <div class="hero__ctrl container" aria-label="صور الوجهات">
    <p class="hero__loc">${ic("pin")}<span>${SLIDES[0].loc}</span></p>
    <div class="hero__dots">${SLIDES.map((sl, i) => `<button type="button" class="hero__dot" aria-label="عرض صورة ${sl.loc}"${i === 0 ? ' aria-current="true"' : ""}><i></i></button>`).join("")}</div>
    <button type="button" class="hero__pause" aria-label="إيقاف عرض الصور" aria-pressed="false">${ic("pause")}${ic("play")}</button>
  </div>
</section>
<section class="booker-wrap"><div class="container">${booker()}${cityList()}</div></section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${Array(2).fill(["فنادق ومنتجعات", "تذاكر طيران", "برامج تركيا", "طرابزون وأوزنجول", "تأشيرة السعودية", "تأشيرة العمرة", "فيزا دبي", "تأشيرة شنغن", "السوبر الإسباني 2027", "جورجيا وأذربيجان", "شهر العسل"].map((t) => `<span class="marquee__item">${t}</span>`).join("")).join("")}</div></div>

<section class="section" id="services">
  <div class="container">
    ${sectionHead({ eyebrow: "خدماتنا", title: `كل ما تحتاجه لرحلتك… <span class="hl">في مكان واحد</span>`, lead: "من حجز الفندق والتذكرة إلى التأشيرة والبرنامج السياحي والسائق — نرتّب لك التفاصيل لتستمتع أنت بالحكاية." })}
    <div class="bento" data-stagger>
      ${services.map((s) => `
      <div class="svc svc--photo ${s.cls}" data-reveal>
        <div class="svc__bg" aria-hidden="true">${photoImg(s.img, { alt: "", sizes: s.cls.includes("b-hero") ? "(max-width: 1040px) 92vw, 620px" : "(max-width: 1040px) 46vw, 320px", max: 1024 })}</div>

        ${s.badge ? `<span class="badge" style="position:static;align-self:flex-start">${s.badge}</span>` : ""}
        <span class="ico${s.cls.includes("dark") ? " ico--glass" : ""}">${ic(s.icon)}</span>
        <h3><a class="cover" href="{{root}}${s.href}">${s.title}</a></h3>
        <p>${s.text}</p>
        <span class="link-arrow">اكتشف المزيد ${ic("arrow")}</span>
      </div>`).join("")}
    </div>
    <div class="ground" data-reveal>
      <p class="ground__t">${ic("car")} خدمات على الأرض وعروض الموسم</p>
      <div class="ground__links">
        ${(data.extras || []).map((x) => `<a href="{{root}}${x.path}">${ic(x.icon || "car")}<span>${x.navLabel}</span></a>`).join("")}
        <a href="{{root}}offers/">${ic("calendar")}<span>كل العروض الموسمية</span></a>
      </div>
    </div>
  </div>
</section>

${finderSection(data)}

<section class="section section--tight">
  <div class="container">${superCup.promo()}</div>
</section>

${globeSection(data)}

<section class="section">
  <div class="container" data-rail>
    ${sectionHead({ eyebrow: "وجهات تركيا", title: "إلى أين تأخذك الحكاية هذه المرة؟", lead: "من مآذن إسطنبول إلى ضباب أوزنجول ومناطيد كابادوكيا — اختر وجهتك واكتشف برامجها.", row: true, after: `<div class="rail-ctrl"><button type="button" data-rail-prev aria-label="السابق">${ic("chev-right")}</button><button type="button" data-rail-next aria-label="التالي">${ic("chev-left")}</button></div>` })}
    <div class="rail">${data.destinations.map((d) => destCard(d, path, { count: data.packages.filter((p) => (p.dest || []).includes(d.slug)).length })).join("")}</div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "برامج مختارة", title: "برامج سياحية جاهزة… ومرنة بالكامل", lead: "برامج يوماً بيوم صممناها بعد دراسة ما يطلبه المسافر العربي فعلاً، ويمكنك تعديل أي تفصيل فيها.", row: true, after: `<a class="btn btn--ghost" href="{{root}}packages/">كل البرامج ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3 home-featured" data-stagger>${featured.map((p) => packageCard(p, path)).join("")}</div>
  </div>
</section>

<section class="section section--navy on-dark">
  <div class="container split">
    <div>
      ${sectionHead({ eyebrow: "لماذا أويا؟", title: "لأن رحلتك تستحق من يهتم بتفاصيلها", lead: "نحن لا نبيعك حجزاً فقط؛ نرافقك من فكرة الرحلة حتى العودة، بخدمة شخصية وشفافية كاملة." })}
      <div class="stats" data-stagger>
        <div class="stat" data-reveal><b><span data-count="${counts.dest}">${ar(counts.dest)}</span></b><span>وجهات داخل تركيا</span></div>
        <div class="stat" data-reveal><b><span data-count="${counts.tr + counts.world}">${ar(counts.tr + counts.world)}</span></b><span>برنامجاً سياحياً جاهزاً</span></div>
        <div class="stat" data-reveal><b><span data-count="${counts.visas}">${ar(counts.visas)}</span></b><span>نوعاً من التأشيرات نساعدك فيها</span></div>
        <div class="stat" data-reveal><b><span data-count="${counts.world}">${ar(counts.world)}</span></b><span>دول خارج تركيا</span></div>
      </div>
    </div>
    <div class="features features--2" data-stagger>
      ${[
        { icon: "headset", title: "خدمة عربية شخصية", text: "مستشار واحد يتابع طلبك بالعربية من أول رسالة حتى العودة." },
        { icon: "doc", title: "عرض مكتوب وواضح", text: "تفاصيل الفندق والبرنامج والسعر وسياسة الإلغاء قبل الدفع." },
        { icon: "car", title: "سائقون يتحدثون العربية", text: "تنقلات خاصة مريحة وآمنة بسيارات حديثة." },
        { icon: "refresh", title: "مرونة كاملة", text: "عدّل المدن والأيام والفنادق كما تشاء." },
        { icon: "whatsapp", title: "متابعة على واتساب", text: "رقم واحد للتواصل والمساعدة طوال رحلتك." },
        { icon: "sparkles", title: "كل شيء في مكان واحد", text: "طيران + فندق + برنامج + تأشيرة + تذاكر مباريات." },
      ].map((f) => featureItem({ ...f, tone: "ico--glass" })).join("")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "مركز التأشيرات", title: "تأشيرتك بأيدٍ خبيرة", lead: "نجهّز ملفك ونتابع طلبك عبر القنوات الرسمية — للسعودية بجميع أنواع تأشيراتها، ودول الخليج، والوجهات الدولية.", center: true })}
    <div class="grid grid-3" data-stagger>
      ${[
        { g: "saudi", hub: "saudi-visa/", title: "تأشيرات السعودية", icon: "mosque", text: "سياحية إلكترونية، عمرة، زيارة عائلية وشخصية، أعمال، ترانزيت، وتأشيرة المقيمين في الخليج.", tone: "" },
        { g: "gcc", hub: "gcc-visas/", title: "تأشيرات دول الخليج", icon: "burj", text: "تأشيرة الإمارات (دبي)، قطر، عُمان، البحرين والكويت، ومتابعة مستجدات التأشيرة الخليجية الموحدة.", tone: "svc--dark" },
        { g: "intl", hub: "visas/", title: "تأشيرات دولية", icon: "globe", text: "شنغن، بريطانيا، أمريكا وكندا من تركيا: تعبئة الطلب، الحجوزات، التأمين ومراجعة الملف.", tone: "" },
      ].map((c) => `
      <div class="svc ${c.tone}" data-reveal>
        <span class="ico${c.tone ? " ico--glass" : " ico--orange"}">${ic(c.icon)}</span>
        <h3><a class="cover" href="{{root}}${c.hub}">${c.title}</a></h3>
        <p>${c.text}</p>
        <div class="facts" style="display:flex;flex-wrap:wrap;gap:6px;position:relative;z-index:3">${visasBy(c.g).slice(0, 4).map((v) => `<span class="chip${c.tone ? " chip--dark" : ""}">${v.short || v.name}</span>`).join("")}</div>
        <span class="link-arrow">كل التفاصيل ${ic("arrow")}</span>
      </div>`).join("")}
    </div>
  </div>
</section>

<section class="section section--white">
  <div class="container">
    ${sectionHead({ eyebrow: "بخطوات بسيطة", title: "كيف تحجز رحلتك مع أويا؟", center: true })}
    <div class="steps" data-stagger>
      ${[
        { icon: "send", t: "أرسل طلبك", d: "عبر واتساب أو نموذج الحجز: الوجهة، التواريخ وعدد المسافرين." },
        { icon: "doc", t: "استلم عرضك", d: "عرض مكتوب بالتفاصيل والخيارات المناسبة لميزانيتك." },
        { icon: "check-circle", t: "أكّد الحجز", d: "نؤكد الفنادق والتنقلات والتذاكر ونرسل لك كل الوثائق." },
        { icon: "plane", t: "سافر واستمتع", d: "استقبال في المطار ومتابعة مستمرة حتى عودتك بالسلامة." },
      ].map((s) => `<div class="step" data-reveal><span class="ico">${ic(s.icon)}</span><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}
    </div>
  </div>
</section>

${data.posts.length ? `
<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: "دليل المسافر", title: "من مدونة أويا", lead: "أدلة عملية تساعدك على التخطيط: أفضل الأوقات، التكاليف، البرامج والتأشيرات.", row: true, after: `<a class="btn btn--ghost" href="{{root}}blog/">كل المقالات ${ic("arrow", "i-flip")}</a>` })}
    <div class="grid grid-3" data-stagger>${data.posts.slice(0, 3).map((p) => postCard(p, path)).join("")}</div>
  </div>
</section>` : ""}

${faqBlock(faq)}
${ctaBand({})}`;
  page.schemaGraph = [S.orgNode(), S.websiteNode(), S.webPageNode(page), S.faqNode(page, faq)].filter(Boolean);
  return page;
}
