"use client"

import Link from "next/link"
import * as React from "react"
import { Gamepad2, ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { getProductsByCategory, type ProductRow } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [slug, setSlug] = React.useState<string>("")
  const [products, setProducts] = React.useState<ProductRow[]>([])
  const [loading, setLoading] = React.useState(true)

  const categoryName = CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

  React.useEffect(() => {
    ;(async () => {
      const { slug: resolvedSlug } = await params
      setSlug(resolvedSlug)
      try {
        const data = await getProductsByCategory(resolvedSlug)
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [params])

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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="flex flex-col gap-2 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
          >
            <ChevronLeft className="size-4" />
            Volver a categorías
          </Link>
          <h2 className="text-2xl font-bold">{categoryName}</h2>
          <p className="text-sm text-muted-foreground">
            Elegí un producto para comparar precios entre tiendas.
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando productos…</div>
        ) : products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No hay productos disponibles en esta categoría aún.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`}>
                <Card className="transition hover:bg-muted/30 cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Ver comparativa →
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}