"use client"

import * as React from "react"
import Link from "next/link"
import { Gamepad2, ChevronLeft } from "lucide-react"
import { ComparisonTable } from "@/components/comparison-table"
import { Badge } from "@/components/badge"
import { getLatestPricesForProduct } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"

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

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#111111]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-white" />
            <span className="text-base font-bold tracking-tight text-white">
              Comparador Gaming
            </span>
          </Link>
          <Badge className="bg-[#166534] text-white text-[10px] uppercase tracking-widest">
            Argentina
          </Badge>
        </div>
      </header>

      {/* ── Product Hero ── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={selectedProduct ? `/categoria/${selectedProduct.category}` : "/"}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-[#166534] w-fit transition-colors"
          >
            <ChevronLeft className="size-4" />
            {categoryName ? `Volver a ${categoryName}` : "Volver"}
          </Link>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {loading ? "Cargando..." : selectedProduct?.name ?? "Producto no encontrado"}
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Comparativa de precios en las principales tiendas de Argentina.
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="text-sm text-foreground/60">Cargando precios…</div>
        ) : selectedProduct ? (
          <ComparisonTable prices={selectedProduct.prices} />
        ) : (
          <div className="text-sm text-foreground/60">
            No se encontró el producto.
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#111111] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-white" />
                <span className="text-sm font-bold">Comparador Gaming</span>
              </div>
              <p className="text-xs text-gray-300 font-medium max-w-xs">
                Compará precios de hardware y periféricos gaming en las principales tiendas de Argentina.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Tiendas comparadas
              </span>
              <ul className="flex flex-col gap-1 text-xs text-gray-300 font-medium">
                <li>Compragamer</li>
                <li>Mexx</li>
                <li>Fullhard</li>
                <li>Maximus Gaming</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-400">
            Precios actualizados periódicamente. No nos hacemos responsables por errores de precios.
          </div>
        </div>
      </footer>

    </div>
  )
}