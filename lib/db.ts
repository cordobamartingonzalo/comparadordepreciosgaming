import "server-only"
import { getSupabaseServer } from "./supabase-server"

export type ProductRow = {
  id: string
  name: string
  category: string
  image_url: string | null
}

export type StorePrice = {
  storeId: string
  storeName: string
  priceArs: number
  inStock: boolean
  shippingLabel: string
  updatedAtISO: string
  url: string
}

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .select("id,name,category,image_url")
    .order("name")
  if (error) throw error
  return data ?? []
}

export async function getCategories(): Promise<string[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .select("category")
  if (error) throw error
  const unique = Array.from(new Set((data ?? []).map((p) => p.category)))
  return unique.sort()
}

export async function getProductsByCategory(
  category: string
): Promise<ProductRow[]> {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from("products")
    .select("id,name,category,image_url")
    .eq("category", category)
    .order("name")
  if (error) throw error
  return data ?? []
}

export async function getLatestPricesForProduct(productId: string): Promise<{
  product: ProductRow
  prices: StorePrice[]
}> {
  const supabase = getSupabaseServer()

  const { data: productData, error: productErr } = await supabase
    .from("products")
    .select("id,name,category,image_url")
    .eq("id", productId)
    .single()

  if (productErr) throw productErr
  if (!productData) throw new Error("Producto no encontrado")

  const { data: listings, error: listErr } = await supabase
    .from("store_listings")
    .select("id, url, store_id, stores(id, name)")
    .eq("product_id", productId)

  if (listErr) throw listErr

  const prices = await Promise.all(
    (listings ?? []).map(async (listing) => {
      const { data: snapshots, error: snapErr } = await supabase
        .from("price_snapshots")
        .select("price_ars, in_stock, shipping_label, scraped_at")
        .eq("listing_id", listing.id)
        .order("scraped_at", { ascending: false })
        .limit(1)

      if (snapErr) throw snapErr

      const latest = snapshots?.[0]
      if (!latest) return null

      const store = listing.stores as unknown as { id: string; name: string } | null

      return {
        storeId: listing.store_id,
        storeName: store?.name ?? listing.store_id,
        priceArs: latest.price_ars,
        inStock: latest.in_stock,
        shippingLabel: latest.shipping_label ?? "N/D",
        updatedAtISO: latest.scraped_at,
        url: listing.url,
      } satisfies StorePrice
    })
  )

  return {
    product: productData,
    prices: prices.filter((p): p is StorePrice => p !== null),
  }
}
