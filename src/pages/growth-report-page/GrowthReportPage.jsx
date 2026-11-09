import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import goodIcon from "../../assets/icons/good.svg";
import badIcon from "../../assets/icons/bad.svg";
import retryBlueIcon from "../../assets/icons/retry-blue.svg";
import retryGreenIcon from "../../assets/icons/retry-green.svg";
import pencilIcon from "../../assets/icons/pencil-white.svg";

import "./GrowthReportPage.css";

const studentMap = {
  elementary: {
    name: "김하린",
    level: "초등학교 5학년",
  },
  highschool: {
    name: "이도윤",
    level: "고등학교 3학년",
  },
  college: {
    name: "최서윤",
    level: "대학교 2학년",
  },
  professor: {
    name: "박영호",
    level: "대학 교수님",
  },
};

const demoReport = {
  topic: "스택과 큐",
  totalQuestions: 5,
  correctAnswers: 4,
  previousCorrectAnswers: 3,
  goodPoint: "스택의 개념과 동작 방식을 쉬운 예시로 잘 설명했어요.",
  missedPoint: "큐의 활용 예시가 다소 부족했어요.",
  reviewRecommendation: "큐의 실생활 예시와 FIFO 개념을 다시 설명해 보세요.",
};

function GrowthReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId } = useParams();

  const studentId =
    location.state?.studentId ||
    sessionStorage.getItem("teachingStudentId") ||
    "elementary";

  const student = studentMap[studentId] || studentMap.elementary;

  const report = {
    ...demoReport,
    topic: location.state?.topic || demoReport.topic,
  };

  const currentScore = Math.round(
    (report.correctAnswers / report.totalQuestions) * 100,
  );

  const previousScore = Math.round(
    (report.previousCorrectAnswers / report.totalQuestions) * 100,
  );

  const scoreDifference = currentScore - previousScore;

  const handleRetryTeaching = () => {
    navigate("/teaching", {
      state: {
        studentId,
        topic: report.topic,
      },
    });
  };

  const handleRetest = () => {
    navigate("/retest", {
      state: {
        studentId,
        topic: report.topic,
        reportId: reportId || "demo",
      },
    });
  };

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
                  {report.topic}
                </strong>
              </div>

              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">학생 AI</span>

                <strong className="growth-report-page__row-value">
                  {student.name} ({student.level})
                </strong>
              </div>

              <div className="growth-report-page__report-row">
                <span className="growth-report-page__row-label">
                  AI 학생평가 점수
                </span>

                <div className="growth-report-page__score">
                  <strong>
                    {report.correctAnswers} / {report.totalQuestions}
                  </strong>
                  <span>({currentScore}점)</span>
                </div>
              </div>
            </div>
          </section>

          <section className="growth-report-page__comparison">
            <h2>이전 점수 비교</h2>

            <div className="growth-report-page__comparison-card">
              <div className="growth-report-page__comparison-item">
                <span>이전 수업 {previousScore}점</span>

                <strong>
                  {report.previousCorrectAnswers}/{report.totalQuestions}
                  <span> ({previousScore}점)</span>
                </strong>
              </div>

              <span
                className="growth-report-page__comparison-arrow"
                aria-hidden="true"
              >
                →
              </span>

              <div className="growth-report-page__comparison-item">
                <span>이번 수업 {currentScore}점</span>

                <strong>
                  {report.correctAnswers}/{report.totalQuestions}
                  <span> ({currentScore}점)</span>
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
        </div>

        <div className="growth-report-page__right">
          <section className="growth-report-page__feedback growth-report-page__feedback--good">
            <div className="growth-report-page__feedback-heading">
              <h2>잘한 점</h2>
              <img src={goodIcon} alt="" />
            </div>

            <p>{report.goodPoint}</p>
          </section>

          <section className="growth-report-page__feedback growth-report-page__feedback--missed">
            <div className="growth-report-page__feedback-heading">
              <h2>놓친 개념</h2>
              <img src={badIcon} alt="" />
            </div>

            <p>{report.missedPoint}</p>
          </section>

          <section className="growth-report-page__feedback growth-report-page__feedback--review">
            <div className="growth-report-page__feedback-heading">
              <h2>복습 추천</h2>
              <img src={retryBlueIcon} alt="" />
            </div>

            <p>{report.reviewRecommendation}</p>
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
        >
          <img src={pencilIcon} alt="" />
          <span>직접 재시험 보기</span>
        </button>
      </div>
    </div>
  );
}

export default GrowthReportPage;
