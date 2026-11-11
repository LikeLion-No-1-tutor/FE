import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { createRetest, getRetest } from "../../api/retestApi";
import { getReport } from "../../api/reportApi";

import PageHeader from "../../components/common/PageHeader";

import openBookIcon from "../../assets/icons/open-book-retest.svg";
import retryGreenIcon from "../../assets/icons/retry-green.svg";
import openBookIcon2 from "../../assets/icons/open-book.svg";
import goodCatIcon from "../../assets/icons/good-cat.svg";
import sosoEmojiIcon from "../../assets/icons/soso-emoji.svg";
import sadEmojiIcon from "../../assets/icons/sad-emoji.svg";

import "./RetestResultPage.css";

function getResultMeta(score) {
  if (score >= 80) {
    return {
      status: "good",
      label: "GOOD!",
      icon: goodCatIcon,
    };
  }

  if (score > 50) {
    return {
      status: "soso",
      label: "SOSO!",
      icon: sosoEmojiIcon,
    };
  }

  return {
    status: "bad",
    label: "BAD!",
    icon: sadEmojiIcon,
  };
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

function getResultMemo(correct, total) {
  if (total === 0) {
    return "채점 결과를 확인할 수 없어요.";
  }

  if (correct === total) {
    return "모든 문제를 맞혔어요! 학습한 개념을 잘 이해하고 있어요.";
  }

  const wrongCount = total - correct;

  return `${wrongCount}개 문제를 다시 복습해 보세요. 틀린 문제의 정답과 해설을 확인하면 좋아요.`;
}

function RetestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const retestId =
    params.retestId ||
    location.state?.retestId ||
    location.state?.result?.id ||
    null;

  const [retest, setRetest] = useState(null);
  const [report, setReport] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCreatingRetest, setIsCreatingRetest] = useState(false);
  const [retestError, setRetestError] = useState("");

  useEffect(() => {
    if (!retestId) return;

    let isActive = true;

    const fetchResult = async () => {
      try {
        const retestData = await getRetest(retestId);

        if (!isActive) return;

        setRetest(retestData);

        if (retestData.status === "generating") {
          navigate(`/retests/${retestData.id}`, {
            replace: true,
          });
          return;
        }

        if (retestData.status === "solving") {
          navigate(`/retests/${retestData.id}`, {
            replace: true,
          });
          return;
        }

        const reportData = await getReport(retestData.report_id);

        if (!isActive) return;

        setReport(reportData);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;

        console.error("재시험 결과 조회 실패:", {
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
              errorMessage: "재시험 결과를 찾을 수 없어요.",
            },
          });
          return;
        }

        setErrorMessage("재시험 결과를 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isActive = false;
    };
  }, [retestId, navigate, retryCount]);

  const questions = retest?.questions || [];

  const totalQuestions = retest?.total ?? 0;

  const correctAnswers = questions.filter(
    (question) => question.is_correct === true,
  ).length;

  const scoreHistory = report?.score_history || [];

  const currentExam = scoreHistory.find(
    (exam) => String(exam.exam_id) === String(retestId),
  );

  const calculatedScore =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : null;

  const score = currentExam?.score ?? calculatedScore;

  const topic = report?.lesson?.title || location.state?.topic || "재시험";

  const resultMeta = getResultMeta(score ?? 0);

  const memo = getResultMemo(correctAnswers, totalQuestions);

  const handleViewNote = () => {
    const lessonId = report?.lesson?.id;

    if (!lessonId) return;

    navigate(`/lessons/${lessonId}/note`, {
      state: {
        lessonId,
        topic,
      },
    });
  };

  const handleRetry = async () => {
    const reportId = retest?.report_id || report?.id;

    if (!reportId || isCreatingRetest) return;

    setIsCreatingRetest(true);
    setRetestError("");

    try {
      const result = await createRetest(reportId, "missed_terms");

      navigate(`/retests/${result.id}`, {
        state: {
          reportId,
          lessonId: report?.lesson?.id,
          topic,
        },
      });
    } catch (error) {
      console.error("재시험 재출제 실패:", {
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

      if (error.code === "RETEST_GENERATING") {
        setRetestError(
          "이미 재시험을 출제하는 중이에요. 잠시 후 다시 확인해 주세요.",
        );
        return;
      }

      setRetestError("재시험을 다시 출제하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsCreatingRetest(false);
    }
  };

  const handleReload = () => {
    setErrorMessage("");
    setIsLoading(true);
    setRetryCount((previous) => previous + 1);
  };

  if (!retestId) {
    return (
      <div className="app-page retest-result-page">
        <PageHeader
          title="재시험 결과"
          description="내가 직접 푼 시험 결과예요."
        />

        <div className="retest-result-page__state">
          <p>재시험 정보를 찾을 수 없어요.</p>

          <button type="button" onClick={() => navigate("/reports")}>
            성장보고서 목록으로
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-page retest-result-page">
        <PageHeader
          title="재시험 결과"
          description="내가 직접 푼 시험 결과예요."
        />

        <div className="retest-result-page__state" role="status">
          재시험 결과를 불러오는 중...
        </div>
      </div>
    );
  }

  if (errorMessage || !retest || !report) {
    return (
      <div className="app-page retest-result-page">
        <PageHeader
          title="재시험 결과"
          description="내가 직접 푼 시험 결과예요."
        />

        <div className="retest-result-page__state">
          <p>{errorMessage || "재시험 결과를 확인할 수 없어요."}</p>

          <button type="button" onClick={handleReload}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (retest.status === "failed") {
    return (
      <div className="app-page retest-result-page">
        <PageHeader title="재시험 결과" description={topic} />

        <div className="retest-result-page__state">
          <p>재시험 처리에 실패했어요. 다시 시도해 주세요.</p>

          <button
            type="button"
            onClick={() => navigate(`/reports/${retest.report_id}`)}
          >
            성장보고서로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page retest-result-page">
      <PageHeader
        title="재시험 결과"
        description={`${topic} | 내가 직접 푼 시험 결과예요.`}
      />

      <section className="retest-result-page__paper">
        <div className="retest-result-page__paper-header">
          <div className="retest-result-page__paper-title">
            <img src={openBookIcon} alt="" />
            <h2>시험지</h2>
          </div>

          <div className="retest-result-page__subject">
            <strong>{topic}</strong>
            <span>총 {totalQuestions}문제</span>
          </div>

          <div className="retest-result-page__score">
            <strong>{score != null ? `${score}점` : "채점 전"}</strong>
            <span>/ 100점 만점</span>
          </div>
        </div>

        <div className="retest-result-page__divider" />

        <div className="retest-result-page__body">
          <div className="retest-result-page__answer-grid">
            {questions.map((question) => {
              const isCorrect = question.is_correct === true;

              return (
                <article
                  key={question.number}
                  className="retest-result-page__answer-item"
                >
                  <span
                    className={`retest-result-page__answer-mark ${
                      isCorrect
                        ? "retest-result-page__answer-mark--correct"
                        : "retest-result-page__answer-mark--wrong"
                    }`}
                    aria-label={isCorrect ? "정답" : "오답"}
                  >
                    {isCorrect ? "✓" : "×"}
                  </span>

                  <div className="retest-result-page__answer-content">
                    <h3>
                      {question.number}. {question.content}
                    </h3>

                    <p className="retest-result-page__answer-text">
                      <span>내 답:</span>{" "}
                      {getAnswerText(question, question.response)}
                    </p>

                    {!isCorrect && (
                      <p className="retest-result-page__correct-answer">
                        <span>정답:</span>{" "}
                        {question.correct_answer != null
                          ? getAnswerText(question, question.correct_answer)
                          : "정답 정보가 없어요."}
                      </p>
                    )}

                    {question.explanation && (
                      <p className="retest-result-page__explanation">
                        <span>해설:</span> {question.explanation}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}

            <div className="retest-result-page__emotion">
              <div
                className={`retest-result-page__emotion-badge retest-result-page__emotion-badge--${resultMeta.status}`}
              >
                <span className="retest-result-page__emotion-stamp">
                  {resultMeta.label}
                </span>

                <img
                  src={resultMeta.icon}
                  alt=""
                  className="retest-result-page__emotion-icon"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="retest-result-page__memo">
          <strong>메모</strong>
          <p>{memo}</p>
        </div>
      </section>

      <div className="retest-result-page__footer">
        <button
          type="button"
          className="retest-result-page__note-button"
          onClick={handleViewNote}
        >
          <img src={openBookIcon2} alt="" />
          <span>정리노트 보기</span>
        </button>

        <button
          type="button"
          className="retest-result-page__retry-button"
          onClick={handleRetry}
          disabled={isCreatingRetest}
        >
          <img src={retryGreenIcon} alt="" />

          <span>
            {isCreatingRetest ? "재시험 출제 요청 중..." : "다시 시험 보기"}
          </span>
        </button>
      </div>

      {retestError && (
        <p className="retest-result-page__error" role="alert">
          {retestError}
        </p>
      )}
    </div>
  );
}

export default RetestResultPage;
