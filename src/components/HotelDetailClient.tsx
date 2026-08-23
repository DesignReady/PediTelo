"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Comentario, HotelConDisponibilidad } from "@/lib/types";
import CategoriaBooking from "./CategoriaBooking";
import Comentarios from "./Comentarios";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm, formatDistancia, urlGoogleMaps, urlWaze } from "@/lib/geo";

interface UsuarioSesion {
  usuarioId: string;
  email: string;
  nombre: string;
  telefono: string | null;
}

export default function HotelDetailClient({ slug }: { slug: string }) {
  const [hotel, setHotel] = useState<HotelConDisponibilidad | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSesion | null | undefined>(undefined);
  const { coords, estado, solicitar } = useGeolocation();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUsuario(data.usuario))
      .catch(() => setUsuario(null));
  }, []);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/hotels/${slug}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setHotel(data.hotel);
      setComentarios(data.comentarios ?? []);
      setError(null);
    } catch {
      setError("No pudimos cargar este alojamiento. Revisá tu conexión e intentá de nuevo.");
    }
  }, [slug]);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 15000);
    return () => clearInterval(interval);
  }, [cargar]);

  useEffect(() => {
    solicitar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notFound) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-neutral-500">No encontramos este alojamiento.</p>
        <Link href="/" className="mt-3 inline-block text-pink-600 underline">
          Volver a la búsqueda
        </Link>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => cargar()}
          className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!hotel) {
    return <div className="px-4 py-16 text-center text-neutral-400">Cargando…</div>;
  }

  const km = coords ? distanciaKm(coords, { lat: hotel.lat, lng: hotel.lng }) : null;

  return (
    <div>
      <div
        className="h-36 w-full sm:h-52"
        style={{ background: `linear-gradient(135deg, ${hotel.colorDesde}, ${hotel.colorHasta})` }}
      />

      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <Link href="/" className="text-sm text-pink-600 sm:hover:underline">
          ← Volver a la búsqueda
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
              {hotel.nombre}
            </h1>
            <p className="text-sm text-neutral-500">
              {hotel.zona} · {hotel.direccion}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-600">
            ★ {hotel.rating.toFixed(1)}
          </span>
        </div>

        {usuario && (
          <p className="mt-1 text-xs text-neutral-400">
            Conectado como {usuario.nombre} ·{" "}
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout-cliente", { method: "POST" });
                setUsuario(null);
              }}
              className="underline hover:text-neutral-600"
            >
              Cerrar sesión
            </button>
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={urlGoogleMaps(hotel)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition active:bg-pink-700 sm:hover:bg-pink-700"
          >
            🧭 Google Maps
          </a>
          <a
            href={urlWaze(hotel)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-pink-200 px-3 py-1.5 text-xs font-semibold text-pink-700 transition active:bg-pink-50 sm:hover:bg-pink-50"
          >
            🚗 Waze
          </a>
          {km !== null ? (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">
              A {formatDistancia(km)} de tu ubicación
            </span>
          ) : (
            estado !== "buscando" && (
              <button
                onClick={solicitar}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-500"
              >
                📍 Ver distancia
              </button>
            )
          )}
        </div>

        {!hotel.abierto && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Este alojamiento no está operando en este momento.
          </div>
        )}

        {hotel.descripcion && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">{hotel.descripcion}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {hotel.amenitiesGenerales.map((a) => (
            <span
              key={a}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
            >
              {a}
            </span>
          ))}
        </div>

        {hotel.reglas.length > 0 && (
          <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50/40 p-4">
            <h2 className="text-sm font-bold text-neutral-800">Reglas del alojamiento</h2>
            <ul className="mt-2 space-y-1.5">
              {hotel.reglas.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-neutral-600">
                  <span className="text-pink-400">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-7 mb-3 text-base font-bold text-neutral-800 sm:text-lg">
          Categorías de habitación
        </h2>
        <div className="space-y-4">
          {hotel.categorias.map((cat) => (
            <CategoriaBooking
              key={cat.id}
              hotelSlug={hotel.slug}
              categoria={cat}
              usuario={usuario}
              onReservado={cargar}
            />
          ))}
        </div>

        <div className="mt-8 border-t border-pink-100 pt-5">
          <Comentarios hotelSlug={hotel.slug} comentarios={comentarios} onNuevoComentario={cargar} />
        </div>
      </div>
    </div>
  );
}
