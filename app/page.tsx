"use client"

import Link from "next/link"
import {
  Gamepad2,
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

export default function HomePage() {
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

      {/* ── Hero ── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-16">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Encontra el mejor precio para tu
            <span className="text-[#166534]"> setup gaming</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/75 font-medium lg:text-base">
            Compara precios de hardware en las principales tiendas de Argentina. Actualizado constantemente.
          </p>
        </div>
      </section>

      {/* ── Categories ── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Categorías</h3>
            <p className="mt-0.5 text-sm text-foreground/75 font-medium">
              Seleccioná una categoría para explorar productos.
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {CATEGORIES.length} categorías
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-[#166534]/50 hover:shadow-sm sm:gap-3 sm:p-4">
                  <div className="flex size-8 items-center justify-center rounded-md bg-[#f0fdf4] text-[#166534] sm:size-9">
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>
                  <span className="mt-auto flex items-center gap-1 text-xs text-foreground/60 transition-colors group-hover:text-[#166534]">
                    Ver productos
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
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