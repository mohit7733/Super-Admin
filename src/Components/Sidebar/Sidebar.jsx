// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { SidebarData } from "./Sidebardata";
// import "./Sidebar.css";
// import logo1 from "../Assests/logo1.png";
// import { useState, useEffect, useCallback, useMemo } from "react";
// import { FaChevronDown, FaChevronRight, FaBars } from "react-icons/fa";
// import { FaUsers } from "react-icons/fa";

// import Ayurmunilogo from "../Assests/ayurmunilogo1.png"


// console.log("ICON TEST:", <FaUsers />);

// const Sidebar = ({ collapsed, onToggleCollapse }) => {
//   const location = useLocation();
//   const [openMenus, setOpenMenus] = useState({});
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();

//   // Load user data from session storage
//   useEffect(() => {
//     const role = sessionStorage.getItem("role");
//     const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");

//     setUserRole(role);
//     setUserPermissions(permissions);
//   }, []);


//   useEffect(() => {
//     const newOpenMenus = { ...openMenus };
//     let hasChanges = false;

//     SidebarData().forEach((item, index) => {
//       if (item.children) {
//         const isChildActive = item.children.some(
//           subItem => subItem.path === location.pathname
//         );

//         if (isChildActive && !openMenus[index]) {
//           newOpenMenus[index] = true;
//           hasChanges = true;
//         }
//       }
//     });

//     if (hasChanges) {
//       setOpenMenus(newOpenMenus);
//     }
//   }, [location.pathname]);


//   const hasPermission = useCallback((code) => {
//     if (!code) return true;
//     if (userRole === "SUPERADMIN") return true;
//     return userPermissions.includes(code);
//   }, [userRole, userPermissions]);


//  const filteredSidebarItems = useMemo(() => {
//   const filterRecursive = (items) => {
//     return items
//       .map(item => {

//         if (item.children) {
//           const filteredChildren = filterRecursive(item.children);
//           if (
//             filteredChildren.length > 0 ||
//             !item.permission ||
//             hasPermission(item.permission)
//           ) {
//             return {
//               ...item,
//               children: filteredChildren
//             };
//           }

//           return null;
//         }


//         if (!item.permission || hasPermission(item.permission)) {
//           return item;
//         }

//         return null;
//       })
//       .filter(Boolean);
//   };

//   return filterRecursive(SidebarData());
// }, [hasPermission]);
//   const handleToggleMenu = (index) => {
//     setOpenMenus(prev => ({
//       ...prev,
//       [index]: !prev[index]
//     }));
//     console.log(openMenus);

//   };

//   const handleKeyPress = (e, callback) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       callback();
//     }
//   };

//   // Render submenu items
//   // Recursive function to render submenu items with nested children support
//   // const renderSubmenu = (children, parentIndex, level = 1) => {
//   //   if (!children || children.length === 0) return null;

//   //   return (
//   //     <ul
//   //       className={`submenu submenu-level-${level} ${collapsed ? 'submenu-hidden' : ''}`}
//   //       role="menu"
//   //       aria-label="Submenu"
//   //     >
//   //       {children.map((subItem, subIndex) => {
//   //         const hasChildren = subItem.children && subItem.children.length > 0;
//   //         const itemKey = `${parentIndex}-${subIndex}`;

//   //         return (
//   //           <li key={itemKey} role="none" className="submenu-item">
//   //             {hasChildren ? (
//   //               // Render parent item with nested children
//   //               <>
//   //                 <div
//   //                   className={`submenu-link submenu-parent ${openMenus[itemKey] ? 'open' : ''}`}
//   //                   onClick={() => handleToggleMenu(itemKey)}
//   //                   role="button"
//   //                   tabIndex={0}
//   //                 aria-expanded={openMenus[itemKey]}
//   //                   aria-haspopup="true"
//   //                 >
//   //                   {subItem.icon && <span className="submenu-icon">{subItem.icon}</span>}
//   //                   <span className="submenu-text">{subItem.title}</span>
//   //                   <span className="submenu-dropdown-icon">
//   //                     {openMenus[itemKey] ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
//   //                   </span>
//   //                   {subItem.badge && <span className="submenu-badge">{subItem.badge}</span>}
//   //                 </div>

