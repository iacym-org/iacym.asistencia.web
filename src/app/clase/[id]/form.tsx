"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";

interface Alumno { id: number; nombres: string; apellidos: string; dni: string | null }

type Estado = "presente" | "ausente" | "tardanza" | "justificado";

const ESTADOS: { key: Estado; label: string; short: string; color: string; active: string }[] = [
  { key: "presente",    label: "Presente", short: "P", color: "border-green-200  bg-green-50  text-green-700",  active: "border-green-500  bg-green-500  text-white" },
  { key: "tardanza",    label: "Tardanza", short: "T", color: "border-yellow-200 bg-yellow-50 text-yellow-700", active: "border-yellow-500 bg-yellow-500 text-white" },
  { key: "ausente",     label: "Ausente",  short: "A", color: "border-red-200    bg-red-50    text-red-700",    active: "border-red-500    bg-red-500    text-white" },
  { key: "justificado", label: "Justif.",  short: "J", color: "border-blue-200   bg-blue-50   text-blue-700",   active: "border-blue-500   bg-blue-500   text-white" },
];

export default function AsistenciaForm({ claseId, alumnos, estadoInicial, obsInicial }: {
  claseId: number;
  alumnos: Alumno[];
  estadoInicial: Record<number, string>;
  obsInicial: Record<number, string>;
}) {
  const [estados, setEstados] = useState<Record<number, Estado>>(() => {
    const m: Record<number, Estado> = {};
    for (const a of alumnos) m[a.id] = (estadoInicial[a.id] as Estado) ?? "presente";
    return m;
  });
  const [observaciones, setObservaciones] = useState<Record<number, string>>(obsInicial);
  const [modalAlumno, setModalAlumno] = useState<Alumno | null>(null);
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
          items: alumnos.map(a => ({
            alumno_id: a.id,
            estado: estados[a.id],
            observacion: observaciones[a.id] ?? null,
          })),
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
      {/* Marcar todos */}
      <div className="mb-4 flex gap-2">
        {ESTADOS.map(e => (
          <button key={e.key} onClick={() => marcarTodos(e.key)}
            className={clsx("flex-1 rounded-lg border py-2 text-xs font-medium transition", e.color)}>
            Todos {e.short}
          </button>
        ))}
      </div>

      {/* Resumen */}
      <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl bg-white p-3 text-center text-xs shadow-sm border border-gray-100">
        {counts.map(e => (
          <div key={e.key}>
            <p className="text-lg font-bold text-gray-800">{e.n}</p>
            <p className="text-gray-500">{e.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de alumnos */}
      <div className="space-y-2">
        {alumnos.map((alumno) => {
          const estadoActual = estados[alumno.id];
          const obs = observaciones[alumno.id];
          return (
            <div key={alumno.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{alumno.apellidos}, {alumno.nombres}</p>
                  {alumno.dni && <p className="text-xs text-gray-400">DNI {alumno.dni}</p>}
                  {obs && <p className="mt-0.5 text-xs text-gray-500 italic truncate">📝 {obs}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModalAlumno(alumno)}
                    title="Agregar observación"
                    className={clsx(
                      "rounded-lg border p-1.5 transition",
                      obs
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    )}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
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

      {/* Botón guardar fijo */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
        <button onClick={guardar} disabled={saving || saved}
          className={clsx(
            "w-full rounded-xl py-4 text-base font-bold transition",
            saved
              ? "bg-green-500 text-white"
              : "bg-primary-500 text-white active:bg-primary-600 disabled:opacity-60"
          )}>
          {saving ? "Guardando..." : saved ? "✓ Guardado" : `Guardar asistencia (${alumnos.length})`}
        </button>
      </div>

      {/* Modal de observación */}
      {modalAlumno && (
        <ObservacionModal
          alumno={modalAlumno}
          value={observaciones[modalAlumno.id] ?? ""}
          onSave={(text) => {
            setObservaciones(o => ({ ...o, [modalAlumno.id]: text }));
            setModalAlumno(null);
            setSaved(false);
          }}
          onClose={() => setModalAlumno(null)}
        />
      )}
    </>
  );
}

function ObservacionModal({ alumno, value, onSave, onClose }: {
  alumno: Alumno;
  value: string;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-t-2xl bg-white px-4 pb-6 pt-4 shadow-2xl">
        <div className="mb-1 h-1 w-10 rounded-full bg-gray-300 mx-auto" />
        <div className="mb-3 mt-2">
          <p className="font-semibold text-gray-900">{alumno.apellidos}, {alumno.nombres}</p>
          <p className="text-xs text-gray-400">Observación de asistencia</p>
        </div>
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ej: Llegó 15 min tarde por tráfico, Ausencia justificada por enfermedad…"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
        <div className="mt-3 flex gap-2">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 active:bg-gray-50">
            Cancelar
          </button>
          {text && (
            <button onClick={() => onSave("")}
              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 active:bg-red-50">
              Borrar
            </button>
          )}
          <button onClick={() => onSave(text.trim())}
            className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white active:bg-primary-600">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
