"use client";

import { formatARS } from "@/lib/format";

export default function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const rango = Math.max(1, max - min);
  const step = Math.max(500, Math.round(rango / 100 / 500) * 500);
  const pctMin = ((valueMin - min) / rango) * 100;
  const pctMax = ((valueMax - min) / rango) * 100;

  return (
    <div className="min-w-[220px]">
      <div className="flex items-baseline justify-between font-display text-[1.6rem] font-extrabold leading-none tabular-nums text-ink">
        <span>{formatARS(valueMin)}</span>
        <span className="mx-2 h-0.5 flex-1 translate-y-[-0.25em] rounded-full bg-line-strong" aria-hidden="true" />
        <span>{formatARS(valueMax)}</span>
      </div>
      <div className="price-range mt-2">
        <div className="pointer-events-none absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-neutral-200" />
        <div
          className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-sheet"
          style={{ left: `${pctMin}%`, width: `${Math.max(0, pctMax - pctMin)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), valueMax - step);
            onChange(Math.max(min, next), valueMax);
          }}
          aria-label="Precio mínimo"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), valueMin + step);
            onChange(valueMin, Math.min(max, next));
          }}
          aria-label="Precio máximo"
        />
      </div>
    </div>
  );
}
