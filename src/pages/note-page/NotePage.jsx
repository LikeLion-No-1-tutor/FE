import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import "./NotePage.css";

const demoNote = {
  title: "스택과 큐",
  concepts: [
    {
      term: "스택",
      description:
        "마지막에 들어온 데이터가 가장 먼저 나가는 자료구조 (후입선출, LIFO)",
    },
    {
      term: "큐",
      description:
        "먼저 들어온 데이터가 가장 먼저 나가는 자료구조 (선입선출, FIFO)",
    },
  ],
  examples: [
    {
      term: "스택",
      description: "접시를 쌓고 꺼내는 것",
    },
    {
      term: "큐",
      description: "줄을 서서 차례대로 들어가는 것",
    },
  ],
  keywords: [
    { id: 1, name: "스택", checked: true },
    { id: 2, name: "후입선출", checked: false },
    { id: 3, name: "큐", checked: true },
    { id: 4, name: "선입선출", checked: false },
  ],
};

function NoteSection({ title, items, variant }) {
  return (
    <section className="note-page__section">
      <h3
        className={`note-page__section-label note-page__section-label--${variant}`}
      >
        {title}
      </h3>

      <ul className="note-page__bullet-list">
        {items.map((item) => (
          <li key={item.term}>
            <strong>{item.term}:</strong> {item.description}
          </li>
        ))}
      </ul>
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
              <NoteSection
                title="개념 정리"
                items={note.concepts}
                variant="concept"
              />

              <div className="note-page__section-divider" />

              <NoteSection
                title="예시"
                items={note.examples}
                variant="example"
              />
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
