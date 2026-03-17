"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { Switch } from "@/components/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import type { StorePrice } from "@/lib/db"

function formatARS(value: number | null) {
  if (!value) return "—"
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

function relativeTimeFromISO(iso: string) {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diffMin = Math.max(0, Math.round((now - t) / 60000))
  if (diffMin < 60) return `${diffMin}min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  return `${Math.round(diffH / 24)}d`
}

type SortKey = "priceAsc" | "priceDesc" | "updated"

export function ComparisonTable({ prices }: { prices: StorePrice[] }) {
  const [onlyInStock, setOnlyInStock] = React.useState(false)
  const [sort, setSort] = React.useState<SortKey>("priceAsc")

  const bestPrice = React.useMemo(() => {
    const inStockPrices = prices.filter((p) => p.inStock && p.priceArs)
    if (!inStockPrices.length) return null
    return inStockPrices.reduce((min, cur) =>
      cur.priceArs < min.priceArs ? cur : min
    )
  }, [prices])

  const filtered = React.useMemo(() => {
    const base = onlyInStock ? prices.filter((p) => p.inStock) : prices.slice()
    base.sort((a, b) => {
      if (sort === "priceAsc") {
        if (!a.priceArs) return 1
        if (!b.priceArs) return -1
        return a.priceArs - b.priceArs
      }
      if (sort === "priceDesc") {
        if (!a.priceArs) return 1
        if (!b.priceArs) return -1
        return b.priceArs - a.priceArs
      }
      return new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime()
    })
    return base
  }, [prices, onlyInStock, sort])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 border border-black/8 bg-[#FEFCF7] rounded-md p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={onlyInStock} onCheckedChange={setOnlyInStock} />
          <div>
            <div className="text-sm font-medium text-[#1C1C1A]">Solo en stock</div>
            <div className="text-xs text-[#7A7870]">Oculta tiendas sin stock</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#7A7870] uppercase tracking-widest">Ordenar por</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[200px] text-xs border-black/10 bg-[#FEFCF7]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceAsc" className="text-xs">Precio: menor a mayor</SelectItem>
              <SelectItem value="priceDesc" className="text-xs">Precio: mayor a menor</SelectItem>
              <SelectItem value="updated" className="text-xs">Más reciente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop tabla */}
      <div className="hidden md:block overflow-hidden border border-black/8 bg-[#FEFCF7] rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EDE9E0] border-b border-black/8">
              <TableHead className="w-[220px] font-mono text-[10px] tracking-widest uppercase text-[#7A7870]">Tienda</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-[#7A7870]">Precio</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-[#7A7870]">Envío</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-[#7A7870]">Stock</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest uppercase text-[#7A7870]">Actualizado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const isBest = bestPrice?.storeId === p.storeId && p.inStock
              return (
                <TableRow key={p.storeId} className={["transition-colors hover:bg-[#EDE9E0]/50 border-b border-black/5", isBest ? "border-l-2 border-l-[#00C88A]" : ""].join(" ")}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1C1C1A]">{p.storeName}</span>
                      {isBest && <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#00C88A]/15 text-[#007A54]">mejor precio</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-serif text-xl ${isBest ? "text-[#00C88A]" : "text-[#1C1C1A]"}`}>{formatARS(p.priceArs)}</span>
                  </TableCell>
                  <TableCell className="text-sm text-[#7A7870]">{p.shippingLabel ?? "N/D"}</TableCell>
                  <TableCell>
                    {p.inStock
                      ? <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#00C88A]/10 text-[#007A54] border border-[#00C88A]/20">En stock</span>
                      : <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-red-50 text-red-600 border border-red-200">Sin stock</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#7A7870]">Hace {relativeTimeFromISO(p.updatedAtISO)}</TableCell>
                  <TableCell className="text-right">
                    <a href={p.url} target="_blank" rel="noreferrer"
                      className={["inline-flex items-center px-3 py-1.5 text-xs font-mono tracking-widest rounded transition-colors", p.inStock ? "bg-[#1C1C1A] text-[#F5F0E8] hover:bg-[#00C88A] hover:text-[#003D2A]" : "bg-[#EDE9E0] text-[#7A7870] pointer-events-none opacity-50"].join(" ")}>
                      Ir a tienda
                    </a>
                  </TableCell>
                </TableRow>
              )
            })}
            {!filtered.length && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center font-mono text-xs text-[#7A7870]">Sin resultados con esos filtros</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((p) => {
          const isBest = bestPrice?.storeId === p.storeId && p.inStock
          return (
            <div key={p.storeId} className={["border bg-[#FEFCF7] p-4 flex flex-col gap-3 rounded-md", isBest ? "border-[#00C88A]/40 border-l-2 border-l-[#00C88A]" : "border-black/8"].join(" ")}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#1C1C1A]">{p.storeName}</span>
                {isBest && <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#00C88A]/15 text-[#007A54]">mejor precio</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-serif text-2xl ${isBest ? "text-[#00C88A]" : "text-[#1C1C1A]"}`}>{formatARS(p.priceArs)}</span>
                {p.inStock
                  ? <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#00C88A]/10 text-[#007A54] border border-[#00C88A]/20">En stock</span>
                  : <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono uppercase bg-red-50 text-red-600 border border-red-200">Sin stock</span>}
              </div>
              <div className="flex items-center justify-between text-xs text-[#7A7870] font-mono">
                <span>Envío: {p.shippingLabel ?? "N/D"}</span>
                <span>Hace {relativeTimeFromISO(p.updatedAtISO)}</span>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer"
                className={["w-full text-center py-2.5 text-xs font-mono tracking-widest rounded transition-colors", p.inStock ? "bg-[#1C1C1A] text-[#F5F0E8] hover:bg-[#00C88A] hover:text-[#003D2A]" : "bg-[#EDE9E0] text-[#7A7870] pointer-events-none opacity-50"].join(" ")}>
                Ir a tienda
              </a>
            </div>
          )
        })}
        {!filtered.length && (
          <div className="border border-black/8 bg-[#FEFCF7] p-6 text-center font-mono text-xs text-[#7A7870] rounded-md">Sin resultados con esos filtros</div>
        )}
      </div>
    </div>
  )
}
