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

  const categoryName = CATEGORIES.find(
    (c) => c.slug === selectedProduct?.category
  )?.name ?? selectedProduct?.category

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Product Hero ── */}
      <section
        className="border-b border-border relative overflow-hidden"
        style={{
          background: "#f8fafc",
          backgroundImage: "radial-gradient(circle, #22c55e1a 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={selectedProduct ? `/categoria/${selectedProduct.category}` : "/"}
            className="mb-4 flex items-center gap-1 text-xs font-mono tracking-widest uppercase text-foreground/60 hover:text-[#22c55e] w-fit transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            {categoryName ? `// VOLVER A ${categoryName.toUpperCase()}` : "// VOLVER"}
          </Link>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#22c55e] mb-1">
              // COMPARATIVA DE PRECIOS
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground uppercase sm:text-2xl">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-[#22c55e] animate-pulse" />
                  CARGANDO...
                </span>
              ) : (
                selectedProduct?.name ?? "PRODUCTO NO ENCONTRADO"
              )}
            </h2>
            <p className="mt-1 text-sm text-foreground/60 font-medium">
              Comparativa de precios en las principales tiendas de Argentina.
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-foreground/60 font-mono">
            <span className="inline-block size-2 rounded-full bg-[#22c55e] animate-pulse" />
            CARGANDO PRECIOS...
          </div>
        ) : selectedProduct ? (
          <ComparisonTable prices={selectedProduct.prices} />
        ) : (
          <div className="text-sm text-foreground/60 font-medium">
            No se encontró el producto.
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
