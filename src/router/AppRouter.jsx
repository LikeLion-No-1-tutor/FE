import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import OnboardingPage from "../pages/onboarding-page/OnboardingPage";
import LoginPage from "../pages/login-page/LoginPage";
import NicknamePage from "../pages/nickname-page/NicknamePage";
import HomePage from "../pages/home-page/HomePage";
import UploadPage from "../pages/upload-page/UploadPage";
import TeachingPage from "../pages/teaching-page/TeachingPage";
import NoteListPage from "../pages/note-list-page/NoteListPage";
import NotePage from "../pages/note-page/NotePage";
import AssessmentPage from "../pages/assessment-page/AssessmentPage";
import GrowthReportPage from "../pages/growth-report-page/GrowthReportPage";
import RetestPage from "../pages/retest-page/RetestPage";
import RetestResultPage from "../pages/retest-result-page/RetestResultPage";
import SettingsPage from "../pages/settings-page/SettingsPage";
import GrowthReportListPage from "../pages/growth-report-list-page/GrowthReportListPage";

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
        path: "/notes",
        element: <NoteListPage />,
      },
      {
        path: "/notes/:noteId",
        element: <NotePage />,
      },
      {
        path: "/lessons/:lessonId/note",
        element: <NotePage />,
      },
      {
        path: "/assessment",
        element: <AssessmentPage />,
      },
      {
        path: "/reports",
        element: <GrowthReportListPage />,
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
        element: <RetestResultPage />,
      },
      {
        path: "/retests/:retestId",
        element: <RetestPage />,
      },
      {
        path: "/retests/:retestId/result",
        element: <RetestResultPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
