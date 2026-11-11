import { apiFetch } from "./apiClient";

export async function getLessonNote(lessonId) {
  if (lessonId == null || lessonId === "") {
    const error = new Error("수업 ID가 필요합니다.");
    error.code = "LESSON_ID_REQUIRED";
    throw error;
  }

  const response = await apiFetch(
    `/api/lessons/${encodeURIComponent(lessonId)}/note`,
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (
    data?.id == null ||
    data?.lesson_id == null ||
    typeof data?.content !== "string"
  ) {
    const error = new Error("정리노트 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}
