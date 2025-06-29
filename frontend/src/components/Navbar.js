import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">BugTrail.</h2>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active-link' : ''}>📊 Dashboard</NavLink>
        <NavLink to="/bugs" className={({ isActive }) => isActive ? 'active-link' : ''}>🐛 My Bugs</NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? 'active-link' : ''}>📁 Projects</NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active-link' : ''}>📅 Calendar</NavLink>
        <NavLink to="/discuss" className={({ isActive }) => isActive ? 'active-link' : ''}>💬 Discuss</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : ''}>⚙️ Settings</NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="user-info">{currentUser.email}</p>
        <button className="logout-btn" onClick={logout}>🚪 Logout</button>
      </div>
    </aside>
  );
}