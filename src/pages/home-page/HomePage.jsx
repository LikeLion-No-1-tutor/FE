import { useNavigate } from "react-router-dom";

import classPlusIcon from "../../assets/icons/class-plus.svg";
import preclassIcon from "../../assets/icons/preclass.svg";
import openBookIcon from "../../assets/icons/open-book.svg";
import fileTextIcon from "../../assets/icons/file-text-gray.svg";

import "./HomePage.css";

const recentClasses = [
  {
    id: 1,
    title: "스택과 큐",
    category: "자료구조",
    date: "2025.10.20",
  },
  {
    id: 2,
    title: "스택과 큐",
    category: "자료구조",
    date: "2025.10.20",
  },
  {
    id: 3,
    title: "스택과 큐",
    category: "자료구조",
    date: "2025.10.20",
  },
];

function HomePage() {
  const navigate = useNavigate();

  const nickname = sessionStorage.getItem("nickname") || "OO";

  return (
    <div className="home-page">
      <header className="home-page__header">
        <h1>{nickname} 선생님!</h1>
        <p>오늘은 어떤 개념을 가르쳐 볼까요?</p>
      </header>

      <section className="home-page__actions">
        <button
          type="button"
          className="home-page__action home-page__action--primary"
          onClick={() => navigate("/upload")}
        >
          <img src={classPlusIcon} alt="" />
          <span>새 수업 시작</span>
        </button>

        <button
          type="button"
          className="home-page__action"
          onClick={() => navigate("/teaching")}
        >
          <img src={preclassIcon} alt="" />
          <span>지난 수업 이어하기</span>
        </button>

        <button
          type="button"
          className="home-page__action"
          onClick={() => navigate("/notes")}
        >
          <img src={openBookIcon} alt="" />
          <span>정리노트 보기</span>
        </button>
      </section>

      <section className="home-page__recent">
        <div className="home-page__recent-header">
          <h2>최근 수업</h2>

          <button
            type="button"
            className="home-page__more"
            onClick={() => navigate("/notes")}
          >
            더보기
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="home-page__recent-list">
          {recentClasses.map((item) => (
            <button
              key={item.id}
              type="button"
              className="home-page__recent-item"
              onClick={() => navigate(`/notes/${item.id}`)}
            >
              <div className="home-page__recent-info">
                <img src={fileTextIcon} alt="" />

                <span className="home-page__recent-title">{item.title}</span>

                <span className="home-page__category">{item.category}</span>
              </div>

              <div className="home-page__recent-right">
                <span className="home-page__recent-date">{item.date}</span>
                <span className="home-page__chevron" aria-hidden="true">
                  ›
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
