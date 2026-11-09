import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />

      <main className="main-layout__content">
        <div className="main-layout__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
