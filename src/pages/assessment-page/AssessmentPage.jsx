import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import { getLessonProgress } from "../../api/lessonApi";

import harinImage from "../../assets/images/assessment-harin.svg";
import doyoonImage from "../../assets/images/assessment-doyoon.svg";
import seoyoonImage from "../../assets/images/assessment-seoyoon.svg";
import yonghoImage from "../../assets/images/assessment-yongho.svg";

import "./AssessmentPage.css";

const students = {
  haneul: {
    name: "하늘",
    level: "초등학교 5학년",
    image: harinImage,
  },
  minjun: {
    name: "민준",
    level: "고등학교 1학년",
    image: doyoonImage,
  },
  seoyeon: {
    name: "서연",
    level: "대학교 2학년",
    image: seoyoonImage,
  },
  hyunwoo: {
    name: "정현우 교수님",
    level: "대학 교수님",
    image: yonghoImage,
  },
};

const legacyStudentIds = {
  elementary: "haneul",
  highschool: "minjun",
  college: "seoyeon",
  professor: "hyunwoo",
};

const examStatusText = {
  pending: "평가 대기 중...",
  generating: "평가 문제 준비 중...",
  solving: "문제 풀이 중...",
  grading: "평가 채점 중...",
  completed: "문제 풀이 완료!",
  failed: "평가 실패",
};

function AssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonId: paramLessonId } = useParams();

  const lessonId =
    paramLessonId ||
    location.state?.lessonId ||
    location.state?.lesson_id ||
    null;

  const savedStudentId =
    location.state?.studentId ||
    sessionStorage.getItem("teachingStudentId") ||
    "haneul";

  const studentId = legacyStudentIds[savedStudentId] || savedStudentId;

  const student = students[studentId] || students.haneul;

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const exam = progressData?.exam;
  const report = progressData?.report;

  const totalCount = Math.max(0, Number(exam?.total) || 0);

  const completedCount = Math.min(
    totalCount,
    Math.max(0, Number(exam?.solved) || 0),
  );

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isExamCompleted = exam?.status === "completed";

  const isFailed =
    exam?.status === "failed" ||
    report?.status === "failed" ||
    progressData?.lesson_status === "failed";

  const reportId = report?.report_id;

  const isReportReady = report?.status === "done" && reportId != null;

  const questions = Array.from({ length: totalCount }, (_, index) => ({
    id: index + 1,
  }));

  useEffect(() => {
    if (!lessonId) return;

    let cancelled = false;
    let timeoutId = null;
    let failureCount = 0;

    const loadProgress = async () => {
      try {
        const data = await getLessonProgress(lessonId);

        if (cancelled) return;

        setProgressData(data);
        setLoading(false);
        setError("");

        failureCount = 0;

        const reportReady =
          data?.report?.status === "done" && data?.report?.report_id != null;

        const failed =
          data?.exam?.status === "failed" ||
          data?.report?.status === "failed" ||
          data?.lesson_status === "failed";

        if (!reportReady && !failed) {
          timeoutId = setTimeout(loadProgress, 3000);
        }
      } catch {
        if (cancelled) return;

        failureCount += 1;

        if (failureCount >= 3) {
          setLoading(false);
          setError("평가 진행 상태를 불러오지 못했어요.");
        } else {
          timeoutId = setTimeout(loadProgress, 3000);
        }
      }
    };

    loadProgress();

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [lessonId, retryCount]);

  useEffect(() => {
    if (!isReportModalOpen) return;
    if (!isReportReady) return;
    if (isFailed) return;

    navigate(`/reports/${reportId}`, {
      replace: true,
      state: {
        studentId,
        lessonId,
      },
    });
  }, [
    isReportModalOpen,
    isReportReady,
    isFailed,
    reportId,
    navigate,
    studentId,
    lessonId,
  ]);

  const handleViewReport = () => {
    if (!isExamCompleted || isFailed || error) return;

    setIsReportModalOpen(true);
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setProgressData(null);
    setIsReportModalOpen(false);
    setRetryCount((prev) => prev + 1);
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
  };

  const getProgressText = () => {
    if (!lessonId) {
      return "학습 정보가 없어요.";
    }

    if (loading) {
      return "평가 정보 불러오는 중...";
    }

    if (error) {
      return "평가 정보를 불러오지 못했어요.";
    }

    return examStatusText[exam?.status] || "평가 준비 중...";
  };

  const displayError = !lessonId ? "학습 정보를 찾을 수 없어요." : error;

  const isReportFailed = isReportModalOpen && isFailed;

  return (
    <div className="app-page assessment-page">
      <PageHeader
        title="학생 AI 평가"
        description="평가 AI가 출제한 문제를 학생 AI가 풀고 있어요."
      />

      <div className="assessment-page__content">
        <section className="assessment-page__student-card">
          <div className="assessment-page__student-info">
            <img
              src={student.image}
              alt={`${student.name} 프로필`}
              className="assessment-page__profile"
            />

            <h2 className="assessment-page__student-name">{student.name}</h2>

            <p className="assessment-page__student-level">{student.level}</p>
          </div>

          <div className="assessment-page__progress-section">
            <p className="assessment-page__progress-title">
              {getProgressText()}
            </p>

            <div
              className="assessment-page__progress-bar"
              role="progressbar"
              aria-label="학생 AI 평가 진행률"
              aria-valuemin={0}
              aria-valuemax={totalCount || 1}
              aria-valuenow={completedCount}
            >
              <div
                className="assessment-page__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="assessment-page__progress-count">
              {completedCount}/{totalCount}
            </span>
          </div>
        </section>

        <section className="assessment-page__question-card">
          <h2 className="assessment-page__question-heading">
            평가 문제 (총 {totalCount}문제)
          </h2>

          {loading && lessonId ? (
            <p className="assessment-page__question-message">
              평가 정보를 불러오고 있어요.
            </p>
          ) : displayError ? (
            <p className="assessment-page__question-message">
              평가 정보를 확인할 수 없어요.
            </p>
          ) : isFailed && totalCount === 0 ? (
            <p className="assessment-page__question-message">
              평가 진행 중 오류가 발생했어요.
            </p>
          ) : totalCount === 0 ? (
            <p className="assessment-page__question-message">
              평가 문제가 준비되고 있어요.
            </p>
          ) : (
            <ol className="assessment-page__question-list">
              {questions.map((question, index) => {
                const isSolved = index < completedCount;

                return (
                  <li
                    key={question.id}
                    className="assessment-page__question-item"
                  >
                    <div className="assessment-page__question-info">
                      <span className="assessment-page__question-number">
                        {index + 1}.
                      </span>

                      <span className="assessment-page__question-text">
                        평가 문제 {index + 1}
                      </span>
                    </div>

                    <span
                      className={`assessment-page__question-status ${
                        isSolved
                          ? "assessment-page__question-status--solved"
                          : ""
                      }`}
                      aria-label={
                        isSolved ? "풀이 완료 수에 포함" : "풀이 대기"
                      }
                    >
                      {isSolved ? "✓" : "···"}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      {displayError && (
        <div className="assessment-page__error" role="alert">
          <span>{displayError}</span>

          {lessonId && (
            <button type="button" onClick={handleRetry}>
              다시 시도
            </button>
          )}
        </div>
      )}

      <div className="assessment-page__footer">
        <button
          type="button"
          className="assessment-page__result-button"
          onClick={handleViewReport}
          disabled={
            loading ||
            !lessonId ||
            !isExamCompleted ||
            isFailed ||
            !!error ||
            isReportModalOpen
          }
        >
          <span>성장보고서 보기</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {isReportModalOpen && (
        <div className="assessment-page__modal-overlay">
          <div
            className="assessment-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assessment-report-title"
          >
            {isReportFailed ? (
              <>
                <h2 id="assessment-report-title">성장보고서 생성 실패</h2>

                <p>성장보고서를 생성하는 중 문제가 발생했어요.</p>
              </>
            ) : (
              <>
                <div className="assessment-page__spinner" />

                <h2 id="assessment-report-title">성장보고서 작성 중</h2>

                <p>
                  학생 AI의 평가 결과를 분석하고 있어요.
                  <br />
                  성장보고서가 완성되면 자동으로 이동해요.
                </p>
              </>
            )}

            <button
              type="button"
              className="assessment-page__modal-close"
              onClick={handleCloseModal}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentPage;
