import type { SVGProps } from "react";

// Un solo juego de íconos: trazo de 2px, extremos redondeados, grilla de 24.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconArrow = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);

export const IconBack = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Base>
);

export const IconPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </Base>
);

export const IconLocate = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    <circle cx="12" cy="12" r="7.5" />
  </Base>
);

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const IconStar = (p: IconProps) => (
  <Base {...p} fill="currentColor" strokeWidth={1.5}>
    <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3.2Z" />
  </Base>
);

export const IconHome = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
  </Base>
);

export const IconMap = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
    <path d="M9 4v14M15 6v14" />
  </Base>
);

export const IconUser = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6" />
  </Base>
);

export const IconKey = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="15" r="3.8" />
    <path d="m10.7 12.3 8-8M16 7l2.5 2.5M13.5 9.5 15.5 11.5" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const IconChevron = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const IconRoute = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
    <path d="M8.2 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.8" />
  </Base>
);

export const IconWaze = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4.5c4 0 7 2.8 7 6.2 0 2.5-1.7 4.7-4.1 5.7H9.1C6.7 15.4 5 13.2 5 10.7 5 7.3 8 4.5 12 4.5Z" />
    <circle cx="9.5" cy="10" r=".6" fill="currentColor" />
    <circle cx="14.5" cy="10" r=".6" fill="currentColor" />
    <path d="M9.5 12.8c1.4 1 3.6 1 5 0" />
    <circle cx="8.5" cy="18.4" r="1.6" />
    <circle cx="15.5" cy="18.4" r="1.6" />
  </Base>
);

export const IconGift = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="9" width="16" height="11" rx="1.5" />
    <path d="M3 9h18v-2.5H3zM12 6.5V20" />
    <path d="M12 6.5C12 4.5 10.5 3.5 9 3.5S6.5 5 8 6.5M12 6.5c0-2 1.5-3 3-3s2.5 1.5 1 3" />
  </Base>
);

export const IconTicket = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5V14a2 2 0 0 0 0-4Z" />
    <path d="M14 7.5v9" strokeDasharray="1.6 2.4" />
  </Base>
);

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4 3 19.5h18L12 4Z" />
    <path d="M12 10v4.2M12 17h.01" />
  </Base>
);

export const IconMask = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8c2.5-1.3 5-1.8 8-1.8S17.5 6.7 20 8v3.2c0 3.8-3.4 6.8-8 6.8s-8-3-8-6.8V8Z" />
    <path d="M8 11.2c.8.7 1.6.9 2.4.7M16 11.2c-.8.7-1.6.9-2.4.7" />
  </Base>
);

export const IconSettings = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
  </Base>
);

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconLogout = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H10" />
    <path d="M15 8l4 4-4 4M19 12H9.5" />
  </Base>
);

export const IconWifiOff = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3l18 18" />
    <path d="M8.5 16.4a5 5 0 0 1 6.9-.4M5 12.9a9.5 9.5 0 0 1 3-2M12 20h.01M19 12.9a9.5 9.5 0 0 0-5.6-2.7" />
  </Base>
);
