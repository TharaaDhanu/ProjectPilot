/**
 * components/Notifications/NotificationCard.jsx
 * ----------------------------------------------
 * Individual notification card with type icon, priority indicator,
 * mark-as-read, and delete actions.
 */

import React from 'react';
import {
  MdNotifications,
  MdCheckCircle,
  MdUpdate,
  MdAssignment,
  MdPersonAdd,
  MdPersonRemove,
  MdEvent,
  MdSchedule,
  MdWarning,
  MdCalendarMonth,
  MdDelete,
  MdMarkEmailRead,
  MdFolder,
  MdTask,
} from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './NotificationCard.module.css';

dayjs.extend(relativeTime);

// ─── Type icon mapping ──────────────────────────────────────────────────────
const TYPE_ICONS = {
  project_created:    MdFolder,
  project_updated:    MdUpdate,
  project_completed:  MdCheckCircle,
  task_assigned:      MdAssignment,
  task_updated:       MdTask,
  task_completed:     MdCheckCircle,
  employee_added:     MdPersonAdd,
  employee_removed:   MdPersonRemove,
  meeting_scheduled:  MdEvent,
  meeting_reminder:   MdSchedule,
  deadline_reminder:  MdWarning,
  calendar_event:     MdCalendarMonth,
  system_alert:       MdNotifications,
};

// ─── Priority colors ────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  low:      '#22c55e',
  normal:   '#3b82f6',
  high:     '#f59e0b',
  critical: '#ef4444',
};

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const Icon = TYPE_ICONS[notification.type] || MdNotifications;
  const priorityColor = PRIORITY_COLORS[notification.priority] || '#3b82f6';
  const timeAgo = notification.created_at
    ? dayjs(notification.created_at).fromNow()
    : '';

  return (
    <div
      className={`${styles.card} ${!notification.is_read ? styles.unread : ''}`}
    >
      {/* Priority indicator bar */}
      <div className={styles.priorityBar} style={{ background: priorityColor }} />

      {/* Icon */}
      <div className={styles.iconWrapper}>
        <Icon size={18} style={{ color: priorityColor }} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.title}>
          {notification.title || notification.type?.replace(/_/g, ' ')}
        </div>
        <div className={styles.message}>{notification.message}</div>
        <div className={styles.meta}>
          <span className={styles.time}>{timeAgo}</span>
          {notification.related_project_title && (
            <span className={styles.project}>
              {notification.related_project_title}
            </span>
          )}
          {notification.related_task_title && (
            <span className={styles.task}>
              {notification.related_task_title}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {!notification.is_read && (
          <button
            className={styles.actionBtn}
            onClick={() => onMarkRead?.(notification.id)}
            title="Mark as read"
            aria-label="Mark as read"
          >
            <MdMarkEmailRead size={16} />
          </button>
        )}
        <button
          className={styles.actionBtn}
          onClick={() => onDelete?.(notification.id)}
          title="Delete"
          aria-label="Delete"
        >
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;