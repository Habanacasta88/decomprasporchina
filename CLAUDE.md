# decomprasporchina.com — Documentación del Proyecto

## Resumen
- **Dominio**: decomprasporchina.com
- **Nombre**: De Compras por China
- **Nicho**: Guías de compras en tiendas chinas (AliExpress, Shein, TEMU, GearBest, etc.)
- **Stack**: Astro SSG + nginx (Docker) + Coolify + Traefik + Let's Encrypt
- **GitHub**: Habanacasta88/decomprasporchina (privado)
- **VPS**: 168.119.125.218 | Coolify
- **Fecha migración**: 2026-03-15

## Contenido migrado desde WordPress
- **Posts**: 297 publicados
- **Páginas**: 6 páginas
- **Imágenes originales**: 296 (22.8 MB)
- **Posts con featured image**: 296/297
- **Plugin SEO original**: Yoast SEO → 91 meta descriptions extraídas
- **Idioma**: Español

## Categorías
| Categoría | Posts | Slug URL |
|-----------|-------|----------|
| Tiendas Chinas | 102 | /categoria/tiendas-chinas |
| Ropa | 50 | /categoria/ropa |
| Accesorios | 50 | /categoria/accesorios |
| Blog | 28 | /categoria/blog |
| Deporte | 23 | /categoria/deporte |
| Tecnología | 21 | /categoria/tecnologia |
| Calzado | 20 | /categoria/calzado |
| Xiaomi | 5 | /categoria/xiaomi |

## Build
- **495 páginas estáticas** generadas en ~1.5 segundos

## Backup original
- Archivo: `decomprasporchina-com-20260314-061527-uoesd7y2nj2s.wpress` (1.1 GB)
- DB prefix original: `eselVKRa`
- Extraído en: `/dev/Migraciones/decomprasporchina-extract/`
  - `database.sql` (22.9 MB)
  - `posts.json`, `pages.json`
  - `images/` (296 imágenes)

## Notas importantes
- nginx.conf usa `listen 80 default_server` + `server_name decomprasporchina.com _`
- WordPress redirect: `/wp-content/uploads/` → `/images/` (en nginx.conf)
