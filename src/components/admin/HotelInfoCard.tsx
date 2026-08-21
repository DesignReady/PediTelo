"use client";

import { useRef, useState } from "react";
import { HotelConDisponibilidad } from "@/lib/types";
import EditableTagList from "./EditableTagList";
import ServiciosDropdown from "../ServiciosDropdown";

export default function HotelInfoCard({
  hotel,
  onGuardado,
}: {
  hotel: HotelConDisponibilidad;
  onGuardado: () => void;
}) {
  // Mismo patrón que CategoriaAdminCard: solo resincronizamos al cambiar de
  // hotel, nunca en cada refresco automático, para no pisar lo que se está
  // escribiendo.
  const idRef = useRef(hotel.id);
  const [descripcion, setDescripcion] = useState(hotel.descripcion);
  const [amenitiesGenerales, setAmenitiesGenerales] = useState(hotel.amenitiesGenerales);
  const [reglas, setReglas] = useState(hotel.reglas);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  if (idRef.current !== hotel.id) {
    idRef.current = hotel.id;
    setDescripcion(hotel.descripcion);
    setAmenitiesGenerales(hotel.amenitiesGenerales);
    setReglas(hotel.reglas);
  }

  async function guardar() {
    setGuardando(true);
    setOk(false);
    try {
      await fetch(`/api/admin/hotels/${hotel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, amenitiesGenerales, reglas }),
      });
      setOk(true);
      onGuardado();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-neutral-800">Información del negocio</h3>
      <p className="mt-0.5 text-xs text-neutral-400">
        Esto es lo primero que ven los huéspedes al entrar a tu hotel en la web.
      </p>

      <div className="mt-4">
        <label
          htmlFor={`hotel-descripcion-${hotel.id}`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400"
        >
          Descripción del alojamiento
        </label>
        <textarea
          id={`hotel-descripcion-${hotel.id}`}
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            setOk(false);
          }}
          rows={3}
          placeholder="Contales a los huéspedes qué hace especial a tu alojamiento"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-pink-400 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Servicios generales del hotel
        </span>
        <ServiciosDropdown
          items={amenitiesGenerales}
          onChange={(items) => {
            setAmenitiesGenerales(items);
            setOk(false);
          }}
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Reglas del alojamiento
        </span>
        <EditableTagList
          items={reglas}
          onChange={(items) => {
            setReglas(items);
            setOk(false);
          }}
          variant="row"
          placeholder="Ej: No se permiten mascotas"
          emptyText="Sin reglas cargadas todavía."
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {ok && <span className="text-xs font-medium text-emerald-600">Guardado ✓</span>}
      </div>
    </div>
  );
}
