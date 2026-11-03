"use client";
import { useState } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";

interface Alumno { id: number; nombres: string; apellidos: string; dni: string | null }

type Estado = "presente" | "ausente" | "tardanza" | "justificado";

const ESTADOS: { key: Estado; label: string; short: string; color: string; active: string }[] = [
  { key: "presente",    label: "Presente",   short: "P", color: "border-green-200  bg-green-50  text-green-700",  active: "border-green-500  bg-green-500  text-white" },
  { key: "tardanza",    label: "Tardanza",   short: "T", color: "border-yellow-200 bg-yellow-50 text-yellow-700", active: "border-yellow-500 bg-yellow-500 text-white" },
  { key: "ausente",     label: "Ausente",    short: "A", color: "border-red-200    bg-red-50    text-red-700",    active: "border-red-500    bg-red-500    text-white" },
  { key: "justificado", label: "Justif.",    short: "J", color: "border-blue-200   bg-blue-50   text-blue-700",   active: "border-blue-500   bg-blue-500   text-white" },
];

export default function AsistenciaForm({ claseId, alumnos, estadoInicial }: {
  claseId: number;
  alumnos: Alumno[];
  estadoInicial: Record<number, string>;
}) {
  const [estados, setEstados] = useState<Record<number, Estado>>(() => {
    const m: Record<number, Estado> = {};
    for (const a of alumnos) m[a.id] = (estadoInicial[a.id] as Estado) ?? "presente";
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setEstado = (alumnoId: number, estado: Estado) => {
    setEstados(e => ({ ...e, [alumnoId]: estado }));
    setSaved(false);
  };

  const marcarTodos = (estado: Estado) => {
    setEstados(Object.fromEntries(alumnos.map(a => [a.id, estado])));
    setSaved(false);
  };

  async function guardar() {
    setSaving(true);
    try {
      const res = await fetch(`/api/asistencia/${claseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: alumnos.map(a => ({ alumno_id: a.id, estado: estados[a.id] })),
        }),
      });
      if (res.ok) { toast.success("Asistencia guardada"); setSaved(true); }
      else toast.error("Error al guardar");
    } catch { toast.error("Sin conexión"); }
    finally { setSaving(false); }
  }

  const counts = ESTADOS.map(e => ({ ...e, n: alumnos.filter(a => estados[a.id] === e.key).length }));

  return (
    <>
      <div className="mb-4 flex gap-2">
        {ESTADOS.map(e => (
          <button key={e.key} onClick={() => marcarTodos(e.key)}
            className={clsx("flex-1 rounded-lg border py-2 text-xs font-medium transition", e.color)}>
            Todos {e.short}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl bg-white p-3 text-center text-xs shadow-sm border border-gray-100">
        {counts.map(e => (
          <div key={e.key}>
            <p className="text-lg font-bold text-gray-800">{e.n}</p>
            <p className="text-gray-500">{e.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {alumnos.map((alumno) => {
          const estadoActual = estados[alumno.id];
          return (
            <div key={alumno.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{alumno.apellidos}, {alumno.nombres}</p>
                  {alumno.dni && <p className="text-xs text-gray-400">DNI {alumno.dni}</p>}
                </div>
                <span className={clsx(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  estadoActual === "presente"    && "bg-green-100 text-green-700",
                  estadoActual === "tardanza"    && "bg-yellow-100 text-yellow-700",
                  estadoActual === "ausente"     && "bg-red-100 text-red-700",
                  estadoActual === "justificado" && "bg-blue-100 text-blue-700",
                )}>
                  {ESTADOS.find(e => e.key === estadoActual)?.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {ESTADOS.map(e => (
                  <button key={e.key} onClick={() => setEstado(alumno.id, e.key)}
                    className={clsx(
                      "rounded-lg border py-2 text-xs font-semibold transition active:scale-95",
                      estadoActual === e.key ? e.active : e.color
                    )}>
                    {e.short}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
        <button onClick={guardar} disabled={saving || saved}
          className={clsx(
            "w-full rounded-xl py-4 text-base font-bold transition",
            saved
              ? "bg-green-500 text-white"
              : "bg-primary-500 text-white active:bg-primary-600 disabled:opacity-60"
          )}>
          {saving ? "Guardando..." : saved ? "✓ Guardado" : `Guardar asistencia (${alumnos.length} alumnos)`}
        </button>
      </div>
    </>
  );
}
