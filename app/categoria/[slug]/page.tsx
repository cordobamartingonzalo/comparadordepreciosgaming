"use client"

import Link from "next/link"
import * as React from "react"
import {
  Gamepad2,
  ChevronLeft,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Box,
  Tv,
  Mouse,
  ArrowRight,
  PackageOpen,
} from "lucide-react"
import { Badge } from "@/components/badge"
import { getProductsByCategory, type ProductRow } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"

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
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#111111]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-white" />
            <span className="text-base font-bold tracking-tight text-white">
              Comparador Gaming
            </span>
          </Link>
          <Badge className="bg-[#166534] text-white text-[10px] uppercase tracking-widest">
            Argentina
          </Badge>
        </div>
      </header>

      {/* ── Category Hero ── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href="/"
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-[#166534] w-fit transition-colors"
          >
            <ChevronLeft className="size-4" />
            Volver a categorías
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#166534]">
              <Icon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                {categoryName}
              </h2>
              <p className="text-sm text-foreground/60">
                Elegí un producto para comparar precios entre tiendas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="text-sm text-foreground/60">Cargando productos…</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <PackageOpen className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-foreground/60">
              No hay productos disponibles en esta categoría aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="group">
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-[#166534]/50 hover:shadow-sm sm:gap-3 sm:p-4">
                  <span className="text-sm font-semibold text-foreground">
                    {p.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-[#166534]">
                    Ver comparativa
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#111111] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-white" />
                <span className="text-sm font-bold">Comparador Gaming</span>
              </div>
              <p className="text-xs text-gray-300 font-medium max-w-xs">
                Compará precios de hardware y periféricos gaming en las principales tiendas de Argentina.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Tiendas comparadas
              </span>
              <ul className="flex flex-col gap-1 text-xs text-gray-300 font-medium">
                <li>Compragamer</li>
                <li>Mexx</li>
                <li>Fullhard</li>
                <li>Maximus Gaming</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-400">
            Precios actualizados periódicamente. No nos hacemos responsables por errores de precios.
          </div>
        </div>
      </footer>

    </div>
  )
}