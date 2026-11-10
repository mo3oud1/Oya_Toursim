// JSON-LD builders (one @graph per page)
import { site } from "../site.mjs";
import { strip, photoExists } from "./ui.mjs";

const abs = (p = "") => `${site.url}/${p}`;
const ORG = `${site.url}/#org`;
const WEB = `${site.url}/#website`;

export function orgNode() {
  const sameAs = Object.values(site.socials).filter(Boolean);
  return {
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": ORG,
    name: site.name,
    alternateName: [site.nameEn, "OYA Tourism Istanbul", "أويا للسياحة والسفر"],
    url: abs(),
    logo: { "@type": "ImageObject", url: abs("assets/img/brand/oya-logo-512.png"), width: 512, height: 512 },
    image: abs("assets/img/og/og-default.jpg"),
    slogan: site.tagline,
    email: site.email,
    telephone: site.phoneIntl,
    address: { "@type": "PostalAddress", addressLocality: "Istanbul", addressCountry: "TR", ...(site.addressLine ? { streetAddress: site.addressLine } : {}) },
    areaServed: ["TR", "SA", "AE", "QA", "KW", "BH", "OM", "IQ", "JO", "LB", "SY", "EG", "MA", "DZ", "TN", "LY"].map((c) => ({ "@type": "Country", name: c })),
    knowsLanguage: ["ar", "tr", "en"],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "09:00", closes: "23:00" }],
    contactPoint: [{ "@type": "ContactPoint", telephone: site.phoneIntl, contactType: "customer service", availableLanguage: ["Arabic", "Turkish", "English"], areaServed: "Worldwide" }],
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
  };
}
export const websiteNode = () => ({ "@type": "WebSite", "@id": WEB, url: abs(), name: site.name, alternateName: site.nameEn, inLanguage: "ar", publisher: { "@id": ORG } });

export function webPageNode(page, type = "WebPage") {
  return {
    "@type": type,
    "@id": abs(page.path) + "#webpage",
    url: abs(page.path),
    name: page.title,
    description: page.description,
    inLanguage: "ar",
    isPartOf: { "@id": WEB },
    about: { "@id": ORG },
    ...(page.crumbs ? { breadcrumb: { "@id": abs(page.path) + "#breadcrumb" } } : {}),
    ...(page.primaryImage ? { primaryImageOfPage: { "@type": "ImageObject", url: page.primaryImage } } : {}),
  };
}
export function breadcrumbNode(page) {
  if (!page.crumbs) return null;
  return {
    "@type": "BreadcrumbList",
    "@id": abs(page.path) + "#breadcrumb",
    itemListElement: page.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}
export function faqNode(page, items) {
  if (!items || !items.length) return null;
  return {
    "@type": "FAQPage",
    "@id": abs(page.path) + "#faq",
    mainEntity: items.map((f) => ({ "@type": "Question", name: strip(f.q), acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
  };
}
export function serviceNode(page, { name, type, description, areaServed = "Worldwide", offers }) {
  return {
    "@type": "Service",
    "@id": abs(page.path) + "#service",
    name, serviceType: type, description,
    provider: { "@id": ORG },
    areaServed,
    url: abs(page.path),
    availableChannel: { "@type": "ServiceChannel", servicePhone: { "@type": "ContactPoint", telephone: site.phoneIntl }, serviceUrl: abs(page.path) },
    ...(offers ? { hasOfferCatalog: offers } : {}),
  };
}
export function imageUrl(key) {
  const f = key && photoExists(key);
  return f ? abs(`assets/img/photos/${f}`) : abs("assets/img/og/og-default.jpg");
}
export function tripNode(page, p) {
  return {
    "@type": "TouristTrip",
    "@id": abs(page.path) + "#trip",
    name: p.h1 || p.title,
    description: strip(p.summary),
    touristType: (p.tags || []).map((t) => ({ family: "عائلات", honeymoon: "شهر العسل", budget: "اقتصادي", luxury: "فاخر", friends: "أصدقاء", winter: "شتوي", nature: "طبيعة", city: "مدن", beach: "شواطئ" }[t] || t)),
    image: imageUrl(p.img),
    provider: { "@id": ORG },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: p.itinerary.length,
      itemListElement: p.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristAttraction", name: `اليوم ${d.day}: ${strip(d.title)}`, description: strip(d.text) } })),
    },
    offers: {
      "@type": "Offer",
      url: abs(page.path),
      availability: "https://schema.org/InStock",
      ...(p.priceFrom ? { price: p.priceFrom, priceCurrency: "USD" } : {}),
      offeredBy: { "@id": ORG },
    },
  };
}
export function destinationNode(page, d) {
  return {
    "@type": "TouristDestination",
    "@id": abs(page.path) + "#destination",
    name: d.name,
    alternateName: d.nameEn,
    description: strip(d.intro),
    image: imageUrl(d.img),
    containedInPlace: { "@type": "Country", name: "Turkey" },
    includesAttraction: (d.highlights || []).map((h) => ({ "@type": "TouristAttraction", name: strip(h.name) })),
  };
}
export function articleNode(page, p) {
  return {
    "@type": "BlogPosting",
    "@id": abs(page.path) + "#article",
    headline: p.h1 || p.title,
    description: p.seo.description,
    image: imageUrl(p.img),
    datePublished: p.date,
    dateModified: p.updated || p.date,
    inLanguage: "ar",
    author: { "@type": "Organization", name: site.name, url: abs() },
    publisher: { "@id": ORG },
    mainEntityOfPage: { "@id": abs(page.path) + "#webpage" },
  };
}
export function itemListNode(page, items) {
  return {
    "@type": "ItemList",
    "@id": abs(page.path) + "#list",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: abs(it.path), name: it.name })),
  };
}
export function eventNode(page, e) {
  return {
    "@type": "SportsEvent",
    "@id": abs(page.path) + "#" + e.id,
    name: e.name,
    sport: "Football",
    startDate: e.start,
    ...(e.end ? { endDate: e.end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue || "Istanbul", address: { "@type": "PostalAddress", addressLocality: "Istanbul", addressCountry: "TR" } },
    ...(e.home ? { homeTeam: { "@type": "SportsTeam", name: e.home }, awayTeam: { "@type": "SportsTeam", name: e.away }, competitor: [{ "@type": "SportsTeam", name: e.home }, { "@type": "SportsTeam", name: e.away }] } : {}),
    description: e.description,
    image: abs("assets/img/og/og-matches.jpg"),
    organizer: { "@type": "Organization", name: "Real Federación Española de Fútbol (RFEF)", url: "https://rfef.es" },
  };
}
