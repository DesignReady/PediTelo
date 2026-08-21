"use client";

import { useRef, useState } from "react";
import { CategoriaConDisponibilidad, TurnoHoras } from "@/lib/types";
import EditableTagList from "./EditableTagList";

export default function CategoriaAdminCard({
  hotelId,
  categoria,
  onGuardado,
  onEliminada,
}: {
  hotelId: string;
  categoria: CategoriaConDisponibilidad;
  onGuardado: () => void;
  onEliminada: () => void;
}) {
  // Solo re-sincronizamos el formulario cuando cambia de categoría (otro hotel/id),
  // nunca en cada refresco automático: si no, el polling pisa lo que el admin
  // está escribiendo y parece que "no deja editar".
  const idRef = useRef(categoria.id);
  const [nombre, setNombre] = useState(categoria.nombre);
  const [descripcion, setDescripcion] = useState(categoria.descripcion);
  const [amenities, setAmenities] = useState(categoria.amenities);
  const [total, setTotal] = useState(categoria.totalHabitaciones);
  const [disponibles, setDisponibles] = useState(categoria.disponibles);
  const [turnos, setTurnos] = useState(categoria.turnos);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  if (idRef.current !== categoria.id) {
    idRef.current = categoria.id;
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setAmenities(categoria.amenities);
    setTotal(categoria.totalHabitaciones);
    setDisponibles(categoria.disponibles);
    setTurnos(categoria.turnos);
  }

  const [foto, setFoto] = useState(categoria.foto);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  async function eliminar() {
    setEliminando(true);
    setErrorBorrado(null);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/categorias/${categoria.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBorrado(data.error ?? "No se pudo eliminar");
        setConfirmandoBorrado(false);
        return;
      }
      onEliminada();
    } finally {
      setEliminando(false);
    }
  }

  function actualizarTurno(horas: TurnoHoras, cambios: Partial<{ precio: number; activo: boolean }>) {
    setTurnos((prev) => prev.map((t) => (t.horas === horas ? { ...t, ...cambios } : t)));
    setOk(false);
  }

  async function guardar() {
    setGuardando(true);
    setOk(false);
    try {
      const disponiblesClamped = Math.min(disponibles, total);
      await fetch(`/api/admin/hotels/${hotelId}/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          amenities,
          totalHabitaciones: total,
          disponibles: disponiblesClamped,
          turnos: turnos.map((t) => ({ horas: t.horas, precio: t.precio, activo: t.activo })),
        }),
      });
      setDisponibles(disponiblesClamped);
      setOk(true);
      onGuardado();
    } finally {
      setGuardando(false);
    }
  }

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await fetch(`/api/admin/hotels/${hotelId}/categorias/${categoria.id}/foto`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorFoto(data.error ?? "No se pudo subir la imagen");
        return;
      }
      setFoto(data.categoria.foto);
      onGuardado();
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          <div className="h-28 w-28 overflow-hidden rounded-xl bg-pink-50">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt={nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-pink-300">
                Sin foto
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendoFoto}
            className="mt-2 w-28 rounded-lg border border-pink-200 px-2 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-50 disabled:opacity-60"
          >
            {subiendoFoto ? "Subiendo…" : foto ? "Cambiar foto" : "Subir foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={subirFoto}
            className="hidden"
          />
          {errorFoto && <p className="mt-1 w-28 text-[11px] text-red-600">{errorFoto}</p>}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <input
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setOk(false);
              }}
              placeholder="Nombre de la categoría"
              className="rounded-lg border border-neutral-200 px-2 py-1 text-sm font-semibold text-neutral-800 focus:border-pink-400 focus:outline-none"
            />
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
              Reservas activas: {categoria.ocupadas}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              Habitaciones totales
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => {
                  const nuevoTotal = Math.max(0, Number(e.target.value));
                  setTotal(nuevoTotal);
                  setDisponibles((d) => Math.min(d, nuevoTotal));
                  setOk(false);
                }}
                className="w-20 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              Disponibles ahora
              <input
                type="number"
                min={0}
                max={total}
                value={disponibles}
                onChange={(e) => {
                  setDisponibles(Math.max(0, Math.min(total, Number(e.target.value))));
                  setOk(false);
                }}
                className="w-20 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`descripcion-${categoria.id}`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400"
        >
          Descripción de la habitación
        </label>
        <textarea
          id={`descripcion-${categoria.id}`}
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            setOk(false);
          }}
          rows={2}
          placeholder="Contales a los huéspedes qué tiene esta habitación"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Servicios de esta habitación
        </span>
        <EditableTagList
          items={amenities}
          onChange={(items) => {
            setAmenities(items);
            setOk(false);
          }}
          placeholder="Ej: Jacuzzi, Minibar…"
          emptyText="Sin servicios cargados todavía."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {turnos.map((t) => (
          <div key={t.horas} className="rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700">Turno {t.horas}h</span>
              <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                <input
                  type="checkbox"
                  checked={t.activo}
                  onChange={(e) => actualizarTurno(t.horas, { activo: e.target.checked })}
                  className="h-3.5 w-3.5 accent-pink-600"
                />
                Ofrecer
              </label>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              $
              <input
                type="number"
                min={0}
                value={t.precio}
                onChange={(e) => actualizarTurno(t.horas, { precio: Number(e.target.value) })}
                className="w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
          {ok && <span className="text-xs font-medium text-emerald-600">Guardado ✓</span>}
        </div>

        {confirmandoBorrado ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">¿Eliminar esta categoría?</span>
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {eliminando ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              onClick={() => setConfirmandoBorrado(false)}
              className="rounded-lg px-3 py-1.5 font-medium text-neutral-500 hover:bg-neutral-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmandoBorrado(true)}
            className="text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Eliminar categoría
          </button>
        )}
      </div>
      {errorBorrado && (
        <p className="mt-2 text-xs font-medium text-red-600">{errorBorrado}</p>
      )}
    </div>
  );
}
