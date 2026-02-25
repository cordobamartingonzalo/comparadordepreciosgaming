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
      return new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime()
    })
    return base
  }, [prices, onlyInStock, sort])

  return (
    <div className="flex flex-col gap-4">

      {/* ── Controls ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <div className="text-sm">
            <div className="font-medium text-foreground">Solo en stock</div>
            <div className="text-xs text-muted-foreground">Oculta tiendas sin stock</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc">Precio (menor a mayor)</SelectItem>
              <SelectItem value="priceDesc">Precio (mayor a menor)</SelectItem>
              <SelectItem value="updated">Actualización</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[220px] font-semibold text-foreground">Tienda</TableHead>
              <TableHead className="font-semibold text-foreground">Precio</TableHead>
              <TableHead className="font-semibold text-foreground">Envío</TableHead>
              <TableHead className="font-semibold text-foreground">Stock</TableHead>
              <TableHead className="font-semibold text-foreground">Actualizado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const isBest = bestPrice?.storeId === p.storeId && p.inStock
              return (
                <TableRow
                  key={p.storeId}
                  className={[
                    "transition-colors hover:bg-gray-50",
                    isBest ? "border-l-2 border-l-[#166534]" : "",
                  ].join(" ")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{p.storeName}</span>
                      {isBest && (
                        <Badge className="bg-[#166534] text-white hover:bg-[#166534]">
                          Mejor precio
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-lg font-bold ${isBest ? "text-[#166534]" : "text-foreground"}`}>
                      {formatARS(p.priceArs)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.shippingLabel ?? "N/D"}
                  </TableCell>
                  <TableCell>
                    {p.inStock ? (
                      <Badge className="bg-[#166534] text-white hover:bg-[#166534]">En stock</Badge>
                    ) : (
                      <Badge variant="destructive">Sin stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {relativeTimeFromISO(p.updatedAtISO)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      disabled={!p.inStock}
                      className="bg-[#166534] text-white hover:bg-[#14532d]"
                    >
                      <a href={p.url} target="_blank" rel="noreferrer">
                        Ir a la tienda
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No hay resultados con esos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile: cards ── */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((p) => {
          const isBest = bestPrice?.storeId === p.storeId && p.inStock
          return (
            <div
              key={p.storeId}
              className={[
                "rounded-xl border bg-white p-4 flex flex-col gap-3",
                isBest ? "border-[#166534]" : "border-border",
              ].join(" ")}
            >
              {/* Tienda + badge */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{p.storeName}</span>
                {isBest && (
                  <Badge className="bg-[#166534] text-white hover:bg-[#166534]">
                    Mejor precio
                  </Badge>
                )}
              </div>

              {/* Precio + stock */}
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-extrabold ${isBest ? "text-[#166534]" : "text-foreground"}`}>
                  {formatARS(p.priceArs)}
                </span>
                {p.inStock ? (
                  <Badge className="bg-[#166534] text-white hover:bg-[#166534]">En stock</Badge>
                ) : (
                  <Badge variant="destructive">Sin stock</Badge>
                )}
              </div>

              {/* Envío + tiempo */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Envío: {p.shippingLabel ?? "N/D"}</span>
                <span>{relativeTimeFromISO(p.updatedAtISO)}</span>
              </div>

              {/* Botón */}
              <Button
                asChild
                disabled={!p.inStock}
                className="w-full bg-[#166534] text-white hover:bg-[#14532d]"
              >
                <a href={p.url} target="_blank" rel="noreferrer">
                  Ir a la tienda
                </a>
              </Button>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-muted-foreground">
            No hay resultados con esos filtros.
          </div>
        )}
      </div>

    </div>
  )
}