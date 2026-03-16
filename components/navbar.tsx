import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#FEFCF7] border-b border-black/8">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="Precios GG" width={36} height={36} className="opacity-90" />
          <span className="font-serif text-xl font-semibold text-[#1C1C1A] group-hover:text-[#00C88A] transition-colors tracking-tight">
            precios<span className="text-[#00C88A]">gg</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
