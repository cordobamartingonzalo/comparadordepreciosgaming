import "dotenv/config"

import { chromium, type Browser, type Page } from "playwright"
import { supabase } from "../lib/supabase"

type StoreListingRow = {
  id: string
  url: string
  store_id: string
  product_id: string
}

type StoreConfig = {
  /**
   * Lista de selectores en orden de prioridad. El scraper va probando
   * hasta encontrar el primer texto que se pueda parsear a precio.
   *
   * Prioridad recomendada: data-* > id > itemprop/meta > clase > texto.
   */
  priceSelectors: string[]
  /**
   * Selectores que permiten inferir stock. Si alguno matchea y el texto
   * contiene términos de falta de stock, in_stock=false.
   */
  inStockSelectors?: string[]
}

/**
 * IMPORTANTE: las keys deben coincidir EXACTAMENTE con stores.id / store_listings.store_id
 *
 * Stores verificadas con dump DOM real (2026-03-17):
 * - compragamer  → Angular SPA, sin selectores de stock visibles; fallback conservador
 * - mexx         → [itemprop="availability"] content="InStock"/"OutOfStock" ✓
 * - fullhard     → .stock-container con texto "Stock alto…" ✓
 * - maximusgaming → .notify-stock aparece SOLO cuando SIN STOCK ✓
 */
const STORE_CONFIGS: Record<string, StoreConfig> = {
  compragamer: {
    priceSelectors: [
      "cgw-price span.price",
      'span[class*="tw:text-price"]:last-child',
      "text=/\\$\\s*[0-9]/",
    ],
    // Angular SPA: no hay selector de disponibilidad en el DOM renderizado.
    // Solo se usan señales negativas; si ninguna matchea → fallback en stock.
    inStockSelectors: [
      "[class*='sin-stock']",
      "[class*='no-disponible']",
      ".product-availability",
    ],
  },
  mexx: {
    priceSelectors: [
      "h2.main-price > b:not([class])",
      "h2.main-price b",
      "text=/\\$\\s*[0-9]/",
    ],
    // VERIFICADO: <link itemprop="availability" content="InStock"> presente en el DOM
    // extractStock() lee el atributo content y detecta "InStock"/"OutOfStock"
    inStockSelectors: [
      '[itemprop="availability"]',
      "[class*='agotado']",
      "[class*='sin-stock']",
    ],
  },
  fullhard: {
    priceSelectors: [
      'meta[itemprop="price"]',
      '[itemprop="price"]',
      "div.price-list-container span.bold",
      "span.bold",
      "text=/\\$\\s*[0-9]/",
    ],
    // VERIFICADO: .stock-container contiene "Stock alto en la web" / "Stock alto en el local"
    // Cuando sin stock, el texto cambia a "sin stock" / "agotado" y el patrón lo detecta
    inStockSelectors: [
      ".stock-container",
      "[class*='sin-stock']",
      "[class*='agotado']",
    ],
  },
  maximusgaming: {
    priceSelectors: [
      "#final-price",
      "[data-bonification]",
      ".value-item--full-price",
      "text=/\\$\\s*[0-9]/",
    ],
    // ADVERTENCIA: [itemprop="availability"] en maximus.com.ar es INCORRECTO —
    // muestra href="InStock" incluso cuando el producto no tiene stock.
    // VERIFICADO: .notify-stock aparece ÚNICAMENTE cuando el producto está SIN STOCK.
    // Su texto: "Este producto no se encuentra disponible en este momento."
    // → outOfStockPattern incluye "no\s+se\s+encuentra" para capturar este caso.
    inStockSelectors: [
      ".notify-stock",
      "[class*='agotado']",
    ],
  },
}

