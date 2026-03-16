"use client"

import Link from "next/link"
import * as React from "react"
import {
  ChevronLeft, Monitor, Cpu, HardDrive, MemoryStick,
  CircuitBoard, Box, Tv, Mouse, ArrowRight, PackageOpen,
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

export function CategoryPageClient({ params }: { params: Promise<{ slug: string }> }) {
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
      <Navbar />
      <section className="border-b border-black/8 bg-[#FEFCF7]">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
          <Link href="/" className="mb-5 flex items-center gap-1 text-xs font-mono tracking-widest text-[#7A7870] hover:text-[#00C88A] w-fit transition-colors">
            <ChevronLeft className="size-3.5" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-[#00C88A]/10 text-[#00C88A] rounded-sm">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-[#00C88A] mb-0.5">Categoría</div>
              <h1 className="font-serif text-2xl text-[#1C1C1A] sm:text-3xl">{categoryName}</h1>
              <p className="text-sm text-[#7A7870] mt-0.5">Elegí un producto para comparar precios entre tiendas.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#7A7870] font-mono">
            <span className="inline-block size-2 rounded-full bg-[#00C88A] animate-pulse" />
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <PackageOpen className="size-10 text-[#7A7870]/30" />
            <p className="text-sm text-[#7A7870]">No hay productos disponibles en esta categoría aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="group">
                <div className="flex h-full flex-col overflow-hidden border border-black/8 bg-[#FEFCF7] rounded-md transition-all duration-150 hover:border-[#00C88A]/40 hover:shadow-[0_4px_20px_#00C88A15]">
                  <div className="h-36 shrink-0 bg-[#EDE9E0] flex items-center justify-center rounded-t-md">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-3" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-[#7A7870]/40">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="1" ry="1" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-xs font-mono">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
                    <span className="text-sm font-medium text-[#1C1C1A]">{p.name}</span>
                    <span className="mt-auto flex items-center gap-1 text-xs text-[#7A7870] font-mono transition-colors group-hover:text-[#00C88A]">
                      Ver comparativa
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
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
