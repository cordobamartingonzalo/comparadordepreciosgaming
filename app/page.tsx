"use client"

import Link from "next/link"
import { Gamepad2, Monitor, Cpu, HardDrive, MemoryStick, CircuitBoard, Box, Tv, Mouse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { CATEGORIES } from "@/lib/categories"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "tarjetas-de-video":  <Monitor className="size-6" />,
  "procesadores":       <Cpu className="size-6" />,
  "almacenamiento":     <HardDrive className="size-6" />,
  "memorias-ram":       <MemoryStick className="size-6" />,
  "placas-madre":       <CircuitBoard className="size-6" />,
  "gabinetes":          <Box className="size-6" />,
  "monitores":          <Tv className="size-6" />,
  "perifericos":        <Mouse className="size-6" />,
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="size-5 text-foreground" />
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Comparador Gaming
            </h1>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Argentina
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="text-sm text-muted-foreground">
            Elegí una categoría para ver los productos disponibles.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categoria/${cat.slug}`}>
              <Card className="transition hover:bg-muted/30 cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="text-muted-foreground mb-2">
                    {CATEGORY_ICONS[cat.slug] ?? <Box className="size-6" />}
                  </div>
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Ver productos →
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}