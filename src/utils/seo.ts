export function resolveYear(text: string): string {
  const year = new Date().getFullYear().toString();
  return text
    .replace(/%%currentyear%%/g, year)
    .replace(/%%year%%/g, year)
    .replace(/%%page%%/g, '')
    .replace(/%%sep%%/g, '–')
    .trim();
}

export function resolveYoastTitle(seoTitle: string, fallbackTitle: string): string {
  // If the seoTitle is entirely a Yoast template pattern, use the fallback
  if (/^%%title%%/.test(seoTitle.trim()) || seoTitle.trim() === '') {
    return resolveYear(fallbackTitle);
  }
  return resolveYear(seoTitle);
}

export function resolveYoastDescription(seoDesc: string, fallback: string): string {
  if (!seoDesc) return fallback;
  // Replace %%excerpt%% with fallback text
  const resolved = seoDesc.replace(/%%excerpt%%/g, fallback).replace(/%%year%%/g, new Date().getFullYear().toString()).trim();
  // Strip leading emoji-only content if it resolves to just an emoji
  return resolved.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+$/u, fallback) || fallback;
}

export function stripEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, '').trim();
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author?: string;
}) {
  // Normalize dates to ISO 8601 (replace space separator with T)
  const pub = opts.datePublished?.replace(' ', 'T') || '';
  const mod = opts.dateModified?.replace(' ', 'T') || pub;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    headline: opts.title,
    description: opts.description,
    inLanguage: 'es-ES',
    url: opts.url,
    ...(opts.image && { image: opts.image }),
    datePublished: pub,
    dateModified: mod,
    author: {
      '@type': 'Organization',
      name: opts.author || 'De Compras por China',
      url: 'https://decomprasporchina.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'De Compras por China',
      url: 'https://decomprasporchina.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://decomprasporchina.com/favicon.svg',
        width: 512,
        height: 512,
      },
    },
  };
}

export function generateItemListSchema(opts: {
  name: string;
  description: string;
  url: string;
  items: { title: string; slug: string; position: number }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.title,
      url: `https://decomprasporchina.com/${item.slug}`,
    })),
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'De Compras por China',
    url: 'https://decomprasporchina.com',
    description: 'Tu guía de referencia para comprar en tiendas chinas: AliExpress, Shein, TEMU y más.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://decomprasporchina.com/blog?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question.startsWith('¿') ? faq.question : `¿${faq.question}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'De Compras por China',
    url: 'https://decomprasporchina.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://decomprasporchina.com/favicon.svg',
      width: 512,
      height: 512,
    },
    description: 'Tu guía de referencia para comprar en AliExpress, Shein, TEMU y las mejores tiendas chinas. Análisis, reseñas y consejos en español.',
    inLanguage: 'es-ES',
    sameAs: [],
  };
}
