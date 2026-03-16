// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import postsData from './src/data/posts.json' with { type: 'json' };
import pagesData from './src/data/pages.json' with { type: 'json' };

const SITE = 'https://decomprasporchina.com';

// Posts that are noindex in [slug].astro — must be excluded from sitemap
const noindexSlugs = new Set([
  // Duplicate posts
  'como-cambiar-la-bateria-de-la-llave-de-un-auto-toyota-2',
  'como-cambiar-la-bateria-de-la-llave-de-un-auto-toyota-3',
  'como-cambiar-la-bateria-de-un-llavero-nissan-3',
  'como-cambiar-la-bateria-del-llavero-2',
  'como-cambiar-la-bateria-del-llavero-3',
  'como-cambiar-la-bateria-en-un-llavero-de-audi-2',
  'como-cambiar-la-bateria-en-un-llavero-mitsubishi-2',
  'como-cambiar-la-bateria-en-un-llavero-lincoln-2',
  'como-cambiar-la-bateria-en-un-llavero-lincoln-3',
  'como-cambiar-la-bateria-en-un-llavero-lincoln-4',
  'como-cambiar-la-bateria-en-un-llavero-toyota-2',
  'como-cambiar-la-bateria-en-un-llavero-2',
  'como-cambiar-la-bateria-en-un-llavero-3',
  'como-cambiar-la-bateria-en-un-llavero-4',
  'como-cambiar-la-bateria-en-un-llavero-5',
  'como-cambiar-la-bateria-en-un-llavero-6',
  'como-cambiar-la-bateria-en-un-llavero-subaru-2',
  'como-cambiar-la-bateria-de-un-llavero-ford-2',
  'como-cambiar-la-bateria-de-un-llavero-ford-3',
  'como-cambiar-la-bateria-de-la-llave-del-coche-2',
  'como-cambiar-la-bateria-en-un-llavero-cadillac-2',
  'como-cambiar-la-bateria-de-una-llave-vw-2',
  'como-cambio-la-bateria-de-mi-llavero-2',
  'como-cambio-la-bateria-de-mi-llavero-3',
  'como-cambiar-la-bateria-en-un-llavero-chevy-2',
  'como-cambiar-la-bateria-en-una-llave-nissan-2',
  'como-cambiar-la-bateria-en-un-llavero-volkswagen-2',
  'como-cambiar-la-bateria-en-un-llavero-hyundai-2',
  'como-cambiar-la-bateria-en-un-llavero-hyundai-3',
  'como-cambiar-la-bateria-en-un-llavero-vw-2',
  // Low-traffic / non-ES market posts
  'como-reemplazar-la-bateria-en-el-llavero-de-chevy',
  'como-cambiar-la-bateria-en-un-llavero-chevy',
  'como-cambiar-la-bateria-en-un-llavero-lincoln',
  'como-cambiar-la-bateria-en-un-llavero-cadillac',
  'como-cambiar-la-bateria-de-una-llave-holden',
]);

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
