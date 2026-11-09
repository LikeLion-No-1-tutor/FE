import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import "./RetestPage.css";

const demoQuestions = [
  {
    id: 1,
    type: "choice",
    question: "스택(Stack)의 특징으로 옳은 것은?",
    options: [
      "먼저 들어온 데이터가 먼저 나간다.",
      "마지막에 들어온 데이터가 먼저 나간다.",
      "데이터를 임의의 순서로 꺼낸다.",
      "모든 데이터가 동시에 제거된다.",
    ],
  },
  {
    id: 2,
    type: "choice",
    question: "큐(Queue)의 특징으로 옳은 것은?",
    options: [
      "마지막에 넣은 데이터를 먼저 꺼낸다.",
      "데이터를 넣는 순서와 꺼내는 순서가 무관하다.",
      "먼저 들어온 데이터를 먼저 꺼낸다.",
      "데이터를 한 번에 모두 삭제해야 한다.",
    ],
  },
  {
    id: 3,
    type: "short",
    question: "후입선출을 의미하는 영어 약어를 작성하세요.",
  },
  {
    id: 4,
    type: "short",
    question: "선입선출을 의미하는 영어 약어를 작성하세요.",
  },
  {
    id: 5,
    type: "essay",
    question: "스택과 큐의 차이를 실생활 예시와 함께 설명하세요.",
  },
];

const typeLabels = {
  choice: "객관식",
  short: "주관식 · 단답형",
  essay: "서술형",
};

function RetestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const topic = location.state?.topic || "스택과 큐";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const question = demoQuestions[currentIndex];
  const totalCount = demoQuestions.length;

  const answeredCount = demoQuestions.filter((item) => {
    const answer = answers[item.id];

    return typeof answer === "string" && answer.trim().length > 0;
  }).length;

  const progress = (answeredCount / totalCount) * 100;
  const allAnswered = answeredCount === totalCount;

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalCount - 1));
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = () => {
    setShowSubmitModal(false);

    sessionStorage.setItem(
      "demoRetestAnswers",
      JSON.stringify({
        topic,
        answers,
      }),
    );

    navigate("/retest/result", {
      state: {
        topic,
        answers,
      },
    });
  };

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
            QUESTION {String(question.id).padStart(2, "0")}
          </span>

          <span className="retest-page__type-badge">
            {typeLabels[question.type]}
          </span>
        </div>

        <h2>{question.question}</h2>

        {question.type === "choice" && (
          <div
            className="retest-page__options"
            role="radiogroup"
            aria-label="객관식 답안 선택"
          >
            {question.options.map((option, index) => {
              const selected = answers[question.id] === String(index);

              return (
                <label
                  key={index}
                  className={`retest-page__option ${
                    selected ? "retest-page__option--selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    checked={selected}
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
        )}

        {question.type === "short" && (
          <div className="retest-page__short-answer">
            <label htmlFor="short-answer">답안 작성</label>

            <input
              id="short-answer"
              type="text"
              placeholder="답안을 입력해 주세요."
              value={answers[question.id] || ""}
              onChange={(event) => handleAnswerChange(event.target.value)}
            />
          </div>
        )}

        {question.type === "essay" && (
          <div className="retest-page__essay-answer">
            <label htmlFor="essay-answer">답안 작성</label>

            <textarea
              id="essay-answer"
              rows={6}
              placeholder="배운 내용을 자신의 언어로 자세히 설명해 주세요."
              value={answers[question.id] || ""}
              onChange={(event) => handleAnswerChange(event.target.value)}
            />

            <span>{(answers[question.id] || "").length}자 작성</span>
          </div>
        )}

        <div className="retest-page__question-footer">
          <button
            type="button"
            className="retest-page__previous-button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            이전 문제
          </button>

          {currentIndex === totalCount - 1 ? (
            <button
              type="button"
              className="retest-page__next-button"
              onClick={handleSubmitClick}
            >
              답안 제출하기
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              className="retest-page__next-button"
              onClick={handleNext}
            >
              다음 문제
              <span aria-hidden="true">→</span>
            </button>
          )}
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
            <h2 id="retest-submit-title">답안을 제출할까요?</h2>

            <p>
              {allAnswered
                ? "모든 문제에 답변했어요. 제출 후에는 수정할 수 없어요."
                : `아직 ${totalCount - answeredCount}문제가 미응답 상태예요. 그래도 제출할까요?`}
            </p>

            <div className="retest-page__modal-actions">
              <button
                type="button"
                className="retest-page__modal-cancel"
                onClick={() => setShowSubmitModal(false)}
              >
                계속 풀기
              </button>

              <button
                type="button"
                className="retest-page__modal-confirm"
                onClick={handleSubmitConfirm}
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetestPage;
