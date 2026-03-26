# decomprasporchina.com — Documentación del Proyecto

## Resumen
- **Dominio**: decomprasporchina.com
- **Nombre**: De Compras por China
- **Nicho**: Guías de compras en tiendas chinas (AliExpress, Shein, TEMU, etc.)
- **Stack**: Astro SSG + nginx (Docker) + Traefik + Let's Encrypt
- **GitHub**: Habanacasta88/decomprasporchina (público)
- **VPS**: 168.119.125.218 | red coolify
- **Fecha migración**: 2026-03-15
- **Última actualización**: 2026-03-26

## Contenido actual
- **317 posts** + 6 páginas + 8 categorías = **360 páginas estáticas**
- **296 imágenes** originales (22.8 MB)
- **21 artículos nuevos** creados en marzo 2026
- **Idioma**: Español (targeting España + LATAM)

## Monetización
- **AdSense**: ca-pub-1887931946230317 | Slots: 4427222054 (after P1) + 1879548363 (after P3)
- **AliExpress**: https://s.click.aliexpress.com/e/_c45uyDgx
- **Amazon**: tag `enjoys0d-21` (España)
- **Compliance**: `rel="nofollow sponsored noopener"` en todos los enlaces de afiliado
- **Componentes**: `AdUnit.astro` + `AffiliateBox.astro` inyectados automáticamente en `[slug].astro`
- **IMPORTANTE**: `type: "post"` requerido en posts.json para que se inyecten ads

## Arquitectura de contenido
- `src/data/posts.json` — Todos los posts (317), flat JSON array
- `src/data/pages.json` — Páginas estáticas (6)
- `src/pages/[slug].astro` — Template de posts con ad injection
- `src/utils/content.ts` — Limpieza HTML, internal links, FAQ extraction, heading IDs
- `src/layouts/Base.astro` — Layout con AdSense script, schema.org, OG tags

### content.ts funciones clave
- `cleanWpContent()` — Strip WP blocks, fix links, strip category prefixes
- `addHeadingIds()` — Añade IDs a H2/H3 (skip si ya tienen)
- `extractFAQs()` — Extrae FAQ de `<details><summary>` y `<h2/h3>` questions
- `addInternalLinks()` — Auto-enlaza 22 términos a páginas hub
- `generateExcerpt()` — Genera excerpt del primer párrafo

### [slug].astro inyección
```
contentPart1 → AdUnit(slot1) → contentPart2 → AffiliateBox → AdUnit(slot2) → contentPart3
```
- `splitAtParagraph(html, n)` divide en el n-ésimo `</p>`
- `slugAffiliates` — Override CTA por slug específico (5 posts)
- `categoryAffiliates` — Fallback CTA por categoría (8 categorías)

## Deploy
```bash
# Build local
source ~/.nvm/nvm.sh && nvm use 22 && npm run build

# Build Docker para VPS (amd64 — el Mac es arm64)
docker buildx build --platform linux/amd64 -t decomprasporchina:latest --load .

# Transfer a VPS
docker save decomprasporchina:latest | ssh root@168.119.125.218 "docker load"

# Run container
ssh root@168.119.125.218 "docker stop decomprasporchina; docker rm decomprasporchina; docker run -d \
  --name decomprasporchina --network coolify --restart unless-stopped \
  -l 'traefik.enable=true' \
  -l 'traefik.http.routers.decomprasporchina.rule=Host(\`decomprasporchina.com\`) || Host(\`www.decomprasporchina.com\`)' \
  -l 'traefik.http.routers.decomprasporchina.entrypoints=https' \
  -l 'traefik.http.routers.decomprasporchina.tls=true' \
  -l 'traefik.http.routers.decomprasporchina.tls.certresolver=letsencrypt' \
  -l 'traefik.http.services.decomprasporchina.loadbalancer.server.port=80' \
  decomprasporchina:latest"
```

O usa el script automatizado: `bash agents/scripts/deploy.sh`

## Sistema de Agentes

6 agentes autónomos gestionan la web via slash commands de Claude Code:

| Agente | Comando | Trigger | Función |
|--------|---------|---------|---------|
| **SEO Sentinel** | `/seo-monitor` | Lunes 09:00 (launchd) | Monitor semanal GSC, detecta caídas, oportunidades |
| **Content Strategist** | `/content-writer` | Manual | Encuentra gaps, verifica duplicados, escribe artículos |
| **GEO Optimizer** | `/geo-optimizer` | Bi-semanal | Optimiza para LATAM (PE, MX, CL, CO) |
| **Site Doctor** | `/site-doctor` | Domingo 08:00 (launchd) | Health check: container, SSL, AdSense, links |
| **Deploy Bot** | `/deploy-bot` | Manual | Build + transfer + deploy + verify |
| **Revenue Analyst** | `/revenue-analyst` | Manual | Audita cobertura de afiliados, sugiere mejoras |

### Estructura de archivos
```
agents/
  state/                    # Estado compartido entre agentes
    seo-baseline.json       # Snapshots semanales GSC
    content-queue.json      # Cola de artículos por escribir
    deploy-lock             # Lock durante deploy (transitorio)
    last-deploy.json        # Info del último deploy
    revenue-index.json      # Mapa de monetización por página
  reports/                  # Reportes generados (no versionados)
    seo/                    # SEO Sentinel reports
    content/                # Content briefs
    health/                 # Health checks
    revenue/                # Revenue analysis
  scripts/
    deploy.sh               # Script completo de deploy
    health-check.sh         # Checks de infraestructura
.claude/commands/           # Slash commands
    seo-monitor.md
    content-writer.md
    geo-optimizer.md
    site-doctor.md
    deploy-bot.md
    revenue-analyst.md
```

### Protocolo de concurrencia
- `deploy-lock` — Presente = deploy en curso, no modificar posts.json
- `content-write-lock` — Presente = un agente está escribiendo, no deploy
- Escritura atómica: escribir a `.tmp`, luego `mv` sobre el original

## nginx.conf
- `listen 80 default_server` + `server_name decomprasporchina.com _`
- Redirects 301: `/tiendas-chinas/slug/` → `https://decomprasporchina.com/slug/` (absoluto, HTTPS)
- Categorías redirigidas: tiendas-chinas, accesorios, ropa, calzado, tecnologia, deporte, xiaomi, blog
- `/wp-content/uploads/` → `/images/`

## GSC Data (marzo 2026)
- 16 clics/semana, ~69 clics/mes, ~7,300 impresiones/mes
- Página dorada: `/escoger-tu-talla-ropa-china/` — 1,104 impr/semana, pos 4-7
- Top países: España, Perú (pos 7.2), Chile (pos 9.8), México (pos 13.2)
- Objetivo: 100€/mes en 90 días (~250 clics/semana)

## Backup original
- Archivo: `decomprasporchina-com-20260314-061527-uoesd7y2nj2s.wpress` (1.1 GB)
- DB prefix: `eselVKRa`
- Extraído en: `/dev/Migraciones/decomprasporchina-extract/`
