import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#22c55e]/20">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logopreciosgg.png" alt="Precios GG" width={150} height={150} />
          <span className="font-mono text-sm font-bold tracking-widest uppercase text-white group-hover:text-[#22c55e] transition-colors">
            PRECIOS_GG
          </span>
        </Link>
      </div>
    </header>
  )
}