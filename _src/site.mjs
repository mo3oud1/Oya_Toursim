// Global site configuration — edit here, then run `node _src/build.mjs`
export const site = {
  name: "أويا للسياحة",
  nameEn: "OYA Tourism",
  tagline: "كل رحلة… حكاية",
  // Languages — Arabic is the default (served at the site root). To add a language later,
  // add it here (e.g. { code: "en", dir: "ltr", og: "en_US", prefix: "en/" }) and translate the content files.
  locales: [{ code: "ar", dir: "rtl", og: "ar_AR", prefix: "" }],
  // Absolute base URL (no trailing slash). Change when a custom domain is connected.
  url: "https://mo3oud1.github.io/Oya_Toursim",
  email: "oya.tourism01@gmail.com",
  phoneDisplay: "+90 539 933 43 31",
  phoneIntl: "+905399334331",
  whatsapp: "905399334331",
  city: "إسطنبول",
  country: "تركيا",
  hours: "يومياً من 9 صباحاً حتى 11 مساءً (بتوقيت إسطنبول)",
  // Fill these when available (leave empty to hide)
  visasReviewed: "2026-11-10", // آخر مراجعة لمعلومات صفحات التأشيرات (تظهر في الصفحات وفي بيانات جوجل)
  tursab: "", // رقم رخصة TÜRSAB
  legalName: "", // الاسم القانوني للشركة (يظهر في سياسة الخصوصية عند تعبئته)
  addressLine: "", // العنوان التفصيلي للمكتب
  mapsUrl: "",
  socials: { instagram: "https://www.instagram.com/oya_tourism01", facebook: "https://www.facebook.com/share/1FyNG91QkB/", tiktok: "", youtube: "", snap: "" },
  ga4: "", // Google Analytics 4 ID e.g. G-XXXXXXX
  gscVerification: "", // Google Search Console meta verification token
};

export const nav = [
  { key: "home", label: "الرئيسية", href: "" },
  {
    key: "turkey", label: "رحلات تركيا", href: "turkey-tours/", mega: "turkey",
  },
  { key: "world", label: "خارج تركيا", href: "world-tours/" },
  { key: "flights", label: "طيران", href: "flights/" },
  { key: "hotels", label: "فنادق ومنتجعات", href: "hotels/" },
  { key: "visas", label: "التأشيرات", href: "visas/", mega: "visas" },
  { key: "matches", label: "تذاكر المباريات", href: "matches/", isNew: true },
];

// Common city list for flight/hotel forms (datalist)
export const cities = [
  "إسطنبول (IST)", "إسطنبول صبيحة (SAW)", "أنقرة (ESB)", "أنطاليا (AYT)", "طرابزون (TZX)", "إزمير (ADB)", "بودروم (BJV)", "دالامان (DLM)", "كابادوكيا (NAV)", "غازي عنتاب (GZT)",
  "الرياض (RUH)", "جدة (JED)", "الدمام (DMM)", "المدينة المنورة (MED)", "أبها (AHB)", "الطائف (TIF)", "تبوك (TUU)", "القصيم (ELQ)",
  "دبي (DXB)", "أبوظبي (AUH)", "الشارقة (SHJ)", "الدوحة (DOH)", "الكويت (KWI)", "مسقط (MCT)", "البحرين (BAH)",
  "عمّان (AMM)", "بيروت (BEY)", "بغداد (BGW)", "أربيل (EBL)", "البصرة (BSR)", "النجف (NJF)", "السليمانية (ISU)", "دمشق (DAM)", "حلب (ALP)",
  "القاهرة (CAI)", "الإسكندرية (HBE)", "شرم الشيخ (SSH)", "الغردقة (HRG)", "الدار البيضاء (CMN)", "مراكش (RAK)", "تونس (TUN)", "الجزائر (ALG)", "طرابلس (MJI)", "الخرطوم (KRT)",
  "تبليسي (TBS)", "باتومي (BUS)", "باكو (GYD)", "سراييفو (SJJ)", "كوالالمبور (KUL)", "بالي (DPS)", "جاكرتا (CGK)", "بانكوك (BKK)", "بوكيت (HKT)", "ماليه – المالديف (MLE)", "طشقند (TAS)", "سمرقند (SKD)",
  "لندن (LHR)", "باريس (CDG)", "ميونخ (MUC)", "فرانكفورت (FRA)", "أمستردام (AMS)", "روما (FCO)", "ميلانو (MXP)", "مدريد (MAD)", "برشلونة (BCN)", "فيينا (VIE)", "جنيف (GVA)", "زيورخ (ZRH)", "برلين (BER)", "نيويورك (JFK)", "تورنتو (YYZ)",
];
