"use client";

import { useState } from "react";

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
        className="w-full rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40 py-4 text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
      >
        + Agregar categoría de habitación
      </button>
    );
  }

  return (
    <form
      onSubmit={crear}
      className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
    >
      <h3 className="font-semibold text-neutral-800">Nueva categoría</h3>
      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Nombre
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Suite Deluxe"
            autoFocus
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Contales a los huéspedes qué tiene esta habitación"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          Habitaciones totales
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
          />
        </label>
        <p className="text-xs text-neutral-400">
          Se crea sin precios cargados y sin ofrecer ningún turno — configurás
          eso después de guardarla.
        </p>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={creando || !nombre.trim()}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
        >
          {creando ? "Creando…" : "Crear categoría"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
