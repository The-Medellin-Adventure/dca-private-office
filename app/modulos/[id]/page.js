"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import AddItemModal from "@/components/AddItemModal";
import DataTable from "@/components/DataTable";
import PasswordGate, { isUnlocked } from "@/components/PasswordGate";

export default function ModuloDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [modulo, setModulo] = useState(null);
  const [items, setItems] = useState([]);
  const [tablas, setTablas] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [ready, setReady] = useState(false);

  const loadAll = useCallback(async () => {
    if (!id) return;

    const [{ data: moduloData, error: moduloError }, { data: itemsData }, { data: tablasData }] =
      await Promise.all([
        supabase.from("modulos").select("*").eq("id", id).single(),
        supabase.from("items").select("*").eq("modulo_id", id).order("creado_en", { ascending: false }),
        supabase.from("tablas").select("*").eq("modulo_id", id),
      ]);

    if (moduloError) {
      console.error(moduloError);
      setModulo(null);
      setReady(true);
      return;
    }

    setModulo(moduloData);
    setUnlocked(!moduloData.protegido || isUnlocked(`modulo:${id}`));
    setItems(itemsData || []);
    setTablas(tablasData || []);
    setReady(true);
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleNuevaTabla() {
    const nombre = prompt("Nombre de la tabla:");
    if (!nombre) return;
    const { error } = await supabase.from("tablas").insert({
      modulo_id: id,
      nombre,
      columnas: ["Columna 1", "Columna 2"],
      filas: [],
    });
    if (error) {
      console.error(error);
      alert("No se pudo crear la tabla.");
      return;
    }
    loadAll();
  }

  async function handleDeleteModulo() {
    const ok = confirm(
      `¿Eliminar el módulo "${modulo.nombre}" junto con todos sus archivos y tablas? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    const { error } = await supabase.from("modulos").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el módulo.");
      return;
    }
    router.push("/");
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

  if (!modulo) {
    return (
      <div className="flex min-h-screen">
        <Sidebar ownerName="" ownerRole="" />
        <main className="flex-1 flex items-center justify-center text-inkSoft text-sm">
          Módulo no encontrado.
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName="" ownerRole="" />
      <main className="flex-1 px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{modulo.icono}</span>
            <h1 className="font-serif text-3xl text-ink">{modulo.nombre}</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={() => router.push(`/modulos/${id}/editar`)}
            >
              ✏️ Editar módulo
            </button>
            <button
              className="btn-secondary text-sm hover:border-terracotta hover:text-terracotta"
              onClick={handleDeleteModulo}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>

        {modulo.protegido && !unlocked ? (
          <PasswordGate
            storageKey={`modulo:${id}`}
            passwordHash={modulo.password_hash}
            title={modulo.nombre}
            onUnlock={() => setUnlocked(true)}
          />
        ) : (
          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-ink">Archivos y contenido</h2>
                <button className="btn-primary text-sm" onClick={() => setShowAddItem(true)}>
                  + Agregar
                </button>
              </div>

              {items.length === 0 ? (
                <div className="card p-8 text-center text-sm text-inkSoft">
                  Aún no hay archivos en este módulo.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} onChanged={loadAll} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-ink">Tablas</h2>
                <button className="btn-secondary text-sm" onClick={handleNuevaTabla}>
                  + Nueva tabla
                </button>
              </div>

              {tablas.length === 0 ? (
                <div className="card p-8 text-center text-sm text-inkSoft">
                  Aún no hay tablas en este módulo.
                </div>
              ) : (
                <div className="space-y-6">
                  {tablas.map((t) => (
                    <DataTable key={t.id} tabla={t} onChanged={loadAll} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <AddItemModal
          open={showAddItem}
          onClose={() => setShowAddItem(false)}
          moduloId={id}
          onCreated={loadAll}
        />
      </main>
    </div>
  );
}
