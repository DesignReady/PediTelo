"use client";

import { useRef, useState } from "react";
import { CategoriaConDisponibilidad, Habitacion, TurnoHoras } from "@/lib/types";
import HabitacionesEditor from "./HabitacionesEditor";
import ServiciosDropdown from "../ServiciosDropdown";
import { IconCheck } from "../icons";

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
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(categoria.habitaciones);
  const [turnos, setTurnos] = useState(categoria.turnos);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  if (idRef.current !== categoria.id) {
    idRef.current = categoria.id;
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setAmenities(categoria.amenities);
    setHabitaciones(categoria.habitaciones);
    setTurnos(categoria.turnos);
  }

  const [foto, setFoto] = useState(categoria.foto);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const libres = habitaciones.filter((h) => h.disponible).length;

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
    setErrorGuardado(null);
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          amenities,
          habitaciones: habitaciones.map((h) => ({
            id: h.id.startsWith("temp_") ? undefined : h.id,
            numero: h.numero,
            disponible: h.disponible,
          })),
          turnos: turnos.map((t) => ({ horas: t.horas, precio: t.precio, activo: t.activo })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorGuardado(data.error ?? "No se pudo guardar");
        return;
      }
      if (data.categoria?.habitaciones) {
        setHabitaciones(data.categoria.habitaciones);
      }
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
    <div className="panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          <div className="h-28 w-28 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt={nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink-3">
                Sin foto
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendoFoto}
            className="btn btn-ghost mt-2 w-28 !min-h-10 !px-3 !text-base"
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
          {errorFoto && <p className="mt-1 w-28 text-xs font-semibold text-red-600">{errorFoto}</p>}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2.5">
            <input
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setOk(false);
              }}
              placeholder="Nombre de la categoría"
              aria-label="Nombre de la categoría"
              className="field !min-h-12 w-full font-display !text-[1.5rem] font-extrabold"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-tint px-2.5 py-1 font-display text-base font-extrabold tracking-wide text-pink-text">
                {libres} de {habitaciones.length} libres
              </span>
              <span className="rounded-md bg-surface-2 px-2.5 py-1 font-display text-base font-extrabold tracking-wide text-ink-2">
                Reservas activas: {categoria.ocupadas}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`descripcion-${categoria.id}`}
          className="mb-1 block text-sm font-bold text-ink-2"
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
          className="field w-full"
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-bold text-ink-2">
          Servicios de esta habitación
        </span>
        <ServiciosDropdown
          items={amenities}
          onChange={(items) => {
            setAmenities(items);
            setOk(false);
          }}
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-bold text-ink-2">
          Habitaciones de esta categoría
        </span>
        <HabitacionesEditor
          habitaciones={habitaciones}
          onChange={(h) => {
            setHabitaciones(h);
            setOk(false);
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {turnos.map((t) => (
          <div key={t.horas} className="rounded-2xl border-2 border-line bg-surface-2 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-extrabold leading-none">Turno {t.horas}h</span>
              <label className="flex min-h-9 items-center gap-1.5 text-sm font-semibold text-ink-2">
                <input
                  type="checkbox"
                  checked={t.activo}
                  onChange={(e) => actualizarTurno(t.horas, { activo: e.target.checked })}
                  className="h-5 w-5"
                />
                Ofrecer
              </label>
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-display text-xl font-bold">
              $
              <input
                type="number"
                min={0}
                value={t.precio}
                onChange={(e) => actualizarTurno(t.horas, { precio: Number(e.target.value) })}
                className="field w-full"
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
            className="btn btn-primary !min-h-11 !text-base"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
          {ok && <span className="flex items-center gap-1 text-sm font-bold text-emerald-700"><IconCheck size={16} /> Guardado</span>}
        </div>

        {confirmandoBorrado ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-ink-2">¿Eliminar esta categoría?</span>
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="btn !min-h-10 !bg-alert !px-4 !text-base text-white"
            >
              {eliminando ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              onClick={() => setConfirmandoBorrado(false)}
              className="btn btn-quiet !min-h-10"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmandoBorrado(true)}
            className="btn btn-quiet !min-h-10 !text-alert hover:!bg-red-50"
          >
            Eliminar categoría
          </button>
        )}
      </div>
      {errorGuardado && (
        <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{errorGuardado}</p>
      )}
      {errorBorrado && (
        <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{errorBorrado}</p>
      )}
    </div>
  );
}
