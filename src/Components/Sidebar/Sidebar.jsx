
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { SidebarData } from "./Sidebardata";
import "./Sidebar.css";
import Ayurmunilogo from "../Assests/ayurmunilogo1.png";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  FaChevronDown,
  FaChevronRight,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarRef = useRef(null);
  const popupRef = useRef(null);

  const [openMenus, setOpenMenus] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  const [popup, setPopup] = useState(null);

  // =====================================
  // USER ROLE AND PERMISSIONS
  // =====================================

  useEffect(() => {
    const role = sessionStorage.getItem("role");

    let permissions = [];

    try {
      permissions = JSON.parse(
        sessionStorage.getItem("permissions") || "[]"
      );
    } catch (error) {
      console.error("Permission parsing error:", error);
    }

    setUserRole(role);

    setUserPermissions(
      Array.isArray(permissions) ? permissions : []
    );
  }, []);

  // =====================================
  // PERMISSION CHECK
  // =====================================

  const hasPermission = useCallback(
    (code) => {
      if (!code) return true;

      if (userRole === "SUPERADMIN") return true;

      return userPermissions.includes(code);
    },
    [userRole, userPermissions]
  );

  // =====================================
  // FILTER SIDEBAR DATA
  // =====================================

  const filteredSidebarItems = useMemo(() => {
    const filterRecursive = (items) => {
      return items
        .map((item) => {
          if (item.children) {
            const filteredChildren = filterRecursive(
              item.children
            );

            if (
              filteredChildren.length > 0 ||
              !item.permission ||
              hasPermission(item.permission)
            ) {
              return {
                ...item,
                children: filteredChildren,
              };
            }

            return null;
          }

          return hasPermission(item.permission) ? item : null;
        })
        .filter(Boolean);
    };

    return filterRecursive(SidebarData());
  }, [hasPermission]);

  // =====================================
  // FIND ACTIVE ROUTE AND OPEN PARENTS
  // =====================================

  useEffect(() => {
    const newOpenMenus = {};

    const findActivePath = (items, parentKey = "") => {
      let found = false;

      items.forEach((item, index) => {
        const currentKey = parentKey
          ? `${parentKey}-${index}`
          : String(index);

        if (item.path === location.pathname) {
          found = true;
        }

        if (item.children?.length) {
          const childFound = findActivePath(
            item.children,
            currentKey
          );

          if (childFound) {
            newOpenMenus[currentKey] = true;
            found = true;
          }
        }
      });

      return found;
    };

    findActivePath(filteredSidebarItems);

    setOpenMenus((prev) => ({
      ...prev,
      ...newOpenMenus,
    }));

    setPopup(null);
  }, [location.pathname, filteredSidebarItems]);

  // =====================================
  // TOGGLE EXPANDED MENU
  // =====================================

  const handleToggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =====================================
  // TOGGLE COLLAPSED ROOT POPUP
  // =====================================

  const handleRootMenuClick = (key, item, event) => {
    event.stopPropagation();

    if (!collapsed) {
      handleToggleMenu(key);
      return;
    }

    if (popup?.key === key) {
      setPopup(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const popupHeight = Math.min(
      Math.max(item.children.length * 48 + 25, 100),
      window.innerHeight - 30
    );

    let top = rect.top;

    if (top + popupHeight > window.innerHeight - 15) {
      top = window.innerHeight - popupHeight - 15;
    }

    top = Math.max(15, top);

    setPopup({
      key,
      item,
      top,
      left: rect.right + 12,
    });

    setOpenMenus({});
  };

  // =====================================
  // OUTSIDE CLICK CLOSE
  // =====================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sidebarRef.current?.contains(event.target) ||
        popupRef.current?.contains(event.target)
      ) {
        return;
      }

      setPopup(null);
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================
  // CLOSE POPUP ON ESCAPE
  // =====================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPopup(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================
  // RENDER SUBMENU
  // =====================================

  const renderSubmenu = (
    children,
    parentKey,
    level = 1
  ) => {
    if (!children || children.length === 0) return null;

    return (
      <ul className={`submenu submenu-level-${level}`}>
        {children.map((child, index) => {
          const key = `${parentKey}-${index}`;

          const hasChildren =
            child.children && child.children.length > 0;

          const isOpen = !!openMenus[key];

          // Nested parent
          if (hasChildren) {
            return (
              <li
                key={key}
                className={`submenu-item has-children ${
                  isOpen ? "submenu-open" : ""
                }`}
              >
                <div
                  className={`submenu-link submenu-parent ${
                    isOpen ? "open" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleMenu(key);
                  }}
                >
                  <span className="submenu-icon">
                    {child.icon}
                  </span>

                  <span className="submenu-text">
                    {child.title}
                  </span>

                  <span className="submenu-dropdown-icon">
                    {isOpen ? (
                      <FaChevronDown size={11} />
                    ) : (
                      <FaChevronRight size={11} />
                    )}
                  </span>
                </div>

                {isOpen &&
                  renderSubmenu(
                    child.children,
                    key,
                    level + 1
                  )}
              </li>
            );
          }

          // Normal link
          return (
            <li key={key} className="submenu-item">
              <Link
                to={child.path}
                className={`submenu-link ${
                  location.pathname === child.path
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setPopup(null);
                  setOpenMenus({});
                }}
              >
                <span className="submenu-icon">
                  {child.icon}
                </span>

                <span className="submenu-text">
                  {child.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  // =====================================
  // RENDER PARENT MENU
  // =====================================

  const renderParentMenuItem = (item, key) => {
    const isOpen = !!openMenus[key];

    if (!item.children?.length) return null;

    return (
      <li
        key={key}
        className={`menu-item has-children ${
          isOpen ? "menu-open" : ""
        }`}
      >
        <div
          className={`nav-link nav-link-parent ${
            isOpen || popup?.key === key ? "open" : ""
          }`}
          onClick={(event) =>
            handleRootMenuClick(key, item, event)
          }
          data-tooltip={collapsed ? item.title : ""}
          title={collapsed ? item.title : ""}
        >
          <span className="nav-icon">
            {item.icon}
          </span>

          {!collapsed && (
            <>
              <span className="nav-text">
                {item.title}
              </span>

              <span className="dropdown-icon">
                {isOpen ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronRight size={12} />
                )}
              </span>
            </>
          )}
        </div>

        {!collapsed &&
          isOpen &&
          renderSubmenu(item.children, key)}
      </li>
    );
  };

  // =====================================
  // RENDER SINGLE MENU
  // =====================================

  const renderSingleMenuItem = (item, key) => {
    return (
      <li key={key} className="menu-item">
        <Link
          to={item.path}
          className={`nav-link ${
            location.pathname === item.path
              ? "active"
              : ""
          }`}
          data-tooltip={collapsed ? item.title : ""}
          title={collapsed ? item.title : ""}
        >
          <span className="nav-icon">
            {item.icon}
          </span>

          {!collapsed && (
            <span className="nav-text">
              {item.title}
            </span>
          )}
        </Link>
      </li>
    );
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  // =====================================
  // RENDER COLLAPSED POPUP USING PORTAL
  // =====================================

  const renderCollapsedPopup = () => {
    if (!collapsed || !popup) return null;

    return createPortal(
      <div
        ref={popupRef}
        className="sidebar-floating-popup"
        style={{
          top: `${popup.top}px`,
          left: `${popup.left}px`,
        }}
      >
        <div className="sidebar-popup-header">
          <span className="sidebar-popup-icon">
            {popup.item.icon}
          </span>

          <span className="sidebar-popup-title">
            {popup.item.title}
          </span>
        </div>

        <div className="sidebar-popup-content">
          {renderSubmenu(
            popup.item.children,
            popup.key,
            1
          )}
        </div>
      </div>,
      document.body
    );
  };

  // =====================================
  // MAIN JSX
  // =====================================

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar ${
          collapsed ? "collapsed" : "expanded"
        }`}
        aria-label="Main navigation"
      >
        {/* HEADER */}

        <div className="sidebar-header">
          <div className="logo-container">
            {collapsed ? (
              <div className="logo-collapsed">
                <span role="img" aria-label="Ayurveda">
                  🌿
                </span>
              </div>
            ) : (
              <img
                src={Ayurmunilogo}
                alt="Ayurveda Wellness Logo"
                className="logo-expanded"
                loading="lazy"
              />
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={onToggleCollapse}
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <FaBars />
            </button>
          )}
        </div>

        {/* NAVIGATION */}

        <nav
          className="nav-menu"
          role="navigation"
          aria-label="Main menu"
        >
          <ul role="menubar" aria-orientation="vertical">
            {filteredSidebarItems.map((item, index) => {
              const key = String(index);

              if (item.children?.length > 0) {
                return renderParentMenuItem(item, key);
              }

              return renderSingleMenuItem(item, key);
            })}
          </ul>
        </nav>

        {/* FOOTER */}

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <span>👤</span>
              </div>

              <div className="user-details">
                <span className="user-role">
                  {userRole?.toLowerCase() || "User"}
                </span>

                <span className="user-status">
                  Online
                </span>
              </div>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* FLOATING SUBMENU PORTAL */}

      {renderCollapsedPopup()}
    </>
  );
};

export default Sidebar;
