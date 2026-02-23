import { ProductPageClient } from "@/components/product-page-client"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ProductPageClient productId={id} />
}