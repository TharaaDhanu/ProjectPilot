/**
 * components/Layouts/DashboardLayout.jsx
 * ----------------------------------------
 * Three-column layout shell for all dashboard pages.
 * - Left: <Sidebar /> (fixed, collapsible)
 * - Center: <Navbar /> + scrollable content
 * - Right sidebar removed
 */

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebar } from '../../context/SidebarContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children, pageTitle }) => {
  const { leftCollapsed } = useSidebar();

  return (
    <div className={styles.shell}>
      {/* Left fixed sidebar */}
      <Sidebar />

      {/* Center scrollable column */}
      <main className={`${styles.main} ${leftCollapsed ? styles.leftCollapsed : ''}`}>
        <Navbar pageTitle={pageTitle} />
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;