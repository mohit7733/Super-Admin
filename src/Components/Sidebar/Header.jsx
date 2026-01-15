

"use client"

import { useState } from "react"
import "./Header.css"
import { useNavigate } from "react-router-dom";

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleAvatarClick = () => {
    setShowModal((prev) => !prev)
  }

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("User logged out")
    setShowModal(false)
    sessionStorage.clear();
        navigate("/login")
  }

  return (
    <>
      <div className={`head1 ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <div className="header-left">
          <button className="sidebar-toggle" onClick={handleToggleSidebar}>
            ☰
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-home">🏠 Home</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <button className="user-avatar" onClick={handleAvatarClick}>
              👤
            </button>
            {showModal && (
              <div className="logout-modal">
                <div className="modal-content1">
                  <button className="logout-btn" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </>
  )
}

export default Header
