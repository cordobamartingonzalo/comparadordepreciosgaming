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
        className="flex items-center border border-black/12 bg-[#FEFCF7] rounded-md overflow-hidden focus-within:border-[#00C88A] focus-within:shadow-[0_0_0_3px_#00C88A15] transition-all"
      >
        <div className="flex items-center px-3 text-[#7A7870]">
          <Search className="size-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar producto... (ej: RTX 4060)"
          className="flex-1 py-2.5 pr-3 text-sm bg-transparent text-[#1C1C1A] placeholder:text-[#7A7870]/60 outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#1C1C1A] text-[#F5F0E8] text-xs font-mono tracking-widest uppercase shrink-0 hover:bg-[#00C88A] hover:text-[#003D2A] transition-colors"
        >
          {loading ? "···" : "Buscar"}
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#FEFCF7] border border-black/10 border-t-0 rounded-b-md shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#00C88A]/5 border-b border-black/5 last:border-b-0 transition-colors"
            >
              <span className="text-sm text-[#1C1C1A] truncate pr-2">{p.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00C88A] shrink-0">
                {getCategoryName(p.category)}
              </span>
            </button>
          ))}
        </div>
      )}

      {showNoResults && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#FEFCF7] border border-black/10 border-t-0 rounded-b-md shadow-[0_8px_24px_rgba(0,0,0,0.08)] px-4 py-3">
          <span className="font-mono text-xs text-[#7A7870]">
            Sin resultados para "{query.trim()}"
          </span>
        </div>
      )}
    </div>
  )
}
