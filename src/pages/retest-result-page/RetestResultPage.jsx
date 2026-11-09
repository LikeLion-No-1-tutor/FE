import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import openBookIcon from "../../assets/icons/open-book-retest.svg";
import retryGreenIcon from "../../assets/icons/retry-green.svg";
import openBookIcon2 from "../../assets/icons/open-book.svg";
import goodCatIcon from "../../assets/icons/good-cat.svg";
import sosoEmojiIcon from "../../assets/icons/soso-emoji.svg";
import sadEmojiIcon from "../../assets/icons/sad-emoji.svg";

import "./RetestResultPage.css";

const demoResult = {
  topic: "스택과 큐",
  score: 80,
  totalQuestions: 5,
  memo: "FIFO만 한 번 더 보면 돼요!",
  questions: [
    {
      id: 1,
      title: "스택의 특징",
      correct: true,
      answer: "② 마지막에 들어온 데이터가 먼저 나간다.",
    },
    {
      id: 2,
      title: "큐의 특징",
      correct: true,
      answer: "③ 먼저 들어온 데이터를 먼저 꺼낸다.",
    },
    {
      id: 3,
      title: "LIFO의 의미",
      correct: true,
      answer: "LIFO",
    },
    {
      id: 4,
      title: "FIFO의 의미",
      correct: true,
      answer: "FIFO",
    },
    {
      id: 5,
      title: "스택과 큐의 차이",
      correct: false,
      answer: "스택은 먼저 들어온 데이터가 먼저 나간다.",
      correctAnswer:
        "스택은 후입선출(LIFO), 큐는 선입선출(FIFO) 방식으로 동작한다.",
    },
  ],
};

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

function RetestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = demoResult;
  const topic = location.state?.topic || result.topic;
  const resultMeta = getResultMeta(result.score);

  const handleViewNote = () => {
    navigate("/notes/demo");
  };

  const handleRetry = () => {
    navigate("/retest", {
      state: {
        topic,
      },
    });
  };

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
            <span>총 {result.totalQuestions}문제</span>
          </div>

          <div className="retest-result-page__score">
            <strong>{result.score}점</strong>
            <span>/ 100점 만점</span>
          </div>
        </div>

        <div className="retest-result-page__divider" />

        <div className="retest-result-page__body">
          <div className="retest-result-page__answer-grid">
            {result.questions.map((question) => (
              <article
                key={question.id}
                className="retest-result-page__answer-item"
              >
                <span
                  className={`retest-result-page__answer-mark ${
                    question.correct
                      ? "retest-result-page__answer-mark--correct"
                      : "retest-result-page__answer-mark--wrong"
                  }`}
                  aria-label={question.correct ? "정답" : "오답"}
                >
                  {question.correct ? "✓" : "×"}
                </span>

                <div className="retest-result-page__answer-content">
                  <h3>
                    {question.id}. {question.title}
                  </h3>

                  <p className="retest-result-page__answer-text">
                    <span>내 답:</span> {question.answer}
                  </p>

                  {!question.correct && (
                    <p className="retest-result-page__correct-answer">
                      <span>정답:</span> {question.correctAnswer}
                    </p>
                  )}
                </div>
              </article>
            ))}

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
          <p>{result.memo}</p>
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
        >
          <img src={retryGreenIcon} alt="" />
          <span>다시 시험 보기</span>
        </button>
      </div>
    </div>
  );
}

export default RetestResultPage;
