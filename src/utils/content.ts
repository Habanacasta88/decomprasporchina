/** Strip WordPress block comments and shortcodes from HTML */
export function cleanWpContent(html: string): string {
  return html
    // Fix double-escaped quotes in HTML attributes (e.g. src=\"...\" → src="...")
    .replace(/\\"/g, '"')
    // Remove WP block comments
    .replace(/<!--\s*\/?wp:[^>]*-->/g, '')
    // Remove shortcodes like [su_button ...] ... [/su_button]
    .replace(/\[su_[^\]]*\][^[]*\[\/su_[^\]]*\]/g, '')
    .replace(/\[su_[^\]]*\/?\]/g, '')
    // Fix internal links to new structure
    .replace(/https?:\/\/decomprasporchina\.com\//g, '/')
    // Strip old WordPress category prefixes from internal links
    .replace(/href="\/(tiendas-chinas|accesorios|ropa|calzado|tecnologia|deporte|xiaomi|blog)\/([^"#]+)/g, 'href="/$2')
    // Convert wp-content/uploads/ paths to /images/ (after domain strip above)
    // Handles both with and without year/month subdirectory
    .replace(/\/wp-content\/uploads\/(?:\d{4}\/\d{2}\/)?([^"'\s>]+)/g, '/images/$1')
    // Remove MS Word classes
    .replace(/\s*class="Mso[^"]*"/g, '')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*&nbsp;\s*<\/p>/g, '')
    // Remove inline styles from pasted content
    .replace(/\s*style="[^"]*mso-[^"]*"/g, '')
    // Remove empty spans
    .replace(/<span>\s*<\/span>/g, '')
    // Remove migration artifacts (tixagb_XX codes from WP export)
    .replace(/\(tixagb_\d+[_\d]*\)/g, '')
    .replace(/tixagb_\d+[_\d]*/g, '')
    // Unwrap <p> inside <li> (keep text, remove the extra p tags)
    .replace(/<li([^>]*)>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li$1>$2</li>')
    // Remove empty <li> items (with only whitespace or &nbsp;)
    .replace(/<li[^>]*>\s*(&nbsp;)?\s*<\/li>/gi, '')
    // Fix non-secure image URLs
    .replace(/src="http:\/\//g, 'src="https://')
    // Add lazy loading to YouTube iframes
    .replace(/<iframe([^>]*)(src="https:\/\/www\.youtube\.com\/embed\/[^"]*")([^>]*)>/g,
      (match, before, src, after) => {
        if (match.includes('loading=')) return match;
        return `<iframe${before}${src}${after} loading="lazy">`;
      })
    // Clean up excess whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract headings from HTML for TOC */
export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const regex = /<h([23])[^>]*>(?:<strong>)?(.*?)(?:<\/strong>)?<\/h[23]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const id = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ id, text, level: parseInt(match[1]) });
  }

  return headings;
}

/** Add IDs to headings in HTML */
export function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>((?:<strong>)?)(.*?)((?:<\/strong>)?)<\/h[23]>/gi, (_, level, attrs, openTag, text, closeTag) => {
    // Skip if heading already has an id attribute
    if (/\sid="/.test(attrs)) return `<h${level}${attrs}>${openTag}${text}${closeTag}</h${level}>`;
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    const id = plainText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `<h${level} id="${id}"${attrs}>${openTag}${text}${closeTag}</h${level}>`;
  });
}

/** Strip HTML tags and return plain text */
function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract HowTo steps from the first ordered list (<ol>) in HTML.
 * Returns array of step text strings, or empty array if no OL found.
 */
export function extractHowToSteps(html: string): string[] {
  const olMatch = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (!olMatch) return [];

  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const steps: string[] = [];
  let m;
  while ((m = liRegex.exec(olMatch[1])) !== null) {
    const text = toPlainText(m[1]);
    if (text.length > 10) steps.push(text);
  }
  return steps;
}

/**
 * Extract FAQ pairs from H2/H3 headings that are questions (start with ¿ or end with ?)
 * followed by a paragraph as the answer.
 */
export function extractFAQs(html: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // 1. Extract from <details><summary> blocks (higher quality, manually written)
  const detailsRegex = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let dm;
  while ((dm = detailsRegex.exec(html)) !== null && faqs.length < 5) {
    const question = toPlainText(dm[1]).trim();
    const pMatch = dm[2].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const answer = pMatch ? toPlainText(pMatch[1]).trim() : toPlainText(dm[2]).trim();
    if (question.length > 5 && answer.length >= 20) {
      faqs.push({
        question: question.replace(/^¿|[?¿]$/g, '').trim(),
        answer: answer.length > 300 ? answer.substring(0, 300) + '…' : answer,
      });
    }
  }

  // 2. Extract from h2/h3 questions followed by content
  const sectionRegex = /<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23]|$)/gi;
  let m;
  while ((m = sectionRegex.exec(html)) !== null && faqs.length < 5) {
    const headingText = toPlainText(m[1]).trim();
    if (!headingText.startsWith('¿') && !headingText.endsWith('?')) continue;

    const contentBlock = m[2];
    const pMatch = contentBlock.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (!pMatch) continue;
    const answerText = toPlainText(pMatch[1]).trim();
    if (answerText.length < 20) continue;

    faqs.push({
      question: headingText.replace(/^¿|[?¿]$/g, '').trim(),
      answer: answerText.length > 300 ? answerText.substring(0, 300) + '…' : answerText,
    });
  }

  return faqs;
}

