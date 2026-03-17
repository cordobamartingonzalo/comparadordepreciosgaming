"use client"

import { ComparisonTable } from "@/components/comparison-table"
import type { StorePrice } from "@/lib/db"

export function ProductPageClient({ prices }: { prices: StorePrice[] }) {
  if (!prices.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No hay precios disponibles para este producto todavía.
      </div>
    )
  }

  return <ComparisonTable prices={prices} />
}
