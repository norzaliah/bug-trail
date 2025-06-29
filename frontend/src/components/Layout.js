// frontend/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Navbar'; // your existing Sidebar
import '../styles/Layout.css';

export default function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}