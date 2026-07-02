"use client";

import Link from "next/link";

export default function ModuleCard({ modulo }) {
  return (
    <Link
      href={`/modulos/${modulo.id}`}
      className="card p-5 flex flex-col gap-3 hover:border-gold hover:-translate-y-0.5 transition-all"
    >
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
