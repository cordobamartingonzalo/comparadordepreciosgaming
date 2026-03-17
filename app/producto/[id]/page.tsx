import Link from "next/link"
import { notFound } from "next/navigation"
import { Gamepad2 } from "lucide-react"
import { getLatestPricesForProduct } from "@/lib/db"
import { ProductPageClient } from "@/components/product-page-client"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Metadata } from "next"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const { product } = await getLatestPricesForProduct(id)
    return {
      title: `${product.name} - Precio en Argentina | Precios GG`,
      description: `Compará precios de ${product.name} en Compragamer, Mexx, Fullhard y Maximus Gaming. Actualizados diariamente.`,
    }
  } catch {
    return { title: "Producto | Precios GG" }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  let data: Awaited<ReturnType<typeof getLatestPricesForProduct>>
  try {
    data = await getLatestPricesForProduct(id)
  } catch {
    notFound()
  }

  const { product, prices } = data!

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="size-5 text-foreground" />
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
            >
              Comparador Gaming
            </Link>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Argentina
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            {product.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Comparativa de precios en las principales tiendas de Argentina.
          </p>
        </div>

        <ProductPageClient prices={prices} />
      </main>
    </div>
  )
}
