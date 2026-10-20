"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Buscar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/perfil", label: "Mi cuenta" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 sm:flex">
      {LINKS.map(({ href, label }) => {
        const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`relative rounded-xl px-3.5 py-2.5 text-[0.95rem] font-semibold transition-colors ${
              activo ? "text-pink-text" : "text-ink-2 hover:text-ink"
            }`}
          >
            {label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-3.5 -bottom-px h-[3px] origin-left rounded-full bg-sheet transition-transform duration-300 [transition-timing-function:var(--ease-out)] ${
                activo ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
      <Link
        href="/admin"
        className="ml-2 rounded-xl border-2 border-line-strong px-3.5 py-2 text-[0.95rem] font-bold text-ink-2 transition hover:border-sheet hover:text-pink-text"
      >
        Panel de hotel
      </Link>
    </nav>
  );
}
