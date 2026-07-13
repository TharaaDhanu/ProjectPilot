/**
 * components/Tasks/TaskCard.jsx
 * -----------------------------
 * Displays a single task with metrics, badges, assignee,
 * timeline, timer pulse, and inline quick-actions dropdown.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  LuStar, LuEllipsisVertical, LuPlay, LuCalendar,
  LuSquarePen, LuTrash, LuArchive, LuFolderArchive, LuCopy
} from 'react-icons/lu';
import styles from './TaskCard.module.css';

const STATUS_BADGES = {
  'To Do':       { bg: 'rgba(107, 114, 128, 0.1)',  color: '#4b5563' },
  'In Progress': { bg: 'rgba(59, 130, 246, 0.12)',  color: '#2563eb' },
  'In Review':   { bg: 'rgba(139, 92, 246, 0.12)',  color: '#7c3aed' },
  'Blocked':    { bg: 'rgba(239, 68, 68, 0.1)',     color: '#dc2626' },
  'Completed':  { bg: 'rgba(34, 197, 94, 0.12)',   color: '#16a34a' },
  'Cancelled':  { bg: 'rgba(156, 163, 175, 0.15)', color: '#6b7280' },
  'Archived':   { bg: 'rgba(30, 27, 53, 0.08)',    color: '#4b5563' },
};

const PRIORITY_BADGES = {
  'Low':      { bg: 'rgba(34, 197, 94, 0.1)',   color: '#16a34a' },
  'Medium':   { bg: 'rgba(245, 158, 11, 0.1)',  color: '#d97706' },
  'High':     { bg: 'rgba(239, 68, 68, 0.1)',   color: '#dc2626' },
  'Critical': { bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' },
};

const PROGRESS_FILL = {
  'To Do':       '#6b7280',
  'In Progress': '#3b82f6',
  'In Review':   '#8b5cf6',
  'Blocked':    '#ef4444',
  'Completed':  '#22c55e',
  'Cancelled':  '#9ca3af',
  'Archived':   '#9ca3af',
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const TaskCard = ({
  task,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onFavorite,
  dragHandlers = {}
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [menuOpen]);

  const sb = STATUS_BADGES[task.status]   || { bg: '#f3f4f6', color: '#6b7280' };
  const pb = PRIORITY_BADGES[task.priority] || { bg: '#f3f4f6', color: '#6b7280' };
  const isArchived = task.status === 'Archived';

  return (
    <div
      id={`task-card-${task.id}`}
      className={`${styles.card} ${task.timer_running ? styles.timerActive : ''}`}
      onClick={() => onView(task)}
      {...dragHandlers}
    >
      {/* Top Row: Project + Fav/Menu */}
      <div className={styles.topRow}>
        <span className={styles.projectTitle} title={task.project_title || 'No Project'}>
          {task.project_title || 'General'}
        </span>
        <div className={styles.rightActions} ref={menuRef} onClick={e => e.stopPropagation()}>
          <button
            className={`${styles.favBtn} ${task.is_favorite ? styles.active : ''}`}
            onClick={() => onFavorite(task.id, !task.is_favorite)}
            title={task.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
          >
            <LuStar style={{ fill: task.is_favorite ? '#eab308' : 'none' }} />
          </button>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Task Actions"
          >
            <LuEllipsisVertical />
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onEdit(task); }}>
                <LuSquarePen size={13} /> Edit
              </button>
              <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onDuplicate(task); }}>
                <LuCopy size={13} /> Duplicate
              </button>
              {isArchived ? (
                <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onRestore(task.id); }}>
                  <LuFolderArchive size={13} /> Restore
                </button>
              ) : (
                <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onArchive(task.id); }}>
                  <LuArchive size={13} /> Archive
                </button>
              )}
              <div className={styles.dropSep} />
              <button className={`${styles.dropItem} ${styles.danger}`} onClick={() => { setMenuOpen(false); onDelete(task.id, task.title); }}>
                <LuTrash size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className={styles.title}>{task.title}</h4>

      {/* Badges / Metrics */}
      <div className={styles.badges}>
        <span className={styles.badge} style={{ backgroundColor: sb.bg, color: sb.color }}>
          {task.status}
        </span>
        <span className={styles.badge} style={{ backgroundColor: pb.bg, color: pb.color }}>
          {task.priority}
        </span>
        {task.timer_running && (
          <span className={styles.timerPulse}>
            <span className={styles.pulseDot} />
            <LuPlay size={10} /> Active
          </span>
        )}
      </div>

      {/* Progress */}
      <div className={styles.progressRow}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${task.progress}%`,
              backgroundColor: PROGRESS_FILL[task.status] || '#3b82f6'
            }}
          />
        </div>
        <span className={styles.progressPct}>{task.progress}%</span>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.dateRange} title="Task duration">
          <LuCalendar size={12} />
          {formatDate(task.start_date)} → {formatDate(task.end_date)}
        </div>
        {task.assigned_name && (
          <div className={styles.assignee} title={`Assigned to ${task.assigned_name}`}>
            <div className={styles.avatar}>{getInitials(task.assigned_name)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
