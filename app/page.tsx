"use client"

import Link from "next/link"
import * as React from "react"
import { Gamepad2, Search, ChevronRight, Loader2, PackageSearch } from "lucide-react"
import { Input } from "@/components/input"
import { Badge } from "@/components/badge"
import { getProducts, type ProductRow } from "@/lib/db"

export default function HomePage() {
  const [q, setQ] = React.useState("")
  const [products, setProducts] = React.useState<ProductRow[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const results = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return products
    return products.filter((p) => p.name.toLowerCase().includes(s))
  }, [q, products])

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

      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12">
        {/* Hero section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance lg:text-3xl">
            Compara precios de hardware gaming
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base">
            Encontra el mejor precio en las principales tiendas de Argentina. Busca tu componente y compara al instante.
          </p>
        </div>

        {/* Search */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: RTX 4060, Ryzen 5 5600, SSD 1TB..."
            className="border-0 bg-transparent p-0 shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />
          {q && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Product count */}
        {!loading && !q && (
          <p className="mt-4 text-xs text-muted-foreground">
            {products.length} productos disponibles
          </p>
        )}

        {/* Results */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Cargando productos...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <PackageSearch className="size-8 opacity-40" />
            <span className="text-sm">No se encontraron productos.</span>
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-xs text-primary hover:underline"
              >
                Limpiar busqueda
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 18).map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`}>
                <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-all hover:border-primary/30 hover:bg-accent">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.category}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
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
