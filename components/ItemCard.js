"use client";

import { useState } from "react";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import PasswordGate, { isUnlocked } from "./PasswordGate";
import EditItemModal from "./EditItemModal";

const ICONS = {
  archivo: "📄",
  imagen: "🖼️",
  video: "🎬",
  url: "🔗",
  nota: "📝",
};

export default function ItemCard({ item, onChanged }) {
  const storageKey = `item:${item.id}`;
  const [unlocked, setUnlocked] = useState(
    !item.protegido || isUnlocked(storageKey)
  );
  const [showGate, setShowGate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  async function handleDelete() {
    const ok = confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    if (item.storage_path) {
      await supabase.storage.from(BUCKET_NAME).remove([item.storage_path]);
    }

    const { error } = await supabase.from("items").delete().eq("id", item.id);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar el archivo.");
      return;
    }
    onChanged?.();
  }

  if (item.protegido && !unlocked) {
    return (
      <div className="card p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span>{ICONS[item.tipo] || "📄"}</span>
            <span className="text-sm font-medium text-ink">{item.nombre}</span>
          </div>
          <button
            className="text-xs text-gold hover:underline"
            onClick={() => setShowGate(true)}
          >
            🔒 Desbloquear
          </button>
        </div>
        {showGate && (
          <div className="mt-3">
            <PasswordGate
              storageKey={storageKey}
              passwordHash={item.password_hash}
              title={item.nombre}
              onUnlock={() => setUnlocked(true)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card p-4 group relative">
      <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
        <button
          onClick={() => setShowEdit(true)}
          className="w-7 h-7 rounded-md bg-paper border border-line flex items-center justify-center text-xs hover:border-gold hover:text-gold"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="w-7 h-7 rounded-md bg-paper border border-line flex items-center justify-center text-xs hover:border-terracotta hover:text-terracotta"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>

      <div className="flex items-start gap-3 pr-14">
        <span className="text-xl">{ICONS[item.tipo] || "📄"}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink truncate">{item.nombre}</div>
          {item.observaciones && (
            <div className="text-xs text-inkSoft mt-0.5">{item.observaciones}</div>
          )}

          {item.tipo === "nota" && (
            <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{item.nota}</p>
          )}

          {item.tipo === "imagen" && item.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.nombre} className="mt-2 rounded-lg max-h-48 object-cover" />
          )}

          {item.tipo === "video" && item.url && (
            <video src={item.url} controls className="mt-2 rounded-lg max-h-48 w-full" />
          )}

          {(item.tipo === "url" || item.tipo === "archivo") && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:underline mt-2 inline-block"
            >
              Abrir →
            </a>
          )}
        </div>
      </div>

      <EditItemModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        item={item}
        onUpdated={onChanged}
      />
    </div>
  );
}
