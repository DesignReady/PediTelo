"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const texto = q.trim();
    router.push(texto ? `/?q=${encodeURIComponent(texto)}` : "/");
  }

  return (
    <form onSubmit={buscar} className="relative w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400"
      >
        🔍
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder="Buscar un telo por nombre…"
        aria-label="Buscar alojamiento por nombre"
        className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-pink-400 focus:bg-white focus:outline-none"
      />
    </form>
  );
}
