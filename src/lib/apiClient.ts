// lib/apiClient.ts
"use client";

import { API_BASE_URL } from "@/lib/api-config";
import { fetchRenovando } from "@/lib/fetch-renovando";

export const API_URL = API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  // Token vencido (ex.: backend acordando depois de deploy): renova e tenta de novo uma vez
  const res = await fetchRenovando(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    let detail = errorBody || res.statusText;
    try {
      const parsed = JSON.parse(errorBody) as { message?: unknown; traceId?: unknown; error?: unknown };
      const message = typeof parsed.message === "string" ? parsed.message : typeof parsed.error === "string" ? parsed.error : "";
      const trace = typeof parsed.traceId === "string" ? ` (referência: ${parsed.traceId})` : "";
      if (message) detail = `${message}${trace}`;
    } catch {
      // Mantém o corpo textual enviado pela API quando ele não é JSON.
    }
    throw new Error(`Erro ${res.status}: ${detail}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text() as unknown as T;
}
