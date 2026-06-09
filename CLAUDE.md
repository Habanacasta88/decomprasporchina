# decomprasporchina.com — Documentación del Proyecto

## Resumen
- **Dominio**: decomprasporchina.com
- **Nombre**: De Compras por China
- **Nicho**: Guías de compras en tiendas chinas (AliExpress, Shein, TEMU, etc.)
- **Stack**: Astro SSG + nginx (Docker) + Traefik + Let's Encrypt
- **GitHub**: Habanacasta88/decomprasporchina (público)
- **VPS**: 162.55.129.125 | red coolify (Hetzner AX41 dedicado, Falkenstein — migrado 2026-03-29 desde 168.119.125.218)
- **Fecha migración**: 2026-03-15
- **Última actualización**: 2026-06-08 (post-merge calculadoras + cluster-completo branch)
- **Ruta local**: /dev/decomprasporchina/ (independiente de /dev/Migraciones/)

## Contenido actual (W24 — post-merge PR #1 + cluster-completo en preparación)
- **319 posts** (317 base + 2 tallas AR/ES + 9 tallas LATAM secundarios pendientes de mergear desde feat/cluster-completo)
- **7 páginas + 8 categorías** legacy
- **Hubs calculadoras dinámicas** (mergeadas en main 2026-06-07):
  - 14 URLs `/precio-aliexpress/[moneda]/` (13 monedas + hub)
  - 16 URLs `/aduana/china-a-[pais]/` (15 países + hub)
- **Total páginas build**: 392 en main, 402 en feat/cluster-completo
- **15 países LATAM cubiertos en aduana** (Chile, México, Perú, Colombia, Argentina, España + Ecuador, Venezuela, Panamá, Guatemala, Costa Rica, Uruguay, Bolivia, R. Dominicana, El Salvador)
- **296 imágenes** originales (22.8 MB)
- **21 artículos nuevos** creados en marzo 2026
- **Idioma**: Español (targeting España + LATAM)
- **Páginas legales**: aviso-legal, politica-de-cookies, sobre-nosotros

## Monetización
- **AdSense**: ca-pub-1887931946230317 | Slots: 4427222054 (after P1) + 1879548363 (after P3)
- **AliExpress**: https://s.click.aliexpress.com/e/_c45uyDgx
- **Amazon**: tag `enjoys0d-21` (España)
- **Compliance**: `rel="nofollow sponsored noopener"` en todos los enlaces de afiliado
- **Cookie Consent**: gestionado por AdSense CMP (Google Consent Mode v2) — no requiere banner propio
- **Componentes**: `AdUnit.astro` + `AffiliateBox.astro` inyectados automáticamente en `[slug].astro`
- **IMPORTANTE**: `type: "post"` requerido en posts.json para que se inyecten ads

## Compliance legal (LSSI-CE + RGPD)
- **Aviso Legal** (`/aviso-legal/`): 11 secciones — LSSI-CE Art.10 + RGPD + LOPDGDD. Email contacto: dtotvalles@gmail.com
- **Política de Cookies** (`/politica-de-cookies/`): cookies técnicas, AdSense, Amazon Associates, AliExpress Portals
- **Affiliate Disclosure**: en footer de todos los posts + sección dedicada en aviso-legal
- **Rel attributes**: `nofollow sponsored noopener` en todos los enlaces de afiliado
- **AdSense density**: máximo 2 ads por post (slot1 after P1, slot2 after P3)
- **Trademark risk**: 4 posts con "réplicas + marca" en título (P0 PENDIENTE)
  - zapatillas-nike-replicas, replicas-adidas-aliexpress, replicas-jordan-aliexpress, comprar-zapatillas-vans

## Arquitectura de contenido
- `src/data/posts.json` — Todos los posts (317), flat JSON array
- `src/data/pages.json` — Páginas estáticas (6)
- `src/pages/[slug].astro` — Template de posts con ad injection
- `src/pages/aviso-legal.astro` — Aviso legal LSSI-CE completo
- `src/pages/politica-de-cookies.astro` — Política de cookies RGPD
- `src/pages/sobre-nosotros.astro` — Sobre nosotros con schema Organization
- `src/utils/content.ts` — Limpieza HTML, internal links, FAQ extraction, heading IDs
- `src/layouts/Base.astro` — Layout con AdSense script, schema.org, OG tags

