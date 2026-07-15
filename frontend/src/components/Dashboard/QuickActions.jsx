/**
 * components/Dashboard/QuickActions.jsx
 * ----------------------------------------
 * Quick Actions parent card with 4 actions in a 2x2 grid.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  MdAddCircle,
  MdAddTask,
  MdBarChart,
  MdCalendarMonth,
} from 'react-icons/md';
import styles from './UpcomingTasks.module.css';

const QuickActions = ({ onNewProject, onNewTask }) => {
  const actions = [
    {
      id: 'qa-new-project',
      label: 'New Project',
      icon: MdAddCircle,
      color: '#6366f1',
      bgColor: 'rgba(99,102,241,0.1)',
      onClick: onNewProject,
    },
    {
      id: 'qa-new-task',
      label: 'New Task',
      icon: MdAddTask,
      color: '#8b5cf6',
      bgColor: 'rgba(139,92,246,0.1)',
      onClick: onNewTask,
    },
    {
      id: 'qa-reports',
      label: 'Reports',
      icon: MdBarChart,
      color: '#22c55e',
      bgColor: 'rgba(34,197,94,0.1)',
      href: '/reports',
    },
    {
      id: 'qa-calendar',
      label: 'Calendar',
      icon: MdCalendarMonth,
      color: '#ec4899',
      bgColor: 'rgba(236,72,153,0.1)',
      href: '/calendar',
    },
  ];

  return (
    <div className={styles.quickActionsCard}>
      <div className={styles.quickActionsHeader}>
        <span className={styles.quickActionsTitle}>Quick Actions</span>
      </div>
      <div className={styles.quickActionsGrid}>
        {actions.map(({ id, label, icon: Icon, onClick, href, color, bgColor }) => {
          const inner = (
            <>
              <div
                className={styles.quickActionIcon}
                style={{ background: bgColor, '--btn-color': color }}
              >
                <Icon size={18} />
              </div>
              <span className={styles.quickActionLabel}>{label}</span>
            </>
          );

          if (href) {
            return (
              <Link
                key={id}
                to={href}
                className={styles.quickActionBtn}
                style={{ '--btn-color': color, '--btn-bg': bgColor }}
                aria-label={label}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={id}
              className={styles.quickActionBtn}
              style={{ '--btn-color': color, '--btn-bg': bgColor }}
              aria-label={label}
              onClick={onClick}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;