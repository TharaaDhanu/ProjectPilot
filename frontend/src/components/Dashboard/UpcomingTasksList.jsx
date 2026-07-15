/**
 * components/Dashboard/UpcomingTasksList.jsx
 * ----------------------------------------
 * Compact upcoming-tasks list card — live data via `tasks` prop.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './UpcomingTasks.module.css';

dayjs.extend(relativeTime);

const PRIORITY_COLORS = {
  High:     { dot: '#ef4444', tag: 'rgba(239,68,68,0.1)',    text: '#dc2626' },
  Medium:   { dot: '#f59e0b', tag: 'rgba(245,158,11,0.1)',   text: '#d97706' },
  Low:      { dot: '#22c55e', tag: 'rgba(34,197,94,0.1)',    text: '#16a34a' },
  Critical: { dot: '#7c3aed', tag: 'rgba(124,58,237,0.12)',  text: '#7c3aed' },
};

const UpcomingTasksList = ({ tasks = [] }) => (
  <div id="upcoming-tasks-card" className={styles.card}>
    <div className={styles.cardHeader}>
      <span className={styles.cardTitle}>Upcoming Tasks</span>
      <Link to="/tasks" id="upcoming-add-task-btn" className={styles.addBtn} aria-label="Go to tasks">
        <MdAdd size={16} />
      </Link>
    </div>

    {tasks.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: '0.8125rem' }}>
        No upcoming tasks 🎉
      </div>
    ) : tasks.map((task) => {
      const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;
      const dueLabel = task.end_date ? dayjs(task.end_date).fromNow() : 'No due date';
      return (
        <div key={task.id} className={styles.item}>
          <div className={styles.dot} style={{ background: pc.dot }} />
          <div className={styles.info}>
            <div className={styles.title}>{task.title}</div>
            <div className={styles.due}>Due: {dueLabel}</div>
          </div>
          <span
            className={styles.priorityTag}
            style={{ background: pc.tag, color: pc.text }}
          >
            {task.priority || 'Medium'}
          </span>
        </div>
      );
    })}
  </div>
);

export default UpcomingTasksList;