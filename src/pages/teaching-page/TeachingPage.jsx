import { Fragment, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getLesson,
  getLessonMessages,
  sendLessonMessage,
  askHandRaise,
  endLesson,
} from "../../api/lessonApi";

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
  haneul: {
    profile: harinProfile,
    name: "하늘",
  },
  minjun: {
    profile: doyoonProfile,
    name: "민준",
  },
  seoyeon: {
    profile: seoyoonProfile,
    name: "서연",
  },
  hyunwoo: {
    profile: yonghoProfile,
    name: "정현우 교수님",
  },
};

function formatTime(createdAt) {
  if (!createdAt) return "";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getErrorMessage(error) {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return "설명은 1~3,000자로 입력해 주세요.";

    case "AI_ERROR":
      return "AI 처리에 실패했어요. 다시 시도해 주세요.";

    case "HAND_ALREADY_ASKED":
      return "이미 받은 질문이에요. 대화를 다시 불러올게요.";

    case "LESSON_NOT_TEACHING":
      return "이미 종료된 수업이에요.";

    default:
      return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }
}

function findUnansweredQuestion(messages) {
  const answeredIds = new Set(
    messages
      .filter(
        (message) =>
          message.sender === "teacher" &&
          message.kind === "answer" &&
          message.reply_to_id != null,
      )
      .map((message) => message.reply_to_id),
  );

  const unanswered = messages.filter(
    (message) =>
      message.sender === "student" &&
      message.kind === "question" &&
      !answeredIds.has(message.id),
  );

  return unanswered.length > 0 ? unanswered[unanswered.length - 1].id : null;
}

function TeachingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const lessonId =
    location.state?.lessonId || sessionStorage.getItem("lesson_id");

  const initialLesson = location.state?.lesson || null;

  const studentCode =
    location.state?.studentId || sessionStorage.getItem("teachingStudentId");

  const [lesson, setLesson] = useState(initialLesson);
  const [messages, setMessages] = useState(
    initialLesson?.messages || location.state?.messages || [],
  );
  const [handRaises, setHandRaises] = useState([]);
  const [terms, setTerms] = useState(initialLesson?.terms || []);

  const [inputValue, setInputValue] = useState("");
  const [replyToId, setReplyToId] = useState(null);

  const [showChecklist, setShowChecklist] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [askingHandId, setAskingHandId] = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef(null);
  const operationRef = useRef(false);

  const topic =
    lesson?.material?.title ||
    location.state?.topic ||
    sessionStorage.getItem("teachingTitle") ||
    "수업";

  const studentProfile =
    studentMap[studentCode] ||
    Object.values(studentMap).find(
      (student) => student.name === lesson?.persona?.name,
    ) ||
    null;

  const studentName =
    lesson?.persona?.name ||
    location.state?.studentName ||
    studentProfile?.name ||
    "AI 학생";

  const studentAvatar = studentProfile?.profile || null;

  const lessonStatus = lesson?.status || "teaching";
  const isReadOnly = lessonStatus !== "teaching";

  const checkedCount = terms.filter(
    (term) => term.status === "explained",
  ).length;

  const isBusy = isLoading || isSending || askingHandId !== null || isEnding;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, handRaises, isSending]);

  useEffect(() => {
    if (!lessonId) {
      navigate("/home", { replace: true });
      return;
    }

    let cancelled = false;

    const loadLesson = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [lessonData, chatData] = await Promise.all([
          getLesson(lessonId),
          getLessonMessages(lessonId),
        ]);

        if (cancelled) return;

        setLesson(lessonData);
        setTerms(lessonData.terms || []);
        setMessages(chatData.messages || []);
        setHandRaises(chatData.hand_raises || []);

        setReplyToId(findUnansweredQuestion(chatData.messages || []));

        sessionStorage.setItem("lesson_id", String(lessonData.id));

        sessionStorage.setItem(
          "teachingTitle",
          lessonData.material?.title || "",
        );
      } catch (error) {
        if (cancelled) return;

        console.error("수업 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        if (error.code === "NICKNAME_REQUIRED") {
          navigate("/nickname", { replace: true });
          return;
        }

        if (error.code === "UNAUTHORIZED") {
          navigate("/login", { replace: true });
          return;
        }

        if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
          navigate("/home", {
            replace: true,
            state: {
              errorMessage: "수업을 찾을 수 없어요.",
            },
          });
          return;
        }

        setErrorMessage("수업 정보를 불러오지 못했어요. 다시 시도해 주세요.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [lessonId, navigate]);

  const refreshLessonData = async () => {
    const [lessonData, chatData] = await Promise.all([
      getLesson(lessonId),
      getLessonMessages(lessonId),
    ]);

    setLesson(lessonData);
    setTerms(lessonData.terms || []);
    setMessages(chatData.messages || []);
    setHandRaises(chatData.hand_raises || []);

    setReplyToId(findUnansweredQuestion(chatData.messages || []));
  };

  const handleSend = async () => {
    const content = inputValue.trim();

    if (
      !content ||
      content.length > 3000 ||
      isBusy ||
      isReadOnly ||
      operationRef.current
    ) {
      return;
    }

    operationRef.current = true;
    setIsSending(true);
    setErrorMessage("");

    try {
      const result = await sendLessonMessage(lessonId, {
        content,
        replyToId,
      });

      const reactionMessage =
        typeof result.reaction === "string" && result.reaction.trim()
          ? {
              id: `reaction-${result.message.id}`,
              sender: "student",
              kind: "reaction",
              content: result.reaction,
              reply_to_id: result.message.id,
              created_at: new Date().toISOString(),
            }
          : null;

      setMessages((previous) => [
        ...previous,
        result.message,
        ...(reactionMessage ? [reactionMessage] : []),
      ]);

      setTerms((previous) =>
        previous.map((term) => {
          const updated = result.term_updates?.find(
            (item) => item.term_id === term.term_id,
          );

          return updated ? { ...term, status: updated.status } : term;
        }),
      );

      if (result.new_hand_raise) {
        setHandRaises((previous) => [...previous, result.new_hand_raise]);
      }

      setInputValue("");
      setReplyToId(null);
    } catch (error) {
      console.error("설명 전송 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "LESSON_NOT_TEACHING") {
        setLesson((previous) => ({
          ...previous,
          status: "evaluating",
        }));
      }

      setErrorMessage(getErrorMessage(error));
    } finally {
      operationRef.current = false;
      setIsSending(false);
    }
  };

  const handleAskQuestion = async (handRaiseId) => {
    if (isBusy || isReadOnly || operationRef.current) {
      return;
    }

    operationRef.current = true;
    setAskingHandId(handRaiseId);
    setErrorMessage("");

    try {
      const result = await askHandRaise(lessonId, handRaiseId);

      setHandRaises((previous) =>
        previous.map((item) =>
          item.id === handRaiseId ? result.hand_raise : item,
        ),
      );

      setMessages((previous) => [...previous, result.question]);

      setReplyToId(result.question.id);
    } catch (error) {
      console.error("질문 받기 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "HAND_ALREADY_ASKED") {
        try {
          await refreshLessonData();
        } catch (refreshError) {
          console.error("대화 다시 조회 실패:", refreshError);
          setErrorMessage("대화를 다시 불러오지 못했어요.");
        }
      } else {
        if (error.code === "LESSON_NOT_TEACHING") {
          setLesson((previous) => ({
            ...previous,
            status: "evaluating",
          }));
        }

        setErrorMessage(getErrorMessage(error));
      }
    } finally {
      operationRef.current = false;
      setAskingHandId(null);
    }
  };

  const handleSaveClass = () => {
    if (isBusy || operationRef.current) return;

    setShowChecklist(false);
    navigate("/home");
  };

  const handleEndClass = () => {
    if (isBusy || isReadOnly) return;

    setShowChecklist(false);
    setErrorMessage("");
    setModalType("end-confirm");
  };

  const handleConfirmEnd = async () => {
    if (isEnding || isBusy || operationRef.current) {
      return;
    }

    operationRef.current = true;
    setIsEnding(true);
    setModalType("ending");
    setErrorMessage("");

    try {
      const result = await endLesson(lessonId);

      sessionStorage.setItem("lesson_id", String(result.id));

      navigate(`/lessons/${result.id}/note`, {
        replace: true,
        state: {
          lessonId: result.id,
          lessonStatus: result.status,
        },
      });
    } catch (error) {
      console.error("수업 종료 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "LESSON_NOT_TEACHING") {
        navigate(`/lessons/${lessonId}/note`, {
          replace: true,
          state: {
            lessonId,
          },
        });
        return;
      }

      setErrorMessage(getErrorMessage(error));
      setModalType(null);
    } finally {
      operationRef.current = false;
      setIsEnding(false);
    }
  };

  const renderHandRaise = (handRaise) => {
    const isAsked = handRaise.status === "asked";
    const isAsking = askingHandId === handRaise.id;

    return (
      <button
        key={`hand-${handRaise.id}`}
        type="button"
        className={`teaching-page__question-bubble ${
          isAsked ? "teaching-page__question-bubble--asked" : ""
        }`}
        onClick={() => handleAskQuestion(handRaise.id)}
        disabled={isAsked || isBusy || isReadOnly}
      >
        <img src={handIcon} alt="" />

        <span>
          {isAsking
            ? "질문 만드는 중..."
            : isAsked
              ? "질문했어요"
              : "질문 받기"}
        </span>

        {!isAsked && !isAsking && (
          <span className="teaching-page__question-arrow" aria-hidden="true">
            ›
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="app-page teaching-page">
      <header className="teaching-page__topbar">
        <div className="teaching-page__title-wrap">
          <button
            type="button"
            className="teaching-page__back-button"
            onClick={handleSaveClass}
            aria-label="뒤로가기"
            disabled={isBusy}
          >
            <img src={chevronRightIcon} alt="" />
          </button>

          <h1 className="teaching-page__title">{topic}</h1>

          <div className="teaching-page__check-wrap">
            <button
              type="button"
              className="teaching-page__check-button"
              onClick={() => setShowChecklist((previous) => !previous)}
              aria-expanded={showChecklist}
            >
              <img src={listCheckIcon} alt="" />
              <span>
                용어 체크 {checkedCount}/{terms.length}
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
                  {terms.map((term) => (
                    <li
                      key={term.term_id}
                      className="teaching-page__check-item"
                    >
                      <span
                        className={`teaching-page__check-box ${
                          term.status === "explained"
                            ? "teaching-page__check-box--checked"
                            : ""
                        }`}
                      >
                        {term.status === "explained"
                          ? "✓"
                          : term.status === "mentioned"
                            ? "·"
                            : ""}
                      </span>

                      <span>{term.name}</span>

                      {term.status === "mentioned" && (
                        <span className="teaching-page__term-status">언급</span>
                      )}
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
            disabled={isBusy}
          >
            수업 저장
          </button>

          <button
            type="button"
            className="teaching-page__end-button"
            onClick={handleEndClass}
            disabled={isBusy || isReadOnly}
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
          {isLoading && (
            <p className="teaching-page__notice">수업 내용을 불러오는 중...</p>
          )}

          {!isLoading &&
            messages.map((message) => {
              const attachedHands = handRaises.filter(
                (item) => item.after_message_id === message.id,
              );

              return (
                <Fragment key={message.id}>
                  <div
                    className={`teaching-page__message-row ${
                      message.sender === "teacher"
                        ? "teaching-page__message-row--teacher"
                        : "teaching-page__message-row--student"
                    }`}
                  >
                    {message.sender === "student" &&
                      (studentAvatar ? (
                        <img
                          src={studentAvatar}
                          alt=""
                          className="teaching-page__message-avatar"
                        />
                      ) : (
                        <span
                          className="teaching-page__message-avatar teaching-page__message-avatar--fallback"
                          aria-hidden="true"
                        >
                          {studentName.slice(0, 1)}
                        </span>
                      ))}

                    <div className="teaching-page__message-content">
                      {message.sender === "student" && (
                        <strong className="teaching-page__message-name">
                          {studentName}
                        </strong>
                      )}

                      <div
                        className={`teaching-page__message-bubble ${
                          message.sender === "teacher"
                            ? "teaching-page__message-bubble--teacher"
                            : "teaching-page__message-bubble--student"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>

                      <span className="teaching-page__message-time">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>

                  {attachedHands.length > 0 && (
                    <div className="teaching-page__message-row teaching-page__message-row--student teaching-page__hand-row">
                      {studentAvatar ? (
                        <img
                          src={studentAvatar}
                          alt=""
                          className="teaching-page__message-avatar"
                        />
                      ) : (
                        <span
                          className="teaching-page__message-avatar teaching-page__message-avatar--fallback"
                          aria-hidden="true"
                        >
                          {studentName.slice(0, 1)}
                        </span>
                      )}

                      <div className="teaching-page__hand-content">
                        <strong className="teaching-page__message-name">
                          {studentName}
                        </strong>
                        <div className="teaching-page__hands">
                          {attachedHands.map(renderHandRaise)}
                        </div>
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}

          {isSending && (
            <p className="teaching-page__notice">
              AI 학생이 설명을 확인하고 있어요...
            </p>
          )}

          {errorMessage && (
            <p className="teaching-page__error" role="alert">
              {errorMessage}
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!isReadOnly && (
          <>
            {replyToId !== null && (
              <div className="teaching-page__reply-notice">
                <span>학생 질문에 답변하는 중</span>

                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  disabled={isBusy}
                >
                  일반 설명으로 변경
                </button>
              </div>
            )}

            <form
              className="teaching-page__input-wrap"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              <textarea
                className="teaching-page__input"
                placeholder={
                  replyToId !== null
                    ? "학생의 질문에 답변해 주세요"
                    : "학생에게 개념을 설명해 주세요"
                }
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                maxLength={3000}
                rows={1}
                disabled={isBusy}
              />

              <button
                type="submit"
                className="teaching-page__send-button"
                disabled={!inputValue.trim() || isBusy}
                aria-label={isSending ? "설명 전송 중" : "메시지 전송"}
              >
                <img src={sendIcon} alt="" />
              </button>
            </form>
          </>
        )}

        {isReadOnly && (
          <p className="teaching-page__read-only">
            종료된 수업입니다. 이전 대화를 확인할 수 있어요.
          </p>
        )}
      </section>

      {modalType && (
        <div className="teaching-page__modal-backdrop">
          <div
            className="teaching-page__modal"
            role={modalType === "end-confirm" ? "dialog" : "status"}
            aria-modal="true"
            aria-labelledby="teaching-modal-title"
          >
            {modalType === "end-confirm" ? (
              <>
                <h2 id="teaching-modal-title">수업을 종료할까요?</h2>

                <p>수업을 종료하면 정리노트와 성장보고서 생성을 시작해요.</p>

                <div className="teaching-page__modal-actions">
                  <button type="button" onClick={() => setModalType(null)}>
                    취소
                  </button>

                  <button type="button" onClick={handleConfirmEnd}>
                    수업 종료
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="teaching-modal-title">수업을 종료하고 있어요</h2>

                <p>수업 내용을 저장하고 평가를 준비하고 있어요.</p>

                <div className="teaching-page__loading-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingPage;
