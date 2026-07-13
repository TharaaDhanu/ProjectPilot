/**
 * components/Dashboard/QuickActions.jsx
 * ----------------------------------------
 * Four quick-action buttons: New Project, New Task,
 * View Reports, View Calendar.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  MdAddCircle,
  MdAddTask,
  MdBarChart,
  MdCalendarMonth,
} from 'react-icons/md';
import styles from './QuickActions.module.css';

const QuickActions = ({ onNewProject, onNewTask }) => {
  const actions = [
    {
      id: 'qa-new-project',
      label: 'New Project',
      icon: MdAddCircle,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
      onClick: onNewProject,
    },
    {
      id: 'qa-new-task',
      label: 'New Task',
      icon: MdAddTask,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      onClick: onNewTask,
    },
    {
      id: 'qa-reports',
      label: 'Reports',
      icon: MdBarChart,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.1)',
      href: '/reports',
    },
    {
      id: 'qa-calendar',
      label: 'Calendar',
      icon: MdCalendarMonth,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      href: '/calendar',
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Quick Actions</div>
      <div className={styles.grid}>
        {actions.map(({ id, label, icon: Icon, color, bg, onClick, href }) => {
          const inner = (
            <>
              <div className={styles.iconBox}>
                <Icon size={22} />
              </div>
              <span className={styles.label}>{label}</span>
            </>
          );

          if (href) {
            return (
              <Link
                key={id}
                id={id}
                to={href}
                className={styles.btn}
                style={{ '--btn-color': color, '--btn-bg': bg }}
                aria-label={label}
              >
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={id}
              id={id}
              className={styles.btn}
              style={{ '--btn-color': color, '--btn-bg': bg }}
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
