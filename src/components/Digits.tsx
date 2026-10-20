"use client";

import { useRef } from "react";

/**
 * Cifras en casilleros de ancho fijo, como un tótem de estación de servicio:
 * cuando cambia un dígito solo ese casillero se reemplaza (en seco, sin
 * deslizar). Con `ignite` los dígitos se prenden de izquierda a derecha al
 * aparecer. Con `slots` también las letras ocupan un casillero fijo (códigos).
 */
export default function Digits({
  value,
  className = "",
  ignite = false,
  slots = false,
  label,
}: {
  value: string | number;
  className?: string;
  ignite?: boolean;
  slots?: boolean;
  label?: string;
}) {
  const texto = String(value);
  const previo = useRef<string | null>(null);
  const cambio = previo.current !== null && previo.current !== texto;
  const anterior = previo.current ?? "";
  previo.current = texto;

  const chars = texto.split("");
  const largo = chars.length;

  return (
    <span
      className={`digits ${ignite ? "digits--ignite" : ""} ${className}`}
      role="text"
      aria-label={label ?? texto}
    >
      {chars.map((c, i) => {
        const casillero = slots ? c !== "-" : /\d/.test(c);
        // Clave por posición desde la derecha: solo se remonta lo que cambió.
        const desdeDerecha = largo - i;
        const cambioEste = cambio && anterior[anterior.length - desdeDerecha] !== c;
        return (
          <span
            key={`${desdeDerecha}-${c}`}
            aria-hidden="true"
            className={`${casillero ? "digit" : "digit-sep"} ${cambioEste ? "is-swap" : ""}`}
            style={ignite ? ({ "--n": i } as React.CSSProperties) : undefined}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}