/** Generate a short excerpt from HTML — picks the first meaningful paragraph */
export function generateExcerpt(html: string, maxLength = 160): string {
  // Try to extract text from the first <p> that has enough content
  const pMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const m of pMatches) {
    const text = m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Skip very short paragraphs (less than 40 chars) — likely noise
    if (text.length >= 40) {
      if (text.length <= maxLength) return text;
      const truncated = text.substring(0, maxLength);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > maxLength * 0.4) return truncated.substring(0, lastPeriod + 1);
      return truncated.replace(/\s+\S*$/, '') + '…';
    }
  }

  // Fallback: strip all HTML and take first N chars
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength * 0.4) return truncated.substring(0, lastPeriod + 1);
  return truncated.replace(/\s+\S*$/, '') + '…';
}

/**
 * Add automatic internal links to first mentions of key terms in the HTML.
 * Only links the FIRST occurrence per term, never inside existing <a> or headings.
 * Pass currentSlug to avoid linking to the page's own category.
 */
export function addInternalLinks(html: string, currentSlug: string): string {
  // Terms to auto-link: pattern matches text in <p> tags, links to internal URL
  // Only the FIRST match per pattern is linked (to avoid over-optimization)
  const allTargets: { pattern: RegExp; url: string; exclude?: string[] }[] = [
    // High-value hub pages
    { pattern: /\btallas?\s+(?:de\s+)?(?:ropa\s+)?chin(?:a|as)\b/i, url: '/escoger-tu-talla-ropa-china/', exclude: ['escoger-tu-talla-ropa-china'] },
    { pattern: /\bequivalencia\s+de\s+tallas?\b/i, url: '/escoger-tu-talla-ropa-china/', exclude: ['escoger-tu-talla-ropa-china'] },
    { pattern: /\bTemu\s+vs\s+AliExpress\b/i, url: '/temu-vs-aliexpress/', exclude: ['temu-vs-aliexpress'] },
    { pattern: /\bTemu\b(?!\s*[<.])/i, url: '/temu-vs-aliexpress/', exclude: ['temu-vs-aliexpress', 'opiniones-sobre-temu-es-fiable-comprar-desde-espana'] },
    { pattern: /\brebajas\s+(?:de\s+)?AliExpress\b/i, url: '/calendario-rebajas-aliexpress-2026/', exclude: ['calendario-rebajas-aliexpress-2026', '11-del-11-aliexpress'] },
    { pattern: /\b11\s*del\s*11\b/i, url: '/11-del-11-aliexpress/', exclude: ['11-del-11-aliexpress', 'calendario-rebajas-aliexpress-2026'] },
    // Category pages
    { pattern: /\btiendas?\s+chin(?:a|as)\s+online\b/i, url: '/categoria/tiendas-chinas/', exclude: ['tiendas-chinas-online'] },
    { pattern: /\bAliExpress\s+Plaza\b/i, url: '/aliexpress-plaza/', exclude: ['aliexpress-plaza'] },
    // Top content posts
    { pattern: /\bzapatillas?\s+(?:de\s+)?deporte\b/i, url: '/las-mejores-zapatillas-de-deporte-en-aliexpress/', exclude: ['las-mejores-zapatillas-de-deporte-en-aliexpress'] },
    { pattern: /\bmejores\s+marcas\s+(?:en\s+)?AliExpress\b/i, url: '/mejores-marcas-en-aliexpress/', exclude: ['mejores-marcas-en-aliexpress'] },
    { pattern: /\bropa\s+(?:de\s+)?tallas?\s+grandes?\b/i, url: '/ropa-tallas-grandes/', exclude: ['ropa-tallas-grandes'] },
    { pattern: /\bimportar\s+(?:de|desde)\s+China\b/i, url: '/importar-de-china-2/', exclude: ['importar-de-china-2'] },
    { pattern: /\bbotas?\s+(?:de\s+)?f[uú]tbol\b/i, url: '/botas-de-futbol-en-aliexpress/', exclude: ['botas-de-futbol-en-aliexpress'] },
    { pattern: /\bpatinete\s+el[eé]ctrico\b/i, url: '/comprar-patinete-electrico-en-china/', exclude: ['comprar-patinete-electrico-en-china'] },
    { pattern: /\bvestidos?\s+(?:de\s+)?fiesta\b/i, url: '/vestidos-de-fiesta-en-aliexpress/', exclude: ['vestidos-de-fiesta-en-aliexpress'] },
    { pattern: /\bbolsos?\s+(?:baratos?|chinos?)\b/i, url: '/bolsos-baratos-chinos/', exclude: ['bolsos-baratos-chinos'] },
    { pattern: /\bcomprar\s+en\s+Taobao\b/i, url: '/como-comprar-en-taobao/', exclude: ['como-comprar-en-taobao'] },
    { pattern: /\baduana(?:s)?\s+(?:de\s+)?AliExpress\b/i, url: '/aduana-aliexpress/', exclude: ['aduana-aliexpress'] },
    // New high-value articles (2026)
    { pattern: /\bnuevo\s+arancel\b/i, url: '/nuevo-arancel-compras-china-2026/', exclude: ['nuevo-arancel-compras-china-2026'] },
    { pattern: /\barancel(?:es)?\s+(?:UE|europeo|2026)\b/i, url: '/nuevo-arancel-compras-china-2026/', exclude: ['nuevo-arancel-compras-china-2026', 'aduana-aliexpress'] },
    { pattern: /\bauriculares?\s+(?:bluetooth|inal[aá]mbricos?|TWS)\b/i, url: '/mejores-auriculares-bluetooth-baratos-aliexpress/', exclude: ['mejores-auriculares-bluetooth-baratos-aliexpress', 'comprar-auriculares-en-china'] },
    { pattern: /\bsmartwatch\s+(?:chinos?|baratos?)\b/i, url: '/mejores-smartwatch-chinos-baratos/', exclude: ['mejores-smartwatch-chinos-baratos', 'mejores-relojes-samsung'] },
    { pattern: /\bTemu\s+(?:vs?|o)\s+Shein\b/i, url: '/temu-vs-shein/', exclude: ['temu-vs-shein', 'temu-vs-aliexpress'] },
    { pattern: /\bShein\s+(?:vs?|o)\s+Temu\b/i, url: '/temu-vs-shein/', exclude: ['temu-vs-shein', 'shein-comprar-opiniones'] },
  ];

  // Filter out links TO the current page
  const linkTargets = allTargets.filter(t => !t.exclude?.includes(currentSlug));

  let result = html;

  for (const { pattern, url } of linkTargets) {
    // We replace only the FIRST match that is:
    // 1. Inside a <p> tag text (not headings, not existing links, not attrs)
    // We do this by splitting on existing <a> tags to avoid double-linking
    let linked = false;
    result = result.replace(
      // Match paragraphs and replace only first occurrence of the term
      /<p([^>]*)>([\s\S]*?)<\/p>/gi,
      (fullP, attrs, inner) => {
        if (linked) return fullP;
        // Skip if term doesn't appear in this paragraph
        if (!pattern.test(inner)) return fullP;
        // Skip if term is already inside an anchor in this paragraph
        const innerWithoutLinks = inner.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '___LINK___');
        if (!pattern.test(innerWithoutLinks)) return fullP;

        // Replace first occurrence in this paragraph (outside existing links)
        let replaced = false;
        const newInner = inner.replace(
          // Split by <a> tags, replace in non-link segments only
          /(<a[^>]*>[\s\S]*?<\/a>)|([^<]+)/gi,
          (chunk, linkChunk, textChunk) => {
            if (linkChunk) return linkChunk; // already a link, skip
            if (replaced || !textChunk) return chunk;
            if (pattern.test(textChunk)) {
              replaced = true;
              return textChunk.replace(pattern, (match) => {
                return `<a href="${url}" class="internal-link">${match}</a>`;
              });
            }
            return chunk;
          }
        );
        if (replaced) linked = true;
        return `<p${attrs}>${newInner}</p>`;
      }
    );
  }

  return result;
}
