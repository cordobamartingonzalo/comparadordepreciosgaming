"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import type { ProductRow } from "@/lib/db"

export function HomeSearchClient({ products }: { products: ProductRow[] }) {
  const [q, setQ] = React.useState("")

  const trimmed = q.trim().toLowerCase()

  const results = React.useMemo(() => {
    if (!trimmed) return []
    return products.filter((p) => p.name.toLowerCase().includes(trimmed))
  }, [trimmed, products])

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex items-center gap-2 border border-black/8 bg-[#FEFCF7] rounded-md px-3 py-2.5 focus-within:border-[#00C88A]/60 transition-colors">
        <Search className="size-4 shrink-0 text-[#7A7870]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej: RTX 4060, Ryzen 5 5600, SSD 1TB…"
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-[#1C1C1A] placeholder:text-[#7A7870] outline-none"
        />
      </div>

      {/* Resultados */}
      {trimmed && (
        results.length === 0 ? (
          <p className="text-sm text-[#7A7870]">No se encontraron productos para tu búsqueda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {results.slice(0, 12).map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="group">
                <div className="flex h-full flex-col gap-2 border border-black/8 bg-[#FEFCF7] rounded-md p-3 transition-all duration-150 hover:border-[#00C88A]/40 hover:shadow-[0_4px_20px_#00C88A15]">
                  <span className="text-sm font-medium text-[#1C1C1A] leading-snug">{p.name}</span>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#7A7870]">
                      {p.category}
                    </span>
                    <ArrowRight className="size-3 text-[#7A7870] transition-all group-hover:text-[#00C88A] group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
