import type { MetadataRoute } from "next"
import { CATEGORIES } from "@/lib/categories"
import { getProducts } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `https://preciosgg.com.ar/producto/${p.id}`,
    changeFrequency: "daily",
    priority: 0.6,
  }))

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `https://preciosgg.com.ar/categoria/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }))

  return [
    {
      url: "https://preciosgg.com.ar",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...categoryEntries,
    ...productEntries,
  ]
}
