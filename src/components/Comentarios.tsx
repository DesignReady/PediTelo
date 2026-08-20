"use client";

import { useState } from "react";
import { Comentario } from "@/lib/types";

function Estrellas({
  valor,
  onChange,
  tamaño = "text-lg",
}: {
  valor: number;
  onChange?: (v: number) => void;
  tamaño?: string;
}) {
  return (
    <div className={`flex gap-0.5 ${tamaño}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`leading-none ${
            n <= valor ? "text-amber-400" : "text-neutral-200"
          } ${onChange ? "cursor-pointer" : ""}`}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default function Comentarios({
  hotelSlug,
  comentarios,
  onNuevoComentario,
}: {
  hotelSlug: string;
  comentarios: Comentario[];
  onNuevoComentario: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !texto.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotels/${hotelSlug}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, comentario: texto, calificacion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar el comentario");
        return;
      }
      setNombre("");
      setTexto("");
      setCalificacion(5);
      setEnviado(true);
      onNuevoComentario();
    } finally {
      setEnviando(false);
    }
  }

  const promedio =
    comentarios.length > 0
      ? comentarios.reduce((sum, c) => sum + c.calificacion, 0) / comentarios.length
      : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-800">Opiniones de huéspedes</h2>
        {promedio !== null && (
          <span className="flex items-center gap-1 text-sm text-neutral-500">
            <Estrellas valor={Math.round(promedio)} tamaño="text-sm" />
            {promedio.toFixed(1)} · {comentarios.length} opinión
            {comentarios.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {comentarios.length === 0 && (
          <p className="text-sm text-neutral-400">
            Todavía no hay opiniones. ¡Sé el primero en dejar la tuya!
          </p>
        )}
        {comentarios.map((c) => (
          <div key={c.id} className="rounded-xl border border-pink-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-800">{c.nombre}</span>
              <span className="text-xs text-neutral-400">{formatFecha(c.creada)}</span>
            </div>
            <Estrellas valor={c.calificacion} tamaño="text-xs" />
            <p className="mt-1 text-sm text-neutral-600">{c.comentario}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={enviar}
        className="mt-4 space-y-2 rounded-xl border border-dashed border-pink-200 bg-pink-50/40 p-4"
      >
        <p className="text-sm font-semibold text-neutral-700">Dejá tu opinión</p>
        <Estrellas valor={calificacion} onChange={setCalificacion} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <textarea
          required
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Contanos cómo fue tu experiencia"
          rows={3}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
        />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {enviado && (
          <p className="text-xs font-medium text-emerald-600">¡Gracias por tu opinión!</p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
        >
          {enviando ? "Publicando…" : "Publicar comentario"}
        </button>
      </form>
    </div>
  );
}
