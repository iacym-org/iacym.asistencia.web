import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest, { params }: { params: Promise<{ claseId: string }> }) {
  const { claseId } = await params;
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "No autorizado" }, { status: 401 });

  const body = await req.text();
  const res = await fetch(`${API}/clases/${claseId}/asistencias`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
