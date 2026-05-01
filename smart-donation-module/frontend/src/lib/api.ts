export const API_BASE =
  process.env.NEXT_PUBLIC_DONATION_API_BASE ?? "http://localhost:8085";

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})\n${await safeText(res)}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})\n${await safeText(res)}`);
  return (await res.json()) as T;
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return `HTTP ${res.status}`;
  }
}

