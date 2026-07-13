/**
 * components/Projects/ProjectRow.jsx
 * ----------------------------------------
 * Full list-view table: renders a <table> wrapping all ProjectRow <tr> entries.
 */

import React from 'react';
import { MdEdit, MdDelete, MdArchive, MdRestorePage } from 'react-icons/md';
import styles from './ProjectRow.module.css';

const STATUS_COLORS = {
  'Planning':    { bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
  'Pending':     { bg: 'rgba(107,114,128,0.1)',  color: '#4b5563' },
  'In Progress': { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
  'On Hold':     { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626' },
  'Completed':   { bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
  'Cancelled':   { bg: 'rgba(156,163,175,0.15)', color: '#6b7280' },
  'Archived':    { bg: 'rgba(30,27,53,0.07)',    color: '#9ca3af' },
};

const PRIORITY_COLORS = {
  'Low':      { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
  'Medium':   { bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
  'High':     { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
  'Critical': { bg: 'rgba(124,58,237,0.12)', color: '#7c3aed' },
};

const PROGRESS_COLORS = {
  'Planning':    '#f59e0b',
  'Pending':     '#9ca3af',
  'In Progress': '#6366f1',
  'On Hold':     '#ef4444',
  'Completed':   '#22c55e',
  'Cancelled':   '#d1d5db',
  'Archived':    '#d1d5db',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return 'U';
  const p = name.split(' ');
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
};

// ─── Single row ───────────────────────────────────────────────────────────────
const ProjectTableRow = ({ project, onView, onEdit, onDelete, onArchive, onRestore }) => {
  const sc = STATUS_COLORS[project.status]   || { bg: '#f3f4f6', color: '#6b7280' };
  const pc = PRIORITY_COLORS[project.priority] || { bg: '#f3f4f6', color: '#6b7280' };
  const isArchived = project.status === 'Archived';

  return (
    <tr className={styles.row} onClick={() => onView(project)}>
      <td>
        <div className={styles.projectName}>{project.title}</div>
        {project.description && (
          <div className={styles.projectDesc}>{project.description}</div>
        )}
      </td>
      <td>
        <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
          {project.status}
        </span>
      </td>
      <td>
        <span className={styles.badge} style={{ background: pc.bg, color: pc.color }}>
          {project.priority}
        </span>
      </td>
      <td>
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${project.progress}%`, background: PROGRESS_COLORS[project.status] || '#6366f1' }}
            />
          </div>
          <span className={styles.progressPct}>{project.progress}%</span>
        </div>
      </td>
      <td><span className={styles.date}>{formatDate(project.start_date)}</span></td>
      <td><span className={styles.date}>{formatDate(project.end_date)}</span></td>
      <td>
        <div className={styles.creator}>
          <div className={styles.avatar}>{getInitials(project.creator_name)}</div>
          {project.creator_name || '—'}
        </div>
      </td>
      <td>
        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          <button className={styles.actionBtn} title="Edit" onClick={() => onEdit(project)}>
            <MdEdit size={14} />
          </button>
          {isArchived ? (
            <button className={styles.actionBtn} title="Restore" onClick={() => onRestore(project)}>
              <MdRestorePage size={14} />
            </button>
          ) : (
            <button className={styles.actionBtn} title="Archive" onClick={() => onArchive(project)}>
              <MdArchive size={14} />
            </button>
          )}
          <button className={`${styles.actionBtn} ${styles.danger}`} title="Delete" onClick={() => onDelete(project)}>
            <MdDelete size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Full table ───────────────────────────────────────────────────────────────
const ProjectListTable = ({ projects, onView, onEdit, onDelete, onArchive, onRestore }) => (
  <table className={styles.table}>
    <thead className={styles.thead}>
      <tr>
        <th>Project</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Progress</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Created By</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {projects.map(p => (
        <ProjectTableRow
          key={p.id}
          project={p}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </tbody>
  </table>
);

export default ProjectListTable;
