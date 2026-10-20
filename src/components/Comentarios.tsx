"use client";

import { useState } from "react";
import { Comentario } from "@/lib/types";
import { IconCheck, IconStar } from "./icons";

function Estrellas({
  valor,
  onChange,
  tamano = 18,
}: {
  valor: number;
  onChange?: (v: number) => void;
  tamano?: number;
}) {
  return (
    <div className="flex gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icono = (
          <IconStar
            size={tamano}
            className={n <= valor ? "text-sheet" : "text-line-strong"}
            style={{ transition: "color 160ms ease, transform 200ms var(--ease-out)" }}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === valor}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onChange(n)}
            className="flex h-11 w-9 items-center justify-center rounded-lg transition-transform active:scale-90"
          >
            {icono}
          </button>
        ) : (
          <span key={n}>{icono}</span>
        );
      })}
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
  const [texto, setTexto] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotels/${hotelSlug}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario: texto, calificacion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar el comentario");
        return;
      }
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
    <section aria-labelledby="titulo-opiniones">
      <div className="flex items-end justify-between gap-3">
        <h2 id="titulo-opiniones" className="font-display text-[1.9rem] font-extrabold leading-none">
          Opiniones
        </h2>
        {promedio !== null && (
          <span className="flex items-center gap-2 text-sm font-semibold text-ink-2">
            <Estrellas valor={Math.round(promedio)} tamano={15} />
            <span className="tabular-nums">
              {promedio.toFixed(1)} · {comentarios.length}
            </span>
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {comentarios.length === 0 && (
          <p className="panel px-4 py-5 text-ink-2">
            Todavía no hay opiniones. Sé el primero en dejar la tuya.
          </p>
        )}
        {comentarios.map((c) => (
          <article key={c.id} className="panel p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-xl font-bold leading-none">{c.nombre}</span>
              <span className="text-xs font-semibold text-ink-3">{formatFecha(c.creada)}</span>
            </div>
            <div className="mt-1.5">
              <Estrellas valor={c.calificacion} tamano={14} />
            </div>
            <p className="mt-2 text-[0.95rem] text-ink-2">{c.comentario}</p>
          </article>
        ))}
      </div>

      <form onSubmit={enviar} className="mt-5 space-y-3 rounded-2xl border-2 border-dashed border-line-strong p-4">
        <p className="font-display text-xl font-bold leading-none">Dejá tu opinión</p>
        <p className="text-sm text-ink-3">Se publica de forma anónima, con un nombre al azar.</p>
        <Estrellas valor={calificacion} onChange={setCalificacion} tamano={26} />
        <label htmlFor="opinion-texto" className="sr-only">
          Contanos cómo fue tu experiencia
        </label>
        <textarea
          id="opinion-texto"
          required
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Contanos cómo fue tu experiencia"
          rows={3}
          className="field !min-h-24"
        />
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        {enviado && (
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <IconCheck size={16} /> Gracias por tu opinión.
          </p>
        )}
        <button type="submit" disabled={enviando} className="btn btn-primary">
          {enviando ? "Publicando…" : "Publicar opinión"}
        </button>
      </form>
    </section>
  );
}
