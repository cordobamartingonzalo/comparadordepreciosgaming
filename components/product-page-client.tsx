"use client"

import * as React from "react"
import Link from "next/link"
import { Gamepad2, ArrowLeft, Loader2, PackageX } from "lucide-react"
import { Badge } from "@/components/badge"
import { ComparisonTable } from "@/components/comparison-table"
import { getLatestPricesForProduct } from "@/lib/db"

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
        const { product, prices } =
          await getLatestPricesForProduct(productId)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              PrecioGamer
            </span>
            <Badge variant="outline" className="hidden border-primary/30 text-primary text-[10px] sm:inline-flex">
              AR
            </Badge>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        {/* Breadcrumb / back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver a productos</span>
        </Link>

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Cargando precios...</span>
          </div>
        ) : selectedProduct ? (
          <div className="flex flex-col gap-6">
            {/* Product header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedProduct.category}
                </Badge>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl text-balance">
                {selectedProduct.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Comparando precios en {selectedProduct.prices.length} tienda{selectedProduct.prices.length !== 1 ? "s" : ""} de Argentina
              </p>
            </div>

            {/* Comparison table */}
            <ComparisonTable prices={selectedProduct.prices} />
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <PackageX className="size-8 opacity-40" />
            <span className="text-sm">No se encontro el producto.</span>
            <Link
              href="/"
              className="text-xs text-primary hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
          <span className="text-xs text-muted-foreground">
            PrecioGamer - Precios actualizados de hardware gaming en Argentina
          </span>
        </div>
      </footer>
    </div>
  )
}
