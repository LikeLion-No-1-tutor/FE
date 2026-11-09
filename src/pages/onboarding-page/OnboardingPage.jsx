import { useNavigate } from "react-router-dom";

import logoImage from "../../assets/images/logo.svg";
import onboardingImage from "../../assets/images/onboarding_image.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import graphIcon from "../../assets/icons/graph.svg";
import fileTextIcon from "../../assets/icons/file-text.svg";

import "./OnboardingPage.css";

function OnboardingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="onboarding">
      <header className="onboarding__header">
        <img className="onboarding__logo" src={logoImage} alt="티칭로그" />

        <div className="onboarding__header-buttons">
          <button
            type="button"
            className="onboarding__login-button"
            onClick={() => navigate("/login")}
          >
            로그인
          </button>

          <button
            type="button"
            className="onboarding__start-button"
            onClick={handleStart}
          >
            시작하기
          </button>
        </div>
      </header>

      <main className="onboarding__main">
        <section className="onboarding__hero">
          <div className="onboarding__intro">
            <h1 className="onboarding__title">
              AI 학생을 가르치며
              <br />
              내가 얼마나 이해했는지
              <br />
              확인하는 수업
            </h1>

            <p className="onboarding__description">
              설명하고, 평가받고, 성장하는 새로운 학습 경험
            </p>

            <button
              type="button"
              className="onboarding__hero-button"
              onClick={handleStart}
            >
              <span>지금 시작하기</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <img
            className="onboarding__hero-image"
            src={onboardingImage}
            alt="햇살이 들어오는 창가의 책상과 의자"
          />
        </section>

        <section
          className="onboarding__features"
          aria-label="티칭로그 주요 기능"
        >
          <div className="onboarding__feature">
            <img src={pencilIcon} alt="" />
            <p>직접 가르치며 학습</p>
          </div>

          <div className="onboarding__feature">
            <img src={graphIcon} alt="" />
            <p>AI 시험으로 이해도 점검</p>
          </div>

          <div className="onboarding__feature">
            <img src={fileTextIcon} alt="" />
            <p>정리노트와 성장보고서</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OnboardingPage;
