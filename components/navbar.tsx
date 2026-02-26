import Link from "next/link"
import { Gamepad2 } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neon/20 bg-[#0a0a0a]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="size-5 text-neon" />
          <span className="font-mono text-sm uppercase tracking-widest text-white">
            COMPARADOR GAMING
          </span>
        </Link>
        <span className="inline-flex items-center border border-neon bg-neon/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
          ARGENTINA
        </span>
      </div>
    </header>
  )
}
