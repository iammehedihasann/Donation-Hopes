import { useAuthStore } from "@/store/authStore";

const DEFAULT_API_URL = "http://localhost:5000";

export function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return DEFAULT_API_URL;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${p}`;
}

type ApiJson = {
  success?: boolean;
  message?: string;
  code?: string;
  data?: unknown;
};

async function parseJson(res: Response): Promise<ApiJson> {
  try {
    return (await res.json()) as ApiJson;
  } catch {
    return {};
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  const method = rest.method ?? "GET";
  const skipContentType =
    method === "GET" ||
    method === "HEAD" ||
    (method === "DELETE" && rest.body === undefined) ||
    rest.body instanceof FormData;

  if (!skipContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = useAuthStore.getState().token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), { ...rest, headers });
  const json = await parseJson(res);

  if (!res.ok || json.success === false) {
    const msg = json.message ?? "সার্ভারে সমস্যা হয়েছে";
    throw new Error(msg);
  }

  return json.data as T;
}

export function uploadsUrl(relativePath: string): string {
  const base = getApiBaseUrl();
  const p = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${base}${p}`;
}
