import { Gamepad2 } from "lucide-react"
import { getProducts } from "@/lib/db"
import { HomeSearchClient } from "@/components/home-search-client"

export default async function HomePage() {
  const products = await getProducts()

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
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Buscar producto</h2>
          <p className="text-sm text-muted-foreground">
            Elegí un producto para ver la comparación por tienda.
          </p>
        </div>
        <HomeSearchClient products={products} />
      </main>
    </div>
  )
}
