"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ModuleCard({ modulo, onChanged }) {
  const router = useRouter();

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    const ok = confirm(
      `¿Eliminar el módulo "${modulo.nombre}"? Esto borra también todos sus archivos y tablas. Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    const { error } = await supabase.from("modulos").delete().eq("id", modulo.id);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el módulo.");
      return;
    }
    onChanged?.();
  }

  function handleEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/modulos/${modulo.id}/editar`);
  }

  return (
    <Link
      href={`/modulos/${modulo.id}`}
      className="card p-5 flex flex-col gap-3 hover:border-gold hover:-translate-y-0.5 transition-all relative group"
    >
      <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
        <button
          onClick={handleEdit}
          className="w-7 h-7 rounded-md bg-paper border border-line flex items-center justify-center text-xs hover:border-gold hover:text-gold"
          title="Editar módulo"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="w-7 h-7 rounded-md bg-paper border border-line flex items-center justify-center text-xs hover:border-terracotta hover:text-terracotta"
          title="Eliminar módulo"
        >
          🗑️
        </button>
      </div>

      <div className="w-10 h-10 rounded-lg bg-goldSoft/30 flex items-center justify-center text-xl">
        {modulo.icono || "📁"}
      </div>
      <div>
        <div className="font-serif text-xl text-ink flex items-center gap-2">
          {modulo.nombre}
          {modulo.protegido && (
            <span title="Módulo protegido con contraseña" className="text-xs">🔒</span>
          )}
        </div>
        <div className="text-xs text-inkSoft mt-0.5">
          {modulo.totalItems ?? 0} archivos
        </div>
      </div>
    </Link>
  );
}
