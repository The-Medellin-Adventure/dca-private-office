"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ModuleCard from "@/components/ModuleCard";

export default function ModulosPage() {
  const [modulos, setModulos] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("modulos")
        .select("*, items(count)")
        .order("orden", { ascending: true });

      if (!error) {
        setModulos(
          (data || []).map((m) => ({
            ...m,
            totalItems: m.items?.[0]?.count ?? 0,
          }))
        );
      } else {
        console.error(error);
      }
      setReady(true);
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar ownerName="" ownerRole="" />
      <main className="flex-1 px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl text-ink">Todos los módulos</h1>
          <Link href="/modulos/nuevo" className="btn-primary text-sm">
            + Nuevo módulo
          </Link>
        </div>

        {ready && modulos.length === 0 && (
          <div className="card p-10 text-center text-sm text-inkSoft">
            No tienes módulos todavía.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {modulos.map((m) => (
            <ModuleCard key={m.id} modulo={m} />
          ))}
        </div>
      </main>
    </div>
  );
}
