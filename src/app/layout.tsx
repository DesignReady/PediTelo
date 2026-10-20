import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

// Plus Jakarta Sans para el texto y Bricolage Grotesque para títulos y cifras.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PediTelo — Reservá tu alojamiento por horas, al instante",
  description:
    "Encontrá hoteles de alojamiento con disponibilidad ahora mismo y reservá tu turno de 1, 3 o 5 horas en segundos.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffafc" },
    { media: "(prefers-color-scheme: dark)", color: "#14060d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${jakarta.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-ground text-ink">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-sheet focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1 pb-24 sm:pb-0">
          {children}
        </main>
        <footer className="px-4 pb-28 pt-6 text-center text-xs text-ink-3 sm:pb-8">
          <p className="font-display text-base font-bold tracking-wide text-ink-2">PediTelo</p>
          <p className="mt-0.5">Versión demo · hoteles y disponibilidad simulados.</p>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
