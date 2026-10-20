"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconKey, IconMap, IconUser } from "./icons";

const TABS = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/mapa", label: "Mapa", Icon: IconMap },
  { href: "/perfil", label: "Cuenta", Icon: IconUser },
  { href: "/admin", label: "Hotel", Icon: IconKey },
];

export default function BottomNav() {
  const pathname = usePathname();

  const activo = TABS.findIndex(({ href }) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/hotel") : pathname.startsWith(href)
  );

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-3 z-40 sm:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.625rem)" }}
    >
      <div className="relative grid grid-cols-4 rounded-[1.4rem] border border-line bg-surface/95 p-1.5 shadow-[0_14px_34px_-14px_rgba(63,19,41,0.55)] backdrop-blur-md">
        {/* el cartel activo se desliza de una pestaña a la otra */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/4)] transition-[transform,opacity] duration-[420ms] [transition-timing-function:var(--ease-out)]"
          style={{
            transform: `translateX(${Math.max(activo, 0) * 100}%)`,
            opacity: activo === -1 ? 0 : 1,
          }}
        >
          <span className="block h-full rounded-2xl bg-tint" />
        </span>

        {TABS.map(({ href, label, Icon }, i) => {
          const esActivo = i === activo;
          return (
            <Link
              key={href}
              href={href}
              aria-current={esActivo ? "page" : undefined}
              className={`relative z-10 flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.75rem] font-semibold transition-colors duration-300 active:scale-95 ${
                esActivo ? "text-pink-text" : "text-ink-2"
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
