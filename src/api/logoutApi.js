import { refreshAccessToken } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function logout() {
  const sendLogoutRequest = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      const error = new Error("로그인이 필요해요.");
      error.code = "UNAUTHORIZED";
      error.status = 401;
      throw error;
    }

    return fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  };

  let response = await sendLogoutRequest();

  if (response.status === 401) {
    await refreshAccessToken();
    response = await sendLogoutRequest();
  }

  if (response.status === 204) {
    return true;
  }

  const data = await response.json().catch(() => null);

  const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

  error.code = data?.error?.code || "SERVER_ERROR";
  error.status = response.status;
  error.requestId =
    data?.error?.request_id || response.headers.get("X-Request-ID");

  throw error;
}
