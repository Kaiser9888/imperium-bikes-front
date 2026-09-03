// lib/apiClient.ts
"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL!; // ex: http://localhost:8080

export async function apiFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${errorBody || res.statusText}`);
  }

  // alguns endpoints (ex: sacar) podem retornar texto puro em vez de JSON
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text() as unknown as T;
}