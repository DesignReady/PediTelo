import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-base font-bold text-white shadow-sm sm:h-9 sm:w-9 sm:text-lg">
            P
          </span>
          <span className="text-lg font-extrabold tracking-tight text-pink-600 sm:text-xl">
            Pedi<span className="text-rose-700">Telo</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-neutral-600 transition hover:bg-pink-50 hover:text-pink-700"
          >
            Buscar alojamiento
          </Link>
          <Link
            href="/mapa"
            className="rounded-lg px-3 py-2 text-neutral-600 transition hover:bg-pink-50 hover:text-pink-700"
          >
            Mapa
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-pink-200 px-3 py-2 text-pink-700 transition hover:bg-pink-50"
          >
            Panel de administrador
          </Link>
        </nav>
      </div>
    </header>
  );
}
