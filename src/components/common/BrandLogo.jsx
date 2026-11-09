import { useNavigate } from "react-router-dom";

import logoImage from "../../assets/images/logo.svg";
import "./BrandLogo.css";

function BrandLogo() {
  const navigate = useNavigate();

  return (
    <img
      className="brand-logo"
      src={logoImage}
      alt="티칭로그"
      onClick={() => navigate("/onboarding")}
    />
  );
}

export default BrandLogo;