### content.ts funciones clave
- `cleanWpContent()` — Strip WP blocks, fix links, strip category prefixes, **sanitizar XSS**, add lazy loading to images
- `addHeadingIds()` — Añade IDs a H2/H3 (skip si ya tienen)
- `extractFAQs()` — Extrae FAQ de `<details><summary>` + `<h2/h3>` questions
- `addInternalLinks()` — Auto-enlaza **48 términos** a páginas hub (10 nuevos añadidos 2026-03-29)
- `generateExcerpt()` — Genera excerpt del primer párrafo

### [slug].astro inyección
```
contentPart1 → AdUnit(slot1) → contentPart2 → AffiliateBox → AdUnit(slot2) → contentPart3
```
- `splitAtParagraph(html, n)` divide en el n-ésimo `</p>`
- `slugAffiliates` — Override CTA por slug específico (5 posts)
- `categoryAffiliates` — Fallback CTA por categoría (8 categorías)

## Internal Linking
- **48 auto-link patterns** en content.ts (original 22 + 16 + 10 nuevos 2026-03-29)
- **Link health score**: 7/10 — 293 posts enlazados (92.4%), **24 true orphans** (7.6%)
- **CORRECCIÓN**: El audit anterior reportaba 272 orphans (85.8%) por error metodológico. El cálculo correcto incluye links embebidos en el HTML original de WP + auto-links de build time.
- **Clusters activos**:
  - `tallas` → hub `/escoger-tu-talla-ropa-china/` (63 total: 39 embebidos + 24 auto-link, STRONG)
  - `shein` → hub `/shein-comprar-opiniones/` (44 total: 16 embebidos + 28 auto-link, STRONG)
  - `xiaomi` → hub `/categoria/xiaomi/` (40 incoming via auto-link, STRONG)
  - `tiendas` → hub `/tiendas-chinas-online/` (31 total: 15 embebidos + 16 auto-link, OK)
  - `aliexpress-plaza` → hub `/aliexpress-plaza/` (28 embebidos, OK)
  - `compras` → hub `/como-comprar-en-aliexpress-2026/` (5 incoming, WEAKEST — 10 nuevos via auto-link "comprar en AliExpress")
- **Top orphans** (prioridad por tamaño):
  - /mejores-tapones-para-dormir/ (20k), /casas-de-munecas/ (19k), /juegos-de-mesa-en-aliexpress-y-amazon/ (18k)
- **Proyección**: Con 10 nuevos patterns → ~11 orphans (3.5%), link health 9/10

## Deploy
```bash
# Build local
source ~/.nvm/nvm.sh && nvm use 22 && npm run build

# Build Docker para VPS (amd64 — el Mac es arm64)
docker buildx build --platform linux/amd64 -t decomprasporchina:latest --load .

# Transfer a VPS
docker save decomprasporchina:latest | ssh deploy@162.55.129.125 "docker load"

# Run container
ssh deploy@162.55.129.125 "docker stop decomprasporchina; docker rm decomprasporchina; docker run -d \
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

## Sistema de Agentes (v2 — 13 agentes, 6 capas)

### Organigrama
```
CAPA 1 — DIRECCIÓN
  Diana (Editor Jefe) → /editor-jefe — Orquesta todo, plan semanal, prioriza

CAPA 2 — INTELIGENCIA
  Marco (SEO Sentinel) → /seo-monitor — Monitor GSC, detecta caídas
  Elena (Competitor Watch) → /competitor-watch — Vigila competencia, identifica gaps
  Tomás (Measurement Analyst) → /measurement-analyst — Métricas, atribución, ROI

CAPA 3 — PRODUCCIÓN
  Lucía (Content Writer) → /content-writer — Escribe artículos nuevos
  Pablo (Content Refresher) → /content-refresher — Actualiza posts existentes
  Valentina (GEO Optimizer) → /geo-optimizer — Optimiza LATAM (PE, MX, CL, CO)
  Andrés (Link Architect) → /link-architect — Internal linking, clusters

CAPA 4 — NEGOCIO
  Sara (CRO Strategist) → /cro-strategist — Conversión, CTAs, UX
  Roberto (Revenue Analyst) → /revenue-analyst — Afiliados, AdSense, revenue

