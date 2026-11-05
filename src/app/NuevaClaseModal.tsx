"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Cat { id: number; nombre: string }

export default function NuevaClaseModal({
  sedes,
  niveles,
  fechaDefault,
  onClose,
}: {
  sedes: Cat[];
  niveles: Cat[];
  fechaDefault: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sede_id: sedes[0]?.id ?? "",
    nivel_id: niveles[0]?.id ?? "",
    fecha: fechaDefault,
    hora_inicio: "",
    hora_fin: "",
    tema: "",
  });
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (k: string, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sede_id || !form.nivel_id || !form.fecha) {
      toast.error("Sede, nivel y fecha son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        sede_id: Number(form.sede_id),
        nivel_id: Number(form.nivel_id),
        fecha: form.fecha,
        tema: form.tema.trim() || null,
        hora_inicio: form.hora_inicio || null,
        hora_fin: form.hora_fin || null,
      };
      const res = await fetch("/api/clases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const clase = await res.json();
        toast.success("Clase creada");
        router.push(`/clase/${clase.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail ?? "Error al crear la clase");
      }
    } catch {
      toast.error("Sin conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white px-4 pb-8 pt-4 shadow-2xl">
        <div className="mb-1 h-1 w-10 rounded-full bg-gray-300 mx-auto" />
        <h2 className="mt-3 mb-5 text-base font-bold text-gray-900">Nueva clase</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Sede *</label>
              <select
                ref={firstRef}
                value={form.sede_id}
                onChange={e => set("sede_id", e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Nivel *</label>
              <select
                value={form.nivel_id}
                onChange={e => set("nivel_id", e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {niveles.map(n => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fecha *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => set("fecha", e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Hora inicio</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={e => set("hora_inicio", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Hora fin</label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={e => set("hora_fin", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tema</label>
            <input
              type="text"
              value={form.tema}
              onChange={e => set("tema", e.target.value)}
              placeholder="Ej: El fruto del Espíritu"
              maxLength={200}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 active:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white active:bg-primary-600 disabled:opacity-60"
            >
              {saving ? "Creando…" : "Crear y tomar asistencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
