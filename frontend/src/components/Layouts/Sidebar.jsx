/**
 * components/Layouts/Sidebar.jsx
 * --------------------------------
 * Fixed left navigation sidebar.
 * - Dark navy #1E1B35 background
 * - Lime green #D9FF4F active state
 * - Collapsible with icon-only mode
 * - Dynamic notification badge count via API
 */

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdFolder,
  MdCheckBox,
  MdCalendarMonth,
  MdGroup,
  MdBarChart,
  MdNotifications,
  MdSettings,
  MdRocketLaunch,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import notificationService from '../../services/notificationService';
import styles from './Sidebar.module.css';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard',     icon: MdDashboard,      path: '/' },
  { label: 'Projects',      icon: MdFolder,          path: '/projects' },
  { label: 'Tasks',         icon: MdCheckBox,        path: '/tasks' },
  { label: 'Calendar',      icon: MdCalendarMonth,   path: '/calendar' },
  { label: 'Team',          icon: MdGroup,           path: '/team' },
  { label: 'Reports',       icon: MdBarChart,        path: '/reports' },
  { label: 'Notifications', icon: MdNotifications,   path: '/notifications', badgeKey: 'notif' },
  { label: 'Settings',      icon: MdSettings,        path: '/settings' },
];

// Manager can access all items except Admin-only features
// Admin-only features would be: User Management, System Settings, Role Management, Audit Logs
// Currently all items in ALL_NAV_ITEMS are accessible to Manager
const MANAGER_NAV_ITEMS = [
  { label: 'Dashboard',     icon: MdDashboard,      path: '/' },
  { label: 'Projects',      icon: MdFolder,          path: '/projects' },
  { label: 'Tasks',         icon: MdCheckBox,        path: '/tasks' },
  { label: 'Calendar',      icon: MdCalendarMonth,   path: '/calendar' },
  { label: 'Team',          icon: MdGroup,           path: '/team' },
  { label: 'Reports',       icon: MdBarChart,        path: '/reports' },
  { label: 'Notifications', icon: MdNotifications,   path: '/notifications', badgeKey: 'notif' },
  { label: 'Settings',      icon: MdSettings,        path: '/settings' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const { leftCollapsed, toggleLeft } = useSidebar();
  const [notifCount, setNotifCount] = useState(0);

  // Determine which nav items to show based on user role
  const navItems = user?.role === 'Admin' ? ALL_NAV_ITEMS : MANAGER_NAV_ITEMS;

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await notificationService.getUnreadCount();
        setNotifCount(data?.count || 0);
      } catch {
        // silent
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`${styles.sidebar} ${leftCollapsed ? styles.collapsed : ''}`}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <MdRocketLaunch size={18} color="#1E1B35" />
        </div>
        {!leftCollapsed && (
          <div>
            <div className={styles.logoText}>ProjectPilot</div>
            <div className={styles.logoSub}>Pro</div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.section}>
          {!leftCollapsed && <div className={styles.sectionLabel}>Main Menu</div>}
          {navItems.slice(0, 5).map(({ label, icon: Icon, path, badgeKey }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={leftCollapsed ? label : undefined}
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              {!leftCollapsed && <span className={styles.navLabel}>{label}</span>}
              {badgeKey === 'notif' && notifCount > 0 && (
                <span className={styles.badge}>{notifCount > 99 ? '99+' : notifCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className={styles.section}>
          {!leftCollapsed && <div className={styles.sectionLabel}>Workspace</div>}
          {navItems.slice(5).map(({ label, icon: Icon, path, badgeKey }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={leftCollapsed ? label : undefined}
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              {!leftCollapsed && <span className={styles.navLabel}>{label}</span>}
              {badgeKey === 'notif' && notifCount > 0 && (
                <span className={styles.badge}>{notifCount > 99 ? '99+' : notifCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Collapse Button ── */}
      <button 
        className={styles.collapseBtn} 
        onClick={toggleLeft}
        aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {leftCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
      </button>
    </aside>
  );
};

export default Sidebar;