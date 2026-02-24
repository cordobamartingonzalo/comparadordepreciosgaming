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
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-primary" />
            <span className="text-base font-bold tracking-tight text-foreground">
              Comparador Gaming
            </span>
          </Link>
          <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest">
            Argentina
          </Badge>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-16">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {"Encontra el mejor precio para tu"}
            <span className="text-primary">{" setup gaming"}</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base">
            Compara precios de hardware en las principales tiendas de Argentina. Actualizado constantemente.
          </p>
        </div>
      </section>

      {/* ── Categories ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Categorias</h3>
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
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:border-primary/50 hover:shadow-sm sm:gap-3 sm:p-4">
                  {/* Icon */}
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary sm:size-9">
                    <Icon className="size-4 sm:size-5" />
                  </div>

                  {/* Name */}
                  <span className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>

                  {/* CTA */}
                  <span className="mt-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
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
      <footer className="border-t border-border">
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
