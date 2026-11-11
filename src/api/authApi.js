const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginWithGoogle(idToken) {
  if (!idToken) {
    const error = new Error("GOOGLE_TOKEN_MISSING");
    error.code = "GOOGLE_TOKEN_MISSING";
    throw error;
  }

  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL_MISSING");
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
    const error = new Error(
      data?.error?.message || "로그인 요청에 실패했습니다.",
    );

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (!data?.access_token || !data?.refresh_token || !data?.user) {
    throw new Error("INVALID_LOGIN_RESPONSE");
  }

  return data;
}
