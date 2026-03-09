import "dotenv/config"
import { supabase } from "../lib/supabase"

// ─── Config ───────────────────────────────────────────────────────────────────

const SERPAPI_KEY = process.env.SERPAPI_KEY
const DELAY_MS = 1000

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = {
  total: 0,
  updated: 0,
  failed: 0,
  skipped: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchImageUrl(productName: string): Promise<string | null> {
  const params = new URLSearchParams({
    engine: "google_images",
    q: productName,
    api_key: SERPAPI_KEY!,
  })

  const url = `https://serpapi.com/search.json?${params.toString()}`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`SerpAPI error ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  const results: Array<{ original?: string }> = data.images_results ?? []

  const first = results.find((r) => typeof r.original === "string" && r.original.startsWith("http"))

  return first?.original ?? null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SERPAPI_KEY) {
    console.error("❌  SERPAPI_KEY no está definida en las variables de entorno.")
    process.exit(1)
  }

  // 1. Obtener productos sin imagen
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .or("image_url.is.null,image_url.eq.")

  if (error) {
    console.error("❌  Error al obtener productos de Supabase:", error.message)
    process.exit(1)
  }

  stats.total = products?.length ?? 0
  console.log(`\n// IMAGE SCRAPER — ${stats.total} productos sin imagen\n`)

  if (stats.total === 0) {
    console.log("// Todos los productos ya tienen imagen. Nada que hacer.")
    return
  }

  // 2. Procesar cada producto
  for (const product of products!) {
    const { id, name } = product

    try {
      const imageUrl = await fetchImageUrl(name)

      if (!imageUrl) {
        console.log(`  [SKIP]  ${name} — sin resultados en SerpAPI`)
        stats.skipped++
      } else {
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: imageUrl })
          .eq("id", id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        console.log(`  [OK]    ${name}`)
        console.log(`          ${imageUrl}`)
        stats.updated++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  [ERROR] ${name} — ${msg}`)
      stats.failed++
    }

    await delay(DELAY_MS)
  }

  // 3. Resumen
  console.log("\n// ─── Resumen ────────────────────────────────────────────")
  console.log(`//  Total procesados : ${stats.total}`)
  console.log(`//  Actualizados     : ${stats.updated}`)
  console.log(`//  Sin resultado    : ${stats.skipped}`)
  console.log(`//  Errores          : ${stats.failed}`)
  console.log("// ──────────────────────────────────────────────────────\n")
}

main()
