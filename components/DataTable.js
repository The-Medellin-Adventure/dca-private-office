"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// tabla = { id, columnas: string[], filas: string[][] }
export default function DataTable({ tabla, onChanged }) {
  const [columnas, setColumnas] = useState(tabla.columnas || ["Columna 1"]);
  const [filas, setFilas] = useState(tabla.filas || []);
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="card p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="font-serif text-xl text-ink">{tabla.nombre}</div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs" onClick={addColumn}>+ Columna</button>
          <button className="btn-secondary text-xs" onClick={addRow}>+ Fila</button>
          <button
            className="btn-primary text-xs"
            onClick={() => persist(columnas, filas)}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columnas.map((col, colIdx) => (
              <th key={colIdx} className="text-left border-b border-line pb-2 pr-4">
                <input
                  className="bg-transparent font-medium text-ink w-full focus:outline-none"
                  value={col}
                  onChange={(e) => updateHeader(colIdx, e.target.value)}
                  onBlur={() => persist(columnas, filas)}
                />
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
