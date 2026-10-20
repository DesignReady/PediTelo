"use client";

import { useState } from "react";
import { IconClose } from "../icons";

export default function EditableTagList({
  items,
  onChange,
  placeholder = "Agregar…",
  variant = "chip",
  emptyText = "Todavía no hay nada cargado.",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  variant?: "chip" | "row";
  emptyText?: string;
}) {
  const [nuevo, setNuevo] = useState("");

  function agregar() {
    const v = nuevo.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setNuevo("");
  }

  function quitar(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      agregar();
    }
  }

  return (
    <div>
      {variant === "chip" ? (
        <div className="flex flex-wrap gap-2">
          {items.length === 0 && <span className="text-sm text-ink-3">{emptyText}</span>}
          {items.map((it, i) => (
            <span key={`${it}-${i}`} className="chip !pr-1" data-on="true">
              {it}
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar ${it}`}
                className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/25"
              >
                <IconClose size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.length === 0 && <li className="text-sm text-ink-3">{emptyText}</li>}
          {items.map((it, i) => (
            <li
              key={`${it}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-line bg-surface px-3.5 py-2 text-[0.95rem]"
            >
              <span>{it}</span>
              <button
                type="button"
                onClick={() => quitar(i)}
                className="shrink-0 text-sm font-bold text-alert hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2.5 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="field flex-1"
        />
        <button type="button" onClick={agregar} className="btn btn-ghost !min-h-12 shrink-0 !px-4 !text-base">
          Agregar
        </button>
      </div>
    </div>
  );
}
