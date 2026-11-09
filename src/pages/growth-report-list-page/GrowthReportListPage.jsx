import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import reportIcon from "../../assets/icons/report.svg";
import searchIcon from "../../assets/icons/search.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";

import "./GrowthReportListPage.css";

const demoReports = [
  {
    id: "demo",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-2",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-3",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-4",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-5",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-6",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
  {
    id: "report-7",
    title: "스택과 큐",
    category: "수학",
    score: 90,
    date: "2026.11.03",
  },
];

function getScoreStyle(score) {
  if (score >= 80) return "good";
  if (score > 60) return "average";
  return "low";
}

function GrowthReportListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const categories = useMemo(() => {
    return [...new Set(demoReports.map((report) => report.category))];
  }, []);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return demoReports
      .filter((report) => {
        const matchesSearch =
          report.title.toLowerCase().includes(keyword) ||
          report.category.toLowerCase().includes(keyword);

        const matchesCategory =
          category === "all" || report.category === category;

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

  const handleReportClick = (report) => {
    navigate(`/reports/${report.id}`, {
      state: {
        reportId: report.id,
        topic: report.title,
      },
    });
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
            className="growth-report-list-page__select-arrow"
          />
        </div>
      </div>

      <div className="growth-report-list-page__list-header">
        <h2>전체 보고서</h2>

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
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
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
                <span>성장보고서</span>
              </span>

              <div className="growth-report-list-page__badges">
                <span className="growth-report-list-page__category-tag">
                  {report.category}
                </span>

                <span
                  className={`growth-report-list-page__score-tag growth-report-list-page__score-tag--${getScoreStyle(report.score)}`}
                >
                  {report.score}점
                </span>
              </div>

              <span className="growth-report-list-page__date">
                {report.date}
              </span>

              <img
                src={chevronRightIcon}
                alt=""
                className="growth-report-list-page__item-arrow"
              />
            </button>
          ))
        ) : (
          <div className="growth-report-list-page__empty">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

export default GrowthReportListPage;
