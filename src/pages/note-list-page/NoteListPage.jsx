import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getLessons } from "../../api/lessonApi";

import PageHeader from "../../components/common/PageHeader";
import searchIcon from "../../assets/icons/search.svg";
import documentIcon from "../../assets/icons/document.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";

import "./NoteListPage.css";

const PAGE_SIZE = 20;

const STATUS_LABELS = {
  teaching: "수업 중",
  evaluating: "평가 중",
  completed: "완료",
  failed: "처리 실패",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

function NoteListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") === "all" ? "all" : "notes";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const [lessons, setLessons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      try {
        const result = await getLessons({
          status: view === "notes" ? "completed" : undefined,
          page,
          size: PAGE_SIZE,
        });

        if (cancelled) return;

        setLessons(result.items);
        setTotal(result.total);
        setErrorMessage("");
      } catch (error) {
        if (cancelled) return;

        console.error("학습 목록 조회 실패:", {
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

        setErrorMessage("학습 목록을 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [view, page, retryCount, navigate]);

  const filteredLessons = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return lessons
      .filter((lesson) => {
        const matchesSearch =
          lesson.title.toLowerCase().includes(keyword) ||
          (lesson.persona_name || "").toLowerCase().includes(keyword);

        const matchesStatus =
          view === "notes" ||
          statusFilter === "all" ||
          lesson.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.started_at).getTime() || 0;
        const dateB = new Date(b.started_at).getTime() || 0;

        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
  }, [lessons, search, statusFilter, sortOrder, view]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleViewChange = (nextView) => {
    if (view === nextView) return;

    setSearch("");
    setStatusFilter("all");
    setSortOrder("latest");
    setPage(1);
    setIsLoading(true);
    setErrorMessage("");

    setSearchParams({
      view: nextView,
    });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
    setIsLoading(true);
    setErrorMessage("");
  };

  const handleRetry = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRetryCount((previous) => previous + 1);
  };

  const handleLessonClick = (lesson) => {
    if (lesson.status === "teaching") {
      sessionStorage.setItem("lesson_id", String(lesson.id));

      sessionStorage.setItem("teachingTitle", lesson.title);

      navigate("/teaching", {
        state: {
          lessonId: lesson.id,
          topic: lesson.title,
          studentName: lesson.persona_name,
        },
      });

      return;
    }

    navigate(`/lessons/${lesson.id}/note`, {
      state: {
        lessonId: lesson.id,
        topic: lesson.title,
      },
    });
  };

  return (
    <div className="app-page note-list-page">
      <PageHeader
        title={view === "notes" ? "정리노트" : "전체 학습"}
        description={
          view === "notes"
            ? "내가 가르친 내용을 한눈에 모아볼 수 있어요."
            : "지금까지 진행한 수업을 확인할 수 있어요."
        }
      />

      <div
        className="note-list-page__tabs"
        role="group"
        aria-label="학습 목록 유형"
      >
        <button
          type="button"
          className={`note-list-page__tab ${
            view === "notes" ? "note-list-page__tab--active" : ""
          }`}
          onClick={() => handleViewChange("notes")}
          aria-pressed={view === "notes"}
        >
          정리노트
        </button>

        <button
          type="button"
          className={`note-list-page__tab ${
            view === "all" ? "note-list-page__tab--active" : ""
          }`}
          onClick={() => handleViewChange("all")}
          aria-pressed={view === "all"}
        >
          전체 학습
        </button>
      </div>

      <div className="note-list-page__filters">
        <div className="note-list-page__search">
          <img src={searchIcon} alt="" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="학습 주제 또는 학생 이름 검색"
            aria-label="학습 검색"
          />
        </div>

        <div className="note-list-page__select-wrapper">
          <select
            className="note-list-page__category"
            value={view === "notes" ? "completed" : statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={view === "notes"}
            aria-label="학습 상태 선택"
          >
            {view === "notes" ? (
              <option value="completed">완료된 수업</option>
            ) : (
              <>
                <option value="all">전체 상태</option>
                <option value="teaching">수업 중</option>
                <option value="evaluating">평가 중</option>
                <option value="completed">완료</option>
                <option value="failed">처리 실패</option>
              </>
            )}
          </select>

          <img
            src={chevronRightIcon}
            alt=""
            className="note-list-page__select-arrow"
          />
        </div>
      </div>

      <div className="note-list-page__list-header">
        <h2>
          {view === "notes" ? "전체 노트" : "전체 학습"}
          {!isLoading && !errorMessage && (
            <span className="note-list-page__count">{total}</span>
          )}
        </h2>

        <div className="note-list-page__sort-wrapper">
          <select
            className="note-list-page__sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="학습 정렬"
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
        {isLoading ? (
          <div className="note-list-page__empty" role="status">
            학습 기록을 불러오는 중...
          </div>
        ) : errorMessage ? (
          <div className="note-list-page__empty note-list-page__empty--column">
            <p>{errorMessage}</p>
            <button
              type="button"
              className="note-list-page__retry-button"
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <button
              type="button"
              key={lesson.id}
              className="note-list-page__item"
              onClick={() => handleLessonClick(lesson)}
            >
              <span className="note-list-page__document">
                <img src={documentIcon} alt="" />
              </span>

              <span className="note-list-page__item-info">
                <strong>{lesson.title}</strong>
                <span>
                  {lesson.persona_name || "AI 학생"}
                  {" · "}
                  {STATUS_LABELS[lesson.status] || "상태 확인"}
                </span>
              </span>

              <span
                className={`note-list-page__tag note-list-page__tag--${lesson.status}`}
              >
                {STATUS_LABELS[lesson.status] || "상태 확인"}
              </span>

              <span className="note-list-page__date">
                {formatDate(lesson.started_at)}
              </span>

              <span className="note-list-page__arrow" aria-hidden="true">
                ›
              </span>
            </button>
          ))
        ) : (
          <div className="note-list-page__empty">
            {search.trim() || statusFilter !== "all"
              ? "현재 페이지에 검색 결과가 없어요."
              : view === "notes"
                ? "아직 완성된 정리노트가 없어요."
                : "아직 진행한 수업이 없어요."}
          </div>
        )}
      </section>

      {!isLoading && !errorMessage && totalPages > 1 && (
        <div className="note-list-page__pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            이전
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default NoteListPage;
