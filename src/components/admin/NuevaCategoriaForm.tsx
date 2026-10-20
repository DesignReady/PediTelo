"use client";

import { useState } from "react";
import { IconPlus } from "../icons";

export default function NuevaCategoriaForm({
  hotelId,
  onCreada,
}: {
  hotelId: string;
  onCreada: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [total, setTotal] = useState(1);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCreando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, totalHabitaciones: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la categoría");
        return;
      }
      setNombre("");
      setDescripcion("");
      setTotal(1);
      setAbierto(false);
      onCreada();
    } finally {
      setCreando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong font-display text-xl font-extrabold text-pink-text transition hover:border-sheet hover:bg-tint"
      >
        <IconPlus size={18} /> Agregar categoría
      </button>
    );
  }

  return (
    <form
      onSubmit={crear}
      className="panel p-5"
    >
      <h3 className="font-display text-[1.7rem] font-extrabold leading-none">Nueva categoría</h3>
      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-bold text-ink-2">
            Nombre
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Suite Deluxe"
            autoFocus
            className="field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-ink-2">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Contales a los huéspedes qué tiene esta habitación"
            className="field"
          />
        </div>
        <label className="flex items-center gap-3 text-sm font-bold text-ink-2">
          Habitaciones totales
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value)))}
            className="field w-20"
          />
        </label>
        <p className="text-sm text-ink-3">
          Se crea sin precios cargados y sin ofrecer ningún turno — configurás
          eso después de guardarla.
        </p>
        {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={creando || !nombre.trim()}
          className="btn btn-primary !min-h-11 !text-base"
        >
          {creando ? "Creando…" : "Crear categoría"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="btn btn-quiet"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
