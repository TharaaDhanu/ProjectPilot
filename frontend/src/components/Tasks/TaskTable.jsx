/**
 * components/Tasks/TaskTable.jsx
 * ------------------------------
 * Tabular table view for Tasks.
 */

import React from 'react';
import {
  LuStar, LuSquarePen, LuTrash, LuArchive,
  LuFolderArchive, LuCopy
} from 'react-icons/lu';
import styles from './TaskTable.module.css';

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
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TaskTableRow = ({
  task,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onFavorite
}) => {
  const sb = STATUS_BADGES[task.status]   || { bg: '#f3f4f6', color: '#6b7280' };
  const pb = PRIORITY_BADGES[task.priority] || { bg: '#f3f4f6', color: '#6b7280' };
  const isArchived = task.status === 'Archived';

  return (
    <tr className={styles.row} onClick={() => onView(task)}>
      {/* Task Name */}
      <td>
        <div className={styles.taskNameWrapper}>
          <button
            className={`${styles.favBtn} ${task.is_favorite ? styles.active : ''}`}
            onClick={e => { e.stopPropagation(); onFavorite(task.id, !task.is_favorite); }}
            title={task.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
          >
            <LuStar style={{ fill: task.is_favorite ? '#eab308' : 'none' }} />
          </button>
          <div>
            <div className={styles.taskName}>{task.title}</div>
            {task.description && (
              <div className={styles.taskDesc}>{task.description}</div>
            )}
          </div>
        </div>
      </td>

      {/* Project */}
      <td>
        <span className={styles.projectTitle}>
          {task.project_title || 'General'}
        </span>
      </td>

      {/* Assignee */}
      <td>
        {task.assigned_name ? (
          <div className={styles.assignee} title={task.assigned_email}>
            <div className={styles.avatar}>{getInitials(task.assigned_name)}</div>
            <span>{task.assigned_name.split(' ')[0]}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Unassigned</span>
        )}
      </td>

      {/* Priority */}
      <td>
        <span className={styles.badge} style={{ backgroundColor: pb.bg, color: pb.color }}>
          {task.priority}
        </span>
      </td>

      {/* Status */}
      <td>
        <span className={styles.badge} style={{ backgroundColor: sb.bg, color: sb.color }}>
          {task.status}
        </span>
      </td>

      {/* Progress */}
      <td>
        <div className={styles.progressWrapper}>
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
      </td>

      {/* Start Date */}
      <td><span className={styles.date}>{formatDate(task.start_date)}</span></td>

      {/* End Date */}
      <td><span className={styles.date}>{formatDate(task.end_date)}</span></td>

      {/* Actions */}
      <td>
        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          <button className={styles.actionBtn} title="Edit" onClick={() => onEdit(task)}>
            <LuSquarePen size={13} />
          </button>
          <button className={styles.actionBtn} title="Duplicate" onClick={() => onDuplicate(task)}>
            <LuCopy size={13} />
          </button>
          {isArchived ? (
            <button className={styles.actionBtn} title="Restore" onClick={() => onRestore(task.id)}>
              <LuFolderArchive size={13} />
            </button>
          ) : (
            <button className={styles.actionBtn} title="Archive" onClick={() => onArchive(task.id)}>
              <LuArchive size={13} />
            </button>
          )}
          <button className={`${styles.actionBtn} ${styles.danger}`} title="Delete" onClick={() => onDelete(task.id, task.title)}>
            <LuTrash size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const TaskTable = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onFavorite
}) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Task Name</th>
            <th>Project</th>
            <th>Assigned To</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <TaskTableRow
              key={task.id}
              task={task}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onRestore={onRestore}
              onDuplicate={onDuplicate}
              onFavorite={onFavorite}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
