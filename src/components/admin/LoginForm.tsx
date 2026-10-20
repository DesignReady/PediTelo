"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlert, IconKey } from "../icons";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo ingresar");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="sign px-7 pb-7 pt-7 [--r:1.75rem]" data-glint="1">
        <div className="relative z-[3]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sheet text-white">
            <IconKey size={24} />
          </span>
          <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[0.92]">
            Panel de tu hotel
          </h1>
          <p className="mt-2 text-ink-2">
            Ingresá con el email y la contraseña que te dio PediTelo.
          </p>
        </div>
      </div>

      <form onSubmit={enviar} className="panel mt-4 space-y-4 p-5">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-bold text-ink-2">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            autoFocus
            required
            className="field"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-bold text-ink-2">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="field"
          />
        </div>
        {error && (
          <p role="alert" className="flex gap-2 text-sm font-semibold text-red-600">
            <IconAlert size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
        <button type="submit" disabled={enviando} className="btn btn-primary w-full !min-h-14 !text-xl">
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
