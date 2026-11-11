import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  getRetest,
  submitRetestAnswer,
  completeRetest,
} from "../../api/retestApi";

import PageHeader from "../../components/common/PageHeader";
import "./RetestPage.css";

const POLLING_INTERVAL = 3000;

const typeLabels = {
  multiple_choice: "객관식",
  short_answer: "주관식 · 단답형",
  short: "주관식 · 단답형",
  essay: "서술형",
  descriptive: "서술형",
};

function getErrorMessage(error) {
  if (error?.code === "AI_ERROR") {
    return "AI 채점에 실패했어요. 같은 답안을 다시 제출해 주세요.";
  }

  if (error?.code === "VALIDATION_ERROR") {
    return "답안이 올바르지 않아요. 입력한 내용을 확인해 주세요.";
  }

  return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
}

function getAnswerText(question, answer) {
  if (answer === null || answer === undefined || answer === "") {
    return "미응답";
  }

  if (
    question.question_type === "multiple_choice" &&
    Array.isArray(question.choices)
  ) {
    const index = Number(answer);

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < question.choices.length
    ) {
      return `${index + 1}번. ${question.choices[index]}`;
    }
  }

  return String(answer);
}

function RetestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { retestId: urlRetestId } = useParams();

  const retestId = urlRetestId || location.state?.retestId || null;

  const [retest, setRetest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const [answerError, setAnswerError] = useState("");
  const [completeError, setCompleteError] = useState("");

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!retestId) return;

    let cancelled = false;
    let timeoutId = null;

    const loadRetest = async () => {
      try {
        const result = await getRetest(retestId);

        if (cancelled) return;

        setRetest(result);
        setIsLoading(false);
        setErrorMessage("");

        if (result.status === "generating") {
          timeoutId = window.setTimeout(loadRetest, POLLING_INTERVAL);
        }

        if (result.status === "completed") {
          navigate(`/retests/${result.id}/result`, {
            replace: true,
            state: {
              retestId: result.id,
              reportId: result.report_id,
              topic: location.state?.topic,
            },
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error("재시험 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
          navigate("/home", {
            replace: true,
            state: {
              errorMessage: "재시험을 찾을 수 없어요.",
            },
          });
          return;
        }

        setErrorMessage("재시험 정보를 불러오지 못했어요. 다시 시도해 주세요.");
        setIsLoading(false);
      }
    };

    loadRetest();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [retestId, navigate, retryCount, location.state?.topic]);

  const questions = retest?.questions || [];
  const totalCount = retest?.total ?? questions.length;

  const question = questions[currentIndex] || null;

  const answeredCount = questions.filter((item) => item.answered).length;

  const progress =
    totalCount > 0 ? Math.min(100, (answeredCount / totalCount) * 100) : 0;

  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  const topic = location.state?.topic || "재시험";

  const currentAnswer = question
    ? (answers[question.number] ?? question.response ?? "")
    : "";

  const isCurrentAnswered = question?.answered === true;

  const isLastQuestion = currentIndex === questions.length - 1;

  const isBusy = isSubmittingAnswer || isCompleting;

  const handleAnswerChange = (value) => {
    if (!question || isCurrentAnswered || isBusy) return;

    setAnswers((previous) => ({
      ...previous,
      [question.number]: value,
    }));

    setAnswerError("");
  };

  const handlePrevious = () => {
    if (isBusy) return;

    setCurrentIndex((previous) => Math.max(previous - 1, 0));

    setAnswerError("");
    setCompleteError("");
  };

  const handleNext = () => {
    if (isBusy) return;

    setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1));

    setAnswerError("");
    setCompleteError("");
  };

  const handleSubmitAnswer = async () => {
    if (!question || isCurrentAnswered || isSubmittingAnswer || isCompleting) {
      return;
    }

    const answer = String(currentAnswer).trim();

    if (!answer) {
      setAnswerError("답을 입력하거나 선택해 주세요.");
      return;
    }

    if (question.question_type === "multiple_choice") {
      const choiceIndex = Number(answer);

      if (
        !Number.isInteger(choiceIndex) ||
        choiceIndex < 0 ||
        choiceIndex >= (question.choices?.length ?? 0)
      ) {
        setAnswerError("보기 중 하나를 선택해 주세요.");
        return;
      }
    }

    setIsSubmittingAnswer(true);
    setAnswerError("");

    try {
      const result = await submitRetestAnswer(
        retestId,
        question.number,
        answer,
      );

      setRetest((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          questions: previous.questions.map((item) =>
            item.number === question.number
              ? {
                  ...item,
                  answered: true,
                  response: answer,
                  is_correct: result.is_correct,
                  correct_answer: result.correct_answer,
                  explanation: result.explanation,
                }
              : item,
          ),
        };
      });

      setAnswers((previous) => ({
        ...previous,
        [question.number]: answer,
      }));
    } catch (error) {
      console.error("재시험 답안 제출 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "UNAUTHORIZED") {
        navigate("/login", { replace: true });
        return;
      }

      if (error.code === "NICKNAME_REQUIRED") {
        navigate("/nickname", { replace: true });
        return;
      }

      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        navigate("/home", { replace: true });
        return;
      }

      if (
        error.code === "QUESTION_ALREADY_ANSWERED" ||
        error.code === "RETEST_NOT_SOLVING"
      ) {
        setAnswerError(
          "재시험 상태가 변경되었어요. 문제 정보를 다시 불러올게요.",
        );

        try {
          const latest = await getRetest(retestId);
          setRetest(latest);

          if (latest.status === "completed") {
            navigate(`/retests/${latest.id}/result`, {
              replace: true,
            });
          }
        } catch (refreshError) {
          console.error("재시험 상태 갱신 실패:", {
            code: refreshError.code,
            status: refreshError.status,
            requestId: refreshError.requestId,
          });
          setAnswerError("문제 정보를 갱신하지 못했어요. 다시 불러와 주세요.");
        }

        return;
      }

      setAnswerError(getErrorMessage(error));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSubmitClick = () => {
    if (isBusy) return;

    setCompleteError("");
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    if (!retest || isCompleting || isSubmittingAnswer) return;

    setIsCompleting(true);
    setCompleteError("");

    try {
      const result = await completeRetest(retestId);

      setShowSubmitModal(false);

      navigate(`/retests/${result.id}/result`, {
        replace: true,
        state: {
          retestId: result.id,
          reportId: result.report_id,
          topic,
        },
      });
    } catch (error) {
      console.error("재시험 결과 저장 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "UNAUTHORIZED") {
        navigate("/login", { replace: true });
        return;
      }

      if (error.code === "NICKNAME_REQUIRED") {
        navigate("/nickname", { replace: true });
        return;
      }

      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        navigate("/home", { replace: true });
        return;
      }

      if (error.code === "RETEST_NOT_SOLVING") {
        setShowSubmitModal(false);
        setCompleteError(
          "재시험 상태가 변경되었어요. 현재 상태를 다시 확인해 주세요.",
        );

        try {
          const latest = await getRetest(retestId);
          setRetest(latest);

          if (latest.status === "completed") {
            navigate(`/retests/${latest.id}/result`, {
              replace: true,
            });
          }
        } catch (refreshError) {
          console.error("재시험 상태 갱신 실패:", {
            code: refreshError.code,
            status: refreshError.status,
            requestId: refreshError.requestId,
          });
        }

        return;
      }

      setCompleteError("재시험 결과를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRetryLoad = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRetryCount((previous) => previous + 1);
  };

  const handleBackToReport = () => {
    const reportId = retest?.report_id || location.state?.reportId;

    if (reportId) {
      navigate(`/reports/${reportId}`);
      return;
    }

    navigate("/reports");
  };

  if (!retestId) {
    return (
      <div className="app-page retest-page">
        <PageHeader
          title="직접 재시험 보기"
          description="재시험 정보를 확인해 주세요."
        />

        <div className="retest-page__state">
          <h2>재시험 정보를 찾을 수 없어요.</h2>
          <p>성장보고서에서 재시험을 다시 시작해 주세요.</p>

          <button type="button" onClick={() => navigate("/reports")}>
            성장보고서 목록으로
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-page retest-page">
        <PageHeader
          title="직접 재시험 보기"
          description="재시험 정보를 불러오고 있어요."
        />

        <div className="retest-page__state" role="status">
          <div className="retest-page__spinner" aria-hidden="true" />

          <h2>재시험을 불러오는 중이에요</h2>
          <p>잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !retest) {
    return (
      <div className="app-page retest-page">
        <PageHeader
          title="직접 재시험 보기"
          description="재시험 정보를 확인해 주세요."
        />

        <div className="retest-page__state">
          <h2>재시험 정보를 불러오지 못했어요.</h2>
          <p>{errorMessage}</p>

          <button type="button" onClick={handleRetryLoad}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (retest.status === "generating") {
    return (
      <div className="app-page retest-page">
        <PageHeader
          title="직접 재시험 보기"
          description="AI가 재시험 문제를 출제하고 있어요."
        />

        <div className="retest-page__state" role="status">
          <div className="retest-page__spinner" aria-hidden="true" />

          <h2>재시험 문제를 만들고 있어요</h2>

          <p>
            학습 자료를 바탕으로 문제를 생성하고 있어요. 완료되면 자동으로 시험
            화면이 나타나요.
          </p>
        </div>
      </div>
    );
  }

  if (retest.status === "failed") {
    return (
      <div className="app-page retest-page">
        <PageHeader title="직접 재시험 보기" description="재시험 출제 상태" />

        <div className="retest-page__state">
          <h2>재시험 출제에 실패했어요.</h2>

          <p>
            {retest.error?.code === "AI_ERROR"
              ? "잠시 문제가 생겼어요. 다시 시도해 주세요."
              : "재시험을 생성하지 못했어요."}
          </p>

          <button type="button" onClick={handleBackToReport}>
            성장보고서로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (retest.status === "completed") {
    return (
      <div className="app-page retest-page">
        <PageHeader
          title="직접 재시험 보기"
          description="재시험이 완료되었어요."
        />

        <div className="retest-page__state">
          <h2>재시험 결과가 저장되었어요.</h2>

          <button
            type="button"
            onClick={() => navigate(`/retests/${retest.id}/result`)}
          >
            결과 확인하기
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="app-page retest-page">
        <PageHeader title="직접 재시험 보기" description="재시험 문제 조회" />

        <div className="retest-page__state">
          <h2>표시할 문제가 없어요.</h2>

          <p>문제 정보를 다시 불러와 주세요.</p>

          <button type="button" onClick={handleRetryLoad}>
            다시 불러오기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page retest-page">
      <PageHeader
        title="직접 재시험 보기"
        description={`${topic} · 총 ${totalCount}문제`}
      />

      <div className="retest-page__progress-header">
        <strong>
          문제 {currentIndex + 1} / {totalCount}
        </strong>

        <span>{answeredCount}문제 답변 완료</span>
      </div>

      <div
        className="retest-page__progress-bar"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label="답변 완료 진행률"
      >
        <div
          className="retest-page__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="retest-page__question-card">
        <div className="retest-page__question-heading">
          <span className="retest-page__question-number">
            QUESTION {String(question.number).padStart(2, "0")}
          </span>

          <span className="retest-page__type-badge">
            {typeLabels[question.question_type] || "주관식"}
          </span>
        </div>

        <h2>{question.content}</h2>

        {question.question_type === "multiple_choice" ? (
          <div
            className="retest-page__options"
            role="radiogroup"
            aria-label="객관식 답안 선택"
          >
            {(question.choices || []).map((option, index) => {
              const selected = String(currentAnswer) === String(index);

              return (
                <label
                  key={index}
                  className={`retest-page__option ${
                    selected ? "retest-page__option--selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.number}`}
                    value={index}
                    checked={selected}
                    disabled={isCurrentAnswered || isBusy}
                    onChange={() => handleAnswerChange(String(index))}
                  />

                  <span className="retest-page__option-number">
                    {index + 1}
                  </span>

                  <span className="retest-page__option-text">{option}</span>

                  <span
                    className={`retest-page__option-circle ${
                      selected ? "retest-page__option-circle--selected" : ""
                    }`}
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>
        ) : question.question_type === "short_answer" ||
          question.question_type === "short" ? (
          <div className="retest-page__short-answer">
            <label htmlFor="short-answer">답안 작성</label>

            <input
              id="short-answer"
              type="text"
              placeholder="답안을 입력해 주세요."
              value={currentAnswer}
              disabled={isCurrentAnswered || isBusy}
              onChange={(event) => handleAnswerChange(event.target.value)}
            />
          </div>
        ) : (
          <div className="retest-page__essay-answer">
            <label htmlFor="essay-answer">답안 작성</label>

            <textarea
              id="essay-answer"
              rows={6}
              placeholder="배운 내용을 자신의 언어로 자세히 설명해 주세요."
              value={currentAnswer}
              disabled={isCurrentAnswered || isBusy}
              onChange={(event) => handleAnswerChange(event.target.value)}
            />

            <span>{String(currentAnswer).length}자 작성</span>
          </div>
        )}

        {isCurrentAnswered && (
          <div
            className={`retest-page__answer-feedback ${
              question.is_correct
                ? "retest-page__answer-feedback--correct"
                : "retest-page__answer-feedback--wrong"
            }`}
          >
            <strong>
              {question.is_correct ? "✓ 정답이에요!" : "× 오답이에요."}
            </strong>

            <p>
              <span>내 답:</span> {getAnswerText(question, question.response)}
            </p>

            {!question.is_correct && question.correct_answer != null && (
              <p>
                <span>정답:</span>{" "}
                {getAnswerText(question, question.correct_answer)}
              </p>
            )}

            {question.explanation && (
              <p>
                <span>해설:</span> {question.explanation}
              </p>
            )}

            <small>제출한 답안은 수정할 수 없어요.</small>
          </div>
        )}

        {!isCurrentAnswered && (
          <p className="retest-page__answer-hint">
            답안을 채점하면 정답 여부와 해설을 확인할 수 있어요. 채점한 답안은
            수정할 수 없어요.
          </p>
        )}

        {answerError && (
          <p className="retest-page__error" role="alert">
            {answerError}
          </p>
        )}

        {completeError && (
          <p className="retest-page__error" role="alert">
            {completeError}
          </p>
        )}

        <div className="retest-page__question-footer">
          <button
            type="button"
            className="retest-page__previous-button"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isBusy}
          >
            이전 문제
          </button>

          <div className="retest-page__question-actions">
            {!isCurrentAnswered && (
              <button
                type="button"
                className="retest-page__grade-button"
                onClick={handleSubmitAnswer}
                disabled={isBusy || !String(currentAnswer).trim()}
              >
                {isSubmittingAnswer ? "채점 중..." : "답안 채점하기"}
              </button>
            )}

            {isLastQuestion ? (
              <button
                type="button"
                className="retest-page__next-button"
                onClick={handleSubmitClick}
                disabled={isBusy}
              >
                시험 제출하기
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="retest-page__next-button"
                onClick={handleNext}
                disabled={isBusy}
              >
                다음 문제
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {showSubmitModal && (
        <div className="retest-page__modal-backdrop">
          <div
            className="retest-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="retest-submit-title"
          >
            <h2 id="retest-submit-title">시험을 제출할까요?</h2>

            <p>
              {allAnswered
                ? "모든 문제를 채점했어요. 제출하면 최종 점수가 저장돼요."
                : `아직 ${totalCount - answeredCount}문제가 미제출 상태예요. 제출하지 않은 문제는 오답으로 처리돼요.`}
            </p>

            {completeError && (
              <p className="retest-page__error" role="alert">
                {completeError}
              </p>
            )}

            <div className="retest-page__modal-actions">
              <button
                type="button"
                className="retest-page__modal-cancel"
                onClick={() => setShowSubmitModal(false)}
                disabled={isCompleting}
              >
                계속 풀기
              </button>

              <button
                type="button"
                className="retest-page__modal-confirm"
                onClick={handleSubmitConfirm}
                disabled={isCompleting}
              >
                {isCompleting ? "결과 저장 중..." : "제출하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetestPage;
