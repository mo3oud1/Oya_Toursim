// WhatsApp-powered inquiry forms (no backend needed)
import { ic, esc } from "./ui.mjs";
import { cities } from "../site.mjs";

let uid = 0;
const id = (p) => `${p}-${++uid}`;

const ERR = { date: "يرجى اختيار التاريخ", select: "يرجى الاختيار من القائمة" };
export function field({ label, name, type = "text", placeholder = "", required = false, optional = false, options, wide = false, list, attrs = "", value = "", fid: forcedId, auto = "" }) {
  const fid = forcedId || id("f");
  const req = required ? " required" : "";
  const dl = `data-label="${esc(label)}"`;
  let control;
  if (type === "select") {
    const flat = options.flatMap((o) => (typeof o === "string" ? [o] : o.items));
    const extra = value && !flat.includes(value) ? `<option selected>${esc(value)}</option>` : "";
    control = `<select id="${fid}" name="${name}" ${dl}${req} ${attrs}>${placeholder ? `<option value="">${esc(placeholder)}</option>` : ""}${extra}${options
      .map((o) => (typeof o === "string" ? `<option${o === value ? " selected" : ""}>${esc(o)}</option>` : `<optgroup label="${esc(o.group)}">${o.items.map((x) => `<option${x === value ? " selected" : ""}>${esc(x)}</option>`).join("")}</optgroup>`))
      .join("")}</select>`;
  } else if (type === "textarea") {
    control = `<textarea id="${fid}" name="${name}" ${dl} placeholder="${esc(placeholder)}"${req} ${attrs}></textarea>`;
  } else {
    control = `<input id="${fid}" name="${name}" type="${type}" ${dl} placeholder="${esc(placeholder)}"${list ? ` list="${list}"` : ""}${req}${value ? ` value="${esc(value)}"` : ""}${auto ? ` autocomplete="${auto}"` : list ? ' autocomplete="off"' : ""}${required ? ` aria-describedby="${fid}-err"` : ""} ${attrs}>`;
  }
  const mark = required ? `<span class="req" aria-hidden="true">*</span>` : (type === "textarea" || optional ? `<span class="opt">(اختياري)</span>` : "");
  const err = required ? `<span class="err" id="${fid}-err">${ERR[type] || `يرجى تعبئة حقل «${esc(label)}»`}</span>` : "";
  return `<div class="field${wide ? " field--wide" : ""}"><label for="${fid}">${label}${mark}</label>${control}${err}</div>`;
}

export function seg({ label, name, options, checked = 0, attrs = "" }) {
  return `<div class="field field--wide"><span>${label}</span><div class="seg" role="radiogroup" aria-label="${esc(label)}">${options
    .map((o, i) => `<label><input type="radio" name="${name}" value="${esc(o)}" data-label="${esc(label)}"${i === checked ? " checked" : ""} ${attrs}><span>${esc(o)}</span></label>`)
    .join("")}</div></div>`;
}

const actions = (label = "أرسل الطلب عبر واتساب") => `
<div class="form-actions">
  <button class="btn btn--wa" type="submit">${ic("whatsapp")}<span>${label}</span></button>
  <button class="btn btn--ghost btn--sm" type="button" data-mail>${ic("mail")}<span>أو أرسل بالبريد</span></button>
</div>
<ul class="assure">
  <li>${ic("check-circle")}عرض مجاني دون أي التزام</li>
  <li>${ic("check-circle")}لا دفع قبل موافقتك على العرض المكتوب</li>
  <li>${ic("lock")}بياناتك تُستخدم لطلبك فقط</li>
</ul>
<div class="form-done" role="status" aria-live="polite">${ic("check-circle")}<div><b>تم تجهيز رسالتك في واتساب.</b> أرسلها من التطبيق وسنرد عليك بعرض مكتوب. لم يفتح واتساب؟ <button type="button" data-copy>انسخ الرسالة</button> أو اتصل على <a class="ltr" href="tel:+905399334331">+90 539 933 43 31</a></div></div>`;

