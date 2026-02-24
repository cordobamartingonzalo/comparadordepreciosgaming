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
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
              <Gamepad2 className="size-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Comparador Gaming
            </span>
          </Link>
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase tracking-widest">
            Argentina
          </Badge>
        </div>
      </header>

      {/* ── Category hero ── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--glow),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Volver a categorias
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <Icon className="size-6 sm:size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {categoryName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {"Elegi un producto para comparar precios entre tiendas."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product grid ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-sm">Cargando productos...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <PackageOpen className="size-10 text-muted-foreground/50" />
            <span className="text-sm">
              No hay productos disponibles en esta categoria aun.
            </span>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between">
              <span className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "producto" : "productos"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <Link key={p.id} href={`/producto/${p.id}`} className="group">
                  <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_24px_-6px] hover:shadow-primary/20 sm:p-5">
                    <span className="text-sm font-semibold leading-snug text-card-foreground sm:text-base">
                      {p.name}
                    </span>
                    <span className="mt-4 flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                      Ver comparativa
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
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 lg:px-8">
          <span className="text-xs text-muted-foreground">
            Comparador Gaming Argentina
          </span>
          <span className="text-xs text-muted-foreground">
            Precios actualizados periodicamente
          </span>
        </div>
      </footer>
    </div>
  )
}
