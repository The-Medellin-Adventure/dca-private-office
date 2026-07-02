"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModuleCard from "@/components/ModuleCard";

export default function DashboardPage() {
  const [modulos, setModulos] = useState([]);
  const [ready, setReady] = useState(false);
  const [query_, setQuery] = useState("");

  const ownerName = process.env.NEXT_PUBLIC_OWNER_NAME || "Tu nombre";
  const ownerRole = process.env.NEXT_PUBLIC_OWNER_ROLE || "Tu rol";

  async function loadModulos() {
    const { data, error } = await supabase
      .from("modulos")
      .select("*, items(count)")
      .order("orden", { ascending: true });

    if (error) {
      console.error(error);
      setReady(true);
      return;
    }

    setModulos(
      (data || []).map((m) => ({
        ...m,
        totalItems: m.items?.[0]?.count ?? 0,
      }))
    );
    setReady(true);
  }

  useEffect(() => {
    loadModulos();
  }, []);

  const filtered = useMemo(() => {
    if (!query_.trim()) return modulos;
    return modulos.filter((m) =>
      m.nombre?.toLowerCase().includes(query_.toLowerCase())
    );
  }, [modulos, query_]);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName={ownerName} ownerRole={ownerRole} />

      <main className="flex-1">
        <TopBar query={query_} onQueryChange={setQuery} />

        <div className="px-6 md:px-8 pb-10 space-y-8">
          <section className="card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm text-inkSoft mb-1">Buenos días,</div>
              <h1 className="font-serif text-4xl text-ink">{ownerName}</h1>
              <div className="text-gold text-sm mt-1">{ownerRole}</div>
              <p className="text-inkSoft text-sm mt-4 max-w-md italic">
                &quot;La organización es la clave del éxito profesional y personal.&quot;
              </p>
            </div>
            <div className="text-xs text-inkSoft capitalize">{today}</div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-ink">Tus módulos</h2>
              <Link href="/modulos/nuevo" className="btn-secondary text-sm">
                + Nuevo módulo
              </Link>
            </div>

            {!ready && (
              <div className="text-sm text-inkSoft">Cargando módulos...</div>
            )}

            {ready && filtered.length === 0 && (
              <div className="card p-10 text-center">
                <div className="text-3xl mb-2">📁</div>
                <div className="font-serif text-xl text-ink mb-1">Aún no tienes módulos</div>
                <p className="text-sm text-inkSoft mb-4">
                  Crea tu primer módulo (por ejemplo &quot;Jurídico&quot; o &quot;Finanzas&quot;) para empezar a organizar tu información.
                </p>
                <Link href="/modulos/nuevo" className="btn-primary inline-flex">
                  Crear módulo
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((m) => (
                <ModuleCard key={m.id} modulo={m} />
              ))}
            </div>
          </section>

          <footer className="text-center text-xs text-inkSoft pt-6 border-t border-line">
            Tu información. Bajo tu control.
          </footer>
        </div>
      </main>
    </div>
  );
}
