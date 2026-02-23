require("dotenv").config({ path: ".env.local" })

const { createClient } = require("@supabase/supabase-js")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  )
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data: stores, error: storesErr } = await supabase
    .from("stores")
    .select("id,name")

  if (storesErr) throw storesErr

  const { data: listings, error: listingsErr } = await supabase
    .from("store_listings")
    .select("store_id")

  if (listingsErr) throw listingsErr

  const storeIdsInListings = Array.from(
    new Set((listings ?? []).map((l) => l.store_id).filter(Boolean))
  ).sort()

  console.log("stores (id, name):")
  console.table(
    (stores ?? []).map((s) => ({ id: s.id, name: s.name })).sort((a, b) =>
      String(a.id).localeCompare(String(b.id))
    )
  )

  console.log("store_id presentes en store_listings:")
  console.log(storeIdsInListings)
}

main().catch((err) => {
  console.error("Error inspeccionando store_ids:", err)
  process.exit(1)
})

