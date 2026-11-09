import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import searchIcon from "../../assets/icons/search.svg";
import documentIcon from "../../assets/icons/document.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";

import "./NoteListPage.css";

const demoNotes = [
  {
    id: "demo",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
  {
    id: "note-2",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
  {
    id: "note-3",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
  {
    id: "note-4",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
  {
    id: "note-5",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
  {
    id: "note-6",
    title: "스택과 큐",
    type: "정리노트",
    category: "자료구조",
    date: "2026.11.03",
  },
];

function NoteListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const categories = useMemo(
    () => [...new Set(demoNotes.map((note) => note.category))],
    [],
  );

  const filteredNotes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return demoNotes
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(keyword) ||
          note.category.toLowerCase().includes(keyword);

        const matchesCategory =
          category === "all" || note.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = a.date.replaceAll(".", "");
        const dateB = b.date.replaceAll(".", "");

        return sortOrder === "latest"
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      });
  }, [search, category, sortOrder]);

  const handleNoteClick = (note) => {
    navigate(`/notes/${note.id}`, {
      state: {
        topic: note.title,
        noteId: note.id,
      },
    });
  };

  return (
    <div className="app-page note-list-page">
      <PageHeader
        title="정리노트"
        description="내가 가르친 내용을 한눈에 모아볼 수 있어요."
      />

      <div className="note-list-page__filters">
        <div className="note-list-page__search">
          <img src={searchIcon} alt="" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="학습 주제를 검색해 보세요"
            aria-label="학습 주제 검색"
          />
        </div>

        <div className="note-list-page__select-wrapper">
          <select
            className="note-list-page__category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="분야 선택"
          >
            <option value="all">전체 분야</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <img
            src={chevronRightIcon}
            alt=""
            className="note-list-page__select-arrow"
          />
        </div>
      </div>

      <div className="note-list-page__list-header">
        <h2>전체 노트</h2>

        <div className="note-list-page__sort-wrapper">
          <select
            className="note-list-page__sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="노트 정렬"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>

          <img
            src={chevronRightIcon}
            alt=""
            className="note-list-page__sort-arrow"
          />
        </div>
      </div>

      <section className="note-list-page__list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <button
              type="button"
              key={note.id}
              className="note-list-page__item"
              onClick={() => handleNoteClick(note)}
            >
              <span className="note-list-page__document">
                <img src={documentIcon} alt="" />
              </span>

              <span className="note-list-page__item-info">
                <strong>{note.title}</strong>
                <span>{note.type}</span>
              </span>

              <span className="note-list-page__tag">{note.category}</span>

              <span className="note-list-page__date">{note.date}</span>

              <span className="note-list-page__arrow" aria-hidden="true">
                ›
              </span>
            </button>
          ))
        ) : (
          <div className="note-list-page__empty">검색 결과가 없습니다.</div>
        )}
      </section>
    </div>
  );
}

export default NoteListPage;
