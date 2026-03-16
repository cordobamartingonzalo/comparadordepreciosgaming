export function Footer() {
  return (
    <footer className="bg-[#1C1C1A] border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="font-serif text-xl text-white tracking-tight">
              precios<span className="text-[#00C88A]">gg</span>
            </span>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Compará precios de hardware gaming en las principales tiendas de Argentina. Encontrá la mejor oferta en tiempo real.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] font-semibold text-[#00C88A] uppercase tracking-widest mb-1">
              Tiendas comparadas
            </span>
            <ul className="flex flex-col gap-1.5 text-sm text-white/50">
              <li>Compragamer</li>
              <li>Mexx</li>
              <li>Fullhard</li>
              <li>Maximus Gaming</li>
              <li>Venex</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-5 text-xs text-white/30">
          Precios actualizados periódicamente. No nos hacemos responsables por errores de precios.
        </div>
      </div>
    </footer>
  )
}
