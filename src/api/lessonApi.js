import { apiFetch } from "./apiClient";

async function parseResponse(response, expectedStatus = 200) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || "잠시 문제가 생겼어요.");

    error.code = data?.error?.code || "SERVER_ERROR";
    error.status = response.status;
    error.requestId =
      data?.error?.request_id || response.headers.get("X-Request-ID");

    throw error;
  }

  if (response.status !== expectedStatus || !data) {
    const error = new Error("서버 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

function getLessonPath(lessonId) {
  if (lessonId === null || lessonId === undefined || lessonId === "") {
    const error = new Error("수업 ID가 필요합니다.");
    error.code = "LESSON_ID_REQUIRED";
    throw error;
  }

  return `/api/lessons/${encodeURIComponent(lessonId)}`;
}

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

  const data = await parseResponse(response, 201);

  if (data.id == null) {
    throw new Error("INVALID_LESSON_RESPONSE");
  }

  return data;
}

export async function getLesson(lessonId) {
  const response = await apiFetch(getLessonPath(lessonId));

  return parseResponse(response);
}

export async function getLessonMessages(lessonId, { before, limit } = {}) {
  const params = new URLSearchParams();

  if (before != null) {
    params.set("before", String(before));
  }

  if (limit != null) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  const path = `${getLessonPath(lessonId)}/messages${query ? `?${query}` : ""}`;

  const response = await apiFetch(path);
  const data = await parseResponse(response);

  if (!Array.isArray(data.messages) || !Array.isArray(data.hand_raises)) {
    const error = new Error("대화 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function sendLessonMessage(
  lessonId,
  { content, replyToId = null },
) {
  const trimmedContent = content?.trim() || "";

  if (trimmedContent.length < 1 || trimmedContent.length > 3000) {
    const error = new Error("설명은 1~3,000자로 입력해 주세요.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const response = await apiFetch(`${getLessonPath(lessonId)}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: trimmedContent,
      reply_to_id: replyToId,
    }),
  });

  return parseResponse(response, 201);
}

export async function askHandRaise(lessonId, handRaiseId) {
  if (handRaiseId == null) {
    const error = new Error("손들기 ID가 필요합니다.");
    error.code = "HAND_RAISE_ID_REQUIRED";
    throw error;
  }

  const response = await apiFetch(
    `${getLessonPath(lessonId)}/hand-raises/${encodeURIComponent(
      handRaiseId,
    )}/ask`,
    {
      method: "POST",
    },
  );

  return parseResponse(response, 201);
}

export async function endLesson(lessonId) {
  const response = await apiFetch(`${getLessonPath(lessonId)}/end`, {
    method: "POST",
  });

  return parseResponse(response, 202);
}
