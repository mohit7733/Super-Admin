import { useState } from "react"
import "./Header.css"
import { useNavigate } from "react-router-dom";

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", message: "Welcome to the dashboard", time: "Just now", read: false },
    { id: 2, title: "New Update", message: "Version 2.0 is now available", time: "2 hours ago", read: false },
    { id: 3, title: "Meeting Reminder", message: "Team meeting at 3 PM", time: "5 hours ago", read: true },
    { id: 4, title: "Task Completed", message: "Your task has been approved", time: "Yesterday", read: true },
    { id: 4, title: "Task Completed", message: "Your task has been approved", time: "Yesterday", read: true },
  ]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  }

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className={`head1 ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
        <div className="header-left">
          <button className="sidebar-toggle" onClick={handleToggleSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {/* <div className="breadcrumb">
            <span className="breadcrumb-home" onClick={() => navigate('/')}>
               Home
            </span>
          </div> */}
        </div>

        <div className="header-right">
          {/* Notification Icon */}
          <div className="notification-wrapper">
            <button className="notification-icon" onClick={toggleNotifications}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="modal-backdrop" onClick={toggleNotifications}></div>
            )}
            {/* Notification Modal */}
            {showNotifications && (
              <div className="notification-modal">

                {/* Backdrop for modal */}
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <div className="notification-actions">
                    {notifications.length > 0 && (
                      <>
                        <button className="action-btn" onClick={markAllAsRead}>
                          Mark all read
                        </button>
                        <button className="action-btn danger" onClick={clearAllNotifications}>
                          Clear all
                        </button>
                      </>
                    )}
                  </div>
                  <button className="close-modal" onClick={toggleNotifications}>✕</button>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="notification-dot"></div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notification-footer">
                    <a href="#" className="view-all">View all notifications →</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          {/* <div className="user-profile">
            <div className="avatar">
              <img src="https://ui-avatars.com/api/?background=0D614E&color=fff&name=User" alt="Profile" />
            </div>
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
          </div> */}
        </div>
      </div>

    </>
  )
}

export default Header