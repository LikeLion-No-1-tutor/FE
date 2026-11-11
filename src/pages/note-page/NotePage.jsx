import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHeader from "../../components/common/PageHeader";
import { getLesson, getLessonProgress } from "../../api/lessonApi";
import { getLessonNote } from "../../api/noteApi";

import "./NotePage.css";

const POLLING_INTERVAL = 3000;

const EXAM_STATUS_TEXT = {
  pending: "평가 준비 대기 중",
  generating: "AI 평가 문제 출제 중",
  solving: "학생 AI가 문제를 풀고 있어요",
  grading: "평가 답안 채점 중",
  completed: "AI 평가 완료",
  failed: "AI 평가 실패",
};

function getApiErrorMessage(error) {
  if (error?.code === "AI_ERROR") {
    return "AI 처리에 실패했어요. 담당자에게 문의해 주세요.";
  }

  if (error?.code === "NOTE_NOT_READY") {
    return "정리노트가 아직 준비되지 않았어요.";
  }

  return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
}

function NotePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonId } = useParams();

  const currentLessonId = lessonId || location.state?.lessonId || null;

  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [note, setNote] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [noteError, setNoteError] = useState("");

  const [retryCount, setRetryCount] = useState(0);
  const [noteRetryCount, setNoteRetryCount] = useState(0);

  useEffect(() => {
    if (!currentLessonId) {
      setIsLoading(false);
      setErrorMessage(
        "수업 정보를 찾을 수 없어요. 수업 목록에서 다시 선택해 주세요.",
      );
      return;
    }

    let cancelled = false;

    const loadLesson = async () => {
      try {
        const result = await getLesson(currentLessonId);

        if (!cancelled) {
          setLesson(result);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("수업 정보 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
          navigate("/home", {
            replace: true,
            state: {
              errorMessage: "수업을 찾을 수 없어요.",
            },
          });
          return;
        }

        setErrorMessage("수업 정보를 불러오지 못했어요.");
      }
    };

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [currentLessonId, navigate, retryCount]);

  useEffect(() => {
    if (!currentLessonId) return;

    let cancelled = false;
    let timeoutId = null;
    let consecutiveErrors = 0;

    const loadProgress = async () => {
      try {
        const result = await getLessonProgress(currentLessonId);

        if (cancelled) return;

        consecutiveErrors = 0;
        setProgress(result);
        setIsLoading(false);
        setErrorMessage("");

        if (result.lesson_status === "evaluating") {
          timeoutId = window.setTimeout(loadProgress, POLLING_INTERVAL);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("진행 상태 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
          navigate("/home", {
            replace: true,
            state: {
              errorMessage: "수업을 찾을 수 없어요.",
            },
          });
          return;
        }

        consecutiveErrors += 1;

        if (consecutiveErrors < 3) {
          timeoutId = window.setTimeout(loadProgress, POLLING_INTERVAL);
        } else {
          setErrorMessage("진행 상태를 불러오지 못했어요. 다시 시도해 주세요.");
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    loadProgress();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [currentLessonId, navigate, retryCount]);

  const noteStatus = progress?.note?.status;

  useEffect(() => {
    if (!currentLessonId || noteStatus !== "done") {
      return;
    }

    let cancelled = false;

    const loadNote = async () => {
      setIsNoteLoading(true);
      setNoteError("");

      try {
        const result = await getLessonNote(currentLessonId);

        if (cancelled) return;

        setNote(result);
      } catch (error) {
        if (cancelled) return;

        console.error("정리노트 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
          navigate("/home", {
            replace: true,
            state: {
              errorMessage: "수업을 찾을 수 없어요.",
            },
          });
          return;
        }

        setNoteError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsNoteLoading(false);
        }
      }
    };

    loadNote();

    return () => {
      cancelled = true;
    };
  }, [currentLessonId, noteStatus, noteRetryCount, navigate]);

  const title = lesson?.material?.title || location.state?.topic || "정리노트";

  const terms = lesson?.terms || [];

  const checkedCount = terms.filter(
    (term) => term.status === "explained",
  ).length;

  const exam = progress?.exam;
  const report = progress?.report;

  const isCompleted = progress?.lesson_status === "completed";

  const isFailed = progress?.lesson_status === "failed";

  const reportReady =
    isCompleted && report?.status === "done" && report?.report_id != null;

  const solvedCount = exam?.solved ?? 0;
  const totalCount = exam?.total ?? 0;

  const progressPercent =
    totalCount > 0
      ? Math.min(100, Math.max(0, (solvedCount / totalCount) * 100))
      : 0;

  const handleRetry = () => {
    setErrorMessage("");
    setRetryCount((previous) => previous + 1);
  };

  const handleReport = () => {
    if (!reportReady) return;

    navigate(`/reports/${report.report_id}`);
  };

  const renderNoteBody = () => {
    if (note) {
      return (
        <div className="note-page__markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>
      );
    }

    if (isNoteLoading) {
      return (
        <div className="note-page__empty-state">
          <h3>정리노트를 불러오는 중이에요</h3>
          <p>완성된 학습 내용을 가져오고 있어요.</p>
        </div>
      );
    }

    if (noteError) {
      return (
        <div className="note-page__empty-state">
          <h3>정리노트를 불러오지 못했어요</h3>
          <p>{noteError}</p>
          <button
            type="button"
            onClick={() => setNoteRetryCount((previous) => previous + 1)}
          >
            다시 불러오기
          </button>
        </div>
      );
    }

    if (noteStatus === "failed" || isFailed) {
      return (
        <div className="note-page__empty-state">
          <h3>정리노트 생성에 실패했어요</h3>
          <p>
            {progress?.error?.message || "AI 처리 과정에서 문제가 발생했어요."}
          </p>
        </div>
      );
    }

    if (progress?.lesson_status === "teaching") {
      return (
        <div className="note-page__empty-state">
          <h3>아직 수업이 진행 중이에요</h3>
          <p>수업을 종료하면 정리노트 생성을 시작해요.</p>
          <button
            type="button"
            onClick={() =>
              navigate("/teaching", {
                state: {
                  lessonId: currentLessonId,
                },
              })
            }
          >
            수업으로 돌아가기
          </button>
        </div>
      );
    }

    return (
      <div className="note-page__empty-state">
        <div className="note-page__loading-spinner" aria-hidden="true" />
        <h3>정리노트를 작성하고 있어요</h3>
        <p>수업 내용을 정리하고 있어요. 완료되면 자동으로 표시할게요.</p>
      </div>
    );
  };

  return (
    <div className="app-page note-page">
      <PageHeader
        title="정리노트"
        description="지금까지의 수업 내용을 정리했어요."
      />

      {errorMessage && (
        <div className="note-page__error" role="alert">
          <p>{errorMessage}</p>
          {currentLessonId && (
            <button type="button" onClick={handleRetry}>
              다시 시도
            </button>
          )}
        </div>
      )}

      <div className="note-page__notebook">
        <div className="note-page__binding" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <div className="note-page__ring" key={index}>
              <span className="note-page__ring-hole" />
              <span className="note-page__ring-wire" />
              <span className="note-page__ring-end" />
            </div>
          ))}
        </div>

        <div className="note-page__notebook-inner">
          <div className="note-page__note-title">
            <h2>{title}</h2>
          </div>

          <div className="note-page__note-grid">
            <div className="note-page__note-content">
              {isLoading && !progress ? (
                <div className="note-page__empty-state">
                  <h3>수업 정보를 불러오는 중이에요</h3>
                </div>
              ) : (
                renderNoteBody()
              )}
            </div>

            <aside className="note-page__keywords">
              <h3>핵심 용어</h3>

              <div className="note-page__keyword-divider" />

              {terms.length > 0 ? (
                <ul>
                  {terms.map((term) => {
                    const isExplained = term.status === "explained";

                    const isMentioned = term.status === "mentioned";

                    return (
                      <li key={term.term_id}>
                        <span
                          className={`note-page__keyword-checkbox ${
                            isExplained
                              ? "note-page__keyword-checkbox--checked"
                              : ""
                          }`}
                          aria-label={
                            isExplained
                              ? "설명 완료"
                              : isMentioned
                                ? "이름만 언급"
                                : "아직 설명하지 않음"
                          }
                        >
                          {isExplained && "✓"}
                          {isMentioned && "·"}
                        </span>

                        <span>{term.name}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="note-page__keyword-empty">
                  표시할 용어가 없어요.
                </p>
              )}

              <p className="note-page__keyword-summary">
                설명한 용어 {checkedCount}/{terms.length}
              </p>
            </aside>
          </div>
        </div>
      </div>

      <section className="note-page__progress" aria-label="평가 진행 상태">
        <div className="note-page__progress-header">
          <div>
            <h3>학습 결과 생성 현황</h3>
            <p>수업 종료 후 AI가 학습 결과를 만들고 있어요.</p>
          </div>

          {isCompleted && (
            <span className="note-page__progress-completed">전체 완료</span>
          )}
        </div>

        <div className="note-page__progress-steps">
          <div className="note-page__progress-step">
            <span className="note-page__progress-number">01</span>

            <div>
              <strong>정리노트</strong>
              <p>
                {noteStatus === "done"
                  ? "생성 완료"
                  : noteStatus === "failed"
                    ? "생성 실패"
                    : "생성 중"}
              </p>
            </div>
          </div>

          <div className="note-page__progress-step">
            <span className="note-page__progress-number">02</span>

            <div className="note-page__progress-step-body">
              <strong>학생 AI 평가</strong>

              <p>{EXAM_STATUS_TEXT[exam?.status] || "평가 대기 중"}</p>

              {exam?.status === "solving" && totalCount > 0 && (
                <>
                  <div className="note-page__progress-bar">
                    <span
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>

                  <span className="note-page__progress-count">
                    {solvedCount}/{totalCount}문제 풀이 완료
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="note-page__progress-step">
            <span className="note-page__progress-number">03</span>

            <div>
              <strong>성장보고서</strong>
              <p>
                {report?.status === "done"
                  ? "생성 완료"
                  : report?.status === "running"
                    ? "생성 중"
                    : report?.status === "failed"
                      ? "생성 실패"
                      : "생성 대기 중"}
              </p>
            </div>
          </div>
        </div>

        {isFailed && (
          <p className="note-page__progress-error" role="alert">
            {progress?.error?.message || "학습 결과 생성 중 문제가 발생했어요."}
          </p>
        )}
      </section>

      <div className="note-page__footer">
        <button
          type="button"
          className="note-page__assessment-button"
          onClick={handleReport}
          disabled={!reportReady}
        >
          <span>
            {reportReady
              ? "성장보고서 확인하기"
              : isFailed
                ? "평가 처리 실패"
                : isCompleted
                  ? "성장보고서 확인 대기 중"
                  : "평가 진행 중"}
          </span>

          {reportReady && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </div>
  );
}

export default NotePage;
