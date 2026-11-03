import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

interface Clase {
  id: number;
  sede_id: number;
  grado_id: number;
  periodo_id: number;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  materia: string | null;
}
interface Cat { id: number; nombre: string }

export default async function HomePage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);
  const headers = { Authorization: `Bearer ${token}` };

  const [clasesRes, sedesRes, gradosRes] = await Promise.all([
    fetch(`${API}/clases?fecha=${today}`, { headers }),
    fetch(`${API}/sedes`, { headers }),
    fetch(`${API}/grados`, { headers }),
  ]);

  const clases: Clase[] = clasesRes.ok ? await clasesRes.json() : [];
  const sedes: Cat[] = sedesRes.ok ? await sedesRes.json() : [];
  const grados: Cat[] = gradosRes.ok ? await gradosRes.json() : [];

  const nombre = (list: Cat[], id: number) => list.find(x => x.id === id)?.nombre ?? `#${id}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary-500">IACyM Asistencia</h1>
          <p className="text-sm text-gray-500">Hoy: {today}</p>
        </div>
        <form action="/api/logout" method="POST">
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Salir
          </button>
        </form>
      </header>

      <h2 className="mb-3 text-base font-semibold text-gray-700">Clases de hoy</h2>

      {clases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No hay clases programadas para hoy.
        </div>
      ) : (
        <div className="space-y-3">
          {clases.map(c => (
            <a key={c.id} href={`/clase/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm active:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-900">{c.materia ?? "Clase"}</p>
                <p className="text-sm text-gray-500">
                  {nombre(grados, c.grado_id)} · {nombre(sedes, c.sede_id)}
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
