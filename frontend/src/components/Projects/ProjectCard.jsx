/**
 * components/Projects/ProjectCard.jsx
 * ----------------------------------------
 * Grid-view project card with quick-action dropdown menu.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MdMoreVert, MdEdit, MdDelete, MdArchive, MdRestorePage,
  MdCalendarToday, MdPerson,
} from 'react-icons/md';
import styles from './ProjectCard.module.css';

// ─── Badge helpers ────────────────────────────────────────────────────────────
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
  'Low':      { bg: 'rgba(34,197,94,0.1)',    color: '#16a34a' },
  'Medium':   { bg: 'rgba(245,158,11,0.1)',   color: '#d97706' },
  'High':     { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626' },
  'Critical': { bg: 'rgba(124,58,237,0.12)',  color: '#7c3aed' },
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

const Badge = ({ text, colorMap }) => {
  const style = colorMap[text] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className={styles.badge} style={{ background: style.bg, color: style.color }}>
      {text}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectCard = ({ project, onEdit, onDelete, onArchive, onRestore, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const isArchived = project.status === 'Archived';

  return (
    <div
      id={`project-card-${project.id}`}
      className={styles.card}
      onClick={() => onView(project)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onView(project)}
    >
      {/* ── Top row: badges + menu ── */}
      <div className={styles.topRow}>
        <div className={styles.badges}>
          <Badge text={project.status}   colorMap={STATUS_COLORS} />
          <Badge text={project.priority} colorMap={PRIORITY_COLORS} />
        </div>

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            aria-label="Project actions"
          >
            <MdMoreVert />
          </button>

          {menuOpen && (
            <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
              <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onEdit(project); }}>
                <MdEdit size={15} /> Edit Project
              </button>
              {isArchived ? (
                <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onRestore(project); }}>
                  <MdRestorePage size={15} /> Restore Project
                </button>
              ) : (
                <button className={styles.dropItem} onClick={() => { setMenuOpen(false); onArchive(project); }}>
                  <MdArchive size={15} /> Archive Project
                </button>
              )}
              <div className={styles.dropSep} />
              <button className={`${styles.dropItem} ${styles.danger}`} onClick={() => { setMenuOpen(false); onDelete(project); }}>
                <MdDelete size={15} /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Title ── */}
      <h3 className={styles.title}>{project.title}</h3>
      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}

      {/* ── Progress ── */}
      <div className={styles.progressRow}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${project.progress}%`,
              background: PROGRESS_COLORS[project.status] || '#6366f1',
            }}
          />
        </div>
        <span className={styles.progressPct}>{project.progress}%</span>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <div className={styles.dateRange}>
          <MdCalendarToday size={12} />
          {formatDate(project.start_date)} → {formatDate(project.end_date)}
        </div>
        {project.creator_name && (
          <div className={styles.createdBy}>
            <div className={styles.avatar}>{getInitials(project.creator_name)}</div>
            {project.creator_name.split(' ')[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
