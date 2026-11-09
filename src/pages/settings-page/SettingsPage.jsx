import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const trimmedNickname = inputNickname.trim();
  const isValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 10;

  const handleOpenNickname = () => {
    setInputNickname(nickname);
    setModalType("nickname");
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleNicknameSubmit = (event) => {
    event.preventDefault();

    if (!isValid) return;

    sessionStorage.setItem("nickname", trimmedNickname);
    setNickname(trimmedNickname);
    setModalType(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("nickname");
    sessionStorage.removeItem("teachingStudent");
    sessionStorage.removeItem("teachingStudentId");
    sessionStorage.removeItem("teachingFileName");
    sessionStorage.removeItem("demoRetestAnswers");

    setModalType(null);
    navigate("/login", { replace: true });
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
            onClick={() => setModalType("logout")}
          >
            로그아웃
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
                aria-label="닫기"
              >
                <img src={crossMarkIcon} alt="" />
              </button>

              <h2 id="nickname-modal-title">닉네임</h2>

              <input
                className="settings-page__nickname-input"
                type="text"
                value={inputNickname}
                onChange={(event) => setInputNickname(event.target.value)}
                maxLength={10}
                autoFocus
                aria-label="수정할 닉네임"
                aria-describedby="nickname-modal-helper"
              />

              <p
                id="nickname-modal-helper"
                className="settings-page__modal-description"
              >
                2~10자로 입력해 주세요.
              </p>

              <button
                type="submit"
                className="settings-page__modal-confirm"
                disabled={!isValid}
              >
                확인
              </button>
            </form>
          ) : (
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
                aria-label="닫기"
              >
                <img src={crossMarkIcon} alt="" />
              </button>

              <h2 id="logout-modal-title">로그아웃</h2>

              <p className="settings-page__logout-question">
                정말로 로그아웃 하시겠어요?
              </p>

              <button
                type="button"
                className="settings-page__modal-logout"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
