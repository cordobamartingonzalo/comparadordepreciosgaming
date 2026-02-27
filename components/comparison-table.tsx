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
  if (diffMin < 60) return `${diffMin}MIN`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}H`
  const diffD = Math.round(diffH / 24)
  return `${diffD}D`
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
      <div className="flex flex-col gap-3 border border-border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <div>
            <div className="font-mono text-xs font-semibold text-foreground uppercase tracking-widest">
              SOLO EN STOCK
            </div>
            <div className="text-xs text-foreground/60 font-medium">Oculta tiendas sin stock</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-foreground/60 uppercase tracking-widest">
            ORDENAR_POR
          </span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[200px] font-mono text-xs uppercase tracking-wide">
              <SelectValue placeholder="ORDENAR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc" className="font-mono text-xs uppercase">
                PRECIO MENOR A MAYOR
              </SelectItem>
              <SelectItem value="priceDesc" className="font-mono text-xs uppercase">
                PRECIO MAYOR A MENOR
              </SelectItem>
              <SelectItem value="updated" className="font-mono text-xs uppercase">
                ACTUALIZACIÓN
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden md:block overflow-hidden border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f8fafc] border-b border-border">
              <TableHead className="w-[220px] font-mono text-[10px] tracking-widest uppercase text-foreground/60">
                TIENDA
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-foreground/60">
                PRECIO
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-foreground/60">
                ENVÍO
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-foreground/60">
                STOCK
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-foreground/60">
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
                    isBest
                      ? "border-l-2 border-l-[#22c55e] shadow-[inset_4px_0_0_#22c55e10]"
                      : "",
                  ].join(" ")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{p.storeName}</span>
                      {isBest && (
                        <Badge className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#22c55e] font-mono text-[9px] tracking-widest uppercase px-1.5">
                          MEJOR PRECIO
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-lg font-bold font-mono ${isBest ? "text-[#22c55e]" : "text-foreground"}`}>
                      {formatARS(p.priceArs)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/60 font-medium">
                    {p.shippingLabel ?? "N/D"}
                  </TableCell>
                  <TableCell>
                    {p.inStock ? (
                      <Badge className="bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/15 border border-[#22c55e]/30 font-mono text-[9px] tracking-widest uppercase">
                        EN STOCK
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="font-mono text-[9px] tracking-widest uppercase">
                        SIN STOCK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground/60">
                    {relativeTimeFromISO(p.updatedAtISO)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      disabled={!p.inStock}
                      className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#16a34a] font-mono text-xs tracking-widest uppercase font-bold"
                    >
                      <a href={p.url} target="_blank" rel="noreferrer">
                        IR A TIENDA
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
                  className="py-10 text-center font-mono text-xs text-foreground/60 uppercase tracking-widest"
                >
                  SIN RESULTADOS CON ESOS FILTROS
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
                "border bg-white p-4 flex flex-col gap-3",
                isBest
                  ? "border-[#22c55e] border-l-2 shadow-[0_0_12px_#22c55e20]"
                  : "border-border",
              ].join(" ")}
            >
              {/* Tienda + badge */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{p.storeName}</span>
                {isBest && (
                  <Badge className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#22c55e] font-mono text-[9px] tracking-widest uppercase px-1.5">
                    MEJOR PRECIO
                  </Badge>
                )}
              </div>

              {/* Precio + stock */}
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-extrabold font-mono ${isBest ? "text-[#22c55e]" : "text-foreground"}`}>
                  {formatARS(p.priceArs)}
                </span>
                {p.inStock ? (
                  <Badge className="bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/15 border border-[#22c55e]/30 font-mono text-[9px] tracking-widest uppercase">
                    EN STOCK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-mono text-[9px] tracking-widest uppercase">
                    SIN STOCK
                  </Badge>
                )}
              </div>

              {/* Envío + tiempo */}
              <div className="flex items-center justify-between text-xs text-foreground/60 font-mono">
                <span>ENVÍO: {p.shippingLabel ?? "N/D"}</span>
                <span>HACE {relativeTimeFromISO(p.updatedAtISO)}</span>
              </div>

              {/* Botón */}
              <Button
                asChild
                disabled={!p.inStock}
                className="w-full bg-[#22c55e] text-[#0a0a0a] hover:bg-[#16a34a] font-mono text-xs tracking-widest uppercase font-bold"
              >
                <a href={p.url} target="_blank" rel="noreferrer">
                  IR A TIENDA
                </a>
              </Button>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="border border-border bg-white p-6 text-center font-mono text-xs text-foreground/60 uppercase tracking-widest">
            SIN RESULTADOS CON ESOS FILTROS
          </div>
        )}
      </div>

    </div>
  )
}
