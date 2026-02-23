import type { StorePrice } from "@/components/ui/comparison-table"

export type ProductWithPrices = {
  id: string
  name: string
  category: string
  prices: StorePrice[]
}

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString()

export const catalog: ProductWithPrices[] = [
  {
    id: "p1",
    name: "RTX 4060 8GB",
    category: "GPU",
    prices: [
      { storeId: "cg", storeName: "CompraGamer", priceArs: 489999, shippingLabel: "Gratis", inStock: true,  updatedAtISO: hoursAgo(2), url: "https://example.com" },
      { storeId: "mx", storeName: "Maximus",    priceArs: 499990, shippingLabel: "Consultar", inStock: true, updatedAtISO: hoursAgo(5), url: "https://example.com" },
      { storeId: "fh", storeName: "FullH4rd",   priceArs: 515000, shippingLabel: "Gratis", inStock: false, updatedAtISO: hoursAgo(7), url: "https://example.com" },
      { storeId: "gz", storeName: "Gezatek",    priceArs: 509900, shippingLabel: "N/D", inStock: true, updatedAtISO: hoursAgo(9), url: "https://example.com" },
      { storeId: "vx", storeName: "Venex",      priceArs: 529000, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(12), url: "https://example.com" },
    ],
  },
  {
    id: "p2",
    name: "Ryzen 5 5600",
    category: "CPU",
    prices: [
      { storeId: "cg", storeName: "CompraGamer", priceArs: 169999, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(3), url: "https://example.com" },
      { storeId: "mx", storeName: "Maximus", priceArs: 175500, shippingLabel: "Consultar", inStock: true, updatedAtISO: hoursAgo(6), url: "https://example.com" },
      { storeId: "fh", storeName: "FullH4rd", priceArs: 178000, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(10), url: "https://example.com" },
      { storeId: "gz", storeName: "Gezatek", priceArs: 181900, shippingLabel: "N/D", inStock: false, updatedAtISO: hoursAgo(8), url: "https://example.com" },
      { storeId: "vx", storeName: "Venex", priceArs: 184990, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(15), url: "https://example.com" },
    ],
  },
  {
    id: "p3",
    name: "SSD NVMe 1TB",
    category: "Almacenamiento",
    prices: [
      { storeId: "cg", storeName: "CompraGamer", priceArs: 89999, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(1), url: "https://example.com" },
      { storeId: "mx", storeName: "Maximus", priceArs: 94990, shippingLabel: "Consultar", inStock: true, updatedAtISO: hoursAgo(4), url: "https://example.com" },
      { storeId: "fh", storeName: "FullH4rd", priceArs: 97900, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(11), url: "https://example.com" },
      { storeId: "gz", storeName: "Gezatek", priceArs: 99900, shippingLabel: "N/D", inStock: false, updatedAtISO: hoursAgo(9), url: "https://example.com" },
      { storeId: "vx", storeName: "Venex", priceArs: 102000, shippingLabel: "Gratis", inStock: true, updatedAtISO: hoursAgo(14), url: "https://example.com" },
    ],
  },
]