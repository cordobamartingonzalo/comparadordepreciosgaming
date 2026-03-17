import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CATEGORIES } from "@/lib/categories"
import { getProductsByCategory } from "@/lib/db"
import { CategoryPageClient } from "@/components/category-page-client"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  const categoryName = category?.name ?? slug

  return {
    title: `${categoryName} | Precios GG`,
    description: `Compará precios de ${categoryName} en Argentina. Encontrá la mejor oferta entre Compragamer, Mexx, Fullhard y Maximus.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) notFound()

  let products: Awaited<ReturnType<typeof getProductsByCategory>>
  try {
    products = await getProductsByCategory(slug)
  } catch {
    notFound()
  }

  return <CategoryPageClient slug={slug} products={products!} />
}
