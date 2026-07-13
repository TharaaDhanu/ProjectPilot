/**
 * components/Dashboard/ActivityTimeline.jsx
 * -------------------------------------------
 * Full-width activity timeline — driven by live notifications from useTasks.
 */

import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  MdCheckCircle, MdAdd, MdEdit, MdDeleteForever,
  MdComment, MdFlag, MdTimer, MdDone, MdCheckBox, MdOutlineAllInbox,
} from 'react-icons/md';
import styles from './ActivityTimeline.module.css';

dayjs.extend(relativeTime);

// ─── Map notification type → icon + color ────────────────────────────────────
const TYPE_META = {
  task_created:    { Icon: MdAdd,           color: '#6366f1' },
  task_updated:    { Icon: MdEdit,          color: '#f59e0b' },
  task_deleted:    { Icon: MdDeleteForever, color: '#ef4444' },
  task_completed:  { Icon: MdCheckBox,      color: '#22c55e' },
  comment_added:   { Icon: MdComment,       color: '#06b6d4' },
  status_changed:  { Icon: MdFlag,          color: '#8b5cf6' },
  timer_started:   { Icon: MdTimer,         color: '#ec4899' },
  timer_stopped:   { Icon: MdDone,          color: '#10b981' },
  task_duplicated: { Icon: MdOutlineAllInbox, color: '#f59e0b' },
};

// ─── Helper: parse notification message into user + action ───────────────────
const parseMessage = (msg = '') => {
  // Notification message format: "You created 'Task Title'" or similar
  return msg;
};

const ActivityTimeline = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) => {
  const items = notifications.slice(0, 10);

  return (
    <div id="activity-timeline" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Activity Timeline</span>
        {notifications.some((n) => !n.is_read) && (
          <button className={styles.viewAll} onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.8125rem' }}>
          No recent activity
        </div>
      ) : (
        <div className={styles.timeline}>
          {items.map((notif) => {
            const meta = TYPE_META[notif.type] || { Icon: MdCheckCircle, color: '#6366f1' };
            const { Icon, color } = meta;
            const isUnread = !notif.is_read;

            return (
              <div
                key={notif.id}
                className={`${styles.item} ${isUnread ? styles.unread : ''}`}
                onClick={() => isUnread && onMarkRead?.(notif.id)}
              >
                <div className={styles.avatarCol}>
                  <div
                    className={styles.avatar}
                    style={{ background: color + '22', color }}
                  >
                    <Icon size={14} />
                  </div>
                </div>
                <div className={styles.body}>
                  <div className={styles.text}>
                    {parseMessage(notif.message || notif.title || 'Activity')}
                  </div>
                  <div className={styles.time}>
                    {notif.created_at ? dayjs(notif.created_at).fromNow() : ''}
                  </div>
                </div>
                {isUnread && <div className={styles.unreadDot} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
