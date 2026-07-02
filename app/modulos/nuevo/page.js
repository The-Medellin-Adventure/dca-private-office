"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import Sidebar from "@/components/Sidebar";

const ICONOS = ["📁", "⚖️", "🏢", "💰", "❤️", "🚗", "🏠", "📅", "☁️"];

export default function NuevoModuloPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState(ICONOS[0]);
  const [protegido, setProtegido] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      const passwordHash = protegido && password ? await hashPassword(password) : null;

      const { data, error } = await supabase
        .from("modulos")
        .insert({
          nombre: nombre.trim(),
          icono,
          protegido,
          password_hash: passwordHash,
          orden: Date.now(),
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/modulos/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el módulo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName="" ownerRole="" />
      <main className="flex-1 px-6 md:px-8 py-10">
        <div className="max-w-lg mx-auto card p-8">
          <h1 className="font-serif text-3xl text-ink mb-6">Nuevo módulo</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-inkSoft">Nombre del módulo</label>
              <input
                className="input mt-1"
                placeholder="Ej: Jurídico, Finanzas, Vehículos..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-inkSoft">Ícono</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICONOS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcono(ic)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg ${
                      icono === ic ? "border-gold bg-goldSoft/30" : "border-line"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={protegido}
                  onChange={(e) => setProtegido(e.target.checked)}
                />
                Proteger todo el módulo con contraseña
              </label>
              {protegido && (
                <input
                  type="password"
                  className="input mt-2"
                  placeholder="Contraseña del módulo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "Creando..." : "Crear módulo"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
