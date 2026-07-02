"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// tabla = { id, columnas: string[], filas: string[][] }
export default function DataTable({ tabla, onChanged }) {
  const [nombre, setNombre] = useState(tabla.nombre || "Tabla");
  const [columnas, setColumnas] = useState(tabla.columnas || ["Columna 1"]);
  const [filas, setFilas] = useState(tabla.filas || []);
  const [saving, setSaving] = useState(false);

  async function persistNombre(nextNombre) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tablas")
        .update({ nombre: nextNombre })
        .eq("id", tabla.id);
      if (error) throw error;
      onChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTabla() {
    const ok = confirm(`¿Eliminar la tabla "${nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    const { error } = await supabase.from("tablas").delete().eq("id", tabla.id);
    if (error) {
      console.error(error);
      alert("No se pudo eliminar la tabla.");
      return;
    }
    onChanged?.();
  }

  async function persist(nextColumnas, nextFilas) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tablas")
        .update({ columnas: nextColumnas, filas: nextFilas })
        .eq("id", tabla.id);
      if (error) throw error;
      onChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function addColumn() {
    const next = [...columnas, `Columna ${columnas.length + 1}`];
    setColumnas(next);
    const nextFilas = filas.map((f) => [...f, ""]);
    setFilas(nextFilas);
    persist(next, nextFilas);
  }

  function addRow() {
    const next = [...filas, columnas.map(() => "")];
    setFilas(next);
    persist(columnas, next);
  }

  function updateCell(rowIdx, colIdx, value) {
    const next = filas.map((f, i) =>
      i === rowIdx ? f.map((c, j) => (j === colIdx ? value : c)) : f
    );
    setFilas(next);
  }

  function updateHeader(colIdx, value) {
    const next = columnas.map((c, i) => (i === colIdx ? value : c));
    setColumnas(next);
  }

  function removeRow(rowIdx) {
    const next = filas.filter((_, i) => i !== rowIdx);
    setFilas(next);
    persist(columnas, next);
  }

  function removeColumn(colIdx) {
    if (columnas.length <= 1) {
      alert("Debe quedar al menos una columna.");
      return;
    }
    const nextColumnas = columnas.filter((_, i) => i !== colIdx);
    const nextFilas = filas.map((f) => f.filter((_, i) => i !== colIdx));
    setColumnas(nextColumnas);
    setFilas(nextFilas);
    persist(nextColumnas, nextFilas);
  }

  return (
    <div className="card p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-3 gap-3">
        <input
          className="font-serif text-xl text-ink bg-transparent focus:outline-none flex-1 min-w-0"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => persistNombre(nombre)}
        />
        <div className="flex gap-2 shrink-0">
          <button className="btn-secondary text-xs" onClick={addColumn}>+ Columna</button>
          <button className="btn-secondary text-xs" onClick={addRow}>+ Fila</button>
          <button
            className="btn-primary text-xs"
            onClick={() => persist(columnas, filas)}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            className="btn-secondary text-xs hover:border-terracotta hover:text-terracotta"
            onClick={handleDeleteTabla}
            title="Eliminar tabla"
          >
            🗑️
          </button>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columnas.map((col, colIdx) => (
              <th key={colIdx} className="text-left border-b border-line pb-2 pr-4">
                <div className="flex items-center gap-1">
                  <input
                    className="bg-transparent font-medium text-ink w-full focus:outline-none"
                    value={col}
                    onChange={(e) => updateHeader(colIdx, e.target.value)}
                    onBlur={() => persist(columnas, filas)}
                  />
                  <button
                    className="text-inkSoft hover:text-terracotta text-xs shrink-0"
                    onClick={() => removeColumn(colIdx)}
                    title="Eliminar columna"
                  >
                    ×
                  </button>
                </div>
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, rowIdx) => (
            <tr key={rowIdx} className="border-b border-line/60">
              {fila.map((celda, colIdx) => (
                <td key={colIdx} className="py-2 pr-4">
                  <input
                    className="bg-transparent text-ink w-full focus:outline-none"
                    value={celda}
                    onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                    onBlur={() => persist(columnas, filas)}
                  />
                </td>
              ))}
              <td>
                <button
                  className="text-inkSoft hover:text-terracotta text-xs"
                  onClick={() => removeRow(rowIdx)}
                  aria-label="Eliminar fila"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filas.length === 0 && (
        <div className="text-xs text-inkSoft mt-3">Aún no hay filas. Usa &quot;+ Fila&quot; para empezar.</div>
      )}
    </div>
  );
}
