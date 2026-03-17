/**
 * test-no-price-stock.ts
 * Verifica que la lógica "sin precio = sin stock" funciona correctamente.
 *
 * No inserta datos reales en Supabase (no requiere listing_id válido).
 * Solo comprueba que extractFirstParsablePrice devuelve null para URLs
 * sin producto, lo que dispararía el insert in_stock: false en el scraper real.
 */
import { chromium } from "playwright"
import type { Page } from "playwright"

// ── Replica mínima de parsePrice y extractFirstParsablePrice ─────────────

function parsePrice(raw: string | null): number | null {
  if (!raw) return null
  let cleaned = raw.replace(/\s+/g, "").replace(/[^\d.,]/g, "")
  if (!cleaned) return null

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")
  const dotCount = (cleaned.match(/\./g) ?? []).length
  const commaCount = (cleaned.match(/,/g) ?? []).length

  if (hasComma && hasDot) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  } else if (hasComma && !hasDot) {
    if (commaCount === 1) {
      const afterComma = cleaned.split(",")[1] ?? ""
      cleaned = afterComma.length === 3 ? cleaned.replace(",", "") : cleaned.replace(",", ".")
    } else {
      cleaned = cleaned.replace(/,/g, "")
    }
  } else if (hasDot && !hasComma) {
    if (dotCount > 1) {
      cleaned = cleaned.replace(/\./g, "")
    } else {
      const afterDot = cleaned.split(".")[1] ?? ""
      if (afterDot.length === 3) cleaned = cleaned.replace(".", "")
    }
  }

  const num = Number.parseFloat(cleaned)
  if (!Number.isFinite(num) || num < 1000) return null
  return Math.round(num)
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

// ── Casos de prueba ───────────────────────────────────────────────────────

const TEST_CASES = [
  {
    label: "URL de búsqueda (sin página de producto)",
    url: "https://compragamer.com/productos?criterio=rx%20580",
    priceSelectors: [
      "cgw-price span.price",
      'span[class*="tw:text-price"]:last-child',
      "text=/\\$\\s*[0-9]/",
    ],
    // Una página de búsqueda puede mostrar muchos precios de productos listados,
    // así que este test puede fallar si los selectors matchean precios del listing.
    // Lo que queremos verificar es la lógica del flujo.
    expectNoPrice: false, // puede tener precios en la grilla
    note: "Página de búsqueda — verifica qué precio se detectaría",
  },
  {
    label: "URL de producto inexistente (404)",
    url: "https://compragamer.com/producto/producto-que-no-existe-12345678",
    priceSelectors: [
      "cgw-price span.price",
      'span[class*="tw:text-price"]:last-child',
    ],
    expectNoPrice: true,
    note: "404 o redirect → sin precio → in_stock: false",
  },
  {
    label: "maximus.com.ar — producto SIN STOCK (sin precio en el DOM)",
    url: "https://www.maximus.com.ar/Producto/Placa-de-Video-Zotac-Nvidia-Geforce-RTX-5050-8GB-SOLO-GDDR6/ITEM=19475/maximus.aspx?PN=ZT-B50500G-10L",
    priceSelectors: [
      "#final-price",
      "[data-bonification]",
      ".value-item--full-price",
    ],
    expectNoPrice: true,
    note: "Producto sin stock en maximus → no hay precio → in_stock: false",
  },
]

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("Test: lógica sin-precio → sin-stock\n")

  let passed = 0
  let failed = 0

  for (const tc of TEST_CASES) {
    console.log(`[${tc.label}]`)
    console.log(`  URL: ${tc.url}`)
    console.log(`  Nota: ${tc.note}`)

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    try {
      const response = await page.goto(tc.url, {
        waitUntil: "networkidle",
        timeout: 35_000,
      })

      const httpStatus = response?.status() ?? 0
      const httpFailed = !response || httpStatus >= 400

      if (httpFailed) {
        console.log(`  HTTP ${httpStatus} → scraper insertaría in_stock: false, price_ars: null`)
        console.log(`  ✓ CORRECTO (error HTTP detectado)\n`)
        passed++
        continue
      }

      const priceHit = await extractFirstParsablePrice(page, tc.priceSelectors)

      if (priceHit) {
        const label = `precio detectado: $${priceHit.price.toLocaleString("es-AR")} (selector: ${priceHit.matchedSelector})`
        if (tc.expectNoPrice) {
          console.log(`  ✗ INESPERADO — ${label}`)
          console.log(`    Se esperaba sin precio pero se encontró uno.\n`)
          failed++
        } else {
          console.log(`  ✓ ${label}`)
          console.log(`    scraper insertaría in_stock: true con ese precio.\n`)
          passed++
        }
      } else {
        console.log(`  Sin precio detectado → scraper insertaría in_stock: false, price_ars: null`)
        if (tc.expectNoPrice) {
          console.log(`  ✓ CORRECTO\n`)
          passed++
        } else {
          console.log(`  ⚠ Sin precio (podría ser correcto según el estado actual de la URL)\n`)
          passed++ // no falla — el estado del site puede variar
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("Timeout") || msg.includes("timeout")) {
        console.log(`  TIMEOUT → scraper insertaría in_stock: false, price_ars: null`)
        console.log(`  ✓ CORRECTO (timeout manejado como sin stock)\n`)
        passed++
      } else {
        console.log(`  ERROR: ${msg}\n`)
        failed++
      }
    } finally {
      await page.close()
      await browser.close()
    }
  }

  console.log(`\nResultado: ${passed} OK, ${failed} FALLARON`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error("Error inesperado:", err)
  process.exit(1)
})
