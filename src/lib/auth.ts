"use server";
import { cookies } from "next/headers";

const COOKIE = "wa_token";

export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearToken() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
