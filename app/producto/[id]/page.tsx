import type { Metadata } from "next"
import { getLatestPricesForProduct } from "@/lib/db"
import { ProductPageClient } from "@/components/product-page-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const { product } = await getLatestPricesForProduct(id)
    return {
      title: `${product.name} - Precio en Argentina | Precios GG`,
      description: `Compará el precio de ${product.name} en las principales tiendas gaming de Argentina.`,
    }
  } catch {
    return {
      title: "Producto | Precios GG",
      description: "Compará precios en las principales tiendas gaming de Argentina.",
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductPageClient productId={id} />
}