export const cityList = () => `<datalist id="cities">${cities.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>`;

export function flightForm({ compact = false } = {}) {
  return `
<form novalidate data-wa data-date-pair data-intro="مرحباً أويا للسياحة، أرغب بحجز تذكرة طيران:">
  <div class="form-grid">
    ${seg({ label: "نوع الرحلة", name: "trip", options: ["ذهاب وعودة", "ذهاب فقط", "وجهات متعددة"], attrs: "data-oneway" })}
    ${field({ label: "من", name: "from", placeholder: "مدينة أو مطار المغادرة", list: "cities", required: true })}
    ${field({ label: "إلى", name: "to", placeholder: "مدينة أو مطار الوصول", list: "cities", required: true })}
    ${field({ label: "تاريخ الذهاب", name: "depart", type: "date", required: true, attrs: "data-date-start" })}
    ${field({ label: "تاريخ العودة", name: "return", type: "date", optional: true, attrs: "data-date-end data-return" })}
    ${field({ label: "المسافرون", name: "pax", type: "select", options: ["1 بالغ", "2 بالغين", "3 بالغين", "4 بالغين", "5 بالغين", "عائلة (سأذكر التفاصيل)", "مجموعة +6"], value: "1 بالغ" })}
    ${field({ label: "الدرجة", name: "cabin", type: "select", options: ["السياحية", "السياحية الممتازة", "رجال الأعمال", "الأولى"], value: "السياحية" })}
    ${compact ? "" : field({ label: "ملاحظات", name: "notes", type: "textarea", wide: true, placeholder: "مثال: طفلان عمر 4 و7 سنوات، نفضل الخطوط التركية" })}
  </div>
  ${actions("اطلب أفضل سعر عبر واتساب")}
</form>`;
}

export function hotelForm({ compact = false, city = "" } = {}) {
  return `
<form novalidate data-wa data-date-pair data-intro="مرحباً أويا للسياحة، أرغب بحجز فندق:">
  <div class="form-grid">
    ${field({ label: "الوجهة / المدينة", name: "city", placeholder: "إسطنبول، طرابزون، أنطاليا…", required: true, value: city })}
    ${field({ label: "تاريخ الوصول", name: "checkin", type: "date", required: true, attrs: "data-date-start" })}
    ${field({ label: "تاريخ المغادرة", name: "checkout", type: "date", required: true, attrs: "data-date-end" })}
    ${field({ label: "الأطفال وأعمارهم", name: "kids", placeholder: "مثال: طفلان 4 و9 سنوات", optional: true })}
    ${field({ label: "الغرف والضيوف", name: "rooms", type: "select", options: ["غرفة – شخصان", "غرفة – شخص واحد", "غرفة – عائلة مع أطفال", "غرفتان", "3 غرف أو أكثر", "شقة فندقية / فيلا"], value: "غرفة – شخصان" })}
    ${field({ label: "الفئة المفضّلة", name: "stars", type: "select", options: ["4 نجوم", "5 نجوم", "منتجع / إطلالة بحرية", "فيلا خاصة مع مسبح", "اقتصادي 3 نجوم", "لا مانع — الأفضل قيمة"], value: "5 نجوم" })}
    ${compact ? "" : field({ label: "ملاحظات", name: "notes", type: "textarea", wide: true, placeholder: "مثال: إطلالة على البوسفور وقريب من تقسيم، مع إفطار" })}
  </div>
  ${actions("احصل على عروض الفنادق")}
</form>`;
}

