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
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
        <span>{formatARS(valueMin)}</span>
        <span>{formatARS(valueMax)}</span>
      </div>
      <div className="price-range mt-1">
        <div className="pointer-events-none absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-neutral-200" />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-pink-500"
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
