import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyInfo } from "../../api/userApi";
import { getLessons } from "../../api/lessonApi";

import classPlusIcon from "../../assets/icons/class-plus.svg";
import preclassIcon from "../../assets/icons/preclass.svg";
import openBookIcon from "../../assets/icons/open-book.svg";
import fileTextIcon from "../../assets/icons/file-text-gray.svg";

import "./HomePage.css";

const STATUS_LABELS = {
  teaching: "수업 중",
  evaluating: "평가 중",
  completed: "완료",
  failed: "처리 실패",
};

const PERSONA_CODES = {
  하늘: "haneul",
  민준: "minjun",
  서연: "seoyeon",
  "정현우 교수님": "hyunwoo",
  정현우: "hyunwoo",
};

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

function getScoreText(lesson) {
  if (lesson.status === "teaching") {
    return "학습 중";
  }

  if (lesson.status === "evaluating") {
    return "평가 중";
  }

  if (lesson.status === "failed") {
    return "처리 실패";
  }

  if (lesson.latest_score != null) {
    return `${lesson.latest_score}점`;
  }

  if (lesson.score != null) {
    return `${lesson.score}점`;
  }

  return "점수 없음";
}

function HomePage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(
    sessionStorage.getItem("nickname") || "",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [lessons, setLessons] = useState([]);
  const [isLessonsLoading, setIsLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState("");
  const [lessonsRetryCount, setLessonsRetryCount] = useState(0);

  const [resumeMessage, setResumeMessage] = useState("");

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

  useEffect(() => {
    let isActive = true;

    const fetchLessons = async () => {
      try {
        const result = await getLessons({
          page: 1,
          size: 20,
        });

        if (!isActive) return;

        setLessons(result.items);
        setLessonsError("");
      } catch (error) {
        if (!isActive) return;

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

        setLessonsError("학습 기록을 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (isActive) {
          setIsLessonsLoading(false);
        }
      }
    };

    fetchLessons();

    return () => {
      isActive = false;
    };
  }, [navigate, lessonsRetryCount]);

  const recentClasses = lessons.slice(0, 3);

  const ongoingLesson = lessons.find((lesson) => lesson.status === "teaching");

  const openLesson = (lesson) => {
    if (!lesson?.id) return;

    setResumeMessage("");

    if (lesson.status === "teaching") {
      const personaCode = PERSONA_CODES[lesson.persona_name] || "";

      sessionStorage.setItem("lesson_id", String(lesson.id));

      sessionStorage.setItem("teachingTitle", lesson.title || "");

      sessionStorage.setItem("teachingStudentId", personaCode);

      navigate("/teaching", {
        state: {
          lessonId: lesson.id,
          topic: lesson.title,
          studentId: personaCode,
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

  const handleResumeLesson = () => {
    if (isLessonsLoading) {
      return;
    }

    if (lessonsError) {
      setResumeMessage("학습 목록을 불러온 후 다시 시도해 주세요.");
      return;
    }

    if (!ongoingLesson) {
      setResumeMessage("진행 중인 수업이 없어요. 새 수업을 시작해 보세요!");
      return;
    }

    openLesson(ongoingLesson);
  };

  const handleRetryLessons = () => {
    setLessonsError("");
    setResumeMessage("");
    setIsLessonsLoading(true);

    setLessonsRetryCount((previous) => previous + 1);
  };

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
          onClick={handleResumeLesson}
          disabled={isLessonsLoading}
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

      {resumeMessage && (
        <p className="home-page__resume-message" role="status">
          {resumeMessage}
        </p>
      )}

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
          {isLessonsLoading ? (
            <div className="home-page__recent-empty" role="status">
              학습 기록을 불러오는 중...
            </div>
          ) : lessonsError ? (
            <div className="home-page__recent-empty">
              <p>{lessonsError}</p>

              <button
                type="button"
                className="home-page__retry-button"
                onClick={handleRetryLessons}
              >
                다시 시도
              </button>
            </div>
          ) : recentClasses.length === 0 ? (
            <div className="home-page__recent-empty">
              <p>아직 진행한 수업이 없어요.</p>
              <span>
                새 수업을 시작하면 이곳에서 학습 기록을 확인할 수 있어요.
              </span>
            </div>
          ) : (
            recentClasses.map((item) => (
              <button
                key={item.id}
                type="button"
                className="home-page__recent-item"
                onClick={() => openLesson(item)}
              >
                <div className="home-page__recent-info">
                  <img src={fileTextIcon} alt="" />

                  <span className="home-page__recent-title">{item.title}</span>

                  <span
                    className={`home-page__category home-page__category--${item.status}`}
                  >
                    {STATUS_LABELS[item.status] || "상태 확인"}
                  </span>
                </div>

                <div className="home-page__recent-right">
                  <span className="home-page__recent-persona">
                    {item.persona_name}
                  </span>

                  <span className="home-page__recent-score">
                    {getScoreText(item)}
                  </span>

                  <span className="home-page__recent-date">
                    {formatDate(item.started_at)}
                  </span>

                  <span className="home-page__chevron" aria-hidden="true">
                    ›
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
