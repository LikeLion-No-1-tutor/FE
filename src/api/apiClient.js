import { refreshAccessToken } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let refreshPromise = null;

function clearAuth() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("nickname");
}

function redirectToLogin() {
  clearAuth();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

async function getNewAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL_MISSING");
  }

  const { headers: customHeaders, ...requestOptions } = options;

  const sendRequest = (accessToken) => {
    const headers = new Headers(customHeaders);

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
    });
  };

  let accessToken = sessionStorage.getItem("access_token");

  if (!accessToken) {
    redirectToLogin();

    const error = new Error("다시 로그인해 주세요.");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  let response = await sendRequest(accessToken);

  if (response.status !== 401) {
    return response;
  }

  try {
    accessToken = await getNewAccessToken();
  } catch (error) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      redirectToLogin();
    }

    throw error;
  }

  response = await sendRequest(accessToken);

  if (response.status === 401) {
    redirectToLogin();

    const error = new Error("다시 로그인해 주세요.");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  return response;
}
