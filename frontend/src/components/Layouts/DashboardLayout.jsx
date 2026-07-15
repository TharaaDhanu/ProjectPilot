/**
 * components/Layouts/DashboardLayout.jsx
 * ----------------------------------------
 * Three-column layout shell for all dashboard pages.
 * - Left: <Sidebar /> (fixed, collapsible)
 * - Center: <Navbar /> + scrollable content
 * - Right: <RightSidebar /> (fixed, collapsible)
 */

import React from 'react';
import Sidebar      from './Sidebar';
import Navbar       from './Navbar';
import RightSidebar from './RightSidebar';
import { useSidebar } from '../../context/SidebarContext';
import styles       from './DashboardLayout.module.css';

const DashboardLayout = ({ children, pageTitle }) => {
  const { leftCollapsed, rightCollapsed } = useSidebar();

  return (
    <div className={styles.shell}>
      {/* Left fixed sidebar */}
      <Sidebar />

      {/* Center scrollable column */}
      <main className={`${styles.main} ${leftCollapsed ? styles.leftCollapsed : ''} ${rightCollapsed ? styles.rightCollapsed : ''}`}>
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