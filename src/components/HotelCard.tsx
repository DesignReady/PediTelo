import Link from "next/link";
import { HotelConDisponibilidad } from "@/lib/types";
import { formatARS } from "@/lib/format";
import { formatDistancia } from "@/lib/geo";

export default function HotelCard({
  hotel,
  distanciaKm,
}: {
  hotel: HotelConDisponibilidad;
  distanciaKm?: number;
}) {
  const disponible = hotel.abierto && hotel.totalDisponibles > 0;
  const estado = !hotel.abierto ? "Cerrado" : hotel.totalDisponibles === 0 ? "Lleno" : null;

  return (
    <div className="relative">
      {estado && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          {estado}
        </span>
      )}
      <Link
        href={`/hotel/${hotel.slug}`}
        className={`flex gap-3 rounded-2xl border border-pink-100 bg-white p-3 shadow-sm transition active:scale-[0.98] active:bg-pink-50/60 ${
          estado ? "grayscale" : ""
        }`}
      >
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${hotel.colorDesde}, ${hotel.colorHasta})`,
          }}
        >
          <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            ★ {hotel.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-800">{hotel.nombre}</h3>
            {distanciaKm !== undefined && (
              <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                {formatDistancia(distanciaKm)}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-neutral-400">{hotel.zona}</p>

          <div className="mt-1.5 flex items-center gap-1.5">
            {disponible ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                {hotel.totalDisponibles} libres ahora
              </span>
            ) : (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">
                {estado === "Cerrado" ? "Cerrado ahora" : "Sin disponibilidad"}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-1.5">
            <span className="text-[11px] text-neutral-400">Turnos 1h · 3h · 5h</span>
            {hotel.precioDesde !== null ? (
              <span className="text-right leading-tight">
                <span className="block text-[10px] font-medium text-neutral-400">Desde</span>
                <span className="text-sm font-bold text-rose-700">
                  {formatARS(hotel.precioDesde)}
                </span>
              </span>
            ) : (
              <span className="text-sm text-neutral-300">—</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
