import "dotenv/config"

import { chromium, type Browser, type Page } from "playwright"
import { supabase } from "../lib/supabase"

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreId = "compragamer" | "mexx" | "venex" | "fullhard" | "maximusgaming"

type SearchResult = { name: string; url: string }

type Product = { id: string; name: string; category: string }

// ─── Config ───────────────────────────────────────────────────────────────────

const ALL_STORES: StoreId[] = ["compragamer", "mexx", "venex", "fullhard", "maximusgaming"]

const stats = {
  processed: 0,
  inserted: 0,
  not_found: 0,
  errors: 0,
}

// ─── Token matching ───────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2)
}

/**
 * Devuelve el primer resultado cuyo nombre contiene TODOS los tokens del query.
 */
function findFirstMatch(queryTokens: string[], results: SearchResult[]): SearchResult | null {
  for (const result of results) {
    const resultNorm = result.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    const allMatch = queryTokens.every((token) => resultNorm.includes(token))
    if (allMatch) return result
  }
  return null
}

// ─── Per-store search scrapers ────────────────────────────────────────────────

/**
 * COMPRAGAMER — busca por criterio, usa Web Components <cgw-product-card>
 */
async function searchCompragamer(page: Page, query: string): Promise<SearchResult[]> {
  await page.goto(
    `https://compragamer.com/productos?criterio=${encodeURIComponent(query)}`,
    { waitUntil: "domcontentloaded", timeout: 60_000 }
  )
  await page.waitForSelector("cgw-product-card", { timeout: 10_000 }).catch(() => {})

  const base = "https://compragamer.com"
  const results = await page.evaluate((baseUrl: string) => {
    return Array.from(document.querySelectorAll("cgw-product-card")).map((card) => {
      const name =
        card.getAttribute("name") ??
        card.querySelector("[class*='name'],[class*='title'],h2,h3")?.textContent ??
        ""
      const anchor = card.querySelector("a[href]") ?? card.closest("a[href]")
      const href = anchor?.getAttribute("href") ?? ""
      return { name: name.trim(), href }
    })
  }, base)

  return results
    .filter((r) => r.name.length > 0 && r.href.length > 0)
    .map((r) => ({
      name: r.name,
      url: r.href.startsWith("http") ? r.href : `${base}${r.href}`,
    }))
}

/**
 * MEXX — busca con /buscar/?p=, resultados en a[href*='/productos-rubro/'][href$='.html']
 */
async function searchMexx(page: Page, query: string): Promise<SearchResult[]> {
  await page.goto(
    `https://www.mexx.com.ar/buscar/?p=${encodeURIComponent(query)}`,
    { waitUntil: "networkidle", timeout: 60_000 }
  )

  const results = await page.evaluate(() => {
    const seen = new Set<string>()
    const out: { name: string; url: string }[] = []
    const anchors = Array.from(
      document.querySelectorAll("a[href*='/productos-rubro/'][href$='.html']")
    ) as HTMLAnchorElement[]

    for (const a of anchors) {
      if (seen.has(a.href)) continue
      const name = a.textContent?.trim().replace(/\s+/g, " ") ?? ""
      if (name.length > 4) {
        seen.add(a.href)
        out.push({ name, url: a.href })
      }
    }
    return out
  })

  return results
}

/**
 * VENEX — busca con /resultado-busqueda.htm?keywords=, resultados en h3.product-box-title a[href]
 * Timeout extendido a 90s.
 */
async function searchVenex(page: Page, query: string): Promise<SearchResult[]> {
  await page.goto(
    `https://www.venex.com.ar/resultado-busqueda.htm?keywords=${encodeURIComponent(query)}`,
    { waitUntil: "networkidle", timeout: 90_000 }
  )

  const results = await page.evaluate(() => {
    return (
      Array.from(
        document.querySelectorAll("h3.product-box-title a[href]")
      ) as HTMLAnchorElement[]
    )
      .map((a) => ({
        name: a.textContent?.trim().replace(/\s+/g, " ") ?? "",
        url: a.href,
      }))
      .filter((r) => r.name.length > 4)
  })

  return results
}

/**
 * FULLHARD — busca con /cat/search/{query}, resultados en a[href*='/prod/']
 */
