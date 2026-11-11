import { apiFetch } from "./apiClient";

export async function getPersonas() {
  const response = await apiFetch("/api/personas");

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (!Array.isArray(data?.items)) {
    throw new Error("INVALID_PERSONA_RESPONSE");
  }

  return data.items;
}
