import {
  Monitor, Cpu, HardDrive, MemoryStick,
  CircuitBoard, Box, Tv, Mouse, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getProducts } from "@/lib/db"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HomeSearchClient } from "@/components/home-search-client"

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

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero + buscador */}
      <section className="border-b border-black/8 bg-[#FEFCF7]">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[#00C88A] mb-3">
            Argentina · Actualizado diariamente
          </div>
          <h1 className="font-serif text-3xl text-[#1C1C1A] sm:text-4xl lg:text-5xl max-w-2xl leading-tight">
            Encontrá el mejor precio para tu próxima build
          </h1>
          <p className="mt-3 text-sm text-[#7A7870] max-w-xl">
            Comparamos precios de hardware gaming en las principales tiendas de Argentina.
          </p>
          <div className="mt-6 max-w-xl">
            <HomeSearchClient products={products} />
          </div>
        </div>
      </section>

      {/* Grid de categorías */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 lg:px-8 lg:py-12">
        <div className="mb-6">
          <h2 className="font-serif text-xl text-[#1C1C1A] sm:text-2xl">Explorar hardware</h2>
          <p className="mt-1 text-sm text-[#7A7870]">Seleccioná una categoría para comparar precios.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Box
            return (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group">
                <div className="flex h-full flex-col gap-3 border border-black/8 bg-[#FEFCF7] rounded-md p-4 transition-all duration-150 hover:border-[#00C88A]/40 hover:shadow-[0_4px_20px_#00C88A15]">
                  <div className="flex size-9 items-center justify-center bg-[#00C88A]/10 text-[#00C88A] rounded-sm">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium text-[#1C1C1A] leading-snug">{cat.name}</span>
                    <span className="mt-auto flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-[#7A7870] transition-colors group-hover:text-[#00C88A]">
                      Ver productos
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
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
