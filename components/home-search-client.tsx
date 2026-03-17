"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import type { ProductRow } from "@/lib/db"

export function HomeSearchClient({ products }: { products: ProductRow[] }) {
  const [q, setQ] = React.useState("")

  const results = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return products
    return products.filter((p) => p.name.toLowerCase().includes(s))
  }, [q, products])

  return (
    <>
      <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-4">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej: RTX 4060, Ryzen 5 5600, SSD 1TB"
          autoComplete="off"
        />
      </div>

      {results.length === 0 ? (
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
    </>
  )
}
