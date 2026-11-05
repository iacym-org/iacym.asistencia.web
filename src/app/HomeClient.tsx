"use client";
import { useState } from "react";
import NuevaClaseModal from "./NuevaClaseModal";

interface Clase {
  id: number;
  sede_id: number;
  nivel_id: number;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  tema: string | null;
  grupo: string | null;
}
interface Cat { id: number; nombre: string }

function prevDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() - 1);
  return dt.toISOString().slice(0, 10);
}
function nextDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().slice(0, 10);
}
function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export default function HomeClient({
  clases,
  sedes,
  niveles,
  fecha,
  today,
}: {
  clases: Clase[];
  sedes: Cat[];
  niveles: Cat[];
  fecha: string;
  today: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const isToday = fecha === today;

  const nombre = (list: Cat[], id: number) =>
    list.find(x => x.id === id)?.nombre ?? `#${id}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-500">IACyM Asistencia</h1>
        <form action="/api/logout" method="POST">
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Salir
          </button>
        </form>
      </header>

      {/* Navegación de fechas */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <a
          href={`/?fecha=${prevDate(fecha)}`}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Día anterior"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize text-gray-800">{formatDate(fecha)}</p>
          {!isToday && (
            <a href="/" className="text-xs text-primary-500 underline">Ir a hoy</a>
          )}
        </div>
        <a
          href={`/?fecha=${nextDate(fecha)}`}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Día siguiente"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Encabezado clases + botón nueva */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">Clases del día</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white active:bg-primary-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva clase
        </button>
      </div>

      {clases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No hay clases programadas para este día.
        </div>
      ) : (
        <div className="space-y-3">
          {clases.map(c => (
            <a
              key={c.id}
              href={`/clase/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm active:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-gray-900">{c.tema ?? c.grupo ?? "Clase"}</p>
                <p className="text-sm text-gray-500">
                  {nombre(niveles, c.nivel_id)} · {nombre(sedes, c.sede_id)}
                  {c.hora_inicio && ` · ${c.hora_inicio.slice(0, 5)}`}
                </p>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      )}

      {modalOpen && (
        <NuevaClaseModal
          sedes={sedes}
          niveles={niveles}
          fechaDefault={fecha}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
