/**
 * components/Tasks/TaskStats.jsx
 * ------------------------------
 * Summary cards showing task statistics at the top of the Tasks page.
 */

import React from 'react';
import {
  MdAssignment,
  MdCheckCircle,
  MdPending,
  MdPlayArrow,
  MdTrendingUp,
} from 'react-icons/md';
import styles from './TaskStats.module.css';

const STAT_CONFIG = [
  { key: 'total_tasks',      label: 'Total Tasks',      icon: MdAssignment, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { key: 'completed_tasks',  label: 'Completed Tasks',  icon: MdCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { key: 'pending_tasks',    label: 'Pending Tasks',    icon: MdPending,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { key: 'in_progress_tasks',label: 'In Progress',      icon: MdPlayArrow,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  {
    key: 'completion_rate',
    label: 'Completion Rate',
    icon: MdTrendingUp,
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    suffix: '%',
  },
];

const TaskStats = ({ stats, loading }) => {
  return (
    <div className={styles.grid}>
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, suffix = '' }) => (
        <div key={key} className={styles.card}>
          <div className={styles.iconRow}>
            <div className={styles.iconBox} style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
          </div>
          {loading ? (
            <div className={styles.skeleton} />
          ) : (
            <>
              <div className={styles.value}>
                {stats?.[key] ?? 0}
                {suffix}
              </div>
              <div className={styles.label}>{label}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskStats;