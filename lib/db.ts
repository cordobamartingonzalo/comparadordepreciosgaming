import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type ProductRow = {
  id: string
  name: string
  category: string
}

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,category")

  if (error) throw error

  return data ?? []
}

export async function getLatestPricesForProduct(productId: string) {
  // 🔎 DEBUG
  console.log("Buscando producto con ID:", productId)

  const { data: productData, error: productErr } = await supabase
    .from("products")
    .select("id,name,category")
    .eq("id", productId)

  if (productErr) throw productErr

  if (!productData || productData.length === 0) {
    throw new Error("Producto no encontrado")
  }

  const product = productData[0]

  const { data: listings, error: listErr } = await supabase
    .from("store_listings")
    .select(`
      id,
      url,
      store_id,
      stores (
        id,
        name
      ),
      price_snapshots (
        price_ars,
        in_stock,
        shipping_label,
        scraped_at
      )
    `)
    .eq("product_id", productId)

  if (listErr) throw listErr

  const prices =
    listings?.map((l: any) => {
      const latest = l.price_snapshots
        ?.sort(
          (a: any, b: any) =>
            new Date(b.scraped_at).getTime() -
            new Date(a.scraped_at).getTime()
        )[0]

      if (!latest) return null

      return {
        storeId: l.store_id,
        storeName: l.stores?.name ?? l.store_id,
        priceArs: latest.price_ars,
        inStock: latest.in_stock,
        shippingLabel: latest.shipping_label ?? "N/D",
        updatedAtISO: latest.scraped_at,
        url: l.url,
      }
    }) ?? []

  return { product, prices: prices.filter(Boolean) }
}