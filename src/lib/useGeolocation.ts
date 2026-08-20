import { useCallback, useState } from "react";
import { Coords } from "./geo";

export type EstadoGeo = "inactivo" | "buscando" | "listo" | "denegado" | "error";

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [estado, setEstado] = useState<EstadoGeo>("inactivo");

  const solicitar = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setEstado("error");
      return;
    }
    setEstado("buscando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEstado("listo");
      },
      (err) => {
        setEstado(err.code === err.PERMISSION_DENIED ? "denegado" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { coords, estado, solicitar };
}
