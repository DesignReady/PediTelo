"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlert, IconCheck, IconKey } from "../icons";

interface HotelConCuenta {
  id: string;
  slug: string;
  nombre: string;
  zona: string;
  email: string | null;
}

interface CredencialesGeneradas {
  hotelId: string;
  email: string;
  password: string;
}

export default function SuperadminClient() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [passwordMaestra, setPasswordMaestra] = useState("");
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [ingresando, setIngresando] = useState(false);

  const [hotels, setHotels] = useState<HotelConCuenta[]>([]);
  const [emailPorHotel, setEmailPorHotel] = useState<Record<string, string>>({});
  const [creandoPara, setCreandoPara] = useState<string | null>(null);
  const [credenciales, setCredenciales] = useState<CredencialesGeneradas | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarHoteles = useCallback(async () => {
    const res = await fetch("/api/superadmin/hotels");
    if (res.status === 401) {
      setAutenticado(false);
      return;
    }
    const data = await res.json();
    setHotels(data.hotels ?? []);
    setAutenticado(true);
  }, []);

  useEffect(() => {
    cargarHoteles();
  }, [cargarHoteles]);

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();
    setIngresando(true);
    setErrorLogin(null);
    try {
      const res = await fetch("/api/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordMaestra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorLogin(data.error ?? "No se pudo ingresar");
        return;
      }
      setPasswordMaestra("");
      await cargarHoteles();
    } finally {
      setIngresando(false);
    }
  }

  async function crearCuenta(hotelId: string) {
    const email = emailPorHotel[hotelId]?.trim();
    if (!email) return;
    setCreandoPara(hotelId);
    setError(null);
    setCredenciales(null);
    try {
      const res = await fetch("/api/superadmin/cuentas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta");
        return;
      }
      setCredenciales({ hotelId, email: data.email, password: data.password });
      cargarHoteles();
    } finally {
      setCreandoPara(null);
    }
  }

  if (autenticado === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-16" aria-hidden="true">
        <div className="sign sign--ghost h-44" />
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="sign px-7 pb-7 pt-7 [--r:1.75rem]" data-glint="1">
          <div className="relative z-[3]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sheet text-white">
              <IconKey size={24} />
            </span>
            <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[0.92]">
              Acceso restringido
            </h1>
            <p className="mt-2 text-ink-2">
              Ingresá la clave maestra para administrar las cuentas de los hoteles.
            </p>
          </div>
        </div>
        <form onSubmit={iniciarSesion} className="panel mt-4 space-y-4 p-5">
          <div>
            <label htmlFor="clave-maestra" className="mb-1 block text-sm font-bold text-ink-2">
              Clave maestra
            </label>
            <input
              id="clave-maestra"
              type="password"
              value={passwordMaestra}
              onChange={(e) => setPasswordMaestra(e.target.value)}
              autoFocus
              required
              className="field"
            />
          </div>
          {errorLogin && (
            <p role="alert" className="flex gap-2 text-sm font-semibold text-red-600">
              <IconAlert size={18} className="mt-0.5 shrink-0" />
              {errorLogin}
            </p>
          )}
          <button
            type="submit"
            disabled={ingresando}
            className="btn btn-primary w-full !min-h-14 !text-xl"
          >
            {ingresando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-[2.6rem] font-extrabold leading-[0.92] sm:text-[3.2rem]">
        Cuentas de hoteles
      </h1>
      <p className="mt-2 max-w-[60ch] text-ink-2">
        Creá o restablecé el acceso de cada hotel a su propio panel de administración.
      </p>

      {credenciales && (
        <div role="status" className="ticket rise-in mt-5" style={{ ["--notch" as string]: "46%" }}>
          <div className="px-6 pb-4 pt-5">
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold leading-none">
              <IconCheck size={22} className="text-sheet" />
              Cuenta lista
            </p>
            <p className="mt-1.5 text-sm font-semibold text-ink-2">
              Copiá estos datos ahora, no se vuelven a mostrar.
            </p>
          </div>
          <div className="perforation mx-5" />
          <div className="space-y-1.5 px-6 pb-5 pt-4 text-[0.95rem]">
            <p>
              Usuario: <span className="font-mono font-bold">{credenciales.email}</span>
            </p>
            <p>
              Contraseña: <span className="font-mono font-bold">{credenciales.password}</span>
            </p>
            <p className="pt-1 text-sm text-ink-3">
              Mandaselo al hotel por el medio que prefieras junto con el link{" "}
              <span className="font-mono">/admin/login</span>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-700">
          <IconAlert size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {hotels.map((h, i) => (
          <div key={h.id} className="panel rise-in p-4" style={{ ["--d" as string]: `${Math.min(i, 8) * 45}ms` }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-[1.5rem] font-extrabold leading-none">{h.nombre}</p>
                <p className="mt-0.5 text-sm text-ink-3">{h.zona}</p>
              </div>
              {h.email ? (
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-display text-sm font-extrabold tracking-wide text-emerald-700">
                  Cuenta activa
                </span>
              ) : (
                <span className="rounded-md bg-surface-2 px-2.5 py-1 font-display text-sm font-extrabold tracking-wide text-ink-3">
                  Sin cuenta
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`email-${h.id}`} className="sr-only">
                Email de {h.nombre}
              </label>
              <input
                id={`email-${h.id}`}
                type="email"
                value={emailPorHotel[h.id] ?? h.email ?? ""}
                onChange={(e) =>
                  setEmailPorHotel((prev) => ({ ...prev, [h.id]: e.target.value }))
                }
                placeholder="email@hotel.com"
                className="field flex-1"
              />
              <button
                onClick={() => crearCuenta(h.id)}
                disabled={creandoPara === h.id}
                className="btn btn-primary shrink-0 !min-h-12 !px-5 !text-base"
              >
                {creandoPara === h.id
                  ? "Generando…"
                  : h.email
                  ? "Restablecer contraseña"
                  : "Crear cuenta"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
