"use client";

import { useEffect, useRef } from "react";
import type * as LType from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatARS } from "@/lib/format";

export interface MapHotelPoint {
  slug: string;
  nombre: string;
  lat: number;
  lng: number;
  precioDesde: number | null;
  totalDisponibles: number;
  abierto: boolean;
}

export default function LeafletMap({
  hotels,
  userCoords,
}: {
  hotels: MapHotelPoint[];
  userCoords: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const markersRef = useRef<LType.Marker[]>([]);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView(
          [-34.61, -58.43],
          12
        );
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds: [number, number][] = [];

      hotels.forEach((h) => {
        const disponible = h.abierto && h.totalDisponibles > 0;
        const icon = L.divIcon({
          className: "",
          html: `<div class="map-pin ${disponible ? "map-pin--on" : "map-pin--off"}"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div class="map-popup">
             <strong>${h.nombre}</strong><br/>
             ${
               disponible
                 ? `<span style="color:#059669">${h.totalDisponibles} libres ahora</span>`
                 : `<span style="color:#a3a3a3">Sin disponibilidad</span>`
             }<br/>
             ${h.precioDesde !== null ? `Desde ${formatARS(h.precioDesde)}` : ""}
             <br/><a href="/hotel/${h.slug}">Ver hotel →</a>
           </div>`
        );
        markersRef.current.push(marker);
        bounds.push([h.lat, h.lng]);
      });

      if (userCoords) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div class="map-user-dot"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const um = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        markersRef.current.push(um);
        bounds.push([userCoords.lat, userCoords.lng]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hotels, userCoords]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
