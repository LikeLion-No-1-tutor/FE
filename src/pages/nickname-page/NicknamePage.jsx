import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/common/BrandLogo";
import profileIcon from "../../assets/icons/profile.svg";

import "./NicknamePage.css";

function NicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const trimmedNickname = nickname.trim();
  const isValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 10;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) return;

    sessionStorage.setItem("nickname", trimmedNickname);
    navigate("/home");
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
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="off"
              aria-describedby="nickname-help"
            />

            <p id="nickname-help" className="nickname-page__helper">
              2~10자로 입력해 주세요.
            </p>
          </div>

          <button
            type="submit"
            className={`nickname-page__submit ${
              isValid ? "nickname-page__submit--active" : ""
            }`}
            disabled={!isValid}
          >
            <span>시작하기</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </main>
    </div>
  );
}

export default NicknamePage;
