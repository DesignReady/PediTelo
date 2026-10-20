"use client";

export default function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="group relative inline-flex h-11 w-[4.25rem] shrink-0 items-center justify-center rounded-full"
    >
      <span
        className={`relative inline-block h-8 w-14 rounded-full transition-colors duration-300 ${
          checked ? "bg-sheet" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-[0_2px_5px_rgba(63,19,41,0.4)] transition-transform duration-[320ms] [transition-timing-function:var(--ease-out)] group-active:scale-x-110 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