function parsePrice(raw: string | null): number | null {
  if (!raw) return null

  let cleaned = raw.replace(/\s+/g, "").replace(/[^\d.,]/g, "")
  if (!cleaned) return null

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")
  const dotCount = (cleaned.match(/\./g) ?? []).length
  const commaCount = (cleaned.match(/,/g) ?? []).length

  if (hasComma && hasDot) {
    // Formato AR clásico: 12.345,67 o 1.234,5 — coma=decimal, punto=miles
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  } else if (hasComma && !hasDot) {
    if (commaCount === 1) {
      const afterComma = cleaned.split(",")[1] ?? ""
      if (afterComma.length === 3) {
        // Separador de miles tipo europeo: 1,234 → 1234
        cleaned = cleaned.replace(",", "")
      } else {
        // Decimal: 1234,56 o 1234,5
        cleaned = cleaned.replace(",", ".")
      }
    } else {
      // Múltiples comas: separadores de miles → eliminar todas
      cleaned = cleaned.replace(/,/g, "")
    }
  } else if (hasDot && !hasComma) {
    if (dotCount > 1) {
      // Múltiples puntos = todos son separadores de miles: 1.234.567 → 1234567
      cleaned = cleaned.replace(/\./g, "")
    } else {
      const afterDot = cleaned.split(".")[1] ?? ""
      if (afterDot.length === 3) {
        // Exactamente 3 dígitos post-punto = separador de miles: 409.750 → 409750
        cleaned = cleaned.replace(".", "")
      }
      // 1 o 2 dígitos post-punto = decimal real: 1234.56 → dejar como está
    }
  }

  const num = Number.parseFloat(cleaned)

  // Sanity check: en Argentina los precios de hardware son > $1000 ARS
  if (!Number.isFinite(num) || num < 1000) return null

  return Math.round(num)
}

async function fetchStoreListings(): Promise<StoreListingRow[]> {
  const { data, error } = await supabase
    .from("store_listings")
    .select("id,url,store_id,product_id")

  if (error) throw error
  return (data ?? []) as StoreListingRow[]
}

async function insertPriceSnapshot(input: {
  listing_id: string
  price_ars: number
  in_stock: boolean
}) {
  const { error } = await supabase.from("price_snapshots").insert(input)
  if (error) throw error
}

async function extractFirstParsablePrice(
  page: Page,
  selectors: string[]
): Promise<{ price: number; matchedSelector: string } | null> {
  for (const selector of selectors) {
    const loc = page.locator(selector)
    const count = await loc.count()
    for (let i = 0; i < count; i++) {
      const txt = await loc.nth(i).textContent()
      const parsed = parsePrice(txt)
      if (parsed != null) return { price: parsed, matchedSelector: selector }
    }
  }
  return null
}

async function extractStock(
  page: Page,
  selectors: string[] | undefined
): Promise<{ inStock: boolean; evidence?: string }> {
  if (!selectors || selectors.length === 0) return { inStock: true }

  const outOfStockPattern =
    /agotado|sin\s*stock|no\s*disponible|articulo\s*sin\s*stock|out\s*of\s*stock|sold\s*out|no\s*hay\s*stock|producto\s*no\s*disponible|no\s+se\s+encuentra/

  for (const selector of selectors) {
    const loc = page.locator(selector)
    if ((await loc.count()) === 0) continue

    const el = loc.first()

    // Caso especial: itemprop="availability" usa el atributo content
    // Ej: <link itemprop="availability" content="OutOfStock"/>
    const contentAttr = await el.getAttribute("content").catch(() => null)
    if (contentAttr) {
      const normalized = contentAttr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      if (
        normalized.includes("outofstock") ||
        normalized.includes("out_of_stock") ||
        outOfStockPattern.test(normalized)
      ) {
        return { inStock: false, evidence: `${selector}[content="${contentAttr}"]` }
      }
      return { inStock: true, evidence: `${selector}[content="${contentAttr}"]` }
    }

    // Caso general: texto visible del elemento
    const txt = (await el.textContent().catch(() => "")) ?? ""
    const normalized = txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    if (outOfStockPattern.test(normalized)) {
      return { inStock: false, evidence: `${selector} → "${txt.trim()}"` }
    }

    // El selector matcheó y el texto no indica sin-stock → en stock
    return { inStock: true, evidence: `${selector} → "${txt.trim()}"` }
  }

  // Ningún selector matcheó → fallback conservador (asumimos en stock)
  return { inStock: true, evidence: "no selector matched" }
}

