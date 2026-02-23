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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
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
      return (
        new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime()
      )
    })
    return base
  }, [prices, onlyInStock, sort])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <div className="text-sm">
            <div className="font-medium">Solo en stock</div>
            <div className="text-xs text-muted-foreground">
              Oculta tiendas sin stock
            </div>
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

      {/* Desktop */}
      <div className="hidden md:block overflow-hidden rounded-xl border bg-background">
        <div className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[260px]">Tienda</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const isBest =
                  bestPrice?.storeId === p.storeId && p.inStock

                return (
                  <TableRow
                    key={p.storeId}
                    className={[
                      "transition-colors hover:bg-muted/40",
                      isBest ? "bg-muted/50" : "",
                    ].join(" ")}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.storeName}</span>
                        {isBest ? (
                        <Badge className="bg-green-500 text-white hover:bg-green-600">Mejor precio</Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold">
                      {formatARS(p.priceArs)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {p.shippingLabel ?? "N/D"}
                    </TableCell>

                    <TableCell>
                      {p.inStock ? (
                        <Badge>En stock</Badge>
                      ) : (
                        <Badge variant="destructive">Sin stock</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {relativeTimeFromISO(p.updatedAtISO)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button asChild disabled={!p.inStock}>
                        <a href={p.url} target="_blank" rel="noreferrer">
                          Ir
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}

              {!filtered.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No hay resultados con esos filtros.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden grid gap-3">
        {filtered.map((p) => {
          const isBest =
            bestPrice?.storeId === p.storeId && p.inStock

          return (
            <Card key={p.storeId} className={isBest ? "bg-muted/40" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.storeName}</CardTitle>
                  {isBest ? (
                    <Badge className="bg-green-500 text-white hover:bg-green-600">Mejor precio</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-semibold">
                    {formatARS(p.priceArs)}
                  </div>
                  {p.inStock ? (
                    <Badge>En stock</Badge>
                  ) : (
                    <Badge variant="destructive">Sin stock</Badge>
                  )}
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Envío: {p.shippingLabel ?? "N/D"}</span>
                  <span>{relativeTimeFromISO(p.updatedAtISO)}</span>
                </div>

                <Button asChild disabled={!p.inStock}>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    Ir
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}

        {!filtered.length ? (
          <div className="rounded-xl border bg-background p-6 text-center text-muted-foreground">
            No hay resultados con esos filtros.
          </div>
        ) : null}
      </div>
    </div>
  )
}
