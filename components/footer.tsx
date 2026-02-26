import { Gamepad2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-neon/20 bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-neon" />
              <span className="font-mono text-xs uppercase tracking-widest text-white">
                COMPARADOR GAMING
              </span>
            </div>
            <p className="max-w-xs font-sans text-xs leading-relaxed text-gray-400">
              Compara precios de hardware y perifericos gaming en las principales tiendas de Argentina.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
              {"// TIENDAS COMPARADAS"}
            </span>
            <ul className="flex flex-col gap-1 font-sans text-xs text-gray-400">
              <li>Compragamer</li>
              <li>Mexx</li>
              <li>Fullhard</li>
              <li>Maximus Gaming</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-widest text-gray-600">
          {">"} Precios actualizados periodicamente. No nos hacemos responsables por errores de precios.
        </div>
      </div>
    </footer>
  )
}
