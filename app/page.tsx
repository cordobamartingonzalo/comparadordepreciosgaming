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
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#111111]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-white" />
            <span className="text-base font-bold tracking-tight text-white">
              Comparador Gaming
            </span>
          </Link>
          <Badge className="rounded-md bg-[#166534] text-white text-[10px] uppercase tracking-widest border-transparent hover:bg-[#166534]">
            Argentina
          </Badge>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {"Encontra el mejor precio para tu"}
            <span className="text-[#166534]">{" setup gaming"}</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base">
            Compara precios de hardware en las principales tiendas de Argentina.
            Actualizado constantemente.
          </p>
        </div>
      </section>

      {/* ── Categories ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Categorias
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Selecciona una categoria para explorar productos.
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
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
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-[#166534] hover:shadow-sm sm:gap-3 sm:p-4">
                  {/* Icon */}
                  <div className="flex size-8 items-center justify-center rounded-md bg-[#f0fdf4] text-[#166534] sm:size-9">
                    <Icon className="size-4 sm:size-5" />
                  </div>

                  {/* Name */}
                  <span className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>

                  {/* CTA */}
                  <span className="mt-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-[#166534]">
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
      <footer className="bg-[#111111]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:px-8">
          {/* Left column */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-white" />
              <span className="text-sm font-bold text-white">
                Comparador Gaming
              </span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-[#9ca3af]">
              Compara precios de hardware gaming en las mejores tiendas online
              de Argentina. Encontra las mejores ofertas al instante.
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            <span className="text-xs text-[#9ca3af]">
              Precios actualizados periodicamente
            </span>
            <span className="text-xs text-[#9ca3af]">
              Tiendas comparadas:
            </span>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {["Compragamer", "Mexx", "Fullhard", "Maximus"].map((store) => (
                <span
                  key={store}
                  className="rounded bg-[#1f2937] px-2 py-0.5 text-[11px] font-medium text-[#d1d5db]"
                >
                  {store}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-[#1f2937]">
          <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
            <span className="text-[11px] text-[#6b7280]">
              Comparador Gaming Argentina. Los precios son orientativos.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
