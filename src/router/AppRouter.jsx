import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import OnboardingPage from "../pages/onboarding-page/OnboardingPage";
import LoginPage from "../pages/login-page/LoginPage";
import NicknamePage from "../pages/nickname-page/NicknamePage";
import HomePage from "../pages/home-page/HomePage";
import UploadPage from "../pages/upload-page/UploadPage";
import TeachingPage from "../pages/teaching-page/TeachingPage";
import NotePage from "../pages/note-page/NotePage";
import AssessmentPage from "../pages/assessment-page/AssessmentPage";
import GrowthReportPage from "../pages/growth-report-page/GrowthReportPage";
import RetestPage from "../pages/retest-page/RetestPage";

const PagePlaceholder = ({ title }) => {
  return (
    <div style={{ padding: "48px" }}>
      <h1>{title}</h1>
      <p>티칭로그 페이지를 구현할 예정입니다.</p>
    </div>
  );
};

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/onboarding" replace />,
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/nickname",
    element: <NicknamePage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/upload",
        element: <UploadPage />,
      },
      {
        path: "/teaching",
        element: <TeachingPage />,
      },
      {
        path: "/notes/:noteId",
        element: <NotePage />,
      },
      {
        path: "/notes/:noteId",
        element: <PagePlaceholder title="정리노트 상세" />,
      },
      {
        path: "/assessment",
        element: <AssessmentPage />,
      },
      {
        path: "/reports",
        element: <PagePlaceholder title="성장보고서 목록" />,
      },
      {
        path: "/reports/:reportId",
        element: <GrowthReportPage />,
      },
      {
        path: "/retest",
        element: <RetestPage />,
      },
      {
        path: "/retest/result",
        element: <PagePlaceholder title="재시험 결과" />,
      },
      {
        path: "/settings",
        element: <PagePlaceholder title="설정" />,
      },
    ],
  },
]);
