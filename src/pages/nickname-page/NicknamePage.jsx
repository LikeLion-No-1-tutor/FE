import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMyInfo } from "../../api/userApi";
import BrandLogo from "../../components/common/BrandLogo";
import profileIcon from "../../assets/icons/profile.svg";

import "./NicknamePage.css";

function NicknamePage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedNickname = nickname.trim();
  const isValid = trimmedNickname.length >= 1 && trimmedNickname.length <= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const user = await updateMyInfo({
        nickname: trimmedNickname,
        onboarding_completed: true,
      });

      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("nickname", user.nickname);

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("닉네임 저장 실패:", {
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

  return (
    <div className="nickname-page">
      <header className="nickname-page__header">
        <BrandLogo />
      </header>

      <main className="nickname-page__main">
        <form className="nickname-page__card" onSubmit={handleSubmit}>
          <img
            className="nickname-page__profile-icon"
            src={profileIcon}
            alt=""
          />

          <h1 className="nickname-page__title">어떻게 불러드리면 될까요?</h1>

          <p className="nickname-page__description">
            나만의 교실에서 사용할 닉네임을 정해 주세요.
          </p>

          <div className="nickname-page__field">
            <label className="nickname-page__label" htmlFor="nickname">
              닉네임
            </label>

            <input
              id="nickname"
              className="nickname-page__input"
              type="text"
              value={nickname}
              placeholder="닉네임을 입력해 주세요"
              onChange={(e) => {
                setNickname(e.target.value);
                setErrorMessage("");
              }}
              maxLength={10}
              autoComplete="off"
              aria-describedby="nickname-help"
              aria-invalid={Boolean(errorMessage)}
              disabled={isLoading}
            />

            <p id="nickname-help" className="nickname-page__helper">
              1~10자로 입력해 주세요.
            </p>

            {errorMessage && (
              <p className="nickname-page__error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`nickname-page__submit ${
              isValid && !isLoading ? "nickname-page__submit--active" : ""
            }`}
            disabled={!isValid || isLoading}
          >
            <span>{isLoading ? "저장 중..." : "시작하기"}</span>
            {!isLoading && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </main>
    </div>
  );
}

export default NicknamePage;
