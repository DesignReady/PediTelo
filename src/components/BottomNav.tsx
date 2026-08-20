"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconInicio({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMapa({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconAdmin({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path
        d="M10.5 3.5h3l.4 2a6.9 6.9 0 0 1 1.9 1.1l2-.7 1.5 2.6-1.5 1.4a7 7 0 0 1 0 2.2l1.5 1.4-1.5 2.6-2-.7a6.9 6.9 0 0 1-1.9 1.1l-.4 2h-3l-.4-2a6.9 6.9 0 0 1-1.9-1.1l-2 .7-1.5-2.6 1.5-1.4a7 7 0 0 1 0-2.2L4.7 8.5l1.5-2.6 2 .7A6.9 6.9 0 0 1 10.1 5.5l.4-2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

const tabs = [
  { href: "/", label: "Inicio", Icon: IconInicio },
  { href: "/mapa", label: "Mapa", Icon: IconMapa },
  { href: "/admin", label: "Admin", Icon: IconAdmin },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-pink-100 bg-white/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                active ? "text-pink-600" : "text-neutral-400"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
