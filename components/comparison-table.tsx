"use client"

import * as React from "react"
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
import { ExternalLink } from "lucide-react"

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
  if (diffMin < 60) return `${diffMin} MIN`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH} H`
  const diffD = Math.round(diffH / 24)
  return `${diffD} D`
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
        new Date(b.updatedAtISO).getTime() -
        new Date(a.updatedAtISO).getTime()
      )
    })
    return base
  }, [prices, onlyInStock, sort])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-foreground">
              SOLO EN STOCK
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              OCULTA TIENDAS SIN STOCK
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ORDENAR
          </span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[220px] border-border font-mono text-[11px] uppercase tracking-wider">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc">PRECIO (MENOR A MAYOR)</SelectItem>
              <SelectItem value="priceDesc">PRECIO (MAYOR A MENOR)</SelectItem>
              <SelectItem value="updated">ACTUALIZACION</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section header */}
      <div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-neon">
          {"[ COMPARATIVA DE PRECIOS ]"}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-neon/30 bg-[#f8fafc]">
              <TableHead className="w-[220px] font-mono text-[10px] uppercase tracking-widest text-foreground">
                TIENDA
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                PRECIO
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                ENVIO
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                STOCK
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-foreground">
                ACTUALIZADO
              </TableHead>
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
                    "transition-colors hover:bg-[#f8fafc]",
                    isBest ? "border-l-3 border-l-neon bg-neon/5" : "",
                  ].join(" ")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-bold text-foreground">
                        {p.storeName}
                      </span>
                      {isBest && (
                        <span className="inline-flex items-center border border-neon bg-neon px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon-foreground">
                          MEJOR PRECIO
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-sans text-lg font-bold ${
                        isBest ? "text-neon" : "text-foreground"
                      }`}
                    >
                      {formatARS(p.priceArs)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {p.shippingLabel ?? "N/D"}
                  </TableCell>
                  <TableCell>
                    {p.inStock ? (
                      <span className="inline-flex items-center border border-neon bg-neon/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon">
                        EN STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center border border-destructive bg-destructive/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-destructive">
                        SIN STOCK
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {relativeTimeFromISO(p.updatedAtISO)}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className={[
                        "inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                        p.inStock
                          ? "border border-neon bg-neon text-neon-foreground hover:bg-neon/90"
                          : "pointer-events-none border border-border bg-muted text-muted-foreground opacity-50",
                      ].join(" ")}
                    >
                      IR A TIENDA
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                </TableRow>
              )
            })}
            {!filtered.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground"
                >
                  NO HAY RESULTADOS CON ESOS FILTROS
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((p) => {
          const isBest = bestPrice?.storeId === p.storeId && p.inStock
          return (
            <div
              key={p.storeId}
              className={[
                "flex flex-col gap-3 border bg-card p-4",
                isBest
                  ? "border-l-3 border-l-neon border-t-border border-r-border border-b-border bg-neon/5"
                  : "border-border",
              ].join(" ")}
            >
              {/* Store + badge */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-bold text-foreground">
                  {p.storeName}
                </span>
                {isBest && (
                  <span className="inline-flex items-center border border-neon bg-neon px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon-foreground">
                    MEJOR PRECIO
                  </span>
                )}
              </div>

              {/* Price + stock */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-sans text-2xl font-bold ${
                    isBest ? "text-neon" : "text-foreground"
                  }`}
                >
                  {formatARS(p.priceArs)}
                </span>
                {p.inStock ? (
                  <span className="inline-flex items-center border border-neon bg-neon/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon">
                    EN STOCK
                  </span>
                ) : (
                  <span className="inline-flex items-center border border-destructive bg-destructive/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-destructive">
                    SIN STOCK
                  </span>
                )}
              </div>

              {/* Shipping + time */}
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>ENVIO: {p.shippingLabel ?? "N/D"}</span>
                <span>{relativeTimeFromISO(p.updatedAtISO)}</span>
              </div>

              {/* Button */}
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={[
                  "flex w-full items-center justify-center gap-1.5 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  p.inStock
                    ? "border border-neon bg-neon text-neon-foreground hover:bg-neon/90"
                    : "pointer-events-none border border-border bg-muted text-muted-foreground opacity-50",
                ].join(" ")}
              >
                IR A TIENDA
                <ExternalLink className="size-3" />
              </a>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="border border-dashed border-border p-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            NO HAY RESULTADOS CON ESOS FILTROS
          </div>
        )}
      </div>
    </div>
  )
}
