import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const menus = [
  { label: "홈", path: "/home" },
  { label: "자료 제출", path: "/upload" },
  { label: "정리노트", path: "/notes" },
  { label: "성장보고서", path: "/reports" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">티칭로그</div>

      <nav className="sidebar__menus">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `sidebar__menu ${isActive ? "sidebar__menu--active" : ""}`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `sidebar__menu ${isActive ? "sidebar__menu--active" : ""}`
        }
      >
        설정
      </NavLink>
    </aside>
  );
}

export default Sidebar;
