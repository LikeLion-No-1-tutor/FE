import { apiFetch } from "./apiClient";

export async function startLesson({ materialId, personaId }) {
  if (materialId == null || personaId == null) {
    const error = new Error("학습 자료와 AI 학생을 선택해 주세요.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const response = await apiFetch("/api/lessons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      material_id: materialId,
      persona_id: personaId,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (response.status !== 201 || data?.id == null) {
    throw new Error("INVALID_LESSON_RESPONSE");
  }

  return data;
}
