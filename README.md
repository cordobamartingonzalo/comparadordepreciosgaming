# Precios GG 🎮

Comparador de precios de componentes gaming y periféricos en Argentina. Muestra el precio más bajo entre tiendas y resalta la mejor oferta.

**URL:** [preciosgg.com.ar](https://preciosgg.com.ar)

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos (Supabase)](#base-de-datos-supabase)
- [Tiendas configuradas](#tiendas-configuradas)
- [Scrapers](#scrapers)
- [Automatización (GitHub Actions)](#automatización-github-actions)
- [Frontend](#frontend)
- [SEO](#seo)
- [Analytics y monitoreo](#analytics-y-monitoreo)
- [Infraestructura y deploy](#infraestructura-y-deploy)
- [Variables de entorno](#variables-de-entorno)
- [Comandos útiles](#comandos-útiles)
- [Próximos pasos](#próximos-pasos)

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) + React 19 + TypeScript | Frontend y servidor |
| Tailwind CSS v4 + shadcn/ui | Estilos y componentes UI |
| Supabase | Base de datos PostgreSQL |
| Playwright | Web scraping |
| GitHub Actions | Automatización de scrapers |
| Vercel | Hosting y deploy |
| Cloudflare | DNS y CDN |

---

## Estructura del proyecto

```
comparador-gaming/
├── app/
│   ├── layout.tsx              # Layout global, metadata SEO, Google Analytics
│   ├── page.tsx                # Home: buscador y lista de categorías
│   ├── sitemap.ts              # Sitemap dinámico para SEO
│   ├── categoria/
│   │   └── [slug]/
│   │       └── page.tsx        # Página de categoría (ej: /categoria/procesadores)
│   └── producto/
│       └── [id]/
│           └── page.tsx        # Página de detalle del producto
├── components/
│   ├── category-page-client.tsx    # Cards de productos con imagen/placeholder
│   ├── product-page-client.tsx     # Componente cliente de página de producto
│   └── comparison-table.tsx        # Tabla comparativa de precios por tienda
├── lib/
│   ├── db.ts                   # Funciones para consultar Supabase
│   └── supabase.ts             # Cliente de Supabase
├── scripts/
│   ├── scraper.ts              # Scraper de precios (corre diario)
│   └── catalog-scraper.ts      # Scraper de catálogo con imágenes (corre semanal)
├── .github/
│   └── workflows/
│       └── scrapers.yml        # Automatización GitHub Actions
└── public/                     # Assets estáticos
```

---

## Base de datos (Supabase)

### Tablas

#### `products`
Productos únicos del catálogo.

| Campo | Tipo | Descripción |
|---|---|---|
| id | text (PK) | Slug único del producto (ej: `ryzen-5-5600x`) |
| name | text | Nombre del producto |
| category | text | Categoría (ej: `procesadores`, `tarjetas-de-video`) |
| image_url | text | URL de la imagen del producto |

#### `stores`
Tiendas donde se scrapean precios.

| Campo | Tipo | Descripción |
|---|---|---|
| id | text (PK) | Slug de la tienda (ej: `compragamer`) |
| name | text | Nombre para mostrar |

#### `store_listings`
Relación entre producto y tienda, con la URL específica del producto en esa tienda.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | ID único |
| product_id | text (FK) | Referencia a `products.id` |
| store_id | text (FK) | Referencia a `stores.id` |
| url | text | URL del producto en la tienda |

#### `price_snapshots`
Historial de precios scrapeados. Se inserta un registro por cada scraping exitoso.

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid (PK) | ID único |
| listing_id | uuid (FK) | Referencia a `store_listings.id` |
| price_ars | numeric | Precio en pesos argentinos |
| in_stock | boolean | Si el producto está en stock |
| shipping_label | text | Texto de envío (ej: "Envío gratis") |
| scraped_at | timestamptz | Fecha y hora del scraping |

### Índices
```sql
idx_price_snapshots_listing_id
idx_price_snapshots_scraped_at
idx_price_snapshots_listing_scraped
idx_store_listings_product_id
idx_store_listings_store_id
```

### Limpieza automática
Cron job en Supabase (pg_cron) que borra snapshots de más de 30 días, todos los días a las 2am:
```sql
-- jobid=1, schedule: 0 2 * * *
DELETE FROM price_snapshots WHERE scraped_at < NOW() - INTERVAL '30 days';
```

---

## Tiendas configuradas

| ID | Nombre | URL |
|---|---|---|
| `compragamer` | Compra Gamer | compragamer.com |
| `fullhard` | Full Hard | fullhard.com.ar |
| `maximusgaming` | Maximus Gaming | maximusgaming.com.ar |
| `mexx` | Mexx | mexx.com.ar |
| `venex` | Venex | venex.com.ar |

---

## Scrapers

### `scripts/scraper.ts` — Scraper de precios
- **Qué hace:** Itera sobre todos los `store_listings` activos, entra a cada URL y extrae el precio actual, stock y etiqueta de envío.
- **Cómo corre:** Playwright con Chromium headless.
- **Output:** Inserta registros en `price_snapshots`.
- **Frecuencia:** Diario (4am UTC via GitHub Actions).
- **Cómo correr manualmente:**
```bash
npx tsx --env-file=.env.local scripts/scraper.ts
```

### `scripts/catalog-scraper.ts` — Scraper de catálogo
- **Qué hace:** Scrapea las páginas de categorías de cada tienda para descubrir productos nuevos. Extrae nombre, categoría, URL del producto e imagen.
- **Output:** Inserta/actualiza registros en `products` y `store_listings`. Guarda `image_url` cuando la encuentra.
- **Soporte de imágenes por tienda:**
  - ✅ Venex — og:image funciona
  - ✅ Maximus — extracción desde listado funciona
  - ⚠️ Compragamer — Shadow DOM bloquea, usa placeholder
  - ⚠️ Mexx — lazy loading JS, usa placeholder
  - ⚠️ Fullhard — timeouts frecuentes
- **Frecuencia:** Semanal (lunes 3am UTC via GitHub Actions).
- **Cómo correr manualmente:**
```bash
npx tsx --env-file=.env.local scripts/catalog-scraper.ts
```

---

## Automatización (GitHub Actions)

Archivo: `.github/workflows/scrapers.yml`

### Jobs

| Job | Schedule | Descripción |
|---|---|---|
| `catalog-scraper` | Lunes 3am UTC | Actualiza catálogo de productos e imágenes |
| `image-scraper` | Lunes (tras catalog-scraper) | Busca imágenes faltantes vía SerpAPI |
| `price-scraper` | Diario 4am UTC | Actualiza precios de todos los productos |

### Secrets requeridos en GitHub
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SERPAPI_KEY
```

### Secuencia de instalación en cada job
1. `npm ci` — instala dependencias del proyecto
2. `npm install playwright` — instala módulo npm de Playwright
3. `npx playwright install chromium --with-deps` — descarga binario de Chromium

> **Nota:** Playwright no está en `package.json` porque es muy pesado para el build de Vercel. Se instala explícitamente solo en el runner de GitHub Actions.

---

## Frontend

### Navegación
```
/ (Home)
  └── /categoria/[slug]        (ej: /categoria/procesadores)
        └── /producto/[id]     (ej: /producto/ryzen-5-5600x)
```

### Componentes clave

#### `app/page.tsx`
Home con buscador en tiempo real y grid de categorías con íconos decorativos de fondo.

#### `app/categoria/[slug]/page.tsx`
Server component con `generateMetadata` dinámico para SEO. Renderiza `category-page-client.tsx`.

#### `components/category-page-client.tsx`
Grid de cards de productos. Cada card muestra imagen del producto (o placeholder SVG si no hay), nombre y link a la comparativa. Altura fija `h-36` para consistencia visual.

#### `app/producto/[id]/page.tsx`
Server component con `generateMetadata` dinámico. Renderiza `product-page-client.tsx`.

#### `components/product-page-client.tsx`
Página de detalle del producto con tabla comparativa de precios.

#### `components/comparison-table.tsx`
Tabla que muestra precio, stock y envío por tienda. Resalta el precio más bajo en verde.

### Funciones de base de datos (`lib/db.ts`)

| Función | Descripción |
|---|---|
| `getCategories()` | Lista todas las categorías disponibles |
| `getProductsByCategory(slug)` | Productos de una categoría con último precio |
| `getProducts()` | Todos los productos con imagen |
| `getLatestPricesForProduct(id)` | Precios actuales de un producto en todas las tiendas |
| `searchProducts(query)` | Búsqueda por nombre |

---

## SEO

### Metadata global (`app/layout.tsx`)
- Title, description, keywords
- Open Graph tags
- Canonical: `https://preciosgg.com.ar`
- Verificación Google Search Console

### Metadata dinámica
Las páginas de categoría y producto generan metadata dinámico con `generateMetadata` usando el nombre real de la categoría/producto.

### Sitemap (`app/sitemap.ts`)
Generado dinámicamente desde Supabase. Incluye:
- Home (priority 1.0, weekly)
- Categorías (priority 0.8, daily)
- Productos (priority 0.6, daily)

Accesible en: `https://preciosgg.com.ar/sitemap.xml`

### Google Search Console
- Sitio verificado con etiqueta HTML meta
- Sitemap enviado y activo

---

## Analytics y monitoreo

### Google Analytics 4
- ID: `G-V5DJZ6MEF1`
- Implementado via `next/script` en `app/layout.tsx`
- Trackea pageviews automáticamente

---

## Infraestructura y deploy

### Deploy
- **Plataforma:** Vercel (plan Hobby)
- **Trigger:** Automático en cada `git push` a `main`
- **URL de producción:** https://preciosgg.com.ar

### DNS
- **Registrar:** NIC.ar (dominio preciosgg.com.ar)
- **DNS:** Cloudflare (plan Free)
  - Nameservers: `dimitris.ns.cloudflare.com` / `norah.ns.cloudflare.com`
  - Registro A: `@` → `216.198.79.1` (DNS only)
  - CNAME: `www` → `17dc581abd272b4f.vercel-dns-017.com` (DNS only)

### Hosting adicional (no usado)
- Donweb: hosting comprado por error, no se usa. Vence 02/03/2027.

---

## Variables de entorno

Crear archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Estas mismas variables deben estar configuradas como Secrets en GitHub y como variables de entorno en Vercel.

---

## Comandos útiles

```bash
# Desarrollo local
npm run dev

# Correr scraper de precios manualmente
npx tsx --env-file=.env.local scripts/scraper.ts

# Correr catalog-scraper manualmente
npx tsx --env-file=.env.local scripts/catalog-scraper.ts

# Build de producción
npm run build

# Deploy (automático al hacer push)
git add .
git commit -m "descripción del cambio"
git push
```

---

## Próximos pasos

- [ ] Filtros y ordenamiento en páginas de categoría (por precio, nombre, disponibilidad)
- [ ] Resolver imágenes de Compragamer y Mexx
- [ ] Revisar por qué Maximus Gaming no actualiza precios en placas de video
- [ ] Agregar más productos al catálogo
- [ ] Sistema de alertas cuando los scrapers fallan
- [ ] Monetización: programa de afiliados o Google AdSense
- [ ] Dominio propio con renovación automática

---

*Última actualización: Marzo 2026*