async function scrapeOneListing(browser: Browser, listing: StoreListingRow) {
  const { id, url, store_id, product_id } = listing

  console.log(
    `Procesando listing ${id} | product_id=${product_id} | store_id=${store_id}`
  )

  const config = STORE_CONFIGS[store_id]
  if (!config) {
    console.warn(`No hay STORE_CONFIGS para store_id="${store_id}". Se omite.`)
    return
  }

  const page = await browser.newPage()
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 })

    // Página no disponible (404, 410, 5xx, etc.) → sin stock
    if (!response || response.status() >= 400) {
      await insertPriceSnapshot({ listing_id: id, price_ars: 0, in_stock: false })
      console.log(
        `⚠ listing ${id} | store=${store_id} | ` +
        `HTTP ${response?.status() ?? "sin respuesta"} → marcado como SIN STOCK`
      )
      return
    }

    const priceHit = await extractFirstParsablePrice(page, config.priceSelectors)
    if (!priceHit) {
      // Sin precio = sin stock: tiendas ocultan el precio cuando el producto está agotado
      await insertPriceSnapshot({ listing_id: id, price_ars: 0, in_stock: false })
      console.log(
        `⚠ listing ${id} | store=${store_id} | SIN PRECIO → marcado como SIN STOCK`
      )
      return
    }

    const stockResult = await extractStock(page, config.inStockSelectors)

    await insertPriceSnapshot({
      listing_id: id,
      price_ars: Math.round(priceHit.price),
      in_stock: stockResult.inStock,
    })

    console.log(
      `✓ listing ${id} | store=${store_id} | ` +
      `precio=${Math.round(priceHit.price).toLocaleString("es-AR")} | ` +
      `stock=${stockResult.inStock ? "EN STOCK" : "SIN STOCK"} | ` +
      `evidencia=${stockResult.evidence ?? "N/A"} | ` +
      `selector_precio=${priceHit.matchedSelector}`
    )
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.message.includes("timeout") || err.message.includes("Timeout"))

    if (isTimeout) {
      try {
        await insertPriceSnapshot({ listing_id: id, price_ars: 0, in_stock: false })
        console.log(
          `⚠ listing ${id} | store=${store_id} | TIMEOUT → marcado como SIN STOCK`
        )
      } catch (insertErr) {
        console.error(`Error insertando sin-stock por timeout en listing ${id}:`, insertErr)
      }
    } else {
      console.error(
        `Error en listing ${id} (product_id=${product_id}, store_id=${store_id}):`,
        err
      )
    }
  } finally {
    await page.close()
  }
}

async function main() {
  console.log("Iniciando scraper de precios gaming...")

  const listings = await fetchStoreListings()
  if (listings.length === 0) {
    console.log("No hay listings en store_listings para procesar.")
    return
  }

  const browser = await chromium.launch({ headless: true })
  try {
    for (const listing of listings) {
      // Los errores esperados (timeout, HTTP error, sin precio) ya se manejan
      // dentro de scrapeOneListing(). Este catch solo captura fallos inesperados.
      await scrapeOneListing(browser, listing).catch((err) => {
        console.error(
          `Error inesperado en listing ${listing.id} (store_id=${listing.store_id}):`,
          err
        )
      })
    }
  } finally {
    console.log("Cerrando navegador de Playwright...")
    await browser.close()
  }
}

main()
  .then(() => console.log("Scraper finalizado."))
  .catch((err) => {
    console.error("Error inesperado en el scraper:", err)
    process.exit(1)
  })