async function searchFullhard(page: Page, query: string): Promise<SearchResult[]> {
  await page.goto(
    `https://fullh4rd.com.ar/cat/search/${encodeURIComponent(query)}`,
    { waitUntil: "networkidle", timeout: 60_000 }
  )

  const results = await page.evaluate(() => {
    const seen = new Set<string>()
    const out: { name: string; url: string }[] = []
    const anchors = Array.from(
      document.querySelectorAll("a[href*='/prod/']")
    ) as HTMLAnchorElement[]

    for (const a of anchors) {
      if (seen.has(a.href)) continue
      seen.add(a.href)
      const rawText = a.textContent?.trim().replace(/\s+/g, " ") ?? ""
      const name = rawText.replace(/\s*\$\s*[\d.,]+.*$/, "").trim()
      if (name.length > 4) out.push({ name, url: a.href })
    }
    return out
  })

  return results
}

/**
 * MAXIMUS — busca con /BUS={query}/PAGE={n}/, máximo 3 páginas.
 * Resultados en a[href*='/Producto/'][href*='ITEM='].
 * Para si la página actual tiene igual cantidad que la anterior
 * o si los primeros 3 hrefs son los mismos.
 * Delay de 1 segundo entre páginas.
 */
async function searchMaximus(page: Page, query: string): Promise<SearchResult[]> {
  const baseSearchUrl =
    `https://www.maximus.com.ar/Productos/maximus.aspx?/CAT=-1/SCAT=-1/M=-1/BUS=` +
    `${encodeURIComponent(query)}/OR=1/PAGE=`

  const allResults: SearchResult[] = []
  let prevCount = -1
  let prevFirstHrefs: string[] = []

  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    if (pageNum > 1) {
      await new Promise((r) => setTimeout(r, 1_000))
    }

    await page.goto(`${baseSearchUrl}${pageNum}/`, { waitUntil: "networkidle", timeout: 60_000 })
    await page.waitForTimeout(2_000)

    const pageResults = await page.evaluate(() => {
      const seen = new Set<string>()
      const out: { name: string; url: string }[] = []
      const anchors = Array.from(
        document.querySelectorAll("a[href*='/Producto/'][href*='ITEM=']")
      ) as HTMLAnchorElement[]

      for (const a of anchors) {
        if (seen.has(a.href)) continue
        seen.add(a.href)
        const match = a.href.match(/\/Producto\/([^/]+)\/ITEM=/)
        if (!match) continue
        const name = match[1].replace(/-/g, " ").trim()
        if (name.length > 4) out.push({ name, url: a.href })
      }
      return out
    })

    const firstHrefs = pageResults.slice(0, 3).map((r) => r.url)
    const sameCount = prevCount >= 0 && pageResults.length === prevCount
    const sameHrefs =
      firstHrefs.length > 0 && firstHrefs.every((h, i) => h === prevFirstHrefs[i])

    if (sameCount || sameHrefs) break

    allResults.push(...pageResults)
    prevCount = pageResults.length
    prevFirstHrefs = firstHrefs
  }

  // Deduplicate across pages
  const seen = new Set<string>()
  return allResults.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })
}

// ─── Search dispatcher ────────────────────────────────────────────────────────

