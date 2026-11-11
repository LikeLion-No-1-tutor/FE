import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import "./NotePage.css";

const demoNote = {
  title: "스택과 큐",
  terms: [
    {
      id: 1,
      name: "스택 (Stack)",
      concept:
        "마지막에 들어온 데이터가 가장 먼저 나가는 후입선출(LIFO) 방식의 자료구조입니다.",
      questions: [
        {
          id: 1,
          status: "answered",
          question:
            "스택에서 가장 위에 있는 데이터를 제거할 때 어떤 연산을 사용하나요?",
          answer:
            "pop 연산을 사용하여 가장 마지막에 삽입한 데이터를 제거합니다.",
        },
        {
          id: 2,
          status: "unseen",
          question:
            "스택에서 데이터가 모두 제거된 상태에서 pop 연산을 실행하면 어떻게 되나요?",
          answer: null,
        },
      ],
    },
    {
      id: 2,
      name: "큐 (Queue)",
      concept:
        "먼저 들어온 데이터가 가장 먼저 나가는 선입선출(FIFO) 방식의 자료구조입니다.",
      questions: [
        {
          id: 3,
          status: "answered",
          question:
            "큐에서 데이터를 삽입하고 삭제할 때 사용하는 연산은 무엇인가요?",
          answer:
            "데이터를 삽입할 때는 enqueue, 삭제할 때는 dequeue 연산을 사용합니다.",
        },
        {
          id: 4,
          status: "unseen",
          question: "일반적인 선형 큐와 원형 큐의 차이점은 무엇인가요?",
          answer: null,
        },
      ],
    },
  ],
  keywords: [
    { id: 1, name: "스택", checked: true },
    { id: 2, name: "후입선출", checked: false },
    { id: 3, name: "큐", checked: true },
    { id: 4, name: "선입선출", checked: false },
  ],
};

function TermSection({ term, index }) {
  return (
    <section className="note-page__term">
      <div className="note-page__term-header">
        <h3>
          {String(index + 1).padStart(2, "0")}. {term.name}
        </h3>
      </div>

      <div className="note-page__term-concept">
        <h4>개념</h4>
        <p>{term.concept}</p>
      </div>

      <div className="note-page__term-questions">
        {term.questions.map((item) => {
          const isUnseen = item.status === "unseen";

          return (
            <div
              key={item.id}
              className={`note-page__question ${
                isUnseen
                  ? "note-page__question--unseen"
                  : "note-page__question--answered"
              }`}
            >
              <div className="note-page__question-header">
                <h4>{isUnseen ? "확인하지 않은 질문" : "학생 AI의 질문"}</h4>

                <span
                  className={`note-page__question-status ${
                    isUnseen
                      ? "note-page__question-status--unseen"
                      : "note-page__question-status--answered"
                  }`}
                >
                  {isUnseen ? "미확인" : "답변 완료"}
                </span>
              </div>

              <p className="note-page__question-text">{item.question}</p>

              {!isUnseen && item.answer && (
                <div className="note-page__answer">
                  <h4>나의 답변</h4>
                  <p>{item.answer}</p>
                </div>
              )}

              {isUnseen && (
                <p className="note-page__unseen-message">
                  수업 중 확인하지 않은 질문입니다. 복습할 때 함께 생각해
                  보세요.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NotePage() {
  const navigate = useNavigate();
  const { noteId } = useParams();

  const note = demoNote;

  const checkedCount = note.keywords.filter(
    (keyword) => keyword.checked,
  ).length;

  const handleAssessment = () => {
    navigate("/assessment", {
      state: {
        noteId: noteId || "demo",
        topic: note.title,
      },
    });
  };

  return (
    <div className="app-page note-page">
      <PageHeader
        title="정리노트"
        description="지금까지의 수업 내용을 정리했어요."
      />

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
            <h2>{note.title}</h2>
          </div>

          <div className="note-page__note-grid">
            <div className="note-page__note-content">
              {note.terms.map((term, index) => (
                <TermSection key={term.id} term={term} index={index} />
              ))}
            </div>

            <aside className="note-page__keywords">
              <h3>핵심 용어</h3>

              <div className="note-page__keyword-divider" />

              <ul>
                {note.keywords.map((keyword) => (
                  <li key={keyword.id}>
                    <span
                      className={`note-page__keyword-checkbox ${
                        keyword.checked
                          ? "note-page__keyword-checkbox--checked"
                          : ""
                      }`}
                      aria-label={keyword.checked ? "확인됨" : "미확인"}
                    >
                      {keyword.checked && "✓"}
                    </span>

                    <span>{keyword.name}</span>
                  </li>
                ))}
              </ul>

              <p className="note-page__keyword-summary">
                확인한 용어 {checkedCount}/{note.keywords.length}
              </p>
            </aside>
          </div>
        </div>
      </div>

      <div className="note-page__footer">
        <button
          type="button"
          className="note-page__assessment-button"
          onClick={handleAssessment}
        >
          <span>학생 AI 평가 시작하기</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default NotePage;
