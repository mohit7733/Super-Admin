import React, { useState } from "react";
import {
  Bell,
  CloudMoon,
  Menu,
  MessageSquare,
  Search,
  ChevronDown,
} from "lucide-react";

const DashboardHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="topbar">

      <button
        className="icon-button menu-button"
        aria-label="Toggle menu"
      >
        <Menu size={21} />
      </button>

      <div className={`search-box ${searchOpen ? "open" : ""}`}>
        <Search size={18} />

        <input
          aria-label="Search"
          placeholder="Search anything..."
          onFocus={() => setSearchOpen(true)}
        />

        <kbd>Ctrl + K</kbd>
      </div>

      <div className="top-actions">

        <button className="icon-button">
          <CloudMoon size={19} />
        </button>

        <span className="divider" />

        <button className="icon-button badge-wrap">
          <Bell size={19} />
          <b>5</b>
        </button>

        <button className="icon-button badge-wrap">
          <MessageSquare size={19} />
          <b>3</b>
        </button>

        <div className="profile">
          <div className="avatar">SA</div>

          <div>
            <strong>Super Admin</strong>
            <small>Super Admin</small>
          </div>

          <ChevronDown size={16} />
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;