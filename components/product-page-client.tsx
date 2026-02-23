"use client"

import * as React from "react"
import { Gamepad2, Search, Wrench } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs"
import { ComparisonTable } from "@/components/comparison-table"
import { ThemeToggle } from "@/components/theme-toggle"
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
    console.log("ID recibido en frontend:", productId)

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="size-5 text-foreground" />
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Comparador Gaming
            </h1>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Argentina
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
        <Tabs defaultValue="comparador" className="gap-6">
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="comparador" className="flex-1 gap-1.5">
              <Search className="size-3.5" />
              Comparador
            </TabsTrigger>
            <TabsTrigger value="buscador" className="flex-1 gap-1.5">
              <Search className="size-3.5" />
              Buscador
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex-1 gap-1.5">
              <Wrench className="size-3.5" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparador" className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedProduct ? selectedProduct.name : "Cargando..."}
              </h2>
              <p className="text-sm text-muted-foreground">
                Compara precios en las principales tiendas de Argentina.
              </p>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">
                Cargando precios…
              </div>
            ) : selectedProduct ? (
              <ComparisonTable prices={selectedProduct.prices} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No se encontró el producto.
              </div>
            )}
          </TabsContent>

          <TabsContent value="buscador">
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20">
              <Search className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Buscador de productos - Próximamente
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20">
              <Wrench className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Herramientas - Próximamente
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}