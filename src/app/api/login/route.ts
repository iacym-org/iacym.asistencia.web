import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/auth";

const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${API}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error" }));
    return NextResponse.json(err, { status: res.status });
  }
  const { access_token } = await res.json();
  await setToken(access_token);
  return NextResponse.json({ ok: true });
}
