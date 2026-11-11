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

  if (!data || typeof data !== "object") {
    const error = new Error("서버 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

function validateId(id, name) {
  if (id === null || id === undefined || String(id).trim() === "") {
    const error = new Error(`${name}가 필요합니다.`);
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  return encodeURIComponent(String(id));
}

export async function createRetest(reportId, focus = "missed_terms") {
  const id = validateId(reportId, "성장보고서 ID");

  if (!["missed_terms", "all"].includes(focus)) {
    const error = new Error("올바르지 않은 출제 범위입니다.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const response = await apiFetch(`/api/reports/${id}/retests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ focus }),
  });

  const data = await parseResponse(response);

  if (
    response.status !== 202 ||
    data.id == null ||
    data.status !== "generating"
  ) {
    const error = new Error("재시험 출제 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function getRetest(retestId) {
  const id = validateId(retestId, "재시험 ID");

  const response = await apiFetch(`/api/retests/${id}`);
  const data = await parseResponse(response);

  if (
    data.id == null ||
    data.report_id == null ||
    !["generating", "solving", "completed", "failed"].includes(data.status) ||
    !Array.isArray(data.questions)
  ) {
    const error = new Error("재시험 조회 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function submitRetestAnswer(retestId, number, answer) {
  const id = validateId(retestId, "재시험 ID");

  if (!Number.isInteger(number) || number < 1) {
    const error = new Error("문제 번호가 올바르지 않습니다.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const responseText = String(answer ?? "").trim();

  if (!responseText) {
    const error = new Error("답을 입력해 주세요.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const response = await apiFetch(
    `/api/retests/${id}/questions/${number}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response: responseText,
      }),
    },
  );

  const data = await parseResponse(response);

  if (
    data.number == null ||
    typeof data.is_correct !== "boolean" ||
    data.correct_answer == null ||
    typeof data.explanation !== "string"
  ) {
    const error = new Error("문제 채점 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function completeRetest(retestId) {
  const id = validateId(retestId, "재시험 ID");

  const response = await apiFetch(`/api/retests/${id}/complete`, {
    method: "POST",
  });

  const data = await parseResponse(response);

  if (
    data.id == null ||
    data.status !== "completed" ||
    typeof data.correct !== "number" ||
    typeof data.total !== "number" ||
    typeof data.score !== "number" ||
    data.report_id == null
  ) {
    const error = new Error("재시험 결과 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}
