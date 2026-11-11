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

export async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem("refresh_token");

  if (!refreshToken) {
    const error = new Error("다시 로그인해 주세요.");
    error.code = "UNAUTHORIZED";
    error.status = 401;
    throw error;
  }

  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL_MISSING");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || "토큰 재발급에 실패했습니다.",
    );

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (!data?.access_token || !data?.refresh_token) {
    const error = new Error("토큰 재발급 응답이 올바르지 않습니다.");
    error.code = "INVALID_REFRESH_RESPONSE";
    throw error;
  }

  sessionStorage.setItem("access_token", data.access_token);

  sessionStorage.setItem("refresh_token", data.refresh_token);

  return data.access_token;
}
