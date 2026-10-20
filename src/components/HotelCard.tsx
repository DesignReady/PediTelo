import Link from "next/link";
import { HotelConDisponibilidad } from "@/lib/types";
import { formatDistancia } from "@/lib/geo";
import Digits from "./Digits";
import { IconArrow, IconStar } from "./icons";

function miles(n: number): string {
  return n.toLocaleString("es-AR");
}

/**
 * Cartel de salida: nombre y zona a la izquierda, libres y precio en cifras
 * grandes. Si el hotel está cerrado o lleno la lámina se apaga (ceniza, sin
 * destello) y queda solo la etiqueta roja con el motivo.
 */
export default function HotelCard({
  hotel,
  distanciaKm,
  indice = 0,
}: {
  hotel: HotelConDisponibilidad;
  distanciaKm?: number;
  indice?: number;
}) {
  const disponible = hotel.abierto && hotel.totalDisponibles > 0;
  const estado = !hotel.abierto ? "Cerrado" : hotel.totalDisponibles === 0 ? "Lleno" : null;
  const portada = hotel.categorias.find((c) => c.foto)?.foto ?? null;

  return (
    <Link
      href={`/hotel/${hotel.slug}`}
      aria-label={estado ? `${hotel.nombre}, ${estado.toLowerCase()}` : undefined}
      className={`sign sign-link sign-in group block overflow-hidden px-5 pb-5 ${portada ? "pt-0" : "pt-5"} active:scale-[0.985] ${
        disponible ? "" : "sign--ash"
      }`}
      style={{ "--i": indice } as React.CSSProperties}
    >
      {portada && (
        <div className="relative -mx-5 mb-4 aspect-[16/9] overflow-hidden bg-tint">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portada}
            alt=""
            width={1000}
            height={750}
            loading={indice !== undefined && indice < 3 ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-105 ${
              disponible ? "" : "opacity-60 grayscale"
            }`}
          />
          {estado ? (
            <span className="absolute right-3 top-3 rounded-full bg-alert px-3 py-1 text-sm font-bold text-white">
              {estado}
            </span>
          ) : (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-sm font-bold text-pink-text shadow-sm backdrop-blur">
              <IconStar size={14} />
              {hotel.rating.toFixed(1)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-display text-[1.45rem] font-bold leading-[1.1] sm:text-[1.6rem]">
            {hotel.nombre}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.95rem] font-medium text-ink-2">
            <span>{hotel.zona}</span>
            {distanciaKm !== undefined && (
              <>
                <span aria-hidden="true" className="opacity-60">
                  ·
                </span>
                <span className="font-bold text-ink">a {formatDistancia(distanciaKm)}</span>
              </>
            )}
          </p>
        </div>
        {!portada &&
          (estado ? (
            <span className="shrink-0 rounded-full bg-alert px-3 py-1 text-sm font-bold text-white">
              {estado}
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-sm font-bold text-pink-text">
              <IconStar size={14} />
              {hotel.rating.toFixed(1)}
            </span>
          ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-[0.75rem] font-semibold text-ink-3">
              {disponible ? "Libres ahora" : "Libres"}
            </p>
            <Digits
              value={disponible ? hotel.totalDisponibles : 0}
              className={`text-[2.3rem] ${disponible ? "text-pink-text" : ""}`}
              label={
                disponible
                  ? `${hotel.totalDisponibles} habitaciones libres`
                  : `Sin habitaciones libres, ${estado?.toLowerCase()}`
              }
            />
          </div>
          <div>
            <p className="text-[0.75rem] font-semibold text-ink-3">Desde</p>
            {hotel.precioDesde !== null ? (
              <span className="flex items-baseline gap-0.5">
                <span className="font-display text-lg font-bold leading-none">$</span>
                <Digits
                  value={miles(hotel.precioDesde)}
                  className="text-[2.3rem]"
                  label={`desde ${miles(hotel.precioDesde)} pesos`}
                />
              </span>
            ) : (
              <span className="font-display text-[2.3rem] leading-none text-ink-3">—</span>
            )}
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1 group-active:translate-x-1.5 ${
            disponible ? "bg-sheet text-white" : "bg-line text-ink-3"
          }`}
        >
          <IconArrow size={22} />
        </span>
      </div>
    </Link>
  );
}
