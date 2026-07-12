"use client";

import { useState } from "react";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import Modal from "./Modal";

export default function EditItemModal({ open, onClose, item, onUpdated }) {
  const [nombre, setNombre] = useState(item?.nombre || "");
  const [observaciones, setObservaciones] = useState(item?.observaciones || "");
  const [urlValue, setUrlValue] = useState(item?.url || "");
  const [notaValue, setNotaValue] = useState(item?.nota || "");
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [protegido, setProtegido] = useState(!!item?.protegido);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  if (!item) return null;

  const esArchivo = item.tipo === "archivo" || item.tipo === "imagen" || item.tipo === "video";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = {
        nombre: nombre.trim(),
        observaciones: observaciones.trim(),
        protegido,
      };

      if (item.tipo === "url") {
        updates.url = urlValue.trim();
      }

      if (item.tipo === "nota") {
        updates.nota = notaValue.trim();
      }

      // Si el usuario eligió un archivo nuevo, lo sube y reemplaza el anterior
      if (esArchivo && nuevoArchivo) {
        setProgressLabel("Subiendo archivo nuevo...");
        const newPath = `modulos/${item.modulo_id}/${Date.now()}_${nuevoArchivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(newPath, nuevoArchivo);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newPath);
        updates.url = urlData.publicUrl;
        updates.storage_path = newPath;

        // Borra el archivo viejo del almacenamiento para no dejar basura
        if (item.storage_path) {
          await supabase.storage.from(BUCKET_NAME).remove([item.storage_path]);
        }
      }

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
      setProgressLabel("");
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

        {item.tipo === "url" && (
          <div>
            <label className="text-xs text-inkSoft">Enlace</label>
            <input
              type="url"
              className="input mt-1"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              required
            />
          </div>
        )}

        {item.tipo === "nota" && (
          <div>
            <label className="text-xs text-inkSoft">Contenido de la nota</label>
            <textarea
              className="input mt-1"
              rows={4}
              value={notaValue}
              onChange={(e) => setNotaValue(e.target.value)}
              required
            />
          </div>
        )}

        {esArchivo && (
          <div>
            <label className="text-xs text-inkSoft">
              Archivo actual: {item.storage_path ? item.storage_path.split("/").pop() : "—"}
            </label>
            <input
              type="file"
              className="input mt-1"
              accept={item.tipo === "imagen" ? "image/*" : item.tipo === "video" ? "video/*" : undefined}
              onChange={(e) => setNuevoArchivo(e.target.files?.[0] || null)}
            />
            <div className="text-xs text-inkSoft mt-1">
              Deja esto vacío si no quieres reemplazar el archivo, solo cambiar el nombre u observaciones.
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-inkSoft">Observaciones</label>
          <textarea
            className="input mt-1"
            rows={2}
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
          {loading ? (progressLabel || "Guardando...") : "Guardar cambios"}
        </button>
      </form>
    </Modal>
  );
}
