import { Gamepad2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#22c55e]/20">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-[#22c55e]" />
              <span className="font-mono text-sm font-bold tracking-widest uppercase text-white">
                COMPARADOR_GAMING
              </span>
            </div>
            <p className="text-xs text-gray-300 font-medium max-w-xs leading-relaxed">
              Compará precios de hardware y periféricos gaming en las principales tiendas de Argentina.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] font-semibold text-[#22c55e] uppercase tracking-widest">
              // TIENDAS COMPARADAS
            </span>
            <ul className="flex flex-col gap-1 text-xs text-gray-300 font-medium">
              <li>Compragamer</li>
              <li>Mexx</li>
              <li>Fullhard</li>
              <li>Maximus Gaming</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-[#22c55e]/10 pt-4 text-xs text-gray-300 font-medium">
          Precios actualizados periódicamente. No nos hacemos responsables por errores de precios.
        </div>
      </div>
    </footer>
  )
}