export function tourForm({ compact = false, program = "", options } = {}) {
  const opts = options || [
    { group: "داخل تركيا", items: ["إسطنبول", "إسطنبول + بورصة", "إسطنبول + سبانجا + بورصة", "طرابزون + أوزنجول", "جولة البحر الأسود", "إسطنبول + طرابزون", "برنامج عائلي شامل", "شهر العسل في تركيا", "كابادوكيا", "أنطاليا", "بودروم"] },
    { group: "خارج تركيا", items: ["جورجيا", "أذربيجان", "البوسنة", "ماليزيا", "بالي – إندونيسيا", "تايلاند", "المالديف", "مصر", "أوزبكستان"] },
    { group: "أخرى", items: ["برنامج مخصص حسب طلبي"] },
  ];
  return `
<form novalidate data-wa data-date-pair data-intro="مرحباً أويا للسياحة، أرغب ببرنامج سياحي:">
  <div class="form-grid">
    ${field({ label: "البرنامج / الوجهة", name: "program", type: "select", options: opts, placeholder: "اختر البرنامج", required: true, value: program })}
    ${field({ label: "تاريخ الوصول التقريبي", name: "date", type: "date", optional: true, attrs: "data-date-start" })}
    ${field({ label: "عدد الأيام", name: "days", type: "select", options: ["3–4 أيام", "5–6 أيام", "7–8 أيام", "9–10 أيام", "11–14 يوماً", "أكثر من أسبوعين"], value: "7–8 أيام" })}
    ${field({ label: "المسافرون", name: "pax", type: "select", options: ["شخصان", "عائلة صغيرة (3–4)", "عائلة كبيرة (5+)", "شخص واحد", "مجموعة أصدقاء", "مجموعة كبيرة / شركة"], value: "شخصان" })}
    ${field({ label: "مستوى الرحلة", name: "level", type: "select", options: ["متوسط — أفضل قيمة", "فاخر", "اقتصادي"], value: "متوسط — أفضل قيمة" })}
    ${compact ? "" : field({ label: "ملاحظات", name: "notes", type: "textarea", wide: true, placeholder: "مثال: شهر عسل، نفضل فلل مع مسبح خاص في طرابزون" })}
  </div>
  ${actions("صمّم رحلتي عبر واتساب")}
</form>`;
}

export function visaForm({ compact = false, visa = "", options } = {}) {
  const opts = options || [
    { group: "تأشيرات السعودية", items: ["التأشيرة السياحية السعودية", "تأشيرة العمرة", "تأشيرة الزيارة العائلية", "تأشيرة الزيارة الشخصية", "تأشيرة زيارة الأعمال", "تأشيرة العبور (ترانزيت)", "تأشيرة المقيمين في الخليج"] },
    { group: "تأشيرات الخليج", items: ["تأشيرة الإمارات", "تأشيرة قطر", "تأشيرة عُمان", "تأشيرة البحرين", "تأشيرة الكويت", "التأشيرة الخليجية الموحدة"] },
    { group: "تأشيرات دولية", items: ["تأشيرة شنغن", "تأشيرة بريطانيا", "تأشيرة أمريكا", "تأشيرة كندا", "تأشيرة أخرى"] },
  ];
  return `
<form novalidate data-wa data-intro="مرحباً أويا للسياحة، أرغب بالاستفسار عن تأشيرة:">
  <div class="form-grid">
    ${field({ label: "نوع التأشيرة", name: "visa", type: "select", options: opts, placeholder: "اختر التأشيرة", required: true, value: visa, fid: "visa-select" })}
    ${field({ label: "الجنسية", name: "nationality", placeholder: "مثال: سوري، عراقي، تركي…", required: true })}
    ${field({ label: "بلد الإقامة الحالية", name: "residence", placeholder: "مثال: تركيا (إقامة سياحية)", optional: true })}
    ${field({ label: "موعد السفر المتوقع", name: "date", type: "date", optional: true })}
    ${field({ label: "عدد المتقدمين", name: "pax", type: "select", options: ["1", "2", "3", "4", "5", "أكثر من 5"], value: "1" })}
    ${compact ? "" : field({ label: "ملاحظات", name: "notes", type: "textarea", wide: true, placeholder: "مثال: لدي تأشيرة شنغن سارية، أحتاج حجز فندق وتأمين" })}
  </div>
  ${actions("ابدأ طلب التأشيرة")}
</form>`;
}

