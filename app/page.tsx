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

      {/* ── Hero ── */}
      <section
        className="border-b border-border relative overflow-hidden"
        style={{
          background: "#f8fafc",
          backgroundImage: "radial-gradient(circle, #22c55e1a 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-20">
          <div className="font-mono text-xs tracking-widest uppercase text-[#22c55e] mb-3">
            // COMPARADOR DE PRECIOS
          </div>
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl uppercase">
            Encontrá el mejor precio<br className="hidden sm:block" />
            para tu <span className="text-[#22c55e]">setup gaming</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/75 font-medium lg:text-base">
            Compará precios de hardware en las principales tiendas de Argentina. Actualizado constantemente.
          </p>

          <SearchBox />
        </div>
      </section>

      {/* ── Categories ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#22c55e] mb-1">
              // CATEGORÍAS
            </div>
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Explorar Hardware
            </h3>
            <p className="mt-0.5 text-sm text-foreground/75 font-medium">
              Seleccioná una categoría para comparar precios.
            </p>
          </div>
          <span className="hidden text-xs text-foreground/60 font-mono sm:block">
            {CATEGORIES.length} CATEGORÍAS
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="flex h-full flex-col gap-2 border border-border border-l-2 border-l-[#22c55e] bg-card p-3 transition-all duration-150 hover:shadow-[0_0_16px_#22c55e25] hover:border-[#22c55e]/40 sm:gap-3 sm:p-4">
                  <div className="flex size-8 items-center justify-center bg-[#22c55e]/10 text-[#22c55e] sm:size-9">
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {cat.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 text-xs text-foreground/60 font-mono transition-colors group-hover:text-[#22c55e]">
                    VER PRODUCTOS
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
