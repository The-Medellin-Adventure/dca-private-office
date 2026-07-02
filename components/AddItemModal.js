"use client";

import { useState } from "react";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import Modal from "./Modal";

const TIPOS = [
  { value: "archivo", label: "Archivo (PDF, Word, etc.)" },
  { value: "imagen", label: "Imagen" },
  { value: "video", label: "Video" },
  { value: "url", label: "Enlace / URL" },
  { value: "nota", label: "Nota de texto" },
];

export default function AddItemModal({ open, onClose, moduloId, onCreated }) {
  const [tipo, setTipo] = useState("archivo");
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [notaValue, setNotaValue] = useState("");
  const [file, setFile] = useState(null);
  const [protegido, setProtegido] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  function resetForm() {
    setTipo("archivo");
    setNombre("");
    setObservaciones("");
    setUrlValue("");
    setNotaValue("");
    setFile(null);
    setProtegido(false);
    setPassword("");
    setProgressLabel("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);

    try {
      let fileUrl = null;
      let storagePath = null;

      if ((tipo === "archivo" || tipo === "imagen" || tipo === "video") && file) {
        setProgressLabel("Subiendo archivo...");
        storagePath = `modulos/${moduloId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        fileUrl = urlData.publicUrl;
      }

      const passwordHash = protegido && password ? await hashPassword(password) : null;

      const { error: insertError } = await supabase.from("items").insert({
        modulo_id: moduloId,
        tipo,
        nombre: nombre.trim(),
        observaciones: observaciones.trim(),
        url: tipo === "url" ? urlValue.trim() : fileUrl,
        storage_path: storagePath,
        nota: tipo === "nota" ? notaValue.trim() : null,
        protegido: !!protegido,
        password_hash: passwordHash,
      });

      if (insertError) throw insertError;

      resetForm();
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar. Revisa la consola para más detalle.");
    } finally {
      setLoading(false);
      setProgressLabel("");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar contenido">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-inkSoft">Tipo de contenido</label>
          <select className="input mt-1" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-inkSoft">Nombre</label>
          <input
            className="input mt-1"
            placeholder="Ej: Contrato de arrendamiento - Local 302"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {(tipo === "archivo" || tipo === "imagen" || tipo === "video") && (
          <div>
            <label className="text-xs text-inkSoft">Archivo</label>
            <input
              type="file"
              className="input mt-1"
              accept={tipo === "imagen" ? "image/*" : tipo === "video" ? "video/*" : undefined}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        )}

        {tipo === "url" && (
          <div>
            <label className="text-xs text-inkSoft">Enlace</label>
            <input
              type="url"
              className="input mt-1"
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              required
            />
          </div>
        )}

        {tipo === "nota" && (
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

        <div>
          <label className="text-xs text-inkSoft">Observaciones</label>
          <textarea
            className="input mt-1"
            rows={2}
            placeholder="Notas, contexto, fechas importantes..."
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
            <input
              type="password"
              className="input mt-2"
              placeholder="Contraseña para este archivo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? (progressLabel || "Guardando...") : "Guardar"}
        </button>
      </form>
    </Modal>
  );
}
