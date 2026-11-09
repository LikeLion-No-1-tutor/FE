import { NavLink } from "react-router-dom";

import logoImage from "../../assets/images/logo2.svg";
import homeIcon from "../../assets/icons/home.svg";
import uploadIcon from "../../assets/icons/upload.svg";
import noteIcon from "../../assets/icons/note-pencil.svg";
import graphIcon from "../../assets/icons/graph-dark.svg";
import settingIcon from "../../assets/icons/setting.svg";

import "./Sidebar.css";

const menus = [
  {
    label: "홈",
    path: "/home",
    icon: homeIcon,
  },
  {
    label: "자료 제출",
    path: "/upload",
    icon: uploadIcon,
  },
  {
    label: "정리노트",
    path: "/notes",
    icon: noteIcon,
  },
  {
    label: "성장보고서",
    path: "/reports",
    icon: graphIcon,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/home" className="sidebar__brand">
        <img src={logoImage} alt="티칭로그" />
      </NavLink>

      <nav className="sidebar__menus">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `sidebar__menu ${isActive ? "sidebar__menu--active" : ""}`
            }
          >
            <img src={menu.icon} alt="" />
            <span>{menu.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `sidebar__menu sidebar__settings ${
            isActive ? "sidebar__menu--active" : ""
          }`
        }
      >
        <img src={settingIcon} alt="" />
        <span>설정</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;
