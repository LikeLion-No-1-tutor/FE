import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getReport } from "../../api/reportApi";
import { createRetest } from "../../api/retestApi";

import PageHeader from "../../components/common/PageHeader";

import goodIcon from "../../assets/icons/good.svg";
import badIcon from "../../assets/icons/bad.svg";
import retryBlueIcon from "../../assets/icons/retry-blue.svg";
import retryGreenIcon from "../../assets/icons/retry-green.svg";
import pencilIcon from "../../assets/icons/pencil-white.svg";

import "./GrowthReportPage.css";

function GrowthReportPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCreatingRetest, setIsCreatingRetest] = useState(false);
  const [retestError, setRetestError] = useState("");

  useEffect(() => {
    if (!reportId) return;

    let isActive = true;

    const fetchReport = async () => {
      try {
        const result = await getReport(reportId);

        if (!isActive) return;

        setReport(result);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;

        console.error("성장보고서 상세 조회 실패:", {
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
              errorMessage: "성장보고서를 찾을 수 없어요.",
            },
          });
          return;
        }

        setErrorMessage("성장보고서를 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isActive = false;
    };
  }, [reportId, navigate, retryCount]);

  const lesson = report?.lesson;

  const comparison = report?.comparison;

  const currentScore = comparison?.current_score ?? report?.score;

  const previousScore = comparison?.previous_score;

  const scoreDifference = comparison?.diff ?? 0;

  const correctAnswers = report?.exam?.correct ?? 0;
  const totalQuestions = report?.exam?.total ?? 0;

  const strengths = report?.strengths || [];
  const missedTerms = report?.missed_terms || [];
  const reviewRecommendations = report?.review_recommendations || [];

  const explainedTerms = report?.terms?.explained ?? 0;
  const totalTerms = report?.terms?.total ?? 0;

  const handleRetry = () => {
    setErrorMessage("");
    setIsLoading(true);
    setRetryCount((previous) => previous + 1);
  };

  const handleRetryTeaching = () => {
    navigate("/upload");
  };

  const handleRetest = async () => {
    if (!report || isCreatingRetest) return;

    setIsCreatingRetest(true);
    setRetestError("");

    try {
      const result = await createRetest(report.id, "missed_terms");

      navigate(`/retests/${result.id}`, {
        state: {
          retestId: result.id,
          reportId: report.id,
          lessonId: report.lesson.id,
          topic: report.lesson.title,
          studentName: report.lesson.persona_name,
        },
      });
    } catch (error) {
      console.error("재시험 출제 실패:", {
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
            errorMessage: "성장보고서를 찾을 수 없어요.",
          },
        });
        return;
      }

      if (error.code === "RETEST_GENERATING") {
        setRetestError(
          "이미 재시험을 출제하고 있어요. 출제가 진행 중인 재시험을 확인한 뒤 다시 시도해 주세요.",
        );
        return;
      }

      if (error.code === "VALIDATION_ERROR") {
        setRetestError(
          "재시험 출제 범위가 올바르지 않아요. 다시 시도해 주세요.",
        );
        return;
      }

      setRetestError("재시험 출제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsCreatingRetest(false);
    }
  };

  if (!reportId) {
    return (
      <div className="app-page growth-report-page">
        <PageHeader
          title="성장보고서"
          description="오늘의 수업 결과를 확인해 보세요."
        />

        <div className="growth-report-page__state">
          <p>성장보고서 ID가 없어요.</p>

          <button type="button" onClick={() => navigate("/reports")}>
            보고서 목록으로
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-page growth-report-page">
        <PageHeader
          title="성장보고서"
          description="오늘의 수업 결과를 확인해 보세요."
        />

        <div className="growth-report-page__state" role="status">
          성장보고서를 불러오는 중...
        </div>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="app-page growth-report-page">
        <PageHeader
          title="성장보고서"
          description="오늘의 수업 결과를 확인해 보세요."
        />

        <div className="growth-report-page__state">
          <p>{errorMessage || "성장보고서를 표시할 수 없어요."}</p>

          <button type="button" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page growth-report-page">
      <PageHeader
        title="성장보고서"
        description="오늘의 수업 결과를 확인해 보세요."
      />

      <div className="growth-report-page__content">
        <div className="growth-report-page__left">
          <section className="growth-report-page__report-card">
            <h2>수업 성장보고서</h2>

            <div className="growth-report-page__divider" />

            <div className="growth-report-page__report-table">
              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">학습 주제</span>

                <strong className="growth-report-page__row-value">
                  {lesson.title}
                </strong>
              </div>

              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">학생 AI</span>

                <strong className="growth-report-page__row-value">
                  {lesson.persona_name}
                  {lesson.persona_grade_label
                    ? ` (${lesson.persona_grade_label})`
                    : ""}
                </strong>
              </div>

              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">
                  AI 학생평가 점수
                </span>

                <div className="growth-report-page__score">
                  <strong>
                    {correctAnswers} / {totalQuestions}
                  </strong>

                  <span>
                    ({report.score != null ? `${report.score}점` : "점수 없음"})
                  </span>
                </div>
              </div>

              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">
                  설명한 핵심 용어
                </span>

                <strong className="growth-report-page__row-value">
                  {explainedTerms} / {totalTerms}
                </strong>
              </div>

              {comparison && (
                <div className="growth-report-page__report-row">
                  <span className="growth-report-page__row-label">
                    최근 평가 점수
                  </span>

                  <strong className="growth-report-page__row-value">
                    {currentScore}점
                  </strong>
                </div>
              )}
            </div>
          </section>

          {comparison && (
            <section className="growth-report-page__comparison">
              <h2>이전 점수 비교</h2>

              <div className="growth-report-page__comparison-card">
                <div className="growth-report-page__comparison-item">
                  <span>이전 평가</span>

                  <strong>
                    {previousScore}
                    <span>점</span>
                  </strong>
                </div>

                <span
                  className="growth-report-page__comparison-arrow"
                  aria-hidden="true"
                >
                  →
                </span>

                <div className="growth-report-page__comparison-item">
                  <span>최근 평가</span>

                  <strong>
                    {currentScore}
                    <span>점</span>
                  </strong>
                </div>

                <div
                  className={`growth-report-page__score-change ${
                    scoreDifference < 0
                      ? "growth-report-page__score-change--negative"
                      : ""
                  }`}
                >
                  {scoreDifference > 0
                    ? `▲ +${scoreDifference}점`
                    : scoreDifference < 0
                      ? `▼ ${scoreDifference}점`
                      : "변동 없음"}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="growth-report-page__right">
          <section className="growth-report-page__feedback growth-report-page__feedback--good">
            <div className="growth-report-page__feedback-heading">
              <h2>잘한 점</h2>
              <img src={goodIcon} alt="" />
            </div>

            {strengths.length > 0 ? (
              <div className="growth-report-page__feedback-list">
                {strengths.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            ) : (
              <p>아직 등록된 잘한 점이 없어요.</p>
            )}
          </section>

          <section className="growth-report-page__feedback growth-report-page__feedback--missed">
            <div className="growth-report-page__feedback-heading">
              <h2>놓친 개념</h2>
              <img src={badIcon} alt="" />
            </div>

            {missedTerms.length > 0 ? (
              <div className="growth-report-page__feedback-list">
                {missedTerms.map((term) => (
                  <div
                    key={term.term_id}
                    className="growth-report-page__missed-item"
                  >
                    <strong>{term.name}</strong>

                    <span>
                      {term.status === "mentioned"
                        ? "이름만 언급"
                        : "설명하지 않음"}

                      {term.wrong_count > 0
                        ? ` · 관련 문제 ${term.wrong_count}개 오답`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>놓친 핵심 개념이 없어요.</p>
            )}
          </section>

          <section className="growth-report-page__feedback growth-report-page__feedback--review">
            <div className="growth-report-page__feedback-heading">
              <h2>복습 추천</h2>
              <img src={retryBlueIcon} alt="" />
            </div>

            {reviewRecommendations.length > 0 ? (
              <div className="growth-report-page__feedback-list">
                {reviewRecommendations.map((item, index) => (
                  <p key={`${item.term_id}-${index}`}>{item.text}</p>
                ))}
              </div>
            ) : (
              <p>현재 등록된 복습 추천이 없어요.</p>
            )}
          </section>
        </div>
      </div>

      <div className="growth-report-page__footer">
        <button
          type="button"
          className="growth-report-page__retry-button"
          onClick={handleRetryTeaching}
        >
          <img src={retryGreenIcon} alt="" />
          <span>다시 설명하기</span>
        </button>

        <button
          type="button"
          className="growth-report-page__retest-button"
          onClick={handleRetest}
          disabled={isCreatingRetest}
        >
          <img src={pencilIcon} alt="" />

          <span>
            {isCreatingRetest ? "재시험 출제 요청 중..." : "직접 재시험 보기"}
          </span>
        </button>
      </div>

      {retestError && (
        <p className="growth-report-page__retest-error" role="alert">
          {retestError}
        </p>
      )}
    </div>
  );
}

export default GrowthReportPage;
