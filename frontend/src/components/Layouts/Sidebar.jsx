/**
 * components/Layouts/Sidebar.jsx
 * --------------------------------
 * Fixed left navigation sidebar.
 * - Dark navy #1E1B35 background
 * - Lime green #D9FF4F active state
 * - Responsive: collapses to icon-only at ≤1024px
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdFolder,
  MdCheckBox,
  MdCalendarMonth,
  MdGroup,
  MdBarChart,
  MdNotifications,
  MdSettings,
  MdLogout,
  MdRocketLaunch,
} from 'react-icons/md';

import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Dashboard',     icon: MdDashboard,      path: '/' },
  { label: 'Projects',      icon: MdFolder,          path: '/projects' },
  { label: 'Tasks',         icon: MdCheckBox,        path: '/tasks' },
  { label: 'Calendar',      icon: MdCalendarMonth,   path: '/calendar' },
  { label: 'Team',          icon: MdGroup,           path: '/team' },
  { label: 'Reports',       icon: MdBarChart,        path: '/reports' },
  { label: 'Notifications', icon: MdNotifications,   path: '/notifications', badge: 3 },
  { label: 'Settings',      icon: MdSettings,        path: '/settings' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <MdRocketLaunch size={18} color="#1E1B35" />
        </div>
        <div>
          <div className={styles.logoText}>ProjectPilot</div>
          <div className={styles.logoSub}>Pro</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Main Menu</div>
          {navItems.slice(0, 5).map(({ label, icon: Icon, path, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              <span className={styles.navLabel}>{label}</span>
              {badge && <span className={styles.badge}>{badge}</span>}
            </NavLink>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Workspace</div>
          {navItems.slice(5).map(({ label, icon: Icon, path, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              <span className={styles.navLabel}>{label}</span>
              {badge && <span className={styles.badge}>{badge}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Logout ── */}
      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.navIcon}><MdLogout size={18} /></span>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
