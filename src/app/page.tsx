import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";
import HomeClient from "./HomeClient";

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

  const headers = { Authorization: `Bearer ${token}` };

  const [clasesRes, sedesRes, nivelesRes] = await Promise.all([
    fetch(`${API}/clases?fecha=${fecha}`, { headers, cache: "no-store" }),
    fetch(`${API}/sedes`, { headers }),
    fetch(`${API}/niveles`, { headers }),
  ]);

  const clases: Clase[] = clasesRes.ok ? await clasesRes.json() : [];
  const sedes: Cat[] = sedesRes.ok ? await sedesRes.json() : [];
  const niveles: Cat[] = nivelesRes.ok ? await nivelesRes.json() : [];

  return (
    <HomeClient
      clases={clases}
      sedes={sedes}
      niveles={niveles}
      fecha={fecha}
      today={today}
    />
  );
}
