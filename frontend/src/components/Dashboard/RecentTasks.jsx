/**
 * components/Dashboard/RecentTasks.jsx
 * ----------------------------------------
 * Task card list with priority badge, due date, assignee — live data via props.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MdCheck, MdAccessTime } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './RecentTasks.module.css';

dayjs.extend(relativeTime);

const PRIORITY_STYLES = {
  Low:      { background: 'rgba(34,197,94,0.1)',    color: '#16a34a' },
  Medium:   { background: 'rgba(245,158,11,0.1)',   color: '#d97706' },
  High:     { background: 'rgba(239,68,68,0.1)',    color: '#dc2626' },
  Critical: { background: 'rgba(124,58,237,0.12)',  color: '#7c3aed' },
};

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonItem = () => (
  <div className={styles.taskItem}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f0f0f0', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ height: 12, width: '55%', background: '#f0f0f0', borderRadius: 6 }} />
      <div style={{ height: 10, width: '35%', background: '#f0f0f0', borderRadius: 6 }} />
    </div>
    <div style={{ width: 50, height: 20, background: '#f0f0f0', borderRadius: 8 }} />
  </div>
);

const RecentTasks = ({ tasks = [], loading = false }) => {
  const display = tasks.slice(0, 7);

  return (
    <div id="recent-tasks" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Recent Tasks</span>
        <Link to="/tasks" className={styles.viewAll}>View all →</Link>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
      ) : display.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.85rem' }}>
          No tasks yet.{' '}
          <Link to="/tasks" style={{ color: '#6366f1', fontWeight: 600 }}>Create one →</Link>
        </div>
      ) : display.map((task, i) => {
        const isDone = task.status === 'Completed';
        const priority = task.priority || 'Medium';
        const assigneeName = task.assigned_name || task.assignee?.name || '';
        const assigneeInitials = assigneeName
          ? assigneeName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
          : '?';
        const dueLabel = task.end_date ? dayjs(task.end_date).fromNow() : null;

        return (
          <div key={task.id} className={styles.taskItem}>
            {/* Check */}
            <div className={`${styles.check} ${isDone ? styles.done : ''}`}>
              {isDone && <MdCheck size={11} />}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <div className={`${styles.title} ${isDone ? styles.done : ''}`}>
                {task.title}
              </div>
              <div className={styles.meta}>
                {task.project_title && (
                  <span className={styles.project}>{task.project_title}</span>
                )}
                {dueLabel && (
                  <span className={styles.due}>
                    <MdAccessTime size={11} /> {dueLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Right */}
            <div className={styles.right}>
              <span
                className={styles.priority}
                style={PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}
              >
                {priority}
              </span>
              {assigneeName && (
                <div
                  className={styles.assigneeAvatar}
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  title={assigneeName}
                >
                  {assigneeInitials}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentTasks;
