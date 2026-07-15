/**
 * components/Layouts/Navbar.jsx
 * --------------------------------
 * Fixed top navigation bar.
 * - Search bar
 * - Settings + Notifications icons (with unread badge & drawer)
 * - User avatar, name, role badge
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSearch,
  MdSettings,
  MdNotifications,
  MdKeyboardArrowDown,
} from 'react-icons/md';

import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import NotificationDrawer from '../Notifications/NotificationDrawer';
import styles from './Navbar.module.css';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Notification state ──────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      setNotifLoading(true);
      const result = await notificationService.getUnread(10);
      setNotifications(result.notifications || []);
    } catch {
      // silent
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch {
      // silent
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleNotifToggle = () => {
    if (!notifOpen) {
      fetchNotifs();
    }
    setNotifOpen(prev => !prev);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      // silent
    }
  };

  const handleViewAll = () => {
    setNotifOpen(false);
    navigate('/notifications');
  };

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

        {/* Notification dropdown wrapper */}
        <div className={styles.notifWrapper}>
          <button
            id="navbar-notif-btn"
            className={`${styles.iconBtn} ${notifOpen ? styles.active : ''}`}
            aria-label="Notifications"
            onClick={handleNotifToggle}
          >
            <MdNotifications size={18} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <NotificationDrawer
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
              loading={notifLoading}
              onViewAll={handleViewAll}
            />
          )}
        </div>

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