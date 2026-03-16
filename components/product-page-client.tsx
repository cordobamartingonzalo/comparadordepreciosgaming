"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ComparisonTable } from "@/components/comparison-table"
import { getLatestPricesForProduct } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

type ProductWithPrices = {
  id: string
  name: string
  category: string
  prices: any[]
}

export function ProductPageClient({ productId }: { productId: string }) {
  const [selectedProduct, setSelectedProduct] = React.useState<ProductWithPrices | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { product, prices } = await getLatestPricesForProduct(productId)
        setSelectedProduct({ id: product.id, name: product.name, category: product.category, prices })
      } catch (e) {
        console.error("Error cargando producto:", e)
        setSelectedProduct(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [productId])

  const categoryName = CATEGORIES.find((c) => c.slug === selectedProduct?.category)?.name ?? selectedProduct?.category

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <section className="border-b border-black/8 bg-[#FEFCF7]">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={selectedProduct ? `/categoria/${selectedProduct.category}` : "/"}
            className="mb-5 flex items-center gap-1 text-xs font-mono tracking-widest text-[#7A7870] hover:text-[#00C88A] w-fit transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            {categoryName ? `Volver a ${categoryName}` : "Volver"}
          </Link>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#00C88A] mb-1">Comparativa de precios</div>
            <h1 className="font-serif text-2xl text-[#1C1C1A] sm:text-3xl">
              {loading ? (
                <span className="flex items-center gap-2 text-[#7A7870]">
                  <span className="inline-block size-2 rounded-full bg-[#00C88A] animate-pulse" />
                  Cargando...
                </span>
              ) : (
                selectedProduct?.name ?? "Producto no encontrado"
              )}
            </h1>
            <p className="mt-1 text-sm text-[#7A7870]">Comparativa de precios en las principales tiendas de Argentina.</p>
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#7A7870] font-mono">
            <span className="inline-block size-2 rounded-full bg-[#00C88A] animate-pulse" />
            Cargando precios...
          </div>
        ) : selectedProduct ? (
          <ComparisonTable prices={selectedProduct.prices} />
        ) : (
          <div className="text-sm text-[#7A7870]">No se encontró el producto.</div>
        )}
      </main>
      <Footer />
    </div>
  )
}
