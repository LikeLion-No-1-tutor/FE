import { apiFetch } from "./apiClient";

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  return data;
}

export async function getMyInfo() {
  const response = await apiFetch("/api/users/me");

  return handleResponse(response);
}

export async function updateMyInfo(values) {
  const response = await apiFetch("/api/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  return handleResponse(response);
}

export async function deleteMyAccount() {
  const response = await apiFetch("/api/users/me", {
    method: "DELETE",
  });

  return handleResponse(response);
}