//   //                 {/* Recursively render nested children */}
//   //                 {openMenus[itemKey] && renderSubmenu(subItem.children, itemKey, level + 1)}
//   //               </>
//   //             ) : (
//   //               // Render leaf link item
//   //               <Link
//   //                 to={subItem.path}
//   //                 className={`submenu-link ${location.pathname === subItem.path ? "active" : ""}`}
//   //                 role="menuitem"
//   //                 tabIndex={0}
//   //                 aria-current={location.pathname === subItem.path ? "page" : undefined}
//   //               >
//   //                 {subItem.icon && <span className="submenu-icon">{subItem.icon}</span>}
//   //                 <span className="submenu-text">{subItem.title}</span>
//   //                 {subItem.badge && <span className="submenu-badge">{subItem.badge}</span>}
//   //               </Link>
//   //             )}
//   //           </li>
//   //         );
//   //       })}
//   //     </ul>
//   //   );
//   // };
//   const renderSubmenu = (children, parentIndex) => {
//   return (
//     <ul className="submenu">
//       {children.map((subItem, subIndex) => {
//         const hasChildren = subItem.children?.length > 0;
//         const key = `${parentIndex}-${subIndex}`;

//         return (
//           <li key={key}>
//             {hasChildren ? (
//               <>
//                 <div
//                   className="submenu-link"
//                   onClick={() => handleToggleMenu(key)}
//                 >
//                   <span className="submenu-icon">
//                     {subItem.icon || "📄"}
//                   </span>

//                   <span className="submenu-text">{subItem.title}</span>
//                 </div>

//                 {openMenus[key] &&
//                   renderSubmenu(subItem.children, key)}
//               </>
//             ) : (
//               <Link to={subItem.path} className="submenu-link">
//                 <span className="submenu-icon">
//                   {subItem.icon || "📄"}
//                 </span>

//                 <span className="submenu-text">{subItem.title}</span>
//               </Link>
//             )}
//           </li>
//         );
//       })}
//     </ul>
//   );
// };

//   // Render parent menu item (with children)
//   // Render parent menu item (with children)
//   // const renderParentMenuItem = (item, index) => {
//   //   const isOpen = openMenus[index];
//   //   const hasValidChildren = item.children && item.children.length > 0;

//   //   if (!hasValidChildren) return null;

//   //   return (
//   //     <li key={index} role="none" className="menu-item has-children">
//   //       <div
//   //         className={`nav-link nav-link-parent ${isOpen ? "open" : ""} ${hoveredItem === index ? "hovered" : ""
//   //           } ${collapsed ? "collapsed" : ""}`}
//   //         onClick={() => !collapsed && handleToggleMenu(index)}
//   //         onKeyPress={(e) => handleKeyPress(e, () => handleToggleMenu(index))}
//   //         onMouseEnter={() => setHoveredItem(index)}
//   //         onMouseLeave={() => setHoveredItem(null)}
//   //         role="button"
//   //         tabIndex={0}
//   //         aria-expanded={isOpen}
//   //         aria-haspopup="true"
//   //         data-tooltip={!collapsed ? undefined : item.title}
//   //       >
//   //         <span className="nav-icon">{item.icon}</span>

//   //         {!collapsed && (
//   //           <>
//   //             <span className="nav-text">{item.title}</span>
//   //             <span className="dropdown-icon">
//   //               {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
//   //             </span>
//   //           </>
//   //         )}
//   //       </div>

//   //       {!collapsed && isOpen && renderSubmenu(item.children, index)}
//   //     </li>
//   //   );
//   // };
// const renderParentMenuItem = (item, index) => {
//   const isOpen = openMenus[index];
//   const hasValidChildren = item.children && item.children.length > 0;

//   if (!hasValidChildren) return null;

