"use client";

import { useState } from "react";
import { hashPassword } from "@/lib/crypto";

// storageKey identifica qué se desbloquea (ej: `modulo:abc123`).
// Una vez correcta la contraseña, se guarda en sessionStorage para
// no pedirla de nuevo en la misma sesión del navegador.
export default function PasswordGate({ storageKey, passwordHash, onUnlock, title }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const hash = await hashPassword(value);
    if (hash === passwordHash) {
      sessionStorage.setItem(`unlocked:${storageKey}`, "1");
      setError("");
      onUnlock();
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  return (
    <div className="card max-w-sm mx-auto mt-16 p-8 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <div className="font-serif text-2xl text-ink mb-1">{title || "Contenido protegido"}</div>
      <p className="text-sm text-inkSoft mb-5">
        Este contenido tiene una contraseña asignada. Ingrésala para continuar.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          autoFocus
          className="input"
          placeholder="Contraseña"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <div className="text-xs text-terracotta">{error}</div>}
        <button type="submit" className="btn-primary w-full justify-center">
          Desbloquear
        </button>
      </form>
    </div>
  );
}

export function isUnlocked(storageKey) {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`unlocked:${storageKey}`) === "1";
}
