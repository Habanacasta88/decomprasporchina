// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import postsData from './src/data/posts.json' with { type: 'json' };
import pagesData from './src/data/pages.json' with { type: 'json' };

const SITE = 'https://decomprasporchina.com';

// Posts that are noindex in [slug].astro — must be excluded from sitemap
// (cleaned: removed 49 cambiandopilas car-battery slugs that don't exist in this project)
const noindexSlugs = new Set([]);

// Build a slug -> modified date lookup for posts and pages
// Dates in posts.json use "YYYY-MM-DD HH:MM:SS" format (space separator, not T)
const dateBySlug = new Map();
for (const post of postsData) {
  const raw = post.modified || post.date;
  // Normalize to YYYY-MM-DD (W3C date format, accepted by sitemap spec)
  dateBySlug.set(post.slug, raw ? raw.split(' ')[0] : undefined);
}
for (const page of pagesData) {
  const raw = page.modified || page.date;
  dateBySlug.set(page.slug, raw ? raw.split(' ')[0] : undefined);
}

export default defineConfig({
  site: SITE,
  integrations: [
    mdx(),
    sitemap({
      // Exclude: noindex posts, paginated archive pages (blog/2+, categoria/slug/N)
      filter: (url) => {
        const path = url.replace(SITE, '').replace(/\/$/, '');
        const segments = path.split('/').filter(Boolean);

        // Exclude noindex slugs (top-level posts and WP pages)
        if (segments.length === 1 && noindexSlugs.has(segments[0])) {
          return false;
        }

        // Exclude /blog/2, /blog/3 ... /blog/N (paginated blog index)
        if (segments[0] === 'blog' && segments.length === 2 && /^\d+$/.test(segments[1])) {
          return false;
        }

        // Exclude /categoria/slug/2, /categoria/slug/3 ... (paginated category pages)
        if (segments[0] === 'categoria' && segments.length === 3 && /^\d+$/.test(segments[2])) {
          return false;
        }

        return true;
      },

      // Inject accurate lastmod dates from posts.json / pages.json data
      serialize: (item) => {
        const path = item.url.replace(SITE, '').replace(/\/$/, '');
        const segments = path.split('/').filter(Boolean);

        // Top-level slugs: posts and WP pages
        if (segments.length === 1) {
          const dateStr = dateBySlug.get(segments[0]);
          if (dateStr) {
            // Pass a Date object so @astrojs/sitemap formats it correctly
            item.lastmod = dateStr;
          }
        }

        return item;
      },
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
