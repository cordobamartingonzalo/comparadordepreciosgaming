import "dotenv/config"

import { chromium, type Browser, type Page } from "playwright"
import { supabase } from "../lib/supabase"

// ─── Types ────────────────────────────────────────────────────────────────────

type RawProduct = {
  name: string
  url: string
  imageUrl?: string | null
}

type CategoryConfig = {
  url: string
  category: string
  storeId: string
}

// ─── Test mode ────────────────────────────────────────────────────────────────
// Ejecutar con: npx tsx scripts/catalog-scraper.ts --test
// Procesa los 2 primeros productos de cada tienda para validar imágenes.

const TEST_MODE = process.argv.includes("--test")

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = {
  found: 0,
  inserted: 0,
  skipped: 0,
  errors: 0,
  images_saved: 0,
}

// ─── Category URLs ────────────────────────────────────────────────────────────

const CATALOG_URLS: CategoryConfig[] = [
  // ── COMPRAGAMER ────────────────────────────────────────────────────────────
  { url: "https://compragamer.com/productos?cate=62", category: "tarjetas-de-video", storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=6",  category: "tarjetas-de-video", storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=27", category: "procesadores",      storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=48", category: "procesadores",      storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=81", category: "almacenamiento",    storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=15", category: "memorias-ram",      storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=26", category: "placas-madre",      storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=49", category: "placas-madre",      storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=5",  category: "monitores",         storeId: "compragamer" },
  { url: "https://compragamer.com/productos?cate=7",  category: "gabinetes",         storeId: "compragamer" },

  // ── MEXX ───────────────────────────────────────────────────────────────────
  { url: "https://www.mexx.com.ar/productos-rubro/placas-de-video/",         category: "tarjetas-de-video", storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/procesadores/?marca=18",   category: "procesadores",      storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/procesadores/?marca=14",   category: "procesadores",      storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/almacenamiento/",          category: "almacenamiento",    storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/memorias-ram/",            category: "memorias-ram",      storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/motherboards/",            category: "placas-madre",      storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/monitores/",               category: "monitores",         storeId: "mexx" },
  { url: "https://www.mexx.com.ar/productos-rubro/gabinetes/",               category: "gabinetes",         storeId: "mexx" },

  // ── FULLHARD ───────────────────────────────────────────────────────────────
  { url: "https://fullh4rd.com.ar/cat/115/radeon/1",         category: "tarjetas-de-video", storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/cat/124/nvidia/1",         category: "tarjetas-de-video", storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/tag/procesador_ryzen",     category: "procesadores",      storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/tag/procesador_intel",     category: "procesadores",      storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/cat/supra/12/almacenamiento/1", category: "almacenamiento", storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/tag/memoria%20ram",        category: "memorias-ram",      storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/cat/supra/2/motherboard/1",category: "placas-madre",      storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/cat/supra/18/monitores/1", category: "monitores",         storeId: "fullhard" },
  { url: "https://fullh4rd.com.ar/cat/supra/6/gabinetes/1",  category: "gabinetes",         storeId: "fullhard" },

  // ── MAXIMUS ────────────────────────────────────────────────────────────────
  { url: "https://www.maximus.com.ar/Productos/Placas-De-Video/Placas-de-Video-AMD/maximus.aspx?/CAT=48/SCAT=3826/M=-1/OR=1/PAGE=1/",   category: "tarjetas-de-video", storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Placas-De-Video/Placas-de-Video-Nvidia/maximus.aspx?/CAT=48/SCAT=3908/M=-1/OR=1/PAGE=1/",category: "tarjetas-de-video", storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Microprocesadores/maximus.aspx?/CAT=52/SCAT=-1/M=132/OR=1/PAGE=1/",                       category: "procesadores",      storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Microprocesadores/maximus.aspx?/CAT=52/SCAT=-1/M=133/OR=1/PAGE=1/",                       category: "procesadores",      storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Almacenamiento/maximus.aspx?/CAT=53/SCAT=-1/M=-1/OR=1/PAGE=1/",                           category: "almacenamiento",    storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Memorias/maximus.aspx?/CAT=50/SCAT=-1/M=-1/OR=1/PAGE=1/",                                 category: "memorias-ram",      storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Motherboards/maximus.aspx?/CAT=47/SCAT=-1/M=-1/OR=1/PAGE=1/",                             category: "placas-madre",      storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Monitores/maximus.aspx?/CAT=59/SCAT=-1/M=-1/OR=1/PAGE=1/",                                category: "monitores",         storeId: "maximusgaming" },
  { url: "https://www.maximus.com.ar/Productos/Gabinetes/maximus.aspx?/CAT=1/SCAT=-1/M=-1/OR=1/PAGE=1/",                                 category: "gabinetes",         storeId: "maximusgaming" },

  // ── VENEX ──────────────────────────────────────────────────────────────────
  { url: "https://www.venex.com.ar/componentes-de-pc/placas-de-video?vmm=12",          category: "tarjetas-de-video", storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/microprocesadores?vmm=14&man=3",  category: "procesadores",      storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/microprocesadores?vmm=14&man=35", category: "procesadores",      storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/discos-solidos-ssd",              category: "almacenamiento",    storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/memorias-ram/desktop",            category: "memorias-ram",      storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/motherboards/amd",                category: "placas-madre",      storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/motherboards/intel",              category: "placas-madre",      storeId: "venex" },
  { url: "https://www.venex.com.ar/monitores",                                          category: "monitores",         storeId: "venex" },
  { url: "https://www.venex.com.ar/componentes-de-pc/gabinetes",                       category: "gabinetes",         storeId: "venex" },
]

// ─── Name normalization ───────────────────────────────────────────────────────

const STORAGE_BRANDS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\bsamsung\b/i,                  name: "Samsung"       },
  { pattern: /\bkingston\b/i,                 name: "Kingston"      },
  { pattern: /\bWD\b|\bwestern\s+digital\b/i, name: "WD"            },
  { pattern: /\bseagate\b/i,                  name: "Seagate"       },
  { pattern: /\bcrucial\b/i,                  name: "Crucial"       },
  { pattern: /\bpatriot\b/i,                  name: "Patriot"       },
  { pattern: /\bPNY\b/i,                      name: "PNY"           },
  { pattern: /\bhiksemi\b/i,                  name: "Hiksemi"       },
  { pattern: /\bverbatim\b/i,                 name: "Verbatim"      },
  { pattern: /\bsilicon\s+power\b/i,          name: "Silicon Power" },
  { pattern: /\blexar\b/i,                    name: "Lexar"         },
  { pattern: /\badata\b/i,                    name: "Adata"         },
  { pattern: /\bXPG\b/i,                      name: "XPG"           },
  { pattern: /\bcorsair\b/i,                  name: "Corsair"       },
  { pattern: /\bteam\s*group\b/i,             name: "TeamGroup"     },
  { pattern: /\bgoodram\b/i,                  name: "Goodram"       },
]