CAPA 5 — INFRAESTRUCTURA
  Carmen (Site Doctor) → /site-doctor — Health check, container, SSL
  Miguel (Deploy Bot) → /deploy-bot — Build + deploy + verify

CAPA 6 — CONTROL
  Javier (Compliance Guardian) → /compliance-guardian — LSSI-CE, RGPD, trademark
```

### Memoria persistente (4 capas)
```
agents/
  soul/                       # Personalidad de cada agente (13 archivos .md)
    editor-jefe.md              # Diana — orquestadora
    seo-sentinel.md             # Marco — SEO
    content-writer.md           # Lucía — contenido nuevo
    content-refresher.md        # Pablo — actualizaciones
    geo-optimizer.md            # Valentina — LATAM
    link-architect.md           # Andrés — enlaces internos
    competitor-watch.md         # Elena — competencia
    cro-strategist.md           # Sara — conversión
    measurement-analyst.md      # Tomás — métricas
    revenue-analyst.md          # Roberto — ingresos
    site-doctor.md              # Carmen — infraestructura
    deploy-bot.md               # Miguel — deploys
    compliance-guardian.md      # Javier — legal/compliance
  memory/
    shared-context.json         # Contexto compartido (misión, audiencia, voz, goals, orgChart)
    decisions-log.json          # Log cronológico de decisiones con razonamiento
    learnings.json              # 12 learnings críticos (L001-L012)
    relationships.json          # Mapa de comunicación inter-agente
  state/
    seo-baseline.json           # Snapshots semanales GSC
    content-queue.json          # Cola de artículos por escribir
    week-plan.json              # Plan semanal del Editor Jefe
    refresh-tracker.json        # Tracking de posts actualizados
    link-map.json               # Mapa de enlaces internos (score, orphans, clusters)
    compliance-log.json         # Auditoría legal (PASS/FAIL por categoría, risk posts)
    revenue-index.json          # Mapa de monetización (317 posts, 5 overrides, 42 candidates)
    last-deploy.json            # Info del último deploy
    deploy-lock                 # Lock durante deploy (transitorio)
  reports/                      # Reportes generados (no versionados)
  scripts/
    deploy.sh                   # Script completo de deploy
    health-check.sh             # Checks de infraestructura (local → VPS via SSH)
    vps-monitor.sh              # Monitor autónomo en VPS (cron cada 5 min)
.claude/commands/               # 13 slash commands (uno por agente)
~/.claude/scheduled-tasks/      # Tareas programadas de Claude Code
    site-doctor-daily/          # Health check diario (9:17 AM)
    seo-monitor-weekly/         # SEO monitor (lunes 10:23 AM)
    editor-jefe-weekly/         # Plan semanal (lunes 9:42 AM)
    compliance-check-weekly/    # Auditoría legal (miércoles 11:13 AM)
