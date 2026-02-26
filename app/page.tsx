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
  Search,
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
      <header className="sticky top-0 z-40 border-b-2 border-neon bg-[#0f172a]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Gamepad2 className="size-5 text-neon" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">
              COMPARADOR GAMING
            </span>
          </Link>
          <Badge className="rounded-sm border-neon bg-neon text-neon-foreground text-[10px] font-mono uppercase tracking-widest hover:bg-neon/90">
            ARGENTINA
          </Badge>
        </div>
      </header>

      {/* ── Hero with scanline texture ── */}
      <section className="relative overflow-hidden border-b-2 border-neon/30 bg-[#0f172a]">
        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #22c55e 2px, #22c55e 4px)",
          }}
        />
        {/* Dot grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(#22c55e 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-20">
          <h2 className="font-mono text-2xl font-bold uppercase tracking-widest text-white sm:text-3xl lg:text-4xl">
            {"COMPARA PRECIOS GAMING"}
            <br />
            <span className="text-neon">{"EN ARGENTINA"}</span>
          </h2>
          <p className="mt-4 max-w-lg font-mono text-sm leading-relaxed tracking-wide text-slate-400">
            {"// Encontra el mejor precio entre Compragamer, Mexx, Fullhard y Maximus Gaming."}
          </p>

          {/* Search bar placeholder */}
          <div className="mt-8 flex max-w-xl items-stretch">
            <div className="flex flex-1 items-center gap-2 border-2 border-neon/40 bg-[#1e293b] px-4 py-3">
              <Search className="size-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-500">
                {"// BUSCAR PRODUCTO..."}
              </span>
            </div>
            <button className="flex items-center gap-2 bg-neon px-5 font-mono text-sm font-bold uppercase tracking-widest text-neon-foreground transition-colors hover:bg-neon/90">
              BUSCAR
            </button>
          </div>
        </div>
      </section>

      {/* ── Categories grid ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8 lg:py-12">
        {/* Terminal-style section label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon">
            {"[ CATEGORIAS ]"}
          </span>
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {CATEGORIES.length} items
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
                <div className="relative flex h-full flex-col gap-3 border border-border bg-card p-3 transition-all duration-150 hover:border-neon hover:shadow-[0_0_16px_-4px] hover:shadow-neon/30 sm:p-4">
                  {/* Neon left border accent */}
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-neon/40 transition-colors group-hover:bg-neon" />

                  {/* Icon */}
                  <div className="flex size-8 items-center justify-center border border-neon/30 bg-neon/10 text-neon sm:size-9">
                    <Icon className="size-4 sm:size-5" />
                  </div>

                  {/* Name */}
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground sm:text-sm">
                    {cat.name}
                  </span>

                  {/* CTA */}
                  <span className="mt-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-neon sm:text-xs">
                    VER PRODUCTOS
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-neon bg-[#0f172a]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-neon" />
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                COMPARADOR GAMING
              </span>
            </div>
            <p className="max-w-xs font-mono text-xs leading-relaxed tracking-wide text-slate-500">
              {"// Compara precios de hardware gaming en las mejores tiendas online de Argentina."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
              {"[ TIENDAS COMPARADAS ]"}
            </span>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {["COMPRAGAMER", "MEXX", "FULLHARD", "MAXIMUS"].map((store) => (
                <span
                  key={store}
                  className="border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300"
                >
                  {store}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
            <span className="font-mono text-[10px] tracking-widest text-slate-600">
              {"// COMPARADOR GAMING AR — PRECIOS ORIENTATIVOS"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
