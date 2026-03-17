/**
 * dump-stock-html.ts
 * Abre cada URL de tienda con Playwright, busca selectores relacionados con
 * stock y guarda el HTML de cada elemento encontrado en scripts/stock-dump/
 */
import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const OUT_DIR = path.join(__dirname, "stock-dump")

const TARGETS = [
  {
    store: "compragamer",
    url: "https://compragamer.com/producto/Procesador_Intel_Core_i3_12100F_4_3GHz_Turbo_Socket_1700_Alder_Lake_13369?cate=48",
    expectedStock: true,
  },
  {
    store: "mexx",
    url: "https://www.mexx.com.ar/productos-rubro/gabinetes/50888-gabinete-mid-tower-zer01-gaming-centauri-3-fan-rgb-fixed.html",
    expectedStock: true,
  },
  {
    store: "fullhard",
    url: "https://fullh4rd.com.ar/prod/27046/micro-amd-ryzen-7-8700g-c-video-c-cooler-am5",
    expectedStock: true,
  },
  {
    store: "maximusgaming",
    url: "https://www.maximus.com.ar/Producto/Placa-de-Video-Zotac-Nvidia-Geforce-RTX-5050-8GB-SOLO-GDDR6/ITEM=19475/maximus.aspx?PN=ZT-B50500G-10L",
    expectedStock: false,
  },
  {
    store: "venex",
    url: "https://www.venex.com.ar/componentes-de-pc/microprocesadores/cpu-intel-core-i3-14100-raptorlake-4-8-4-70ghz-12mb-s1700.html",
    expectedStock: true,
  },
]

const CANDIDATE_SELECTORS = [
  '[itemprop="availability"]',
  '[class*="stock"]',
  '[class*="Stock"]',
  '[class*="disponib"]',
  '[class*="agotado"]',
  '[class*="comprar"]',
  '[class*="carrito"]',
  '[class*="cart"]',
  'button[disabled]',
  '[data-stock]',
  '[class*="availability"]',
  '[class*="inventory"]',
]

const KEYWORD_PATTERN = /stock|disponib|agotado|carrito|comprar|agregar/i

async function dumpOne(store: string, url: string, expectedStock: boolean): Promise<string> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const lines: string[] = []

  lines.push(`STORE: ${store}`)
  lines.push(`URL: ${url}`)
  lines.push(`EXPECTED STOCK: ${expectedStock ? "EN STOCK" : "SIN STOCK"}`)
  lines.push(`SCRAPED AT: ${new Date().toISOString()}`)
  lines.push("")

  try {
    console.log(`  → Navegando a ${store}...`)
    await page.goto(url, { waitUntil: "networkidle", timeout: 40_000 })

    // ── Selectores candidatos ──────────────────────────────────────────────
    lines.push("=== SELECTORES CANDIDATOS ===")
    for (const selector of CANDIDATE_SELECTORS) {
      try {
        const locs = page.locator(selector)
        const count = await locs.count()
        if (count === 0) continue

        lines.push(`\n--- ${selector} (${count} elemento/s) ---`)
        for (let i = 0; i < Math.min(count, 5); i++) {
          const el = locs.nth(i)
          const outer = await el.evaluate((node) => (node as Element).outerHTML).catch(() => null)
          const content = await el.getAttribute("content").catch(() => null)
          const href = await el.getAttribute("href").catch(() => null)
          if (outer) {
            // Truncar para no saturar el dump
            lines.push(`  [${i}] outerHTML: ${outer.slice(0, 600)}`)
            if (content) lines.push(`  [${i}] content attr: ${content}`)
            if (href) lines.push(`  [${i}] href attr: ${href}`)
          }
        }
      } catch {
        // Selector inválido para Playwright — ignorar
      }
    }

    // ── Líneas de innerText con keywords ──────────────────────────────────
    lines.push("\n=== LÍNEAS DE TEXTO CON KEYWORDS ===")
    const bodyText: string = await page
      .evaluate(() => document.body.innerText)
      .catch(() => "")

    const matchedLines = bodyText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && KEYWORD_PATTERN.test(l))
      .slice(0, 80) // máximo 80 líneas

    if (matchedLines.length === 0) {
      lines.push("  (ninguna línea coincide con los keywords)")
    } else {
      matchedLines.forEach((l) => lines.push(`  ${l}`))
    }

    // ── meta tags de disponibilidad ───────────────────────────────────────
    lines.push("\n=== META/LINK TAGS DE DISPONIBILIDAD ===")
    const metaHtml: string[] = await page
      .evaluate(() => {
        const tags = Array.from(document.querySelectorAll('[itemtype*="Product"] *[itemprop], meta[property*="product"], link[itemprop]'))
        return tags.slice(0, 30).map((el) => el.outerHTML)
      })
      .catch(() => [])

    if (metaHtml.length === 0) {
      lines.push("  (ninguno encontrado)")
    } else {
      metaHtml.forEach((h) => lines.push(`  ${h.slice(0, 400)}`))
    }

    console.log(`  ✓ ${store} — dump completado`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    lines.push(`\nERROR AL CARGAR LA PÁGINA: ${msg}`)
    console.error(`  ✗ ${store} — error: ${msg}`)
  } finally {
    await page.close()
    await browser.close()
  }

  return lines.join("\n")
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log("Iniciando dump de stock HTML...\n")

  for (const target of TARGETS) {
    console.log(`[${target.store}]`)
    try {
      const content = await dumpOne(target.store, target.url, target.expectedStock)
      const outPath = path.join(OUT_DIR, `${target.store}.txt`)
      fs.writeFileSync(outPath, content, "utf-8")
      console.log(`  Guardado: ${outPath}\n`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  FALLO COMPLETO para ${target.store}: ${msg}\n`)
    }
  }

  console.log("Dump finalizado.")
}

main().catch((err) => {
  console.error("Error inesperado:", err)
  process.exit(1)
})
