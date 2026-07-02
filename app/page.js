"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModuleCard from "@/components/ModuleCard";

export default function DashboardPage() {
  const [modulos, setModulos] = useState([]);
  const [ready, setReady] = useState(false);
  const [query_, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

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

  // Buscador global: busca coincidencias en nombres de módulos y en
  // nombre/observaciones de archivos, con un pequeño retraso para no
  // disparar una búsqueda en cada tecla.
  useEffect(() => {
    const term = query_.trim();
    if (!term) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      const [{ data: modulosMatch }, { data: itemsMatch }] = await Promise.all([
        supabase.from("modulos").select("*").ilike("nombre", `%${term}%`),
        supabase
          .from("items")
          .select("*, modulos(nombre, icono)")
          .or(`nombre.ilike.%${term}%,observaciones.ilike.%${term}%`)
          .limit(20),
      ]);

      setSearchResults({
        modulos: modulosMatch || [],
        items: itemsMatch || [],
      });
      setSearching(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query_]);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const isSearchMode = query_.trim().length > 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName={ownerName} ownerRole={ownerRole} />

      <main className="flex-1">
        <TopBar query={query_} onQueryChange={setQuery} />

        <div className="px-6 md:px-8 pb-10 space-y-8">
          {!isSearchMode && (
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
          )}

          {isSearchMode ? (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">
                Resultados para &quot;{query_}&quot;
              </h2>

              {searching && <div className="text-sm text-inkSoft">Buscando...</div>}

              {!searching && searchResults && (
                <div className="space-y-8">
                  {searchResults.modulos.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-inkSoft mb-2">
                        Módulos
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {searchResults.modulos.map((m) => (
                          <ModuleCard key={m.id} modulo={m} onChanged={loadModulos} />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.items.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-inkSoft mb-2">
                        Archivos
                      </div>
                      <div className="space-y-2">
                        {searchResults.items.map((item) => (
                          <Link
                            key={item.id}
                            href={`/modulos/${item.modulo_id}`}
                            className="card p-4 flex items-center justify-between hover:border-gold transition-colors"
                          >
                            <div>
                              <div className="text-sm font-medium text-ink">{item.nombre}</div>
                              {item.observaciones && (
                                <div className="text-xs text-inkSoft">{item.observaciones}</div>
                              )}
                            </div>
                            <div className="text-xs text-inkSoft flex items-center gap-1">
                              {item.modulos?.icono} {item.modulos?.nombre}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.modulos.length === 0 && searchResults.items.length === 0 && (
                    <div className="card p-10 text-center text-sm text-inkSoft">
                      No encontramos nada con ese término.
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
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

              {ready && modulos.length === 0 && (
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
                {modulos.map((m) => (
                  <ModuleCard key={m.id} modulo={m} onChanged={loadModulos} />
                ))}
              </div>
            </section>
          )}

          <footer className="text-center text-xs text-inkSoft pt-6 border-t border-line">
            Tu información. Bajo tu control.
          </footer>
        </div>
      </main>
    </div>
  );
}
