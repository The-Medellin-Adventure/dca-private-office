"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import Sidebar from "@/components/Sidebar";

const ICONOS = ["📁", "⚖️", "🏢", "💰", "❤️", "🚗", "🏠", "📅", "☁️"];

export default function EditarModuloPage() {
  const { id } = useParams();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState(ICONOS[0]);
  const [protegido, setProtegido] = useState(false);
  const [password, setPassword] = useState("");
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("modulos").select("*").eq("id", id).single();
      if (!error && data) {
        setNombre(data.nombre || "");
        setIcono(data.icono || ICONOS[0]);
        setProtegido(!!data.protegido);
      }
      setReady(true);
    }
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      const updates = {
        nombre: nombre.trim(),
        icono,
        protegido,
      };

      if (protegido && cambiarPassword && password) {
        updates.password_hash = await hashPassword(password);
      }
      if (!protegido) {
        updates.password_hash = null;
      }

      const { error } = await supabase.from("modulos").update(updates).eq("id", id);
      if (error) throw error;

      router.push(`/modulos/${id}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el módulo.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen">
        <Sidebar ownerName="" ownerRole="" />
        <main className="flex-1 flex items-center justify-center text-inkSoft text-sm">
          Cargando...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName="" ownerRole="" />
      <main className="flex-1 px-6 md:px-8 py-10">
        <div className="max-w-lg mx-auto card p-8">
          <h1 className="font-serif text-3xl text-ink mb-6">Editar módulo</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-inkSoft">Nombre del módulo</label>
              <input
                className="input mt-1"
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
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-inkSoft">
                    <input
                      type="checkbox"
                      checked={cambiarPassword}
                      onChange={(e) => setCambiarPassword(e.target.checked)}
                    />
                    Establecer / cambiar la contraseña
                  </label>
                  {cambiarPassword && (
                    <input
                      type="password"
                      className="input"
                      placeholder="Nueva contraseña del módulo"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 justify-center"
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
