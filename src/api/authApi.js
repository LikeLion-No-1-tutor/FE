const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginWithGoogle(idToken) {
  if (!idToken) {
    throw new Error("GOOGLE_TOKEN_MISSING");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.code || "SERVER_ERROR");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  return data;
}
