import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/common/BrandLogo";
import openBookIcon from "../../assets/icons/open-book.svg";
import googleIcon from "../../assets/icons/google-icon.svg";

import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    navigate("/nickname");
  };

  return (
    <div className="login-page">
      <header className="login-page__header">
        <BrandLogo />
      </header>

      <main className="login-page__main">
        <section className="login-page__card">
          <img className="login-page__book-icon" src={openBookIcon} alt="" />

          <h1 className="login-page__title">배움의 새로운 시작</h1>

          <p className="login-page__description">
            AI 학생을 가르치며 나의 이해를 확인해 보세요.
          </p>

          <button
            type="button"
            className="login-page__google-button"
            onClick={handleGoogleLogin}
          >
            <img src={googleIcon} alt="" />
            <span>Google로 계속하기</span>
          </button>

          <p className="login-page__notice">
            Google 계정으로 간편하게 시작할 수 있어요.
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
