"use client"

import Link from "next/link"
import * as React from "react"
import { Gamepad2, Search } from "lucide-react"
import { Input } from "@/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
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
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Buscar producto</h2>
          <p className="text-sm text-muted-foreground">
            Elegí un producto para ver la comparación por tienda.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-4">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: RTX 4060, Ryzen 5 5600, SSD 1TB"
          />
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-muted-foreground">
            Cargando productos…
          </div>
        ) : results.length === 0 ? (
          <div className="mt-6 text-sm text-muted-foreground">
            No se encontraron productos.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {results.slice(0, 12).map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`}>
                <Card className="transition hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {p.category}
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