/**
 * components/Layouts/Navbar.jsx
 * --------------------------------
 * Fixed top navigation bar.
 * - Search bar
 * - Settings + Notifications icons
 * - User avatar, name, role badge
 */

import React from 'react';
import {
  MdSearch,
  MdSettings,
  MdNotifications,
  MdKeyboardArrowDown,
} from 'react-icons/md';

import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();

  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase() +
      (user.last_name?.[0] || user.username?.[1] || '').toUpperCase()
    : 'U';

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';

  const role = user?.role || 'Member';

  return (
    <header className={styles.navbar}>
      {/* Page title */}
      <h1 className={styles.pageTitle}>{pageTitle}</h1>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <MdSearch className={styles.searchIcon} />
        <input
          id="navbar-search"
          type="text"
          className={styles.searchInput}
          placeholder="Search projects, tasks..."
          aria-label="Search"
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button id="navbar-settings-btn" className={styles.iconBtn} aria-label="Settings">
          <MdSettings size={18} />
        </button>

        <button id="navbar-notif-btn" className={styles.iconBtn} aria-label="Notifications">
          <MdNotifications size={18} />
          <span className={styles.notifDot} />
        </button>

        <div className={styles.divider} />

        {/* Profile */}
        <div id="navbar-profile" className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{displayName}</span>
            <span className={styles.roleBadge}>{role}</span>
          </div>
          <MdKeyboardArrowDown size={16} style={{ color: '#9ca3af', marginLeft: 2 }} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
