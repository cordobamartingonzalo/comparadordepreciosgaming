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
 * Según tu Supabase hoy son:
 * - compragamer
 * - mexx
 * - fullhard
 * - maximusgaming
 */
const STORE_CONFIGS: Record<string, StoreConfig> = {
  compragamer: {
    priceSelectors: [
      "cgw-price span.price",
      'span[class*="tw:text-price"]:last-child',
      "text=/\\$\\s*[0-9]/",
    ],
  },
  mexx: {
    priceSelectors: [
      "h2.main-price > b:not([class])",
      "h2.main-price b",
      "text=/\\$\\s*[0-9]/",
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
  },
  maximusgaming: {
    priceSelectors: [
      "#final-price",
      "[data-bonification]",
      ".value-item--full-price",
      "text=/\\$\\s*[0-9]/",
    ],
  },
}

function parsePrice(raw: string | null): number | null {
  if (!raw) return null

  // Normaliza espacios y elimina todo lo que no sea dígito, punto o coma
  let cleaned = raw.replace(/\s+/g, "").replace(/[^\d.,]/g, "")
  if (!cleaned) return null

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")

  // Caso AR típico: 12.345,67  /  409.750  /  589.747,94
  if (hasComma) {
    // Coma = decimal, puntos = miles
    cleaned = cleaned.replace(/\./g, "")
    cleaned = cleaned.replace(",", ".")
  } else if (hasDot) {
    // Solo puntos: puede ser decimal real (1234.56) o miles (409.750)
    const matchDecimal = cleaned.match(/\.(\d{1,2})$/)
    if (!matchDecimal) cleaned = cleaned.replace(/\./g, "")
  }

  const num = Number.parseFloat(cleaned)
  return Number.isFinite(num) ? num : null
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

  for (const selector of selectors) {
    const loc = page.locator(selector)
    if ((await loc.count()) === 0) continue

    const txt = (await loc.first().textContent()) ?? ""
    const normalized = txt.toLowerCase()

    if (/agotado|sin stock|no disponible|articulo sin stock/.test(normalized)) {
      return { inStock: false, evidence: `${selector} -> ${txt.trim()}` }
    }

    return { inStock: true, evidence: `${selector} -> ${txt.trim()}` }
  }

  return { inStock: true }
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
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 })

    const priceHit = await extractFirstParsablePrice(page, config.priceSelectors)
    if (!priceHit) {
      console.warn(
        `No se encontró un precio parseable para listing ${id} (store_id=${store_id}).`
      )
      return
    }

    const { inStock } = await extractStock(page, config.inStockSelectors)

    await insertPriceSnapshot({
      listing_id: id,
      price_ars: Math.round(priceHit.price),
      in_stock: inStock,
    })

    console.log(
      `OK listing ${id}. price_ars=${priceHit.price} (selector=${priceHit.matchedSelector}) in_stock=${inStock}`
    )
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
      try {
        await scrapeOneListing(browser, listing)
      } catch (err) {
        console.error(
          `Error en listing ${listing.id} (product_id=${listing.product_id}, store_id=${listing.store_id}):`,
          err
        )
      }
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
