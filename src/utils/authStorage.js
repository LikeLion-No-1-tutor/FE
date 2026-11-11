export function saveAuth(data) {
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}

export function saveTokens(data) {
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
}

export function getAccessToken() {
  return sessionStorage.getItem("access_token");
}

export function getRefreshToken() {
  return sessionStorage.getItem("refresh_token");
}

export function clearAuth() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("nickname");
}