//   return (
//     <li key={index} className="menu-item has-children">
//       <div
//         className={`nav-link nav-link-parent ${isOpen ? "open" : ""}`}
//         onClick={() => !collapsed && handleToggleMenu(index)}
//       >

//         <span className="nav-icon">
//           {item.icon || "📁"}
//         </span>

//         {!collapsed && (
//           <>
//             <span className="nav-text">{item.title}</span>
//             <span className="dropdown-icon">
//               {isOpen ? <FaChevronDown /> : <FaChevronRight />}
//             </span>
//           </>
//         )}
//       </div>

//       {!collapsed && isOpen && renderSubmenu(item.children, index)}
//     </li>
//   );
// };

//  const renderSingleMenuItem = (item, index) => {
//   return (
//     <li key={index}>
//       <Link to={item.path} className="nav-link">

//         <span className="nav-icon">
//           {item.icon || "📌"}
//         </span>

//         {!collapsed && (
//           <span className="nav-text">{item.title}</span>
//         )}
//       </Link>
//     </li>
//   );
// };
//   const handleLogout = (e) => {
//     e.preventDefault();
//     console.log("User logged out")
//     setShowModal(false)
//     sessionStorage.clear();
//     navigate("/login")
//   }
//   return (
//     <aside
//       className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}
//       aria-label="Main navigation"
//     >
//       {/* Sidebar Header */}
//       <div className="sidebar-header">
//         <div className="logo-container">
//           {collapsed ? (
//             <div className="logo-collapsed" aria-label="Logo">
//               <span role="img" aria-label="Ayurveda">🌿</span>
//             </div>
//           ) : (
//             <img
//               // src={logo1}
//               src={Ayurmunilogo}
//               alt="Ayurveda Wellness Logo"
//               className="logo-expanded"
//               loading="lazy"
//             />
//           )}
//         </div>

//         {/* Collapse toggle button */}
//         {onToggleCollapse && (
//           <button
//             className="sidebar-toggle"
//             onClick={onToggleCollapse}
//             aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//           >
//             <FaBars />
//           </button>
//         )}
//       </div>


//       <nav className="nav-menu" role="navigation" aria-label="Main menu">
//         <ul role="menubar" aria-orientation="vertical">
//           {filteredSidebarItems.map((item, index) => {
//             { console.log(item.title == "Content Management" ? item.children : "", "filteredSidebarItems") }
//             return (
//               item.children && item.children.length > 0
//                 ? renderParentMenuItem(item, index)
//                 : renderSingleMenuItem(item, index)
//             )
//           })}
//         </ul>
//       </nav>

//       {/* Footer Section */}
//       {!collapsed && (
//         <div className="sidebar-footer">
//           <div className="user-info">
//             <div className="user-avatar">
//               <span>👤</span>
//             </div>
//             <div className="user-details">
//               <span className="user-role">{userRole?.toLowerCase() || "User"}</span>
//               <span className="user-status">Online</span>
//             </div>
//             <div>
//               <span onClick={handleLogout} className="logout">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" id="exit"><circle cx="12.5" cy="8.5" r="2.5" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"></circle><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M10 27v-4l-3.573-3.136a1.18 1.18 0 0 1-.337-1.361l2.052-4.924"></path><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M3 16c1.134-2.739 4.875-4.031 9-2 1.792 2.896 3.938 2.146 5 1M10 19l2-5M2 24h3l2.758-2.758M25 17h-5M23 14l3 3-3 3"></path><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M20 12V3h9v26h-9v-7"></path></svg>
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </aside>
//   );
// };

// export default Sidebar;



// new

