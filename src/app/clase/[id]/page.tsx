import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";
import AsistenciaForm from "./form";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

interface Alumno { id: number; nombres: string; apellidos: string; dni: string | null }
interface Clase {
  id: number; sede_id: number; grado_id: number; periodo_id: number;
  fecha: string; hora_inicio: string | null; hora_fin: string | null; materia: string | null;
}
interface Asistencia { id: number; alumno_id: number; estado: string }

export default async function ClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect("/login");

  const headers = { Authorization: `Bearer ${token}` };
  const [claseRes, alumnosRes, asistenciasRes] = await Promise.all([
    fetch(`${API}/clases/${id}`, { headers }),
    fetch(`${API}/clases/${id}/alumnos`, { headers }),
    fetch(`${API}/asistencias?clase_id=${id}`, { headers }),
  ]);

  if (!claseRes.ok) redirect("/");

  const clase: Clase = await claseRes.json();
  const alumnos: Alumno[] = alumnosRes.ok ? await alumnosRes.json() : [];
  const asistencias: Asistencia[] = asistenciasRes.ok ? await asistenciasRes.json() : [];

  const estadoInicial: Record<number, string> = {};
  for (const a of asistencias) estadoInicial[a.alumno_id] = a.estado;

  return (
    <div className="mx-auto max-w-lg px-4 py-4 pb-28">
      <header className="mb-5 flex items-center gap-3">
        <a href="/" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 className="text-lg font-bold text-primary-500">{clase.materia ?? "Clase"}</h1>
          <p className="text-sm text-gray-500">
            {clase.fecha}
            {clase.hora_inicio && ` · ${clase.hora_inicio.slice(0, 5)}${clase.hora_fin ? `–${clase.hora_fin.slice(0, 5)}` : ""}`}
          </p>
        </div>
      </header>

      <div className="mb-4 flex gap-2 text-xs font-medium">
        <span className="flex-1 rounded-lg bg-green-50 py-1 text-center text-green-700">✓ Presente</span>
        <span className="flex-1 rounded-lg bg-yellow-50 py-1 text-center text-yellow-700">⏰ Tardanza</span>
        <span className="flex-1 rounded-lg bg-red-50 py-1 text-center text-red-700">✗ Ausente</span>
        <span className="flex-1 rounded-lg bg-blue-50 py-1 text-center text-blue-700">📋 Justif.</span>
      </div>

      <AsistenciaForm claseId={Number(id)} alumnos={alumnos} estadoInicial={estadoInicial} />
    </div>
  );
}