export function matchForm({ compact = false, match = "" } = {}) {
  return `
<form novalidate data-wa data-intro="مرحباً أويا للسياحة، أرغب بحجز تذاكر مباراة:">
  <div class="form-grid">
    ${field({ label: "المباراة", name: "match", type: "select", required: true, placeholder: "اختر المباراة", value: match, fid: "match-select", options: [
      { group: "كأس السوبر الإسباني 2027 — إسطنبول", items: ["نصف النهائي: برشلونة × أتلتيكو مدريد (2 فبراير)", "نصف النهائي: ريال مدريد × ريال سوسيداد (3 فبراير)", "النهائي (6 فبراير)", "باقة البطولة كاملة (3 مباريات)"] },
      { group: "مباريات أخرى", items: ["ديربي إسطنبول في الدوري التركي", "مباريات الأندية التركية في البطولات الأوروبية", "مباراة أخرى (سأذكرها في الملاحظات)"] },
    ] })}
    ${field({ label: "الفئة", name: "category", type: "select", options: ["الفئة الأولى", "الفئة الثانية", "الفئة الثالثة", "VIP / ضيافة", "أفضل المتاح"], value: "الفئة الأولى" })}
    ${field({ label: "عدد التذاكر", name: "qty", type: "select", options: ["1", "2", "3", "4", "5", "6", "أكثر من 6"], value: "2" })}
    ${field({ label: "الباقة", name: "pack", type: "select", options: ["تذاكر فقط", "تذاكر + فندق", "تذاكر + فندق + نقل VIP", "باقة كاملة مع الطيران"], value: "تذاكر + فندق" })}
    ${compact ? "" : field({ label: "ملاحظات", name: "notes", type: "textarea", wide: true, placeholder: "مثال: نريد مقاعد متجاورة، ووصول قبل المباراة بيومين" })}
  </div>
  ${actions("احجز مقعدك عبر واتساب")}
</form>`;
}

export function contactForm() {
  return `
<form novalidate data-wa data-intro="مرحباً أويا للسياحة،">
  <div class="form-grid form-grid--2">
    ${field({ label: "الاسم", name: "name", placeholder: "اسمك الكريم", required: true, auto: "name" })}
    ${field({ label: "الخدمة", name: "service", type: "select", options: ["تذاكر طيران", "فنادق ومنتجعات", "برنامج سياحي داخل تركيا", "رحلة خارج تركيا", "تأشيرة السعودية", "تأشيرة خليجية", "تأشيرة دولية", "تذاكر مباريات", "استفسار عام"], value: "استفسار عام" })}
    ${field({ label: "رسالتك", name: "message", type: "textarea", wide: true, placeholder: "اكتب تفاصيل طلبك…", required: true })}
  </div>
  ${actions("أرسل الرسالة عبر واتساب")}
</form>`;
}

export function booker() {
  const tabs = [
    { key: "hotels", label: "فنادق", icon: "bed", body: hotelForm({ compact: true }) },
    { key: "flights", label: "طيران", icon: "takeoff", body: flightForm({ compact: true }) },
    { key: "tours", label: "برامج سياحية", icon: "map", body: tourForm({ compact: true }) },
    { key: "visas", label: "تأشيرات", icon: "passport", body: visaForm({ compact: true }) },
    { key: "matches", label: "مباريات", icon: "ball", body: matchForm({ compact: true }) },
  ];
  return `
<div class="booker fade-in" style="--d:.6s" data-tabs id="book">
  <div class="booker__tabs" role="tablist" aria-label="نوع الحجز">
    ${tabs.map((t, i) => `<button class="booker__tab" role="tab" type="button" id="tab-${t.key}" data-key="${t.key}" aria-controls="panel-${t.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${ic(t.icon)}${t.label}</button>`).join("")}
  </div>
  ${tabs.map((t, i) => `<div class="booker__panel" role="tabpanel" id="panel-${t.key}" aria-labelledby="tab-${t.key}"${i ? " hidden" : ""}>${t.body}</div>`).join("")}
</div>`;
}