```

### Automatización activa (2026-03-27)

#### VPS — Cron jobs (siempre activos)
| Tarea | Frecuencia | Script | Acción |
|-------|-----------|--------|--------|
| Monitor de salud | Cada 5 min | `/home/deploy/monitor.sh` | HTTP, container, disco, memoria, auto-restart |
| Docker cleanup | Auto (en monitor) | integrado | `docker image prune` si disco >85% |

- Logs: `/home/deploy/monitor.log` (rotación automática a 1MB)
- Alertas: `/home/deploy/monitor-alert.log` (solo problemas)
- Cron: `*/5 * * * * /home/deploy/monitor.sh 2>&1 | logger -t decompras-monitor`

#### Claude Code — Scheduled Tasks (activos mientras Claude Code esté abierto)
| Agente | Frecuencia | Horario | Acción |
|--------|-----------|---------|--------|
| Site Doctor (Carmen) | Diario | 9:17 AM | Health check completo, actualiza site-health.json |
| SEO Sentinel (Marco) | Lunes | 10:23 AM | Rankings, golden page, LATAM markets |
| Editor Jefe (Diana) | Lunes | 9:42 AM | Plan semanal, prioriza tareas |
| Compliance Guardian (Javier) | Miércoles | 11:13 AM | Trademark risk, affiliate compliance |

**NOTA**: Las scheduled tasks de Claude Code solo corren mientras la sesión esté activa. Auto-expiran tras 3 días sin sesión. El cron del VPS es independiente y siempre activo.

### Protocolo de concurrencia
- `deploy-lock` — Presente = deploy en curso, no modificar posts.json
- `content-write-lock` — Presente = un agente está escribiendo, no deploy
- Escritura atómica: escribir a `.tmp`, luego `mv` sobre el original

## CRO — Optimizaciones de Conversión (2026-03-29)

### Cambios implementados
- **Font loading fix**: Eliminado `@import` de CSS → `<link>` directo en Base.astro (elimina render-blocking)
- **Font payload reducido**: Sora de 7 weights (300-800) a 3 (400, 600, 700); Fraunces de variable completo a 3 weights (400, 600, 700)
- **Lazy loading**: `cleanWpContent()` añade `loading="lazy"` a todas las `<img>` del contenido WP
- **Segundo AffiliateBox**: Añadido después de contentPart3 (final del artículo), antes de FAQ
- **Sticky CTA bar**: Barra fija en bottom (mobile) para golden page, con CTA "Compra con tu talla correcta"
- **10 auto-link patterns nuevos**: "comprar en AliExpress", "tabla de tallas", "ropa barata", "PayPal", etc.
- **5 posts sin ads corregidos**: Añadido `<p>` tags a posts que no tenían paragraphs

### CRO pendiente (recomendaciones del agente)
- **R4 (P0)**: CTA inline justo después del resultado de la calculadora de tallas (+30-50% clics estimados)
- **R1 (P1)**: Sección "Más populares" en homepage (funnel a money pages)
- **R9 (P2)**: Trust micro-elements en AffiliateBox ("Envío gratuito | Protección al comprador")
- **R16 (P2)**: `srcset` en featured images (responsive images)
- **R18 (P2)**: Author bio box al final de posts (E-E-A-T)

### [slug].astro inyección actualizada
```
contentPart1 → AdUnit(slot1) → contentPart2 → AffiliateBox → AdUnit(slot2) → contentPart3 → AffiliateBox2 (end-of-article)
```
- Sticky CTA bar en golden page (`/escoger-tu-talla-ropa-china/`)
- `isGoldenPage` flag activa CTA pegajoso con affiliate link

## Revenue (audit 2026-03-29)
- **312/317 posts con ads activos** (5 corregidos el 29 mar)
- **178 posts (56.2%)** con dual CTA (AliExpress + Amazon)
- **139 posts (43.8%)** solo AliExpress (categorías Tiendas Chinas + Blog)
- **5 slug overrides** personalizados + **10 candidatos** identificados para overrides
- **Top candidates**: cosplays, pendientes Disney, robot aspirador, juegos de mesa, prismáticos
- **Gap**: Amazon affiliates solo funcionan en España (tag enjoys0d-21), no en LATAM

### Learnings críticos (resumen)
- L001: SIEMPRE verificar duplicados antes de crear posts (slugs Y títulos)
- L002: `type: "post"` OBLIGATORIO para ad injection
- L003: Docker images MUST use `--platform linux/amd64` (Mac es arm64)
- L004: Página tallas = ~60% de impresiones (single point of failure + mayor oportunidad)
- L005: LATAM (PE pos 7.2, CL pos 9.8) rankea MEJOR que España (pos 10+)
- L011: seoTitle ≤60 chars, seoDescription ≤155 chars (Google trunca)
- L012: Cada hub page necesita mínimo 5 internal links
- L013: nginx `add_header` en `location` blocks SOBREESCRIBE los del `server` block — repetir headers de seguridad
- L014: Contenido WP migrado puede contener XSS — `cleanWpContent()` DEBE sanitizar scripts/event handlers
- L015: NUNCA usar `root@` para deploys — usar `deploy@` con permisos Docker limitados
- L016: Si CSP rompe AdSense, revisar dominios en Network tab y añadir a whitelist
- L017: El audit de orphans anterior (272/85.8%) era incorrecto — el método no contaba links embebidos en el HTML original de WP. Real: 24 orphans (7.6%)
- L018: `limit_req_zone` va en el contexto `http {}`, NO en `server {}` — nginx.conf es un include de `conf.d/`, no el nginx.conf principal
- L019: Posts sin `<p>` tags en body → `splitAtParagraph()` falla → 0 ads inyectados. Verificar siempre
- L020: Font `@import` en CSS es render-blocking — usar `<link>` en HTML con preconnect. Reducir weights al mínimo
- L021: `/404.html` dentro de `try_files` se sirve como archivo normal → soft-404 con HTTP 200. Usar `error_page 404 /404.html;` + `try_files ... =404` para status 404 real
- L022: HTML sin `Cache-Control` → los navegadores aplican heuristic caching (~10% del age desde `Last-Modified`); tras un deploy los visitantes ven contenido viejo durante días. Usar `Cache-Control: no-cache` en HTML (revalida → 304) y dejar los assets hasheados con `immutable` (incidente 2026-06-08)

## Seguridad (hardening 2026-03-27)

### nginx.conf — Headers de seguridad
- **Content-Security-Policy (CSP)**: whitelist para AdSense, Google Fonts, Amazon, AliExpress
  - `script-src`: self + AdSense + Google Tag Services + Funding Choices
  - `img-src`: self + Google Ads + Amazon images + AliExpress tracking
  - `frame-src`: Google Ads + Funding Choices
  - `object-src: 'none'`, `base-uri: 'self'`, `form-action: 'self'`
- **Strict-Transport-Security (HSTS)**: max-age 1 año + includeSubDomains
- **Permissions-Policy**: bloquea camera, microphone, geolocation, payment, USB, sensores
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: SAMEORIGIN
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Rate limiting**: 10 req/s por IP, burst 20, status 429
- **Rutas bloqueadas**: `/.*` (dotfiles), `/wp-admin`, `/wp-login`, `/xmlrpc`, `/wp-json`, `/wp-includes`
- **IMPORTANTE**: headers de seguridad repetidos en `location` blocks (nginx herencia los sobreescribe)

### content.ts — Sanitización XSS
- Strip `<script>` tags y contenido
- Strip event handlers inline (`onclick`, `onerror`, `onload`, etc.)
- Bloquear `javascript:` y `data:text/html` en atributos href/src
- Eliminar `<iframe>` no confiables (solo YouTube/Google Maps permitidos)
- Eliminar `<object>`, `<embed>`, `<applet>`, `<form>` del contenido WP migrado

### Dockerfile — Container hardening
- `USER nginx` — proceso no corre como root
- `server_tokens off` — oculta versión de nginx en respuestas HTTP
- Ownership correcto de HTML, cache, logs, PID

### SSH — Acceso al VPS
- **Deploy**: `deploy@162.55.129.125` (grupo docker, sin sudo)
- **Admin**: `root@162.55.129.125` (solo para tareas administrativas)
- **REGLA**: deploy.sh y agentes SIEMPRE usan `deploy@`, NUNCA `root@`

## nginx.conf (config general)
- `listen 80 default_server` + `server_name decomprasporchina.com _`
- Redirects 301: `/tiendas-chinas/slug/` → `https://decomprasporchina.com/slug/` (absoluto, HTTPS)
- Categorías redirigidas: tiendas-chinas, accesorios, ropa, calzado, tecnologia, deporte, xiaomi, blog
- `/wp-content/uploads/` → `/images/`

