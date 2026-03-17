/**
 * test-stock.ts
 * Verifica los inStockSelectors actualizados contra las URLs de diagnóstico.
 * Corre extractStock() y compara contra el resultado esperado.
 */
import { chromium } from "playwright"
import type { Page } from "playwright"

// ── Replica de STORE_CONFIGS (solo inStockSelectors) ──────────────────────
const STORE_STOCK_SELECTORS: Record<string, string[]> = {
  compragamer: [
    "[class*='sin-stock']",
    "[class*='no-disponible']",
    ".product-availability",
  ],
  mexx: [
    '[itemprop="availability"]',
    "[class*='agotado']",
    "[class*='sin-stock']",
  ],
  fullhard: [
    ".stock-container",
    "[class*='sin-stock']",
    "[class*='agotado']",
  ],
  maximusgaming: [
    ".notify-stock",
    "[class*='agotado']",
  ],
  venex: [
    '[itemprop="availability"]',
    "[class*='stock']",
    "[class*='disponib']",
    "[class*='agotado']",
    "[class*='sin-stock']",
  ],
}

const TARGETS = [
  { store: "compragamer", url: "https://compragamer.com/producto/Procesador_Intel_Core_i3_12100F_4_3GHz_Turbo_Socket_1700_Alder_Lake_13369?cate=48", expectedInStock: true },
  { store: "mexx",         url: "https://www.mexx.com.ar/productos-rubro/gabinetes/50888-gabinete-mid-tower-zer01-gaming-centauri-3-fan-rgb-fixed.html", expectedInStock: true },
  { store: "fullhard",     url: "https://fullh4rd.com.ar/prod/27046/micro-amd-ryzen-7-8700g-c-video-c-cooler-am5", expectedInStock: true },
  { store: "maximusgaming",url: "https://www.maximus.com.ar/Producto/Placa-de-Video-Zotac-Nvidia-Geforce-RTX-5050-8GB-SOLO-GDDR6/ITEM=19475/maximus.aspx?PN=ZT-B50500G-10L", expectedInStock: false },
  { store: "venex",        url: "https://www.venex.com.ar/componentes-de-pc/microprocesadores/cpu-intel-core-i3-14100-raptorlake-4-8-4-70ghz-12mb-s1700.html", expectedInStock: true },
]

// ── extractStock replicado del scraper ────────────────────────────────────
const outOfStockPattern =
  /agotado|sin\s*stock|no\s*disponible|articulo\s*sin\s*stock|out\s*of\s*stock|sold\s*out|no\s*hay\s*stock|producto\s*no\s*disponible|no\s+se\s+encuentra/

async function extractStock(
  page: Page,
  selectors: string[]
): Promise<{ inStock: boolean; evidence: string }> {
  if (selectors.length === 0) return { inStock: true, evidence: "no selectors" }

  for (const selector of selectors) {
    let loc
    try {
      loc = page.locator(selector)
    } catch {
      continue
    }
    if ((await loc.count()) === 0) continue

    const el = loc.first()

    const contentAttr = await el.getAttribute("content").catch(() => null)
    if (contentAttr) {
      const normalized = contentAttr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      if (normalized.includes("outofstock") || normalized.includes("out_of_stock") || outOfStockPattern.test(normalized)) {
        return { inStock: false, evidence: `${selector}[content="${contentAttr}"]` }
      }
      return { inStock: true, evidence: `${selector}[content="${contentAttr}"]` }
    }

    // También chequear atributo href (mexx/maximus usan <link itemprop> con href)
    const hrefAttr = await el.getAttribute("href").catch(() => null)
    if (hrefAttr && hrefAttr.includes("schema.org/")) {
      const normalized = hrefAttr.toLowerCase()
      if (normalized.includes("outofstock") || normalized.includes("out_of_stock")) {
        return { inStock: false, evidence: `${selector}[href="${hrefAttr}"]` }
      }
      if (normalized.includes("instock")) {
        return { inStock: true, evidence: `${selector}[href="${hrefAttr}"]` }
      }
    }

    const txt = (await el.textContent().catch(() => "")) ?? ""
    const normalized = txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    if (outOfStockPattern.test(normalized)) {
      return { inStock: false, evidence: `${selector} → "${txt.trim().slice(0, 80)}"` }
    }

    return { inStock: true, evidence: `${selector} → "${txt.trim().slice(0, 80)}"` }
  }

  return { inStock: true, evidence: "no selector matched → fallback en stock" }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("Verificando inStockSelectors actualizados...\n")

  let passed = 0
  let failed = 0
  let skipped = 0

  for (const target of TARGETS) {
    const selectors = STORE_STOCK_SELECTORS[target.store] ?? []
    const expectedLabel = target.expectedInStock ? "EN STOCK" : "SIN STOCK"

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    let result: { inStock: boolean; evidence: string } | null = null
    let timedOut = false

    try {
      await page.goto(target.url, { waitUntil: "networkidle", timeout: 40_000 })
      result = await extractStock(page, selectors)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("Timeout")) {
        timedOut = true
      } else {
        console.error(`  ERROR [${target.store}]: ${msg}`)
      }
    } finally {
      await page.close()
      await browser.close()
    }

    if (timedOut) {
      const label = `${target.store.padEnd(14)} → esperado: ${expectedLabel.padEnd(9)} | resultado: TIMEOUT`
      console.log(`  ${label}  ⚠`)
      skipped++
      continue
    }

    const actualLabel = result!.inStock ? "EN STOCK" : "SIN STOCK"
    const ok = result!.inStock === target.expectedInStock
    const icon = ok ? "✓" : "✗"

    if (ok) passed++
    else failed++

    const label = `${target.store.padEnd(14)} → esperado: ${expectedLabel.padEnd(9)} | resultado: ${actualLabel.padEnd(9)}`
    console.log(`  ${label}  ${icon}  [${result!.evidence}]`)
  }

  console.log(`\nResultado: ${passed} OK, ${failed} FALLARON, ${skipped} TIMEOUT`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error("Error inesperado:", err)
  process.exit(1)
})
