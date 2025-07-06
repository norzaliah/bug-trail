import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [sidebarActive, setSidebarActive] = useState(false); // State for toggling sidebar visibility on mobile

  if (!currentUser) return null;

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button className="hamburger-menu" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <h2 className="sidebar-logo">BugTrail.</h2>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active-link' : ''}>📊 Dashboard</NavLink>
          <NavLink to="/bugs" className={({ isActive }) => isActive ? 'active-link' : ''}>🐛 My Bugs</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active-link' : ''}>📁 Projects</NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active-link' : ''}>📅 Calendar</NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : ''}>⚙️ Settings</NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <p className="user-info">{currentUser.email}</p>
          <button className="logout-btn" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>
    </>
  );
}