import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarData } from "./Sidebardata";
import "./Sidebar.css";
import Ayurmunilogo from "../Assests/ayurmunilogo1.png";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronDown, FaChevronRight, FaBars, FaSignOutAlt } from "react-icons/fa";

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();

 
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
    setUserRole(role);
    setUserPermissions(permissions);
  }, []);

 
  useEffect(() => {
    const newOpenMenus = {};
    let hasChanges = false;

    const checkPath = (items, parentKey = null) => {
      items.forEach((item, index) => {
        const currentKey = parentKey !== null ? `${parentKey}-${index}` : String(index);

        if (item.children) {
          const isChildActive = item.children.some(subItem => {
            if (subItem.children) {
              return checkPathRecursive(subItem.children, location.pathname);
            }
            return subItem.path === location.pathname;
          });

          if (isChildActive && !openMenus[currentKey]) {
            newOpenMenus[currentKey] = true;
            hasChanges = true;
          }

          checkPath(item.children, currentKey);
        }
      });
    };

    const checkPathRecursive = (children, path) => {
      return children.some(child => {
        if (child.children) {
          return checkPathRecursive(child.children, path);
        }
        return child.path === path;
      });
    };

    checkPath(SidebarData());

    if (hasChanges) {
      setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
    }
  }, [location.pathname]);

  // Check if user has permission
  const hasPermission = useCallback((code) => {
    if (!code) return true;
    if (userRole === "SUPERADMIN") return true;
    return userPermissions.includes(code);
  }, [userRole, userPermissions]);

  // Filter sidebar items based on permissions
  const filteredSidebarItems = useMemo(() => {
    const filterRecursive = (items) => {
      return items
        .map(item => {
          if (item.children) {
            const filteredChildren = filterRecursive(item.children);
            if (filteredChildren.length > 0 || !item.permission || hasPermission(item.permission)) {
              return {
                ...item,
                children: filteredChildren
              };
            }
            return null;
          }
          if (!item.permission || hasPermission(item.permission)) {
            return item;
          }
          return null;
        })
        .filter(Boolean);
    };
    return filterRecursive(SidebarData());
  }, [hasPermission]);

  // Toggle menu open/close
  const handleToggleMenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Render submenu items recursively
  const renderSubmenu = (children, parentKey, level = 1) => {
    if (!children || children.length === 0) return null;

    return (
      <ul className={`submenu submenu-level-${level}`}>
        {children.map((child, index) => {
          const key = `${parentKey}-${index}`;
          const hasChildren = child.children && child.children.length > 0;
          const isOpen = openMenus[key];

          if (hasChildren) {
            return (
              <li key={key} className="submenu-item has-children">
                <div
                  className={`submenu-link submenu-parent ${isOpen ? 'open' : ''}`}
                  onClick={() => handleToggleMenu(key)}
                >
                  <span className="submenu-icon">{child.icon}</span>
                  <span className="submenu-text">{child.title}</span>
                  <span className="submenu-dropdown-icon">
                    {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                  </span>
                </div>
                {isOpen && renderSubmenu(child.children, key, level + 1)}
              </li>
            );
          }

          return (
            <li key={key} className="submenu-item">
              <Link
                to={child.path}
                className={`submenu-link ${location.pathname === child.path ? 'active' : ''}`}
              >
                <span className="submenu-icon">{child.icon}</span>
                <span className="submenu-text">{child.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  // Render parent menu item
  const renderParentMenuItem = (item, key) => {
    const isOpen = openMenus[key];
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) return null;

    return (
      <li key={key} className="menu-item has-children">
        <div
          className={`nav-link nav-link-parent ${isOpen ? 'open' : ''}`}
          onClick={() => !collapsed && handleToggleMenu(key)}
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
        {!collapsed && isOpen && renderSubmenu(item.children, key)}
      </li>
    );
  };

  // Render single menu item (no children)
  const renderSingleMenuItem = (item, key) => {
    return (
      <li key={key} className="menu-item">
        <Link
          to={item.path}
          className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {!collapsed && <span className="nav-text">{item.title}</span>}
        </Link>
      </li>
    );
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
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
              src={Ayurmunilogo}
              alt="Ayurveda Wellness Logo"
              className="logo-expanded"
              loading="lazy"
            />
          )}
        </div>

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
            const key = String(index);
            if (item.children && item.children.length > 0) {
              return renderParentMenuItem(item, key);
            }
            return renderSingleMenuItem(item, key);
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
            <button
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
  );
};

export default Sidebar;