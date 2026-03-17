// scripts/debug-stock.ts
// Uso: npx tsx --env-file=.env.local scripts/debug-stock.ts
// Abre el browser visible para inspeccionar el DOM de stock de cada tienda.
// Ejecutar ANTES de correr el scraper corregido para verificar selectores.

import "dotenv/config"
import { chromium } from "playwright"

// Reemplazar estas URLs con productos reales de tu store_listings
// Idealmente uno EN stock y uno SIN stock por tienda para validar ambos casos
const TEST_URLS: Record<string, string> = {
  compragamer:   "https://compragamer.com/producto/Procesador_Intel_Core_i3_12100F_4_3GHz_Turbo_Socket_1700_Alder_Lake_13369?cate=48",
  mexx:          "https://www.mexx.com.ar/productos-rubro/gabinetes/50888-gabinete-mid-tower-zer01-gaming-centauri-3-fan-rgb-fixed.html",
  fullhard:      "https://fullh4rd.com.ar/prod/27046/micro-amd-ryzen-7-8700g-c-video-c-cooler-am5",
  maximusgaming: "https://www.maximus.com.ar/Producto/Placa-de-Video-Zotac-Nvidia-Geforce-RTX-5050-8GB-SOLO-GDDR6/ITEM=19475/maximus.aspx?PN=ZT-B50500G-10L",
  venex:         "https://www.venex.com.ar/componentes-de-pc/microprocesadores/cpu-intel-core-i3-14100-raptorlake-4-8-4-70ghz-12mb-s1700.html",
}

const STOCK_CANDIDATES = [
  // Selectores genéricos a probar en cada tienda
  '[itemprop="availability"]',
  "[data-stock]",
  "[class*='stock']",
  "[class*='Stock']",
  "[class*='disponib']",
  "[class*='agotado']",
  "[class*='Agotado']",
  ".availability",
  ".product-availability",
  "button[id*='comprar']:disabled",
  "button[id*='cart']:disabled",
]

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 })

  for (const [store, url] of Object.entries(TEST_URLS)) {
    if (url.startsWith("REEMPLAZAR")) {
      console.log(`\n⚠️  ${store}: URL no configurada, saltando.`)
      continue
    }

    console.log(`\n========== ${store} ==========`)
    console.log(`URL: ${url}`)

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 })

    for (const selector of STOCK_CANDIDATES) {
      const count = await page.locator(selector).count()
      if (count > 0) {
        const text = await page.locator(selector).first().textContent()
        const content = await page.locator(selector).first().getAttribute("content")
        console.log(`  ✓ ENCONTRADO: ${selector}`)
        console.log(`    text: "${text?.trim()}"`)
        if (content) console.log(`    content attr: "${content}"`)
      }
    }

    // Pausa para inspección manual en el browser abierto
    console.log(`  → Browser abierto. Revisá el DOM manualmente. Cerrá la pestaña para continuar.`)
    await page.waitForEvent("close", { timeout: 120_000 }).catch(() => {})
  }

  await browser.close()
  console.log("\nDiagnóstico completado.")
}

main().catch(console.error)
