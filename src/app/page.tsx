import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const token = await getToken();
  if (!token) redirect("/login");

  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const fecha = sp.fecha ?? today;
  const isToday = fecha === today;

  const headers = { Authorization: `Bearer ${token}` };

  const [clasesRes, sedesRes, nivelesRes] = await Promise.all([
    fetch(`${API}/clases?fecha=${fecha}`, { headers, cache: "no-store" }),
    fetch(`${API}/sedes`, { headers }),
    fetch(`${API}/niveles`, { headers }),
  ]);

  const clases: Clase[] = clasesRes.ok ? await clasesRes.json() : [];
  const sedes: Cat[] = sedesRes.ok ? await sedesRes.json() : [];
  const niveles: Cat[] = nivelesRes.ok ? await nivelesRes.json() : [];

  const nombre = (list: Cat[], id: number) => list.find(x => x.id === id)?.nombre ?? `#${id}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary-500">IACyM Asistencia</h1>
        </div>
        <form action="/api/logout" method="POST">
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Salir
          </button>
        </form>
      </header>

      {/* Date navigation */}
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
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          aria-label="Día siguiente"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <h2 className="mb-3 text-base font-semibold text-gray-700">Clases del día</h2>

      {clases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No hay clases programadas para este día.
        </div>
      ) : (
        <div className="space-y-3">
          {clases.map(c => (
            <a key={c.id} href={`/clase/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm active:bg-gray-50">
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
    </div>
  );
}
