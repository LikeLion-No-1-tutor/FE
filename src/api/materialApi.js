import { apiFetch } from "./apiClient";

async function parseResponse(response) {
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

export async function uploadMaterial({ title, file, text }) {
  const trimmedTitle = title?.trim() || "";
  const trimmedText = text?.trim() || "";

  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    const error = new Error("수업 제목은 1~100자로 입력해 주세요.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (Boolean(file) === Boolean(trimmedText)) {
    const error = new Error("파일 또는 텍스트 중 하나만 입력해 주세요.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const formData = new FormData();

  formData.append("title", trimmedTitle);

  if (file) {
    formData.append("file", file);
  } else {
    formData.append("text", trimmedText);
  }

  const response = await apiFetch("/api/materials", {
    method: "POST",
    body: formData,
  });

  const data = await parseResponse(response);

  if (response.status !== 202 || data?.id == null) {
    throw new Error("INVALID_MATERIAL_RESPONSE");
  }

  return data;
}

export async function getMaterialStatus(materialId) {
  if (materialId == null) {
    throw new Error("MATERIAL_ID_REQUIRED");
  }

  const response = await apiFetch(
    `/api/materials/${encodeURIComponent(materialId)}`,
  );

  return parseResponse(response);
}
