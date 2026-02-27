import Link from "next/link"
import { Gamepad2 } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#22c55e]/20">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Gamepad2 className="size-5 text-[#22c55e]" />
          <span className="font-mono text-sm font-bold tracking-widest uppercase text-white group-hover:text-[#22c55e] transition-colors">
            COMPARADOR_GAMING
          </span>
        </Link>
        <div className="ml-1 px-2 py-0.5 border border-[#22c55e]/40 text-[10px] font-mono tracking-widest uppercase text-[#22c55e]">
          AR
        </div>
      </div>
    </header>
  )
}
