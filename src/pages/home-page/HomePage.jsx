import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyInfo } from "../../api/userApi";

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

  const [nickname, setNickname] = useState(
    sessionStorage.getItem("nickname") || "",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchMyInfo = async () => {
      try {
        const user = await getMyInfo();

        if (!isActive) return;

        sessionStorage.setItem("user", JSON.stringify(user));

        if (user.nickname) {
          sessionStorage.setItem("nickname", user.nickname);
          setNickname(user.nickname);
        } else {
          sessionStorage.removeItem("nickname");
          navigate("/nickname", { replace: true });
          return;
        }

        if (!user.onboarding_completed) {
          navigate("/nickname", { replace: true });
        }
      } catch (error) {
        if (!isActive) return;

        console.error("사용자 정보 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        setErrorMessage("사용자 정보를 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchMyInfo();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="app-page home-page">
      <header className="home-page__header">
        <h1>{nickname || "OO"} 선생님!</h1>
        <p>오늘은 어떤 개념을 가르쳐 볼까요?</p>

        {isLoading && (
          <p className="home-page__status" role="status">
            사용자 정보를 불러오는 중...
          </p>
        )}

        {errorMessage && (
          <p className="home-page__error" role="alert">
            {errorMessage}
          </p>
        )}
      </header>

      <section className="home-page__actions" aria-label="수업 바로가기">
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
            <span>더보기</span>
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
