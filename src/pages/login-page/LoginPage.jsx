import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import BrandLogo from "../../components/common/BrandLogo";
import openBookIcon from "../../assets/icons/open-book.svg";
import { loginWithGoogle } from "../../api/authApi";

import { saveAuth } from "../../utils/authStorage";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (isLoading) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const data = await loginWithGoogle(credentialResponse.credential);

      saveAuth(data);

      if (data.user.nickname) {
        sessionStorage.setItem("nickname", data.user.nickname);
      } else {
        sessionStorage.removeItem("nickname");
      }

      if (!data.user.nickname || !data.user.onboarding_completed) {
        navigate("/nickname", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Google 로그인 실패:", {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });

      if (error.code === "UNAUTHORIZED") {
        setLoginError(
          "Google 로그인 정보를 확인할 수 없어요. 다시 로그인해 주세요.",
        );
      } else if (
        error.code === "VALIDATION_ERROR" ||
        error.code === "GOOGLE_TOKEN_MISSING"
      ) {
        setLoginError("Google 로그인 정보가 없습니다. 다시 시도해 주세요.");
      } else {
        setLoginError("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setLoginError("Google 로그인에 실패했어요. 다시 시도해 주세요.");
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

          <div
            className={`login-page__google-button ${
              isLoading ? "login-page__google-button--loading" : ""
            }`}
          >
            {googleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                logo_alignment="left"
                locale="ko"
                width="300"
              />
            ) : (
              <p className="login-page__error">
                Google 로그인 설정을 확인해 주세요.
              </p>
            )}
          </div>

          {isLoading && (
            <p className="login-page__status" role="status">
              로그인 처리 중...
            </p>
          )}

          {loginError && (
            <p className="login-page__error" role="alert">
              {loginError}
            </p>
          )}

          <p className="login-page__notice">
            Google 계정으로 간편하게 시작할 수 있어요.
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
