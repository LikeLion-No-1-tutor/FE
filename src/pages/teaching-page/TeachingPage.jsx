import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import listCheckIcon from "../../assets/icons/list-check.svg";
import handIcon from "../../assets/icons/hand.svg";
import sendIcon from "../../assets/icons/send.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";

import harinProfile from "../../assets/images/Harin-profile.svg";
import seoyoonProfile from "../../assets/images/Seoyoon-profile.svg";
import yonghoProfile from "../../assets/images/Yongho-profile.svg";
import doyoonProfile from "../../assets/images/Doyoon-profile.svg";

import "./TeachingPage.css";

const studentMap = {
  elementary: {
    name: "김하린",
    level: "초등학교 5학년",
    profile: harinProfile,
    greeting:
      "안녕하세요, 선생님! 저는 초등학교 5학년 김하린이에요. 오늘 수업을 들으러 왔어요. 잘 부탁드려요!",
    question: "선생님! 스택은 왜 마지막에 넣은 데이터를 먼저 꺼내는 건가요?",
  },
  highschool: {
    name: "이도윤",
    level: "고등학교 3학년",
    profile: doyoonProfile,
    greeting:
      "안녕하세요, 선생님. 저는 고등학교 3학년 이도윤입니다. 오늘 설명을 잘 듣고 이해해 볼게요!",
    question: "스택과 큐의 차이를 예시와 함께 설명해 주실 수 있나요?",
  },
  college: {
    name: "최서윤",
    level: "대학교 2학년",
    profile: seoyoonProfile,
    greeting:
      "안녕하세요! 저는 대학교 2학년 최서윤이에요. 오늘 배울 내용을 실제 사례와 연결해서 이해하고 싶어요.",
    question: "큐는 실제 프로그램에서 어떤 상황에 활용할 수 있나요?",
  },
  professor: {
    name: "박영호",
    level: "대학 교수님",
    profile: yonghoProfile,
    greeting:
      "안녕하세요. 박영호입니다. 오늘 주제에 대한 설명을 듣고 함께 논의해 보겠습니다.",
    question: "스택과 큐의 동작 원리와 시간 복잡도를 함께 설명해 주시겠습니까?",
  },
};

const checklistItems = [
  { id: 1, text: "스택", checked: true },
  { id: 2, text: "후입선출(LIFO)", checked: true },
  { id: 3, text: "큐", checked: false },
  { id: 4, text: "선입선출(FIFO)", checked: false },
];

function getMessageTime() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function createMessage(sender, text, type = "normal") {
  return {
    id: crypto.randomUUID(),
    sender,
    type,
    text,
    time: getMessageTime(),
  };
}

function TeachingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const studentId =
    location.state?.studentId ||
    sessionStorage.getItem("teachingStudentId") ||
    "elementary";

  const student = studentMap[studentId] || studentMap.elementary;

  const topic = location.state?.topic || "스택과 큐";

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(() => [
    createMessage("student", student.greeting),
  ]);

  const [showChecklist, setShowChecklist] = useState(false);
  const [modalType, setModalType] = useState(null);

  const messagesEndRef = useRef(null);
  const questionTimerRef = useRef(null);
  const modalTimerRef = useRef(null);

  const checkedCount = checklistItems.filter((item) => item.checked).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }

      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const trimmed = inputValue.trim();

    if (!trimmed || modalType) return;

    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    setMessages((prev) => [
      ...prev.filter((message) => message.type !== "pending"),
      createMessage("teacher", trimmed),
    ]);

    setInputValue("");

    questionTimerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createMessage("student", student.question, "pending"),
      ]);

      questionTimerRef.current = null;
    }, 2000);
  };

  const handleOpenQuestion = (messageId) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId && message.type === "pending"
          ? {
              ...message,
              type: "normal",
              time: getMessageTime(),
            }
          : message,
      ),
    );
  };

  const handleSaveClass = () => {
    if (modalType) return;

    setShowChecklist(false);
    setModalType("save");

    modalTimerRef.current = setTimeout(() => {
      setModalType(null);
      modalTimerRef.current = null;
    }, 1800);
  };

  const handleEndClass = () => {
    if (modalType) return;

    setShowChecklist(false);
    setModalType("end");

    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    modalTimerRef.current = setTimeout(() => {
      setModalType(null);
      modalTimerRef.current = null;
      navigate("/notes/demo");
    }, 1800);
  };

  return (
    <div className="app-page teaching-page">
      <header className="teaching-page__topbar">
        <div className="teaching-page__title-wrap">
          <button
            type="button"
            className="teaching-page__back-button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <img src={chevronRightIcon} alt="" />
          </button>

          <h1 className="teaching-page__title">{topic}</h1>

          <div className="teaching-page__check-wrap">
            <button
              type="button"
              className="teaching-page__check-button"
              onClick={() => setShowChecklist((prev) => !prev)}
              aria-expanded={showChecklist}
            >
              <img src={listCheckIcon} alt="" />
              <span>
                용어 체크 {checkedCount}/{checklistItems.length}
              </span>
            </button>

            {showChecklist && (
              <div className="teaching-page__check-popover">
                <h2 className="teaching-page__check-popover-title">
                  오늘의 체크리스트
                </h2>

                <p className="teaching-page__check-description">
                  수업에서 다룬 핵심 개념을 확인해요.
                </p>

                <ul className="teaching-page__check-list">
                  {checklistItems.map((item) => (
                    <li key={item.id} className="teaching-page__check-item">
                      <span
                        className={`teaching-page__check-box ${
                          item.checked
                            ? "teaching-page__check-box--checked"
                            : ""
                        }`}
                      >
                        {item.checked ? "✓" : ""}
                      </span>

                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="teaching-page__actions">
          <button
            type="button"
            className="teaching-page__save-button"
            onClick={handleSaveClass}
          >
            수업 저장
          </button>

          <button
            type="button"
            className="teaching-page__end-button"
            onClick={handleEndClass}
          >
            수업 종료
          </button>
        </div>
      </header>

      <section
        className="teaching-page__chat-panel"
        aria-label="AI 학생과의 수업 채팅"
      >
        <div className="teaching-page__messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`teaching-page__message-row ${
                message.sender === "teacher"
                  ? "teaching-page__message-row--teacher"
                  : "teaching-page__message-row--student"
              }`}
            >
              {message.sender === "student" && (
                <img
                  src={student.profile}
                  alt=""
                  className="teaching-page__message-avatar"
                />
              )}

              <div className="teaching-page__message-content">
                {message.sender === "student" && (
                  <strong className="teaching-page__message-name">
                    {student.name}
                  </strong>
                )}

                {message.type === "pending" ? (
                  <button
                    type="button"
                    className="teaching-page__question-bubble"
                    onClick={() => handleOpenQuestion(message.id)}
                    aria-label={`${student.name} 학생의 질문 확인하기`}
                  >
                    <img src={handIcon} alt="" />

                    <span>질문 있어요!</span>

                    <span
                      className="teaching-page__question-arrow"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                ) : (
                  <div
                    className={`teaching-page__message-bubble ${
                      message.sender === "teacher"
                        ? "teaching-page__message-bubble--teacher"
                        : "teaching-page__message-bubble--student"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                )}

                <span className="teaching-page__message-time">
                  {message.time}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="teaching-page__input-wrap"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="teaching-page__input"
            placeholder="학생에게 개념을 설명해 주세요"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={modalType !== null}
          />

          <button
            type="submit"
            className="teaching-page__send-button"
            disabled={!inputValue.trim() || modalType !== null}
            aria-label="메시지 전송"
          >
            <img src={sendIcon} alt="" />
          </button>
        </form>
      </section>

      {modalType && (
        <div className="teaching-page__modal-backdrop">
          <div
            className="teaching-page__modal"
            role="status"
            aria-live="polite"
          >
            <h2>
              {modalType === "save" ? "수업 저장 중!" : "정리노트 생성 중"}
            </h2>

            <p>
              {modalType === "save"
                ? "지금까지의 수업 내용을 저장하고 있어요."
                : "수업 내용을 바탕으로 정리노트를 만들고 있어요."}
            </p>

            <div className="teaching-page__loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingPage;
