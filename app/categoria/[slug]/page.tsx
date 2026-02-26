"use client"

import Link from "next/link"
import * as React from "react"
import {
  Gamepad2,
  ChevronLeft,
  ArrowRight,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Box,
  Tv,
  Mouse,
  Loader2,
  PackageOpen,
} from "lucide-react"
import { getProductsByCategory, type ProductRow } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import { Badge } from "@/components/badge"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "tarjetas-de-video": Monitor,
  procesadores: Cpu,
  almacenamiento: HardDrive,
  "memorias-ram": MemoryStick,
  "placas-madre": CircuitBoard,
  gabinetes: Box,
  monitores: Tv,
  perifericos: Mouse,
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [slug, setSlug] = React.useState<string>("")
  const [products, setProducts] = React.useState<ProductRow[]>([])
  const [loading, setLoading] = React.useState(true)

  const category = CATEGORIES.find((c) => c.slug === slug)
  const categoryName = category?.name ?? slug
  const Icon = CATEGORY_ICONS[slug] ?? Box

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
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b-2 border-neon bg-[#0f172a]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Gamepad2 className="size-5 text-neon" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">
              COMPARADOR GAMING
            </span>
          </Link>
          <Badge className="rounded-sm border-neon bg-neon text-neon-foreground text-[10px] font-mono uppercase tracking-widest hover:bg-neon/90">
            ARGENTINA
          </Badge>
        </div>
      </header>

      {/* ── Category header ── */}
      <section className="relative overflow-hidden border-b-2 border-neon/30 bg-[#0f172a]">
        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #22c55e 2px, #22c55e 4px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-neon"
          >
            <ChevronLeft className="size-4" />
            {"< VOLVER"}
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center border border-neon/30 bg-neon/10 text-neon sm:size-12">
              <Icon className="size-5 sm:size-6" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white sm:text-2xl">
                {categoryName}
              </h2>
              <p className="mt-1 font-mono text-xs tracking-wide text-slate-500">
                {"// Elegi un producto para comparar precios entre tiendas."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product grid ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-neon" />
            <span className="font-mono text-xs uppercase tracking-widest">
              CARGANDO PRODUCTOS...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <PackageOpen className="size-10 text-muted-foreground/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {"// NO HAY PRODUCTOS DISPONIBLES AUN"}
            </span>
          </div>
        ) : (
          <>
            {/* Terminal-style section label */}
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon">
                {"[ PRODUCTOS ]"}
              </span>
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {products.length}{" "}
                {products.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  className="group"
                >
                  <div className="relative flex h-full flex-col justify-between border border-border bg-card p-3 transition-all duration-150 hover:border-neon hover:shadow-[0_0_16px_-4px] hover:shadow-neon/30 sm:p-4">
                    {/* Neon left border accent */}
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-neon/40 transition-colors group-hover:bg-neon" />

                    <span className="font-mono text-xs font-bold uppercase leading-snug tracking-wider text-foreground sm:text-sm">
                      {p.name}
                    </span>
                    <span className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-neon sm:text-xs">
                      VER PRECIOS
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-neon bg-[#0f172a]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-neon" />
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                COMPARADOR GAMING
              </span>
            </div>
            <p className="max-w-xs font-mono text-xs leading-relaxed tracking-wide text-slate-500">
              {"// Compara precios de hardware gaming en las mejores tiendas online de Argentina."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
              {"[ TIENDAS COMPARADAS ]"}
            </span>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {["COMPRAGAMER", "MEXX", "FULLHARD", "MAXIMUS"].map((store) => (
                <span
                  key={store}
                  className="border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300"
                >
                  {store}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
            <span className="font-mono text-[10px] tracking-widest text-slate-600">
              {"// COMPARADOR GAMING AR — PRECIOS ORIENTATIVOS"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
