/**
 * components/Layouts/DashboardLayout.jsx
 * ----------------------------------------
 * Three-column layout shell for all dashboard pages.
 * - Left: <Sidebar /> (fixed, 240px)
 * - Center: <Navbar /> + scrollable content
 * - Right: <RightSidebar /> (fixed, 280px)
 */

import React from 'react';
import Sidebar      from './Sidebar';
import Navbar       from './Navbar';
import RightSidebar from './RightSidebar';
import styles       from './DashboardLayout.module.css';

const DashboardLayout = ({ children, pageTitle }) => {
  return (
    <div className={styles.shell}>
      {/* Left fixed sidebar */}
      <Sidebar />

      {/* Center scrollable column */}
      <main className={styles.main}>
        <Navbar pageTitle={pageTitle} />
        <div className={styles.content}>
          {children}
        </div>
      </main>

      {/* Right fixed utility sidebar */}
      <RightSidebar />
    </div>
  );
};

export default DashboardLayout;
