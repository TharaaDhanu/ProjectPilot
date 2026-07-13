/**
 * components/Projects/ProjectDrawer.jsx
 * ----------------------------------------
 * Right-side sliding detail drawer for a single project.
 * Shows: title, status/priority, description, timeline,
 *        progress, created-by, metadata.
 */

import React from 'react';
import { MdClose, MdEdit, MdDelete, MdCalendarToday, MdPerson, MdAccessTime } from 'react-icons/md';
import styles from './ProjectDrawer.module.css';

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
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getInitials = (name) => {
  if (!name) return 'U';
  const p = name.split(' ');
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
};

const ProjectDrawer = ({ project, onClose, onEdit, onDelete }) => {
  if (!project) return null;

  const sc = STATUS_COLORS[project.status]     || { bg: '#f3f4f6', color: '#6b7280' };
  const pc = PRIORITY_COLORS[project.priority] || { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div id="project-drawer" className={styles.drawer}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{project.title}</h2>
            <div className={styles.badges}>
              <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
                {project.status}
              </span>
              <span className={styles.badge} style={{ background: pc.bg, color: pc.color }}>
                {project.priority}
              </span>
            </div>
          </div>
          <button
            id="drawer-close-btn"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close drawer"
          >
            <MdClose />
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Description */}
          {project.description && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Description</div>
              <p className={styles.description}>{project.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Progress</div>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Completion</span>
                <span className={styles.progressPct}>{project.progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${project.progress}%`,
                    background: PROGRESS_COLORS[project.status] || '#6366f1',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Project Timeline</div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}><MdCalendarToday size={11} /> Start Date</div>
                <div className={styles.metaValue}>{formatDate(project.start_date)}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}><MdCalendarToday size={11} /> End Date</div>
                <div className={styles.metaValue}>{formatDate(project.end_date)}</div>
              </div>
            </div>
          </div>

          {/* Creator */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Created By</div>
            <div className={styles.creatorRow}>
              <div className={styles.avatar}>{getInitials(project.creator_name)}</div>
              <div>
                <div className={styles.creatorName}>{project.creator_name || 'Unknown'}</div>
                <div className={styles.creatorDate}>{formatDateTime(project.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Activity</div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}><MdAccessTime size={11} /> Created</div>
                <div className={styles.metaValue} style={{ fontSize: '0.78rem' }}>
                  {formatDateTime(project.created_at)}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}><MdAccessTime size={11} /> Last Updated</div>
                <div className={styles.metaValue} style={{ fontSize: '0.78rem' }}>
                  {formatDateTime(project.updated_at)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button
            id="drawer-edit-btn"
            className={styles.editBtn}
            onClick={() => onEdit(project)}
          >
            <MdEdit size={15} /> Edit Project
          </button>
          <button
            id="drawer-delete-btn"
            className={styles.deleteBtn}
            onClick={() => onDelete(project)}
          >
            <MdDelete size={15} /> Delete
          </button>
        </div>

      </div>
    </>
  );
};

export default ProjectDrawer;
