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

  if (!data) {
    const error = new Error("서버 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function getReports({ page = 1, size = 20 } = {}) {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(size) ||
    size < 1
  ) {
    const error = new Error("페이지 정보가 올바르지 않습니다.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await apiFetch(`/api/reports?${params.toString()}`);

  const data = await parseResponse(response);

  if (
    !Array.isArray(data.items) ||
    typeof data.page !== "number" ||
    typeof data.size !== "number" ||
    typeof data.total !== "number"
  ) {
    const error = new Error("성장보고서 목록 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}

export async function getReport(reportId) {
  if (reportId === null || reportId === undefined || reportId === "") {
    const error = new Error("성장보고서 ID가 필요합니다.");
    error.code = "REPORT_ID_REQUIRED";
    throw error;
  }

  const response = await apiFetch(
    `/api/reports/${encodeURIComponent(reportId)}`,
  );

  const data = await parseResponse(response);

  if (
    data.id == null ||
    !data.lesson ||
    !Array.isArray(data.score_history) ||
    !data.exam ||
    !data.terms ||
    !Array.isArray(data.strengths) ||
    !Array.isArray(data.missed_terms) ||
    !Array.isArray(data.review_recommendations)
  ) {
    const error = new Error("성장보고서 상세 응답이 올바르지 않습니다.");
    error.code = "INVALID_RESPONSE";
    throw error;
  }

  return data;
}
