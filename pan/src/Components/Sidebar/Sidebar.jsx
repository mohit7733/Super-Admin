import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarData } from "./Sidebardata";
import "./Sidebar.css";
import logo1 from "../Assests/logo1.png";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronDown, FaChevronRight, FaBars } from "react-icons/fa";

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Load user data from session storage
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");

    setUserRole(role);
    setUserPermissions(permissions);
  }, []);

  // Auto-expand menu items that match current path
  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let hasChanges = false;

    SidebarData().forEach((item, index) => {
      if (item.children) {
        const isChildActive = item.children.some(
          subItem => subItem.path === location.pathname
        );

        if (isChildActive && !openMenus[index]) {
          newOpenMenus[index] = true;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname]);

  // Check if user has required permission
  const hasPermission = useCallback((code) => {
    if (!code) return true;
    if (userRole === "SUPERADMIN") return true;
    return userPermissions.includes(code);
  }, [userRole, userPermissions]);

  // Get all sidebar items with filtering
  const filteredSidebarItems = useMemo(() => {
    return SidebarData()
      .filter(item => !item.permission || hasPermission(item.permission))
      .map(item => ({
        ...item,
        children: item.children?.filter(
          child => !child.permission || hasPermission(child.permission)
        )
      }))
      .filter(item => !item.children || item.children.length > 0);
  }, [hasPermission]);

  const handleToggleMenu = (index) => {
    setOpenMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
    console.log(openMenus);

  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  // Render submenu items
  // Recursive function to render submenu items with nested children support
  const renderSubmenu = (children, parentIndex, level = 1) => {
    if (!children || children.length === 0) return null;

    return (
      <ul
        className={`submenu submenu-level-${level} ${collapsed ? 'submenu-hidden' : ''}`}
        role="menu"
        aria-label="Submenu"
      >
        {children.map((subItem, subIndex) => {
          const hasChildren = subItem.children && subItem.children.length > 0;
          const itemKey = `${parentIndex}-${subIndex}`;

          return (
            <li key={itemKey} role="none" className="submenu-item">
              {hasChildren ? (
                // Render parent item with nested children
                <>
                  <div
                    className={`submenu-link submenu-parent ${openMenus[itemKey] ? 'open' : ''}`}
                    onClick={() => handleToggleMenu(itemKey)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={handleToggleMenu[itemKey]}
                    aria-haspopup="true"
                  >
                    {subItem.icon && <span className="submenu-icon">{subItem.icon}</span>}
                    <span className="submenu-text">{subItem.title}</span>
                    <span className="submenu-dropdown-icon">
                      {openMenus[itemKey] ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                    </span>
                    {subItem.badge && <span className="submenu-badge">{subItem.badge}</span>}
                  </div>

                  {/* Recursively render nested children */}
                  {openMenus[itemKey] && renderSubmenu(subItem.children, itemKey, level + 1)}
                </>
              ) : (
                // Render leaf link item
                <Link
                  to={subItem.path}
                  className={`submenu-link ${location.pathname === subItem.path ? "active" : ""}`}
                  role="menuitem"
                  tabIndex={0}
                  aria-current={location.pathname === subItem.path ? "page" : undefined}
                >
                  {subItem.icon && <span className="submenu-icon">{subItem.icon}</span>}
                  <span className="submenu-text">{subItem.title}</span>
                  {subItem.badge && <span className="submenu-badge">{subItem.badge}</span>}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Render parent menu item (with children)
  // Render parent menu item (with children)
  const renderParentMenuItem = (item, index) => {
    const isOpen = openMenus[index];
    const hasValidChildren = item.children && item.children.length > 0;

    if (!hasValidChildren) return null;

    return (
      <li key={index} role="none" className="menu-item has-children">
        <div
          className={`nav-link nav-link-parent ${isOpen ? "open" : ""} ${hoveredItem === index ? "hovered" : ""
            } ${collapsed ? "collapsed" : ""}`}
          onClick={() => !collapsed && handleToggleMenu(index)}
          onKeyPress={(e) => handleKeyPress(e, () => handleToggleMenu(index))}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-tooltip={!collapsed ? undefined : item.title}
        >
          <span className="nav-icon">{item.icon}</span>

          {!collapsed && (
            <>
              <span className="nav-text">{item.title}</span>
              <span className="dropdown-icon">
                {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </span>
            </>
          )}
        </div>

        {!collapsed && isOpen && renderSubmenu(item.children, index)}
      </li>
    );
  };

  // Render single menu item (no children)
  const renderSingleMenuItem = (item, index) => {
    return (
      <li key={index} role="none">
        <Link
          to={item.path}
          className={`nav-link ${location.pathname === item.path ? "active" : ""
            } ${hoveredItem === index ? "hovered" : ""}`}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
          role="menuitem"
          tabIndex={0}
          aria-current={location.pathname === item.path ? "page" : undefined}
          data-tooltip={!collapsed ? undefined : item.title}
        >
          <span className="nav-icon">{item.icon}</span>

          {!collapsed && (
            <span className="nav-text">{item.title}</span>
          )}

          {item.badge && !collapsed && (
            <span className="nav-badge">{item.badge}</span>
          )}
        </Link>
      </li>
    );
  };
  const handleLogout = (e) => {
    e.preventDefault();
    console.log("User logged out")
    setShowModal(false)
    sessionStorage.clear();
    navigate("/login")
  }
  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          {collapsed ? (
            <div className="logo-collapsed" aria-label="Logo">
              <span role="img" aria-label="Ayurveda">🌿</span>
            </div>
          ) : (
            <img
              src={logo1}
              alt="Ayurveda Wellness Logo"
              className="logo-expanded"
              loading="lazy"
            />
          )}
        </div>

        {/* Collapse toggle button */}
        {onToggleCollapse && (
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FaBars />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu" role="navigation" aria-label="Main menu">
        <ul role="menubar" aria-orientation="vertical">
          {filteredSidebarItems.map((item, index) => {
            { console.log(item.title == "Content Management" ? item.children : "", "filteredSidebarItems") }
            return (
              item.children && item.children.length > 0
                ? renderParentMenuItem(item, index)
                : renderSingleMenuItem(item, index)
            )
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <span className="user-role">{userRole?.toLowerCase() || "User"}</span>
              <span className="user-status">Online</span>
            </div>
            <div>
              <spna onClick={handleLogout} className="logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" id="exit"><circle cx="12.5" cy="8.5" r="2.5" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"></circle><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M10 27v-4l-3.573-3.136a1.18 1.18 0 0 1-.337-1.361l2.052-4.924"></path><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M3 16c1.134-2.739 4.875-4.031 9-2 1.792 2.896 3.938 2.146 5 1M10 19l2-5M2 24h3l2.758-2.758M25 17h-5M23 14l3 3-3 3"></path><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M20 12V3h9v26h-9v-7"></path></svg>
              </spna>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;