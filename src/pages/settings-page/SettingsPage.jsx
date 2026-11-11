import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyInfo, updateMyInfo, deleteMyAccount } from "../../api/userApi";
import { logout } from "../../api/logoutApi";
import { clearAuth } from "../../utils/authStorage";

import crossMarkIcon from "../../assets/icons/cross-mark.svg";
import checkCircleIcon from "../../assets/icons/check-circle.svg";

import "./SettingsPage.css";

function SettingsPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(
    () => sessionStorage.getItem("nickname") || "OO",
  );

  const [inputNickname, setInputNickname] = useState(nickname);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedNickname = inputNickname.trim();
  const isValid = trimmedNickname.length >= 1 && trimmedNickname.length <= 10;

  useEffect(() => {
    let isActive = true;

    const fetchMyInfo = async () => {
      try {
        const user = await getMyInfo();

        if (!isActive) return;

        setNickname(user.nickname || "OO");
        sessionStorage.setItem("user", JSON.stringify(user));

        if (user.nickname) {
          sessionStorage.setItem("nickname", user.nickname);
        }
      } catch (error) {
        if (!isActive) return;

        console.error("사용자 정보 조회 실패:", {
          code: error.code,
          status: error.status,
          requestId: error.requestId,
        });

        setErrorMessage("사용자 정보를 불러오지 못했어요.");
      }
    };

    fetchMyInfo();

    return () => {
      isActive = false;
    };
  }, []);

  const clearTeachingData = () => {
    sessionStorage.removeItem("teachingStudent");
    sessionStorage.removeItem("teachingStudentId");
    sessionStorage.removeItem("teachingFileName");
    sessionStorage.removeItem("demoRetestAnswers");
  };

  const handleOpenNickname = () => {
    setInputNickname(nickname === "OO" ? "" : nickname);
    setErrorMessage("");
    setModalType("nickname");
  };

  const handleOpenLogout = () => {
    setErrorMessage("");
    setModalType("logout");
  };

  const handleOpenDelete = () => {
    setErrorMessage("");
    setModalType("delete");
  };

  const handleCloseModal = () => {
    if (isLoading) return;

    setErrorMessage("");
    setModalType(null);
  };

  const handleNicknameSubmit = async (event) => {
    event.preventDefault();

    if (!isValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const user = await updateMyInfo({
        nickname: trimmedNickname,
      });

      setNickname(user.nickname);

      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("nickname", user.nickname);

      setModalType(null);
    } catch (error) {
      console.error("닉네임 수정 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "VALIDATION_ERROR") {
        setErrorMessage("닉네임은 1~10자로 입력해 주세요.");
      } else if (error.code === "UNAUTHORIZED") {
        setErrorMessage("로그인이 필요해요. 다시 로그인해 주세요.");
      } else {
        setErrorMessage("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      await logout();

      clearAuth();
      clearTeachingData();

      setModalType(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("로그아웃 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "UNAUTHORIZED") {
        clearAuth();
        clearTeachingData();
        navigate("/login", { replace: true });
      } else {
        setErrorMessage("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      await deleteMyAccount();

      clearAuth();
      clearTeachingData();

      setModalType(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("회원 탈퇴 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "UNAUTHORIZED") {
        setErrorMessage("로그인이 필요해요. 다시 로그인해 주세요.");
      } else {
        setErrorMessage("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-page settings-page">
      <section className="settings-page__card">
        <h1 className="settings-page__title">계정 정보</h1>

        <div className="settings-page__divider" />

        <div className="settings-page__row settings-page__nickname-row">
          <div className="settings-page__info">
            <span className="settings-page__label">닉네임</span>
            <strong className="settings-page__nickname">{nickname}</strong>
          </div>

          <button
            type="button"
            className="settings-page__outline-button"
            onClick={handleOpenNickname}
          >
            수정
          </button>
        </div>

        <div className="settings-page__divider" />

        <div className="settings-page__row settings-page__account-row">
          <div className="settings-page__info">
            <span className="settings-page__label">연결된 계정</span>
            <strong className="settings-page__account">Google 계정</strong>
          </div>

          <img
            className="settings-page__check-icon"
            src={checkCircleIcon}
            alt="연결된 계정"
          />
        </div>

        <div className="settings-page__divider" />

        <div className="settings-page__row settings-page__logout-row">
          <div className="settings-page__info">
            <strong className="settings-page__logout-title">로그아웃</strong>
            <span className="settings-page__logout-description">
              현재 계정에서 로그아웃합니다.
            </span>
          </div>

          <button
            type="button"
            className="settings-page__outline-button"
            onClick={handleOpenLogout}
          >
            로그아웃
          </button>
        </div>

        <div className="settings-page__divider" />

        <div className="settings-page__row settings-page__logout-row">
          <div className="settings-page__info">
            <strong className="settings-page__logout-title">회원 탈퇴</strong>
            <span className="settings-page__logout-description">
              계정과 학습 기록을 영구적으로 삭제합니다.
            </span>
          </div>

          <button
            type="button"
            className="settings-page__outline-button settings-page__delete-button"
            onClick={handleOpenDelete}
          >
            탈퇴
          </button>
        </div>
      </section>

      {modalType && (
        <div
          className="settings-page__modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          {modalType === "nickname" ? (
            <form
              className="settings-page__modal"
              onSubmit={handleNicknameSubmit}
              role="dialog"
              aria-modal="true"
              aria-labelledby="nickname-modal-title"
            >
              <button
                type="button"
                className="settings-page__modal-close"
                onClick={handleCloseModal}
                disabled={isLoading}
                aria-label="닫기"
              >
                <img src={crossMarkIcon} alt="" />
              </button>

              <h2 id="nickname-modal-title">닉네임</h2>

              <input
                className="settings-page__nickname-input"
                type="text"
                value={inputNickname}
                onChange={(event) => {
                  setInputNickname(event.target.value);
                  setErrorMessage("");
                }}
                maxLength={10}
                autoFocus
                disabled={isLoading}
                aria-label="수정할 닉네임"
                aria-describedby="nickname-modal-helper"
              />

              <p
                id="nickname-modal-helper"
                className="settings-page__modal-description"
              >
                1~10자로 입력해 주세요.
              </p>

              {errorMessage && (
                <p className="settings-page__error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="settings-page__modal-confirm"
                disabled={!isValid || isLoading}
              >
                {isLoading ? "저장 중..." : "확인"}
              </button>
            </form>
          ) : modalType === "logout" ? (
            <div
              className="settings-page__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-modal-title"
            >
              <button
                type="button"
                className="settings-page__modal-close"
                onClick={handleCloseModal}
                disabled={isLoading}
                aria-label="닫기"
              >
                <img src={crossMarkIcon} alt="" />
              </button>

              <h2 id="logout-modal-title">로그아웃</h2>

              <p className="settings-page__logout-question">
                정말로 로그아웃 하시겠어요?
              </p>

              {errorMessage && (
                <p className="settings-page__error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                className="settings-page__modal-logout"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          ) : (
            <div
              className="settings-page__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <button
                type="button"
                className="settings-page__modal-close"
                onClick={handleCloseModal}
                disabled={isLoading}
                aria-label="닫기"
              >
                <img src={crossMarkIcon} alt="" />
              </button>

              <h2 id="delete-modal-title">회원 탈퇴</h2>

              <p className="settings-page__logout-question">
                탈퇴하면 지금까지의 학습 기록이 모두 지워지고 되돌릴 수 없어요.
                <br />
                정말 탈퇴하시겠어요?
              </p>

              {errorMessage && (
                <p className="settings-page__error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                className="settings-page__modal-logout settings-page__modal-delete"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? "탈퇴 처리 중..." : "회원 탈퇴"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
