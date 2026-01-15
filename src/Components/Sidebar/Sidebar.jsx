

import { Link, useLocation } from "react-router-dom"
import { SidebarData } from "./Sidebardata"
import "./Sidebar.css"
 import logo1 from '../Assests/logo1.png';




const Sidebar = ({ collapsed }) => {
  const location = useLocation();


  return (
    <div className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
      <div className="sidebar-header">
        <div className="logo1">
          <div>
 
          </div>
          {collapsed ? <span className="logo-collapsed">A</span> : <img
        src={logo1}
        alt="Sidebar Icon"
        className="logo-expanded"
        style={{ width: '111px', height: '51px', marginTop: '3px' ,marginLeft:'64px'}}

      /> }
        </div>
      </div>

      <nav className="nav-menu">
        <ul>
          {SidebarData().map((item, index) => (
            <li key={index} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-text">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
