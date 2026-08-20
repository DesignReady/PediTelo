"use client";

import { useCallback, useEffect, useState } from "react";

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
    return <div className="px-4 py-16 text-center text-neutral-400">Cargando…</div>;
  }

  if (!autenticado) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-extrabold text-neutral-800">Acceso restringido</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ingresá la clave maestra para administrar las cuentas de los hoteles.
        </p>
        <form onSubmit={iniciarSesion} className="mt-5 space-y-3">
          <input
            type="password"
            value={passwordMaestra}
            onChange={(e) => setPasswordMaestra(e.target.value)}
            placeholder="Clave maestra"
            autoFocus
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          {errorLogin && <p className="text-xs font-medium text-red-600">{errorLogin}</p>}
          <button
            type="submit"
            disabled={ingresando}
            className="w-full rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {ingresando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
        Cuentas de hoteles
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Creá o restablecé el acceso de cada hotel a su propio panel de administración.
      </p>

      {credenciales && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            Cuenta lista — copiá estos datos ahora, no se vuelven a mostrar:
          </p>
          <p className="mt-2 text-sm text-emerald-900">
            Usuario: <span className="font-mono font-semibold">{credenciales.email}</span>
          </p>
          <p className="text-sm text-emerald-900">
            Contraseña: <span className="font-mono font-semibold">{credenciales.password}</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            Mandaselo al hotel por el medio que prefieras junto con el link{" "}
            <span className="font-mono">/admin/login</span>.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {hotels.map((h) => (
          <div key={h.id} className="rounded-xl border border-pink-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-800">{h.nombre}</p>
                <p className="text-xs text-neutral-400">{h.zona}</p>
              </div>
              {h.email ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  Cuenta activa
                </span>
              ) : (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-400">
                  Sin cuenta
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={emailPorHotel[h.id] ?? h.email ?? ""}
                onChange={(e) =>
                  setEmailPorHotel((prev) => ({ ...prev, [h.id]: e.target.value }))
                }
                placeholder="email@hotel.com"
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
              />
              <button
                onClick={() => crearCuenta(h.id)}
                disabled={creandoPara === h.id}
                className="shrink-0 rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
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
