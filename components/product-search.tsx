"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/input"
import { catalog, type ProductWithPrices } from "@/lib/mock-data"

export function ProductSearch({
  selectedProduct,
  onSelect,
}: {
  selectedProduct: ProductWithPrices | null
  onSelect: (p: ProductWithPrices) => void
}) {
  const [query, setQuery] = React.useState("")

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((p) => p.name.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto (ej: RTX 4060, Ryzen 5 5600, SSD 1TB)"
        />
      </div>

      <div className="mt-3 grid gap-2">
        {results.slice(0, 8).map((p) => {
          const active = selectedProduct?.id === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={[
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left transition",
                active ? "border-foreground/30 bg-muted/50" : "hover:bg-muted/40",
              ].join(" ")}
            >
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {p.prices.length} tiendas
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}