const MONITOR_BRANDS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\bsamsung\b/i,   name: "Samsung"   },
  { pattern: /\bLG\b/i,        name: "LG"        },
  { pattern: /\bAOC\b/i,       name: "AOC"       },
  { pattern: /\bacer\b/i,      name: "Acer"      },
  { pattern: /\basus\b/i,      name: "Asus"      },
  { pattern: /\bviewsonic\b/i, name: "ViewSonic" },
  { pattern: /\bMSI\b/i,       name: "MSI"       },
  { pattern: /\bgigabyte\b/i,  name: "Gigabyte"  },
  { pattern: /\bbenq\b/i,      name: "BenQ"      },
  { pattern: /\bphilips\b/i,   name: "Philips"   },
  { pattern: /\bdell\b/i,      name: "Dell"      },
  { pattern: /\bHP\b/i,        name: "HP"        },
]

/**
 * Normaliza el nombre del producto a un modelo genérico legible.
 * Retorna null si no se puede extraer un modelo identificable.
 */
function normalizeName(raw: string, category: string): string | null {
  const s = raw.trim()

  switch (category) {
    case "tarjetas-de-video": {
      // NVIDIA RTX: RTX 5090, RTX 4080 Super, RTX 3080 Ti
      const rtx = s.match(/\b(RTX\s*\d{3,4}(?:\s*(?:Ti|Super))?)\b/i)
      if (rtx) return rtx[1].replace(/\s+/g, " ").trim().toUpperCase()

      // AMD RX: RX 7900 XTX, RX 7600, RX 6800 XT, RX 9070 XT
      const rx = s.match(/\b(RX\s*\d{3,4}(?:\s*(?:XT|XTX|GRE))?)\b/i)
      if (rx) return rx[1].replace(/\s+/g, " ").trim().toUpperCase()

      // Intel Arc: A770, A380
      const arc = s.match(/\b(Arc\s*A\d{3})\b/i)
      if (arc) return arc[1].replace(/\s+/g, " ").trim()

      return null
    }

    case "procesadores": {
      // AMD Ryzen: Ryzen 5 5600, Ryzen 9 7950X3D
      const ryzen = s.match(/\b(Ryzen\s*[3579]\s*\d{4}(?:[A-Z]{0,3})?(?:\s*3D)?)\b/i)
      if (ryzen) return ryzen[1].replace(/\s+/g, " ").trim()

      // Intel Core Ultra: Core Ultra 9 285K
      const coreUltra = s.match(/\b(Core\s+Ultra\s*[579]\s*\d{3,4}[A-Z]*)\b/i)
      if (coreUltra) return coreUltra[1].replace(/\s+/g, " ").trim()

      // Intel Core: Core i9-14900K, Core i5 12400F
      const core = s.match(/\b(Core\s+i[3579][-\s]?\d{4,5}[A-Z]*)\b/i)
      if (core) return core[1].replace(/[-\s]+/g, " ").trim()

      return null
    }

    case "memorias-ram": {
      // Kit: "2x16GB", "2 x 16GB"
      const kitMatch   = s.match(/\b(\d)\s*[xX×]\s*(\d+)\s*GB\b/i)
      const singleCap  = s.match(/\b(\d+)\s*GB\b/i)
      const ddrType    = s.match(/\b(DDR[45])\b/i)
      if (!ddrType) return null

      // Speed: "DDR5-6000" / "DDR4 3200" inline, or standalone "3200MHz"
      const speedInline = s.match(/\bDDR[45][-\s](\d{3,5})\b/i)
      const speedMHz    = s.match(/\b(\d{3,5})\s*MHz\b/i)
      const speed = speedInline ? speedInline[1] : (speedMHz ? speedMHz[1] : null)

      let capStr: string
      if (kitMatch) {
        capStr = `${kitMatch[1]}x${kitMatch[2]}GB`
      } else if (singleCap) {
        capStr = `${singleCap[1]}GB`
      } else {
        return null
      }

      const ddr = ddrType[1].toUpperCase()
      return speed ? `${capStr} ${ddr} ${speed}` : `${capStr} ${ddr}`
    }

    case "almacenamiento": {
      const cap = s.match(/\b(\d+)\s*(TB|GB)\b/i)
      if (!cap) return null
      const size = `${cap[1]}${cap[2].toUpperCase()}`

      let type: string
      if (/hdd|disco\s+r[ií]gido/i.test(s))  type = "HDD"
      else if (/nvme|m\.2|pcie/i.test(s))     type = "NVMe"
      else if (/sata/i.test(s))               type = "SATA"
      else                                     type = ""

      // Buscar marca conocida
      let foundBrand: string | null = null
      let brandEndIdx = 0
      for (const { pattern, name } of STORAGE_BRANDS) {
        const m = s.match(pattern)
        if (m) { foundBrand = name; brandEndIdx = (m.index ?? 0) + m[0].length; break }
      }

      if (!foundBrand) {
        // Sin marca conocida: formato compacto actual
        return type ? `${type} ${size}` : size
      }

      // Extraer modelo: texto tras la marca, hasta la capacidad, limpiando stop words
      const afterBrand = s.substring(brandEndIdx).trimStart()
      const model = afterBrand
        .replace(/\b\d+\s*(TB|GB)\b.*$/i, "")
        .replace(/\b(ssd|nvme|m\.2|sata|hdd|pcie|internal|desktop|laptop|disco|s[oó]lido|unidad|drive|disk)\b/gi, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .split(/\s+/).filter(Boolean).slice(0, 3).join(" ")

      const parts: string[] = [foundBrand]
      if (model) parts.push(model)
      parts.push(size)
      if (type) parts.push(type)
      return parts.join(" ")
    }

    case "placas-madre": {
      // Chipsets: B760-F, B760M, X670E, B650M, Z790, H610M, etc.
      // Captura letra + 2-3 dígitos + sufijo de form factor (M, E…) + sufijo dash opcional (-F, -I…)
      const chipset = s.match(/\b([ABXHZ]\d{2,3}[A-Z]?(?:-[A-Z])?)\b/i)
      if (!chipset) return null

      let result = chipset[1].toUpperCase()

      // Incluir "Pro" si aparece inmediatamente después (ej: "B650M Pro RS WiFi" → "B650M Pro")
      const afterChipset = s.substring((chipset.index ?? 0) + chipset[1].length).trimStart()
      if (/^Pro\b/i.test(afterChipset)) result += " Pro"

      return result
    }

    case "monitores": {
      // Tamaño: busca número de 2 dígitos en rango 17-49 (con o sin decimal)
      const sizeMatch = s.match(/\b(1[7-9]|[23]\d|4[0-9])(?:\.\d)?\b/)
      if (!sizeMatch) return null

      const resMatch = s.match(/\b(4K|QHD|2K|FHD|UHD|WQHD|WFHD)\b/i)
      const hzMatch  = s.match(/\b(\d{2,3})\s*Hz\b/i)
      const res = resMatch ? ` ${resMatch[1].toUpperCase()}` : ""
      const hz  = hzMatch  ? ` ${hzMatch[1]}Hz`             : ""

      const brandEntry = MONITOR_BRANDS.find(({ pattern }) => pattern.test(s))
      const prefix = brandEntry ? brandEntry.name : "Monitor"

      return `${prefix} ${sizeMatch[1]}"${res}${hz}`
    }

    case "gabinetes": {
      // Para gabinetes extraemos el modelo limpiando marcas conocidas
      const cleaned = s
        .replace(/\b(corsair|thermaltake|nzxt|cooler\s*master|deepcool|fractal|lian\s*li|phanteks|be\s*quiet|aerocool|antec|sentey|gamemax|fortrek|redragon|cougar|metallic\s*gear)\b/gi, " ")
        .replace(/\b(gabinete|case|chasis|tower|midi|mid|full|mini|placa\s+madre|placa\s+video)\b/gi, " ")
        .replace(/\b(negro|blanco|black|white|rgb|argb|led|vidrio|glass|templado)\b/gi, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
      return cleaned.length > 2 ? cleaned : null
    }

    default:
      return null
  }
}

// ─── ID generation ────────────────────────────────────────────────────────────

const CATEGORY_PREFIX: Record<string, string> = {
  "tarjetas-de-video": "gpu",
  procesadores: "cpu",
  "memorias-ram": "ram",
  almacenamiento: "ssd",
  "placas-madre": "mb",
  monitores: "monitor",
  gabinetes: "case",
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function generateId(normalizedName: string, category: string): string {
  const prefix = CATEGORY_PREFIX[category] ?? "prod"
  return `${prefix}-${toSlug(normalizedName)}`
}

// ─── Per-store scrapers ───────────────────────────────────────────────────────

/**
 * COMPRAGAMER
 * Usa Web Components <cgw-product-card>. El nombre está en el atributo
 * "name" del elemento o en un hijo h2/h3. La imagen se extrae de los
 * atributos del web component o del img hijo.
 */
async function scrapeCompragamer(page: Page, config: CategoryConfig): Promise<RawProduct[]> {
  await page.goto(config.url, { waitUntil: "domcontentloaded", timeout: 90_000 })
  await page.waitForSelector("cgw-product-card", { timeout: 15_000 }).catch(() => {
    console.warn("  [warn] No se encontraron cgw-product-card")
  })

  const base = "https://compragamer.com"
  const products = await page.evaluate((baseUrl: string) => {
    return Array.from(document.querySelectorAll("cgw-product-card")).map((card) => {
      const name =
        card.getAttribute("name") ??
        card.querySelector("[class*='name'],[class*='title'],h2,h3")?.textContent ??
        ""
      const anchor = card.querySelector("a[href]") ?? card.closest("a[href]")
      // Intentar atributos directos del web component, luego img hijo
      const rawImg =
        card.getAttribute("image") ??
        card.getAttribute("img") ??
        card.getAttribute("thumbnail") ??
        card.getAttribute("photo") ??
        card.querySelector("img")?.getAttribute("src") ??
        card.querySelector("img")?.getAttribute("data-src") ??
        ""
      let imgSrc = ""
      if (rawImg) { try { imgSrc = new URL(rawImg, baseUrl).href } catch {} }
      return { name: name.trim(), href: anchor?.getAttribute("href") ?? "", imgSrc }
    })
  }, base)

  return products
    .filter((p) => p.name.length > 0 && p.href.length > 0)
    .map((p) => ({
      name: p.name,
      url: p.href.startsWith("http") ? p.href : `${base}${p.href}`,
      imageUrl: p.imgSrc || null,
    }))
}

/**
 * MEXX
 * Server-side rendered. Cada producto está en div.productos con un <a href="*.html">.
 * El texto del link es el nombre del producto. La imagen se extrae del img
 * dentro del mismo contenedor de cada card.
 */
async function scrapeMexx(page: Page, config: CategoryConfig): Promise<RawProduct[]> {
  await page.goto(config.url, { waitUntil: "networkidle", timeout: 90_000 })

  const products = await page.evaluate(() => {
    const origin = window.location.origin
    const seen = new Set<string>()
    const results: { name: string; href: string; imgSrc: string }[] = []

    const anchors = Array.from(
      document.querySelectorAll("a[href*='/productos-rubro/'][href$='.html']")
    ) as HTMLAnchorElement[]

    for (const a of anchors) {
      const href = a.href
      if (seen.has(href)) continue
      const name = a.textContent?.trim().replace(/\s+/g, " ") ?? ""
      if (name.length > 4) {
        seen.add(href)
        const card = a.closest("div, li, article, section")
        const img = card?.querySelector("img")
        const rawSrc = img?.getAttribute("src") || img?.getAttribute("data-src") || ""
        let imgSrc = ""
        if (rawSrc) { try { imgSrc = new URL(rawSrc, origin).href } catch {} }
        results.push({ name, href, imgSrc })
      }
    }
    return results
  })

  return products.map((p) => ({ name: p.name, url: p.href, imageUrl: p.imgSrc || null }))
}

/**
 * FULLHARD
 * Server-side rendered. Links de productos en a[href*='/prod/'].
 * El texto del link incluye el nombre + precio; se limpia eliminando el precio.
 * La imagen se extrae del img dentro del mismo contenedor de cada card.
 */
async function scrapeFullhard(page: Page, config: CategoryConfig): Promise<RawProduct[]> {
  await page.goto(config.url, { waitUntil: "networkidle", timeout: 90_000 })

  const products = await page.evaluate(() => {
    const origin = window.location.origin
    const seen = new Set<string>()
    const results: { name: string; href: string; imgSrc: string }[] = []

    const anchors = Array.from(
      document.querySelectorAll("a[href*='/prod/']")
    ) as HTMLAnchorElement[]

    for (const a of anchors) {
      const href = a.href
      if (seen.has(href)) continue
      seen.add(href)

      // El texto incluye el precio: "NOMBRE $XXX.XXX $YYY.YYY Comparar"
      // Cortamos en el primer signo de peso seguido de dígitos
      const rawText = a.textContent?.trim().replace(/\s+/g, " ") ?? ""
      const name = rawText.replace(/\s*\$\s*[\d.,]+.*$/, "").trim()

      if (name.length > 4) {
        const card = a.closest("div, li, article")
        const img = card?.querySelector("img")
        const rawSrc = img?.getAttribute("src") || img?.getAttribute("data-src") || ""
        let imgSrc = ""
        if (rawSrc) { try { imgSrc = new URL(rawSrc, origin).href } catch {} }
        results.push({ name, href, imgSrc })
      }
    }
    return results
  })

  return products.map((p) => ({ name: p.name, url: p.href, imageUrl: p.imgSrc || null }))
}

/**
 * MAXIMUS GAMING
 * Renderiza la grilla via JS. Links de productos en a[href*='/Producto/'][href*='ITEM='].
 * El nombre del producto está codificado en el slug de la URL (entre /Producto/ e /ITEM=).
 * El texto del link es solo "VER MAS", por eso se extrae del slug.
 * La imagen se extrae del img dentro del mismo contenedor de cada card.
 *
 * URL ejemplo: /Producto/Placa-de-Video-Gigabyte-Rx-7600-GAMING-OC-8GB-GDDR6/ITEM=13714/maximus.aspx
 */
async function scrapeMaximus(page: Page, config: CategoryConfig): Promise<RawProduct[]> {
  await page.goto(config.url, { waitUntil: "networkidle", timeout: 90_000 })
  // Esperar que la grilla de productos cargue
  await page.waitForTimeout(2000)

  const products = await page.evaluate(() => {
    const origin = window.location.origin
    const seen = new Set<string>()
    const results: { name: string; href: string; imgSrc: string }[] = []

    const anchors = Array.from(
      document.querySelectorAll("a[href*='/Producto/'][href*='ITEM=']")
    ) as HTMLAnchorElement[]

    for (const a of anchors) {
      const href = a.href
      if (seen.has(href)) continue
      seen.add(href)

      // Extraer nombre del slug: /Producto/NAME-SLUG/ITEM=...
      const match = href.match(/\/Producto\/([^/]+)\/ITEM=/)
      if (!match) continue

      const name = match[1].replace(/-/g, " ").trim()
      if (name.length > 4) {
        const card = a.closest("div, li, article, td")
        const img = card?.querySelector("img[src]")
        const rawSrc = img?.getAttribute("src") || img?.getAttribute("data-src") || ""
        let imgSrc = ""
        if (rawSrc) { try { imgSrc = new URL(rawSrc, origin).href } catch {} }
        results.push({ name, href, imgSrc })
      }
    }
    return results
  })

  return products.map((p) => ({ name: p.name, url: p.href, imageUrl: p.imgSrc || null }))
}

/**
 * VENEX
 * Server-side rendered. Productos en h3.product-box-title > a.
 * El texto del link es el nombre completo del producto.
 */
async function scrapeVenex(page: Page, config: CategoryConfig): Promise<RawProduct[]> {
  await page.goto(config.url, { waitUntil: "networkidle", timeout: 90_000 })

  const products = await page.evaluate(() => {
    const anchors = Array.from(
      document.querySelectorAll("h3.product-box-title a[href]")
    ) as HTMLAnchorElement[]

    return anchors.map((a) => ({
      name: a.textContent?.trim().replace(/\s+/g, " ") ?? "",
      href: a.href,
    })).filter((p) => p.name.length > 4)
  })

  return products.map((p) => ({ name: p.name, url: p.href }))
}

// ─── Store dispatcher ─────────────────────────────────────────────────────────

async function scrapeCategory(browser: Browser, config: CategoryConfig): Promise<RawProduct[]> {
  // Bloquear solo imágenes y media; mantener scripts y CSS
  // (Mexx y Maximus necesitan JS para renderizar)
  async function doScrape(): Promise<RawProduct[]> {
    const page = await browser.newPage()
    await page.route("**/*", (route) => {
      const type = route.request().resourceType()
      if (["image", "media"].includes(type)) {
        route.abort()
      } else {
        route.continue()
      }
    })
    try {
      switch (config.storeId) {
        case "compragamer":    return await scrapeCompragamer(page, config)
        case "mexx":           return await scrapeMexx(page, config)
        case "fullhard":       return await scrapeFullhard(page, config)
        case "maximusgaming":  return await scrapeMaximus(page, config)
        case "venex":          return await scrapeVenex(page, config)
        default:
          console.warn(`  [warn] Sin scraper para store_id="${config.storeId}"`)
          return []
      }
    } finally {
      await page.close()
    }
  }

  try {
    return await doScrape()
  } catch (firstErr) {
    console.warn(`  [retry] Primer intento fallido: ${(firstErr as Error).message.substring(0, 80)}`)
    console.warn(`  [retry] Esperando 5s antes de reintentar...`)
    await new Promise((r) => setTimeout(r, 5_000))
    return await doScrape()
  }
}

// ─── Image extraction ─────────────────────────────────────────────────────────

/**
 * Visita la página del producto y extrae la URL de imagen desde los meta tags
 * og:image o twitter:image. Es más rápido y confiable que buscar elementos img.
 * Retorna null si ningún meta tag está presente o si hay timeout.
 */
async function fetchProductImage(
  browser: Browser,
  storeId: string,
  productUrl: string
): Promise<string | null> {
  const page = await browser.newPage()

  // Bloquear recursos pesados: sólo necesitamos el HTML para leer meta tags
  await page.route("**/*", (route) => {
    const type = route.request().resourceType()
    if (["image", "media", "font", "stylesheet"].includes(type)) {
      route.abort()
    } else {
      route.continue()
    }
  })

  try {
    await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 15_000 })

    const imageUrl = await page.evaluate(() => {
      // 1. og:image
      const ogImage = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content")
      if (ogImage) return ogImage

      // 2. twitter:image (acepta tanto name= como property=)
      const twitterImage =
        document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ??
        document.querySelector('meta[property="twitter:image"]')?.getAttribute("content")
      if (twitterImage) return twitterImage

      return null
    })

    if (!imageUrl) return null

    // Compragamer usa una imagen genérica del sitio como og:image — descartarla
    if (storeId === "compragamer" && /meta_banner|assets\/img/i.test(imageUrl)) {
      return null
    }

    try {
      return new URL(imageUrl, productUrl).href
    } catch {
      return null
    }
  } catch {
    // Timeout u otro error: retornar null sin marcar error
    return null
  } finally {
    await page.close()
  }
}

// ─── DB upsert (safe: nunca modifica ni borra) ────────────────────────────────

/**
 * Inserta el producto si no existe.
 * Retorna:
 *   - "inserted"     → producto nuevo (siempre necesita imagen)
 *   - "existing"     → ya existía y ya tiene image_url (no tocar)
 *   - "needs_image"  → ya existía pero image_url está vacío
 */
async function upsertProduct(product: {
  id: string
  name: string
  category: string
}): Promise<"inserted" | "existing" | "needs_image"> {
  const { data: existing } = await supabase
    .from("products")
    .select("id, image_url")
    .eq("id", product.id)
    .maybeSingle()

  if (existing) {
    return existing.image_url ? "existing" : "needs_image"
  }

  const { error } = await supabase.from("products").insert(product)
  if (error) throw new Error(`products insert: ${error.message}`)
  return "inserted"
}

/** Actualiza image_url de un producto existente. */
async function updateProductImageUrl(productId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ image_url: imageUrl })
    .eq("id", productId)
  if (error) throw new Error(`products update image_url: ${error.message}`)
}

