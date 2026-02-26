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
  Search,
} from "lucide-react"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import * as React from "react"

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
  const [searchQuery, setSearchQuery] = React.useState("")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero Section with scanline/grid texture */}
      <section
        className="relative border-b-2 border-neon/30 bg-[#f8fafc]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #22c55e10 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-neon">
                {"// COMPARADOR DE PRECIOS"}
              </span>
              <h1 className="text-balance font-sans text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                COMPARA PRECIOS
                <br />
                <span className="text-neon">GAMING EN ARGENTINA</span>
              </h1>
              <p className="max-w-lg font-sans text-sm leading-relaxed text-muted-foreground lg:text-base">
                Encontra el mejor precio entre Compragamer, Mexx, Fullhard y
                Maximus Gaming.
              </p>
            </div>

            {/* Search bar */}
            <div className="flex max-w-xl items-center border-2 border-neon bg-card">
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR PRODUCTO (EJ: RTX 4060, RYZEN 5)"
                  className="w-full bg-transparent font-mono text-xs uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
              <button className="flex h-full items-center bg-neon px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-neon-foreground transition-colors hover:bg-neon/90">
                BUSCAR
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-neon">
              {"[ CATEGORIAS ]"}
            </span>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Selecciona una categoria para explorar productos.
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
            {CATEGORIES.length} categorias
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group"
              >
                <div className="flex h-full flex-col gap-3 border border-border bg-card p-4 transition-all duration-150 hover:border-neon hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]">
                  <div className="border-l-2 border-neon pl-3">
                    <div className="flex size-9 items-center justify-center bg-neon/10 text-neon">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <span className="font-sans text-sm font-bold uppercase tracking-wide text-foreground">
                    {cat.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-neon">
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
