import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getReports } from "../../api/reportApi";

import PageHeader from "../../components/common/PageHeader";
import reportIcon from "../../assets/icons/report.svg";
import searchIcon from "../../assets/icons/search.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";

import "./GrowthReportListPage.css";

const PAGE_SIZE = 20;

function getScoreStyle(score) {
  if (score == null) return "average";
  if (score >= 80) return "good";
  if (score > 60) return "average";
  return "low";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

function GrowthReportListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchReports = async () => {
      try {
        const result = await getReports({
          page,
          size: PAGE_SIZE,
        });

        if (!isActive) return;

        setReports(result.items);
        setTotal(result.total);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;

        console.error("성장보고서 목록 조회 실패:", {
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

        setErrorMessage("성장보고서를 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      isActive = false;
    };
  }, [navigate, page, retryCount]);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports
      .filter((report) => {
        const matchesSearch = (report.title || "")
          .toLowerCase()
          .includes(keyword);

        const matchesCategory =
          category === "all" ||
          (category === "retested" && report.retest_count > 0) ||
          (category === "not-retested" && report.retest_count === 0);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime() || 0;
        const dateB = new Date(b.created_at).getTime() || 0;

        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
  }, [reports, search, category, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleReportClick = (report) => {
    navigate(`/reports/${report.id}`);
  };

  const handleRetry = () => {
    setErrorMessage("");
    setIsLoading(true);
    setRetryCount((previous) => previous + 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
    setIsLoading(true);
    setErrorMessage("");
  };

  return (
    <div className="app-page growth-report-list-page">
      <PageHeader
        title="성장보고서"
        description="가르친 수업의 평가 결과와 성장 과정을 확인해 보세요."
      />

      <div className="growth-report-list-page__filters">
        <div className="growth-report-list-page__search">
          <img src={searchIcon} alt="" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="학습 주제를 검색해 보세요"
            aria-label="학습 주제 검색"
          />
        </div>

        <div className="growth-report-list-page__select-wrapper">
          <select
            className="growth-report-list-page__category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="재시험 여부 선택"
          >
            <option value="all">전체 보고서</option>
            <option value="retested">재시험 완료</option>
            <option value="not-retested">재시험 전</option>
          </select>

          <img
            src={chevronRightIcon}
            alt=""
            className="growth-report-list-page__select-arrow"
          />
        </div>
      </div>

      <div className="growth-report-list-page__list-header">
        <h2>
          전체 보고서
          {!isLoading && !errorMessage && (
            <span className="growth-report-list-page__count">{total}</span>
          )}
        </h2>

        <div className="growth-report-list-page__sort-wrapper">
          <select
            className="growth-report-list-page__sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="보고서 정렬"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>

          <img
            src={chevronRightIcon}
            alt=""
            className="growth-report-list-page__sort-arrow"
          />
        </div>
      </div>

      <section className="growth-report-list-page__list">
        {isLoading ? (
          <div className="growth-report-list-page__empty" role="status">
            성장보고서를 불러오는 중...
          </div>
        ) : errorMessage ? (
          <div className="growth-report-list-page__empty growth-report-list-page__empty--column">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="growth-report-list-page__retry-button"
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const latestScore = report.latest_score ?? report.score;

            return (
              <button
                type="button"
                key={report.id}
                className="growth-report-list-page__item"
                onClick={() => handleReportClick(report)}
              >
                <span className="growth-report-list-page__document">
                  <img src={reportIcon} alt="" />
                </span>

                <span className="growth-report-list-page__item-info">
                  <strong>{report.title}</strong>
                  <span>
                    성장보고서
                    {report.retest_count > 0
                      ? ` · 재시험 ${report.retest_count}회`
                      : " · 최초 평가"}
                  </span>
                </span>

                <div className="growth-report-list-page__badges">
                  <span className="growth-report-list-page__category-tag">
                    {report.retest_count > 0 ? "재시험 완료" : "최초 평가"}
                  </span>

                  <span
                    className={`growth-report-list-page__score-tag growth-report-list-page__score-tag--${getScoreStyle(
                      latestScore,
                    )}`}
                  >
                    {latestScore != null ? `${latestScore}점` : "평가 전"}
                  </span>
                </div>

                <span className="growth-report-list-page__date">
                  {formatDate(report.created_at)}
                </span>

                <img
                  src={chevronRightIcon}
                  alt=""
                  className="growth-report-list-page__item-arrow"
                />
              </button>
            );
          })
        ) : (
          <div className="growth-report-list-page__empty">
            {search.trim() || category !== "all"
              ? "현재 페이지에 검색 결과가 없습니다."
              : "아직 생성된 성장보고서가 없어요."}
          </div>
        )}
      </section>

      {!isLoading && !errorMessage && totalPages > 1 && (
        <div className="growth-report-list-page__pagination">
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

export default GrowthReportListPage;
