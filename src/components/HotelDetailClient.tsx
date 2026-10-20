"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Comentario, HotelConDisponibilidad, UsuarioSesion } from "@/lib/types";
import CategoriaBooking from "./CategoriaBooking";
import Comentarios from "./Comentarios";
import { IconAlert, IconBack, IconCheck, IconLocate, IconRoute, IconStar, IconWaze } from "./icons";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm, formatDistancia, urlGoogleMaps, urlWaze } from "@/lib/geo";

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

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-3xl font-extrabold">Esta salida no existe</p>
        <p className="mt-2 text-ink-2">No encontramos este alojamiento.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Volver a la búsqueda
        </Link>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center" role="alert">
        <p className="font-semibold">{error}</p>
        <button onClick={() => cargar()} className="btn btn-primary mt-5">
          Reintentar
        </button>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="mx-auto max-w-3xl px-3 pt-4 sm:px-6" aria-hidden="true">
        <div className="sign sign--ghost h-60 [--r:2rem]" />
        <div className="mt-4 space-y-3">
          <div className="sign sign--ghost h-52" />
          <div className="sign sign--ghost h-52" />
        </div>
      </div>
    );
  }

  const km = coords ? distanciaKm(coords, { lat: hotel.lat, lng: hotel.lng }) : null;
  const encendido = hotel.abierto && hotel.totalDisponibles > 0;
  const motivo = !hotel.abierto ? "Cerrado" : hotel.totalDisponibles === 0 ? "Lleno" : null;

  return (
    <div className="mx-auto max-w-3xl px-3 pb-10 pt-3 sm:px-6 sm:pt-5">
      <Link href="/" className="btn btn-quiet -ml-2 gap-1.5">
        <IconBack size={18} />
        Volver a la búsqueda
      </Link>

      {/* ───── Cartel del hotel ───── */}
      <header
        className={`sign mt-1 px-6 pb-7 pt-7 [--r:2rem] sm:px-10 sm:pb-9 sm:pt-9 ${
          encendido ? "" : "sign--ash"
        }`}
        data-glint={encendido ? "1" : undefined}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 font-display text-[clamp(2rem,8.5vw,3.6rem)] font-extrabold leading-[1.03]">
              {hotel.nombre}
            </h1>
            {motivo ? (
              <span className="shrink-0 rounded-full bg-alert px-3 py-1 text-sm font-bold text-white">
                {motivo}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-tint px-3 py-1 text-base font-bold text-pink-text">
                <IconStar size={16} />
                {hotel.rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="mt-2 text-[1.05rem] font-medium text-ink-2">
            {hotel.zona} · {hotel.direccion}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <a
              href={urlGoogleMaps(hotel)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white !min-h-12 !px-4 !text-base"
            >
              <IconRoute size={18} />
              Cómo llegar
            </a>
            <a
              href={urlWaze(hotel)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost !min-h-12 !px-4 !text-base"
            >
              <IconWaze size={18} />
              Waze
            </a>
            {km !== null ? (
              <span className="font-display text-xl font-bold leading-none">
                A {formatDistancia(km)}
              </span>
            ) : (
              estado !== "buscando" && (
                <button onClick={solicitar} className="btn btn-quiet">
                  <IconLocate size={18} />
                  Ver distancia
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {usuario && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 px-1 text-sm text-ink-3">
          <IconCheck size={14} className="text-sheet" />
          Conectado como <span className="font-bold text-ink-2">{usuario.nombre}</span>
          <span aria-hidden="true">·</span>
          <Link href="/perfil" className="font-semibold underline-offset-2 hover:underline">
            Mis reservas
          </Link>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout-cliente", { method: "POST" });
              setUsuario(null);
            }}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Cerrar sesión
          </button>
        </p>
      )}

      {!hotel.abierto && (
        <div role="status" className="mt-4 flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-[0.95rem] font-semibold text-amber-700">
          <IconAlert size={20} className="mt-0.5 shrink-0" />
          Este alojamiento no está operando en este momento. Podés ver sus datos, pero todavía no se puede reservar.
        </div>
      )}

      {hotel.descripcion && (
        <p className="mt-5 max-w-[65ch] text-[1.02rem] leading-relaxed text-ink-2">{hotel.descripcion}</p>
      )}

      {hotel.amenitiesGenerales.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {hotel.amenitiesGenerales.map((a) => (
            <li key={a} className="chip">
              {a}
            </li>
          ))}
        </ul>
      )}

      {hotel.reglas.length > 0 && (
        <section className="panel mt-5 p-5" aria-labelledby="titulo-reglas">
          <h2 id="titulo-reglas" className="font-display text-[1.5rem] font-extrabold leading-none">
            Reglamento
          </h2>
          <ul className="mt-3 space-y-2">
            {hotel.reglas.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[0.95rem] text-ink-2">
                <IconCheck size={18} className="mt-0.5 shrink-0 text-sheet" />
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-3 mt-9 font-display text-[2.1rem] font-extrabold leading-none">
        Elegí tu habitación
      </h2>
      <div className="space-y-4">
        {hotel.categorias.map((cat) => (
          <CategoriaBooking
            key={cat.id}
            hotelSlug={hotel.slug}
            categoria={cat}
            usuario={usuario}
            hotelAbierto={hotel.abierto}
            onReservado={cargar}
          />
        ))}
      </div>

      <div className="mt-10">
        <Comentarios hotelSlug={hotel.slug} comentarios={comentarios} onNuevoComentario={cargar} />
      </div>
    </div>
  );
}
