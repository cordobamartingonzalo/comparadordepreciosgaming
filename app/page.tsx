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

      {/* ── Hero section ── */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Glow effect */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--glow),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-20">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {"Encontra el mejor precio para tu"}
            <span className="text-primary">{" setup gaming"}</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            Compara precios de hardware en las principales tiendas de Argentina. Actualizado constantemente.
          </p>
        </div>
      </section>

      {/* ── Categories grid ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Categorias</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona una categoria para explorar productos.
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {CATEGORIES.length} categorias
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="relative flex h-full flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-5 text-center transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_24px_-6px] hover:shadow-primary/20 sm:p-6">
                  {/* Icon container */}
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 sm:size-14">
                    <Icon className="size-6 sm:size-7" />
                  </div>

                  {/* Name */}
                  <span className="text-sm font-semibold text-card-foreground sm:text-base">
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