async function searchStore(
  browser: Browser,
  storeId: StoreId,
  query: string
): Promise<SearchResult[]> {
  const page = await browser.newPage()
  await page.route("**/*", (route) => {
    const type = route.request().resourceType()
    if (["image", "media"].includes(type)) route.abort()
    else route.continue()
  })

  try {
    switch (storeId) {
      case "compragamer":   return await searchCompragamer(page, query)
      case "mexx":          return await searchMexx(page, query)
      case "venex":         return await searchVenex(page, query)
      case "fullhard":      return await searchFullhard(page, query)
      case "maximusgaming": return await searchMaximus(page, query)
    }
  } finally {
    await page.close()
  }
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function insertStoreListing(
  productId: string,
  storeId: string,
  url: string
): Promise<void> {
  // Guard: verificar que no exista (por si el set en memoria quedó desactualizado)
  const { data: existing } = await supabase
    .from("store_listings")
    .select("id")
    .eq("product_id", productId)
    .eq("store_id", storeId)
    .maybeSingle()

  if (existing) return

  const { error } = await supabase
    .from("store_listings")
    .insert({ product_id: productId, store_id: storeId, url })

  if (error) throw new Error(`store_listings insert: ${error.message}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════")
  console.log("  Search Scraper — Comparador Gaming Argentina")
  console.log("  Busca listings faltantes por tienda para cada producto")
  console.log("═══════════════════════════════════════════════════════════")

  // 1. Traer todos los productos
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, category")
    .order("category")
  if (prodError) throw new Error(`products fetch: ${prodError.message}`)
  if (!products?.length) {
    console.log("  Sin productos en la base. Ejecutar catalog-scraper primero.")
    return
  }

  // 2. Traer todos los store_listings en una sola consulta (más eficiente)
  const { data: listings, error: listError } = await supabase
    .from("store_listings")
    .select("product_id, store_id")
  if (listError) throw new Error(`store_listings fetch: ${listError.message}`)

  const existingPairs = new Set<string>(
    (listings ?? []).map((l) => `${l.product_id}::${l.store_id}`)
  )

  // 3. Construir lista de trabajo (producto + tiendas donde falta listing)
  //    Salteamos gabinetes: los nombres son demasiado específicos para matchear entre tiendas
  type WorkItem = { product: Product; missingStores: StoreId[] }
  const workItems: WorkItem[] = []
  let skippedGabinetes = 0

  for (const product of products) {
    if (product.category === "gabinetes") {
      skippedGabinetes++
      continue
    }
    const missing = ALL_STORES.filter(
      (store) => !existingPairs.has(`${product.id}::${store}`)
    )
    if (missing.length > 0) {
      workItems.push({ product, missingStores: missing })
    }
  }

  const totalProducts = workItems.length
  const alreadyComplete = products.length - skippedGabinetes - totalProducts

  console.log(`  Total productos en DB       : ${products.length}`)
  console.log(`  Gabinetes salteados         : ${skippedGabinetes}`)
  console.log(`  Ya completos (5/5 tiendas)  : ${alreadyComplete}`)
  console.log(`  Con listings faltantes      : ${totalProducts}`)
  console.log("═══════════════════════════════════════════════════════════\n")

  if (totalProducts === 0) {
    console.log("  Todos los productos tienen listings en todas las tiendas.")
    return
  }

  const browser = await chromium.launch({ headless: true })

  try {
    let productIndex = 0

    for (const { product, missingStores } of workItems) {
      productIndex++
      stats.processed++

      const tokens = tokenize(product.name)
      console.log(`\n[${productIndex}/${totalProducts}] ${product.name}  (${product.category})`)
      console.log(`  Tiendas faltantes: ${missingStores.join(", ")}`)

      for (const storeId of missingStores) {
        process.stdout.write(`  → ${storeId}: `)

        try {
          const results = await searchStore(browser, storeId, product.name)
          const match = findFirstMatch(tokens, results)

          if (match) {
            const truncName =
              match.name.length > 55 ? match.name.substring(0, 52) + "..." : match.name
            process.stdout.write(`[+] "${truncName}"\n`)
            try {
              await insertStoreListing(product.id, storeId, match.url)
              stats.inserted++
            } catch (dbErr) {
              console.error(`     [error] DB: ${(dbErr as Error).message}`)
              stats.errors++
            }
          } else {
            process.stdout.write(`[~] Sin match (${results.length} resultados)\n`)
            stats.not_found++
          }
        } catch (err) {
          const msg = (err as Error).message.substring(0, 70)
          process.stdout.write(`[!] Error: ${msg}\n`)
          stats.errors++
        }

        // Delay de 2 segundos entre búsquedas
        await new Promise((r) => setTimeout(r, 2_000))
      }
    }
  } finally {
    await browser.close()
  }

  console.log("\n═══════════════════════════════════════════════════════════")
  console.log("  RESUMEN FINAL")
  console.log("═══════════════════════════════════════════════════════════")
  console.log(`  Productos procesados      : ${stats.processed}`)
  console.log(`  Listings nuevos agregados : ${stats.inserted}`)
  console.log(`  No encontrados            : ${stats.not_found}`)
  console.log(`  Errores                   : ${stats.errors}`)
  console.log("═══════════════════════════════════════════════════════════")
}

main()
  .then(() => console.log("\nSearch scraper finalizado."))
  .catch((err) => {
    console.error("Error inesperado:", err)
    process.exit(1)
  })
