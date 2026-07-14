/**
 * components/Notifications/NotificationDrawer.jsx
 * ------------------------------------------------
 * Floating dropdown notification panel.
 * Toggle via the notification bell icon in Navbar.
 */

import React, { useEffect, useRef } from 'react';
import {
  MdClose,
  MdDoneAll,
  MdNotificationsOff,
  MdNotifications,
} from 'react-icons/md';
import NotificationCard from './NotificationCard';
import styles from './NotificationDrawer.module.css';

const NotificationDrawer = ({
  open,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  loading,
  onViewAll,
}) => {
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    if (open) {
      // Use setTimeout to avoid the current click event
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, onClose]);

  // Defensive: notifications may be an object { notifications: [...] } or an array
  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : Array.isArray(notifications?.notifications)
      ? notifications.notifications
      : [];
  const displayNotifications = safeNotifications.slice(0, 10);

  return (
    <div
      ref={drawerRef}
      className={`${styles.dropdown} ${open ? styles.open : ''}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <MdNotifications size={20} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button
              className={styles.headerBtn}
              onClick={onMarkAllRead}
              title="Mark all as read"
            >
              <MdDoneAll size={18} />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            className={styles.headerBtn}
            onClick={onClose}
            title="Close"
          >
            <MdClose size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <MdNotificationsOff size={40} />
            <p>No notifications yet</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          <div className={styles.list}>
            {displayNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {displayNotifications.length > 0 && (
        <div className={styles.footer}>
          <button className={styles.viewAllBtn} onClick={onViewAll}>
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDrawer;