import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import harinImage from "../../assets/images/assessment-harin.svg";
import doyoonImage from "../../assets/images/assessment-doyoon.svg";
import seoyoonImage from "../../assets/images/assessment-seoyoon.svg";
import yonghoImage from "../../assets/images/assessment-yongho.svg";

import "./AssessmentPage.css";

const students = {
  elementary: {
    name: "김하린",
    level: "초등학교 5학년",
    image: harinImage,
  },
  highschool: {
    name: "이도윤",
    level: "고등학교 3학년",
    image: doyoonImage,
  },
  college: {
    name: "최서윤",
    level: "대학교 2학년",
    image: seoyoonImage,
  },
  professor: {
    name: "박영호",
    level: "대학 교수님",
    image: yonghoImage,
  },
};

const demoQuestions = [
  {
    id: 1,
    text: "스택의 동작 방식으로 옳은 것은?",
  },
  {
    id: 2,
    text: "큐의 특징으로 올바른 것은?",
  },
  {
    id: 3,
    text: "LIFO의 뜻은?",
  },
  {
    id: 4,
    text: "FIFO가 적용되는 예는?",
  },
  {
    id: 5,
    text: "스택과 큐의 차이로 옳은 것은?",
  },
];

function AssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const studentId =
    location.state?.studentId ||
    sessionStorage.getItem("teachingStudentId") ||
    "elementary";

  const student = students[studentId] || students.elementary;

  const [completedCount, setCompletedCount] = useState(0);

  const totalCount = demoQuestions.length;
  const progress = (completedCount / totalCount) * 100;
  const isCompleted = completedCount === totalCount;

  useEffect(() => {
    if (completedCount >= totalCount) return;

    const timer = setTimeout(() => {
      setCompletedCount((prev) => Math.min(prev + 1, totalCount));
    }, 1400);

    return () => clearTimeout(timer);
  }, [completedCount, totalCount]);

  const handleViewResult = () => {
    if (!isCompleted) return;

    navigate("/reports/demo", {
      state: {
        studentId,
        noteId: location.state?.noteId || "demo",
        topic: location.state?.topic || "스택과 큐",
      },
    });
  };

  return (
    <div className="app-page assessment-page">
      <PageHeader
        title="학생 AI 평가"
        description="평가가 출제된 문제를 학생 AI가 풀고 있어요."
      />

      <div className="assessment-page__content">
        <section className="assessment-page__student-card">
          <img
            src={student.image}
            alt={`${student.name} 프로필`}
            className="assessment-page__profile"
          />

          <h2 className="assessment-page__student-name">{student.name}</h2>

          <p className="assessment-page__student-level">{student.level}</p>

          <div className="assessment-page__progress-section">
            <p className="assessment-page__progress-title">
              {isCompleted ? "문제 풀이 완료!" : "문제 풀이 중..."}
            </p>

            <div
              className="assessment-page__progress-bar"
              role="progressbar"
              aria-label="AI 학생 문제 풀이 진행률"
              aria-valuemin={0}
              aria-valuemax={totalCount}
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
          <h2>평가 문제 (총 {totalCount}문제)</h2>

          <ol className="assessment-page__question-list">
            {demoQuestions.map((question, index) => {
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
                      {question.text}
                    </span>
                  </div>

                  <span
                    className={`assessment-page__question-status ${
                      isSolved ? "assessment-page__question-status--solved" : ""
                    }`}
                    aria-label={isSolved ? "풀이 완료" : "풀이 대기"}
                  >
                    {isSolved ? "✓" : "···"}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className="assessment-page__footer">
        <button
          type="button"
          className="assessment-page__result-button"
          onClick={handleViewResult}
          disabled={!isCompleted}
        >
          <span>결과 보기</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default AssessmentPage;
