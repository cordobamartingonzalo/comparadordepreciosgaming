"use client"

import * as React from "react"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table"
import { Switch } from "@/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import {
  ExternalLink,
  Truck,
  Clock,
  TrendingDown,
  CircleCheck,
  CircleX,
  SlidersHorizontal,
} from "lucide-react"

export type StorePrice = {
  storeId: string
  storeName: string
  priceArs: number
  shippingLabel?: string
  inStock: boolean
  updatedAtISO: string
  url: string
}

function formatARS(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
}

function relativeTimeFromISO(iso: string) {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diffMin = Math.max(0, Math.round((now - t) / 60000))
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  const diffD = Math.round(diffH / 24)
  return `hace ${diffD} d`
}

function priceDiff(price: number, best: number): string | null {
  if (price <= best) return null
  const diff = price - best
  const pct = ((diff / best) * 100).toFixed(1)
  return `+${pct}%`
}

type SortKey = "priceAsc" | "priceDesc" | "updated"

export function ComparisonTable({ prices }: { prices: StorePrice[] }) {
  const [onlyInStock, setOnlyInStock] = React.useState(false)
  const [sort, setSort] = React.useState<SortKey>("priceAsc")

  const bestPrice = React.useMemo(() => {
    const inStock = prices.filter((p) => p.inStock)
    const pool = inStock.length ? inStock : prices
    if (!pool.length) return null
    return pool.reduce((min, cur) => (cur.priceArs < min.priceArs ? cur : min))
  }, [prices])

  const filtered = React.useMemo(() => {
    const base = onlyInStock ? prices.filter((p) => p.inStock) : prices.slice()
    base.sort((a, b) => {
      if (sort === "priceAsc") return a.priceArs - b.priceArs
      if (sort === "priceDesc") return b.priceArs - a.priceArs
      return (
        new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime()
      )
    })
    return base
  }, [prices, onlyInStock, sort])

  return (
    <div className="flex flex-col gap-4">
      {/* Best price summary card */}
      {bestPrice && bestPrice.inStock && (
        <div className="flex items-center gap-3 rounded-xl border border-best/20 bg-best-muted px-4 py-3">
          <TrendingDown className="size-5 shrink-0 text-best" />
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-sm font-semibold text-best">
              Mejor precio: {formatARS(bestPrice.priceArs)}
            </span>
            <span className="text-xs text-muted-foreground">
              en {bestPrice.storeName}
              {bestPrice.shippingLabel === "Gratis" ? " con envio gratis" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <span className="text-sm font-medium text-foreground">Solo en stock</span>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[200px] text-sm">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc">Menor precio primero</SelectItem>
              <SelectItem value="priceDesc">Mayor precio primero</SelectItem>
              <SelectItem value="updated">Mas reciente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card hover:bg-card">
              <TableHead className="w-[220px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tienda
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Precio
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Envio
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stock
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actualizado
              </TableHead>
              <TableHead className="w-[100px]">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const isBest = bestPrice?.storeId === p.storeId && p.inStock
              const diff = bestPrice
                ? priceDiff(p.priceArs, bestPrice.priceArs)
                : null

              return (
                <TableRow
                  key={p.storeId}
                  className={[
                    "transition-colors border-border",
                    isBest
                      ? "bg-best-muted hover:bg-best-muted"
                      : "hover:bg-muted/30",
                    !p.inStock ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isBest ? "text-best" : "text-foreground"}`}>
                        {p.storeName}
                      </span>
                      {isBest && (
                        <Badge className="border-0 bg-best text-best-foreground text-[10px] hover:bg-best">
                          Mejor precio
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-base font-bold tabular-nums ${
                          isBest ? "text-best" : "text-foreground"
                        }`}
                      >
                        {formatARS(p.priceArs)}
                      </span>
                      {diff && !isBest && (
                        <span className="text-xs text-muted-foreground">
                          {diff}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Truck className="size-3.5" />
                      <span className={p.shippingLabel === "Gratis" ? "text-best" : ""}>
                        {p.shippingLabel ?? "N/D"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {p.inStock ? (
                      <div className="flex items-center gap-1.5 text-sm text-best">
                        <CircleCheck className="size-3.5" />
                        <span>En stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-destructive">
                        <CircleX className="size-3.5" />
                        <span>Sin stock</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>{relativeTimeFromISO(p.updatedAtISO)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      asChild
                      size="sm"
                      variant={isBest ? "default" : "outline"}
                      className={isBest ? "bg-best text-best-foreground hover:bg-best/90" : ""}
                      disabled={!p.inStock}
                    >
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="gap-1.5"
                      >
                        <span>Ir a tienda</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {!filtered.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No hay resultados con esos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((p) => {
          const isBest = bestPrice?.storeId === p.storeId && p.inStock
          const diff = bestPrice
            ? priceDiff(p.priceArs, bestPrice.priceArs)
            : null

          return (
            <div
              key={p.storeId}
              className={[
                "rounded-xl border p-4 transition-colors",
                isBest
                  ? "border-best/30 bg-best-muted"
                  : "border-border bg-card",
                !p.inStock ? "opacity-60" : "",
              ].join(" ")}
            >
              {/* Store name + badge */}
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isBest ? "text-best" : "text-foreground"}`}>
                  {p.storeName}
                </span>
                {isBest && (
                  <Badge className="border-0 bg-best text-best-foreground text-[10px] hover:bg-best">
                    Mejor precio
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-xl font-bold tabular-nums ${
                    isBest ? "text-best" : "text-foreground"
                  }`}
                >
                  {formatARS(p.priceArs)}
                </span>
                {diff && !isBest && (
                  <span className="text-xs text-muted-foreground">{diff}</span>
                )}
              </div>

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="size-3" />
                  <span className={p.shippingLabel === "Gratis" ? "text-best" : ""}>
                    {p.shippingLabel ?? "N/D"}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  {p.inStock ? (
                    <>
                      <CircleCheck className="size-3 text-best" />
                      <span className="text-best">En stock</span>
                    </>
                  ) : (
                    <>
                      <CircleX className="size-3 text-destructive" />
                      <span className="text-destructive">Sin stock</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {relativeTimeFromISO(p.updatedAtISO)}
                </span>
              </div>

              {/* CTA */}
              <div className="mt-3">
                <Button
                  asChild
                  size="sm"
                  variant={isBest ? "default" : "outline"}
                  className={[
                    "w-full gap-1.5",
                    isBest ? "bg-best text-best-foreground hover:bg-best/90" : "",
                  ].join(" ")}
                  disabled={!p.inStock}
                >
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <span>Ir a tienda</span>
                    <ExternalLink className="size-3" />
                  </a>
                </Button>
              </div>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No hay resultados con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
