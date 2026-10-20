import Link from "next/link";
import HeaderSearch from "./HeaderSearch";
import HeaderNav from "./HeaderNav";
import { IconArrow } from "./icons";

// Barra superior: logo, búsqueda y navegación, limpia y fija.
export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-ground/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          aria-label="PediTelo, ir al inicio"
          className="group flex min-h-11 shrink-0 items-center gap-2 rounded-full pr-1"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sheet text-white shadow-[0_8px_16px_-8px_rgba(190,24,93,0.9)] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:-rotate-12"
          >
            <IconArrow size={18} />
          </span>
          <span className="font-display text-[1.4rem] font-extrabold leading-none tracking-tight">
            Pedi<span className="text-pink-text">Telo</span>
          </span>
        </Link>

        <div className="min-w-0 flex-1 sm:max-w-sm">
          <HeaderSearch />
        </div>

        <HeaderNav />
      </div>
    </header>
  );
}
