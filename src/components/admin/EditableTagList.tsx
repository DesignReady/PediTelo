"use client";

import { useState } from "react";

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
        <div className="flex flex-wrap gap-1.5">
          {items.length === 0 && <span className="text-xs text-neutral-300">{emptyText}</span>}
          {items.map((it, i) => (
            <span
              key={`${it}-${i}`}
              className="flex items-center gap-1 rounded-full bg-pink-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-pink-700"
            >
              {it}
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar ${it}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-pink-400 hover:bg-pink-200 hover:text-pink-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.length === 0 && <li className="text-xs text-neutral-300">{emptyText}</li>}
          {items.map((it, i) => (
            <li
              key={`${it}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700"
            >
              <span>{it}</span>
              <button
                type="button"
                onClick={() => quitar(i)}
                className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={agregar}
          className="shrink-0 rounded-lg bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-200"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
