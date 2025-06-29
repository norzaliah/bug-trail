import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // This import will now work

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </>
  );
}