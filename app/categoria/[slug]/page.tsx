import type { Metadata } from "next"
import { CATEGORIES } from "@/lib/categories"
import { CategoryPageClient } from "@/components/category-page-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  const categoryName = category?.name ?? slug

  return {
    title: `${categoryName} | Precios GG`,
    description: `Compará precios de ${categoryName} en Argentina. Encontrá la mejor oferta entre Compragamer, Mexx, Fullhard, Maximus y Venex.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return <CategoryPageClient params={params} />
}
