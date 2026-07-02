"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import Modal from "./Modal";

export default function EditItemModal({ open, onClose, item, onUpdated }) {
  const [nombre, setNombre] = useState(item?.nombre || "");
  const [observaciones, setObservaciones] = useState(item?.observaciones || "");
  const [protegido, setProtegido] = useState(!!item?.protegido);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = {
        nombre: nombre.trim(),
        observaciones: observaciones.trim(),
        protegido,
      };

      if (protegido && cambiarPassword && password) {
        updates.password_hash = await hashPassword(password);
      }
      if (!protegido) {
        updates.password_hash = null;
      }

      const { error } = await supabase.from("items").update(updates).eq("id", item.id);
      if (error) throw error;

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el archivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar archivo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-inkSoft">Nombre</label>
          <input
            className="input mt-1"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs text-inkSoft">Observaciones</label>
          <textarea
            className="input mt-1"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="border-t border-line pt-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={protegido}
              onChange={(e) => setProtegido(e.target.checked)}
            />
            Proteger este archivo con contraseña
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
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </Modal>
  );
}
