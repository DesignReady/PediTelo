"use client";

import { useRef, useState } from "react";
import { HotelConDisponibilidad } from "@/lib/types";
import EditableTagList from "./EditableTagList";
import ServiciosDropdown from "../ServiciosDropdown";
import { IconCheck } from "../icons";

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
    <div className="panel p-5">
      <h3 className="font-display text-[1.7rem] font-extrabold leading-none">Información del negocio</h3>
      <p className="mt-1 text-sm text-ink-3">
        Esto es lo primero que ven los huéspedes al entrar a tu hotel en la web.
      </p>

      <div className="mt-4">
        <label
          htmlFor={`hotel-descripcion-${hotel.id}`}
          className="mb-1 block text-sm font-bold text-ink-2"
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
          className="field"
        />
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-bold text-ink-2">
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
        <span className="mb-1 block text-sm font-bold text-ink-2">
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
          className="btn btn-primary !min-h-11 !text-base"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {ok && <span className="flex items-center gap-1 text-sm font-bold text-emerald-700"><IconCheck size={16} /> Guardado</span>}
      </div>
    </div>
  );
}
