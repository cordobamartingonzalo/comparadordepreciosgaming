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
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductWithPrices | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { product, prices } = await getLatestPricesForProduct(productId)
        setSelectedProduct({
          id: product.id,
          name: product.name,
          category: product.category,
          prices,
        })
      } catch (e) {
        console.error("Error cargando producto:", e)
        setSelectedProduct(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [productId])

  const categoryName =
    CATEGORIES.find((c) => c.slug === selectedProduct?.category)?.name ??
    selectedProduct?.category

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Product Hero */}
      <section
        className="border-b-2 border-neon/30 bg-[#f8fafc]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #22c55e10 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={
              selectedProduct
                ? `/categoria/${selectedProduct.category}`
                : "/"
            }
            className="mb-4 flex w-fit items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-neon"
          >
            <ChevronLeft className="size-4" />
            {categoryName ? `VOLVER A ${categoryName.toUpperCase()}` : "VOLVER"}
          </Link>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-neon">
              {"// COMPARACION DE PRECIOS"}
            </span>
            <h1 className="mt-1 font-sans text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
              {loading
                ? "CARGANDO..."
                : selectedProduct?.name ?? "PRODUCTO NO ENCONTRADO"}
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              COMPARATIVA ENTRE LAS PRINCIPALES TIENDAS DE ARGENTINA
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="inline-block size-2 animate-pulse bg-neon" />
            CARGANDO PRECIOS...
          </div>
        ) : selectedProduct ? (
          <ComparisonTable prices={selectedProduct.prices} />
        ) : (
          <div className="border border-dashed border-border p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            NO SE ENCONTRO EL PRODUCTO
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
