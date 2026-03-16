"use client"

import Link from "next/link"
import {
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Box,
  Tv,
  Mouse,
  ArrowRight,
} from "lucide-react"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchBox } from "@/components/search-box"

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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-black/8 bg-[#FEFCF7]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8 lg:py-20">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#00C88A] mb-4">
            Argentina · Actualizado diariamente
          </div>
          <h1 className="font-serif text-3xl text-[#1C1C1A] sm:text-4xl lg:text-5xl leading-[1.15] max-w-2xl">
            Encontrá el mejor precio<br />
            <em className="text-[#7A7870]">para tu próxima build</em>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#7A7870] lg:text-base">
            Comparamos precios de hardware gaming en las principales tiendas de Argentina en tiempo real.
          </p>
          <SearchBox />
        </div>
      </section>

      {/* Categories */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 lg:px-8 lg:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#1C1C1A]">
              Explorar hardware
            </h2>
            <p className="mt-1 text-sm text-[#7A7870]">
              Seleccioná una categoría para comparar precios.
            </p>
          </div>
          <span className="hidden text-xs text-[#7A7870] font-mono sm:block">
            {CATEGORIES.length} categorías
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="flex h-full flex-col gap-3 border border-black/8 bg-[#FEFCF7] p-4 rounded-md transition-all duration-150 hover:border-[#00C88A]/40 hover:shadow-[0_4px_20px_#00C88A15]">
                  <div className="flex size-9 items-center justify-center bg-[#00C88A]/10 text-[#00C88A] rounded-sm">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-[#1C1C1A]">
                    {cat.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 text-xs text-[#7A7870] font-mono transition-colors group-hover:text-[#00C88A]">
                    Ver productos
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