## GSC Data (marzo 2026)
- 16 clics/semana, ~69 clics/mes, ~7,300 impresiones/mes
- Página dorada: `/escoger-tu-talla-ropa-china/` — 1,104 impr/semana, pos 4-7
  - seoTitle optimizado: "Tallas Chinas: Calculadora + Tablas para 6 Países (2026)" (56 chars)
  - 63 internal links (39 embebidos + 24 auto-link)
  - CTR actual: 0.6% (target 5-10%)
  - Sticky CTA bar añadido (2026-03-29)
- Top países: España, Perú (pos 7.2), Chile (pos 9.8), México (pos 13.2)
- Objetivo: 100€/mes en 90 días (~250 clics/semana)
- **Proyección realista (Diana, W13)**: 80-130 clics/semana (~40-65€/mes) si todo se ejecuta bien
  - Golden page CTR fix: +40-80 clics/semana
  - 21 URLs nuevas indexadas: +10-20 clics/semana
  - LATAM optimization: +10-20 clics/semana
  - Linking improvements: +5-10 clics/semana
- **Ahrefs API**: plan actual no incluye API — Marco opera con datos manuales de GSC

## Backup original
- Archivo: `decomprasporchina-com-20260314-061527-uoesd7y2nj2s.wpress` (1.1 GB)
- DB prefix: `eselVKRa`
- Extraído en: `/dev/decomprasporchina-extract/`
