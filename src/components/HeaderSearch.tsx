"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconClose, IconSearch } from "./icons";

export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const texto = q.trim();
    router.push(texto ? `/?q=${encodeURIComponent(texto)}` : "/");
  }

  return (
    <form onSubmit={buscar} role="search" className="relative w-full">
      <IconSearch
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Buscar por nombre"
        aria-label="Buscar alojamiento por nombre"
        className="field !min-h-11 !rounded-full !py-2 pl-10 pr-4 text-[0.95rem]"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          aria-label="Borrar búsqueda"
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 transition hover:bg-surface-2 hover:text-ink"
        >
          <IconClose size={16} />
        </button>
      )}
    </form>
  );
}
