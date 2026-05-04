

import { Link, useLocation } from "react-router-dom";
import { SidebarData } from "./Sidebardata";
import "./Sidebar.css";
import logo1 from "../Assests/logo1.png";
import { useState } from "react";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  const role = sessionStorage.getItem("role");

  const hasPermission = (code) => {
    if (role === "SUPERADMIN") return true;
    return permissions.includes(code);
  };

  const handleToggle = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
    
      <div className="sidebar-header">
        <div className="logo1">
          {collapsed ? (
            <span className="logo-collapsed">A</span>
          ) : (
            <img
              src={logo1}
              alt="Sidebar Icon"
              className="logo-expanded"
              style={{ width: "111px", height: "51px", marginBottom: "36px", marginRight: "30px" }}
            />
          )}
        </div>
      </div>

      
      <nav className="nav-menu">
        <ul>
          {SidebarData()
            .filter(item => !item.permission || hasPermission(item.permission))
            .map((item, index) => {

              const isOpen = openMenu === index;

              return (
                <li key={index}>

                  {/* Parent */}
                  {item.children ? (
                    <div
                      className="nav-link"
                      onClick={() => handleToggle(index)}
                    >
                      <span className="nav-icon">{item.icon}</span>

                      {!collapsed && (
                        <>
                          <span className="nav-text">{item.title}</span>
                          <span style={{ marginLeft: "auto" }}>
                            {isOpen ? "▼" : "▶"}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`nav-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!collapsed && (
                        <span className="nav-text">{item.title}</span>
                      )}
                    </Link>
                  )}

                  {/* Submenu */}
                  {item.children && isOpen && (
                    <ul className="submenu">
                      {item.children
                        .filter(sub => !sub.permission || hasPermission(sub.permission))
                        .map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`submenu-link ${
                                location.pathname === subItem.path ? "active" : ""
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}

                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;