"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { searchProducts } from "@/lib/db"
import type { ProductRow } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"

function getCategoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}

export function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<ProductRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Debounced search — fires 300 ms after the user stops typing
  React.useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchProducts(q)
        setResults(data)
        setOpen(true)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on outside click
  React.useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  function navigate(id: string) {
    router.push(`/producto/${id}`)
    setOpen(false)
    setQuery("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (results.length === 1) navigate(results[0].id)
  }

  const showNoResults = open && query.trim().length >= 2 && !loading && results.length === 0

  return (
    <div ref={containerRef} className="relative mt-6 max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex items-center border border-[#22c55e] bg-white shadow-[0_0_16px_#22c55e20]"
      >
        <div className="flex items-center px-3 text-[#22c55e]">
          <Search className="size-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar producto... (ej: RTX 4060)"
          className="flex-1 py-2.5 pr-3 text-sm font-medium bg-transparent text-foreground placeholder:text-foreground/40 outline-none font-mono"
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-3 py-2.5 bg-[#22c55e] text-[#0a0a0a] text-xs font-mono font-bold tracking-widest uppercase shrink-0"
        >
          {loading ? "···" : "BUSCAR"}
        </button>
      </form>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#22c55e]/40 border-t-0 shadow-[0_8px_24px_#22c55e15] max-h-72 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[#22c55e]/5 border-b border-border last:border-b-0 transition-colors"
            >
              <span className="text-sm font-medium text-foreground truncate pr-2">
                {p.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22c55e] shrink-0">
                {getCategoryName(p.category)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showNoResults && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#22c55e]/40 border-t-0 shadow-[0_8px_24px_#22c55e15] px-3 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">
            SIN RESULTADOS PARA "{query.trim().toUpperCase()}"
          </span>
        </div>
      )}
    </div>
  )
}
