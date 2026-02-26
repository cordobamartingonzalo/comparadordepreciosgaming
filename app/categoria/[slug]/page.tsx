"use client"

import Link from "next/link"
import * as React from "react"
import {
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
import { getProductsByCategory, type ProductRow } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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
      <Navbar />

      {/* Category Hero */}
      <section
        className="border-b-2 border-neon/30 bg-[#f8fafc]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #22c55e10 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href="/"
            className="mb-4 flex w-fit items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-neon"
          >
            <ChevronLeft className="size-4" />
            VOLVER A CATEGORIAS
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center border border-neon bg-neon/10 text-neon">
              <Icon className="size-5" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                {categoryName}
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {"// ELEGI UN PRODUCTO PARA COMPARAR PRECIOS"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="mb-5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-neon">
            {"[ PRODUCTOS ]"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="inline-block size-2 animate-pulse bg-neon" />
            CARGANDO PRODUCTOS...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
            <PackageOpen className="size-10 text-muted-foreground/40" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              NO HAY PRODUCTOS DISPONIBLES EN ESTA CATEGORIA
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="group">
                <div className="flex h-full flex-col gap-2 border-l-2 border-l-neon border-t border-r border-b border-border bg-card p-4 transition-all duration-150 hover:border-neon hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]">
                  <span className="inline-flex w-fit border border-neon/30 bg-neon/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon">
                    {categoryName}
                  </span>
                  <span className="font-sans text-sm font-bold text-foreground">
                    {p.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-neon">
                    {"VER PRECIOS ->"}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