async function upsertStoreListing(listing: {
  product_id: string
  store_id: string
  url: string
}): Promise<"inserted" | "existing"> {
  const { data: existing } = await supabase
    .from("store_listings")
    .select("id")
    .eq("product_id", listing.product_id)
    .eq("store_id", listing.store_id)
    .maybeSingle()

  if (existing) return "existing"

  const { error } = await supabase.from("store_listings").insert(listing)
  if (error) throw new Error(`store_listings insert: ${error.message}`)
  return "inserted"
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function processCategory(browser: Browser, config: CategoryConfig): Promise<void> {
  console.log(`\n► [${config.storeId}] ${config.category}`)
  console.log(`  URL: ${config.url}`)

  let rawProducts: RawProduct[]
  try {
    rawProducts = await scrapeCategory(browser, config)
  } catch (err) {
    console.error(`  [error] Scrape falló: ${(err as Error).message}`)
    stats.errors++
    return
  }

  // En modo test, limitar a los primeros 2 productos
  const toProcess = TEST_MODE ? rawProducts.slice(0, 2) : rawProducts

  console.log(`  Encontrados: ${rawProducts.length} productos${TEST_MODE ? ` (procesando ${toProcess.length} en modo test)` : ""}`)
  stats.found += toProcess.length

  for (const raw of toProcess) {
    const normalizedName = normalizeName(raw.name, config.category)

    if (!normalizedName) {
      console.log(`  [skip] Sin modelo válido: "${raw.name.substring(0, 60)}"`)
      stats.skipped++
      continue
    }

    const productId = generateId(normalizedName, config.category)

    try {
      const productStatus = await upsertProduct({
        id: productId,
        name: normalizedName,
        category: config.category,
      })

      const listingStatus = await upsertStoreListing({
        product_id: productId,
        store_id: config.storeId,
        url: raw.url,
      })

      if (productStatus === "inserted" || listingStatus === "inserted") {
        stats.inserted++
        console.log(
          `  [+] ${normalizedName} (${productId}) — product:${productStatus} listing:${listingStatus}`
        )
      } else if (productStatus !== "needs_image") {
        stats.skipped++
        if (!TEST_MODE) console.log(`  [=] Ya existe: ${normalizedName} (${productId})`)
      }

      // Imagen: desde el listado (ya en raw.imageUrl) para todas las tiendas excepto Venex.
      // Venex no tiene imagen en el listado → se obtiene via og:image de la página de producto.
      const needsImage = TEST_MODE || productStatus === "inserted" || productStatus === "needs_image"
      if (needsImage) {
        const imageUrl = config.storeId === "venex"
          ? await fetchProductImage(browser, config.storeId, raw.url)
          : raw.imageUrl ?? null

        if (TEST_MODE) {
          const display = imageUrl ?? "sin imagen"
          console.log(`  [test] tienda=${config.storeId} | producto="${normalizedName}" | imagen=${display}`)
        }
        if (imageUrl && (productStatus === "inserted" || productStatus === "needs_image")) {
          await updateProductImageUrl(productId, imageUrl)
          stats.images_saved++
          if (!TEST_MODE) {
            const truncated = imageUrl.length > 70 ? imageUrl.substring(0, 67) + "..." : imageUrl
            console.log(`  [img] ${normalizedName}: ${truncated}`)
          }
        } else if (!imageUrl && !TEST_MODE) {
          console.log(`  [img] Sin imagen: ${normalizedName}`)
        }
      }
    } catch (err) {
      console.error(`  [error] DB fallo "${normalizedName}": ${(err as Error).message}`)
      stats.errors++
    }
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════")
  console.log("  Catalog Scraper — Comparador Gaming Argentina")
  if (TEST_MODE) {
    console.log("  MODO TEST: 2 productos por tienda (todas las tiendas)")
  }
  console.log("═══════════════════════════════════════════════════════════")

  // En modo test: una URL por tienda (la primera de cada storeId)
  const configs = TEST_MODE
    ? (() => {
        const seen = new Set<string>()
        return CATALOG_URLS.filter((c) => !seen.has(c.storeId) && !!seen.add(c.storeId))
      })()
    : CATALOG_URLS

  console.log(`  Categorías a procesar: ${configs.length}`)

  const browser = await chromium.launch({ headless: true })

  try {
    for (const config of configs) {
      try {
        await processCategory(browser, config)
      } catch (err) {
        console.error(`[error] Inesperado en ${config.storeId}/${config.category}:`, err)
        stats.errors++
      }
    }
  } finally {
    await browser.close()
  }

  console.log("\n═══════════════════════════════════════════════════════════")
  console.log("  RESUMEN FINAL")
  console.log("═══════════════════════════════════════════════════════════")
  console.log(`  Productos encontrados en páginas : ${stats.found}`)
  console.log(`  Productos/listings insertados    : ${stats.inserted}`)
  console.log(`  Ya existían / sin modelo válido  : ${stats.skipped}`)
  console.log(`  Imágenes guardadas               : ${stats.images_saved}`)
  console.log(`  Errores                          : ${stats.errors}`)
  console.log("═══════════════════════════════════════════════════════════")
}

main()
  .then(() => console.log("\nCatalog scraper finalizado."))
  .catch((err) => {
    console.error("Error inesperado:", err)
    process.exit(1)
  })
