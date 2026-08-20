import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PediTelo — Reservá tu alojamiento por horas, al instante",
  description:
    "Encontrá hoteles de alojamiento con disponibilidad ahora mismo y reservá tu turno de 1, 3 o 5 horas en segundos.",
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <footer className="border-t border-pink-100 bg-white px-4 py-4 pb-24 text-center text-[11px] text-neutral-400 sm:pb-6">
          PediTelo — versión demo. Hoteles y disponibilidad simulados.
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
