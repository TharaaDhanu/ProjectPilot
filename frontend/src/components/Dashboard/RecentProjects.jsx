/**
 * components/Dashboard/RecentProjects.jsx
 * -----------------------------------------
 * Table of recent projects with live data passed via props.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './RecentProjects.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:      { background: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
  Completed:   { background: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
  'On Hold':   { background: 'rgba(245,158,11,0.12)',  color: '#d97706' },
  Planning:    { background: 'rgba(6,182,212,0.12)',   color: '#0891b2' },
  Archived:    { background: 'rgba(156,163,175,0.12)', color: '#6b7280' },
};

const PRIORITY_STYLES = {
  Low:      { background: 'rgba(34,197,94,0.1)',    color: '#16a34a' },
  Medium:   { background: 'rgba(245,158,11,0.1)',   color: '#d97706' },
  High:     { background: 'rgba(239,68,68,0.1)',    color: '#dc2626' },
  Critical: { background: 'rgba(124,58,237,0.12)',  color: '#7c3aed' },
};

const PROGRESS_COLOR = {
  Active:    '#6366f1',
  Completed: '#22c55e',
  'On Hold': '#f59e0b',
  Planning:  '#06b6d4',
  Archived:  '#9ca3af',
};

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className={styles.row}>
    {[200, 80, 120, 80, 80, 60].map((w, i) => (
      <td key={i}>
        <div
          style={{
            height: 14,
            width: w,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      </td>
    ))}
  </tr>
);

const RecentProjects = ({ projects = [], loading = false }) => (
  <div id="recent-projects" className={styles.card}>
    <div className={styles.cardHeader}>
      <span className={styles.cardTitle}>Recent Projects</span>
      <Link to="/projects" className={styles.viewAll}>View all →</Link>
    </div>

    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          <th>Project</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Team</th>
          <th>Deadline</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : projects.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.85rem' }}>
              No projects yet.{' '}
              <Link to="/projects" style={{ color: '#6366f1', fontWeight: 600 }}>Create one →</Link>
            </td>
          </tr>
        ) : projects.map((p, idx) => {
          const statusKey = p.status || 'Active';
          const priorityKey = p.priority || 'Medium';
          const progress = p.completion_percentage ?? 0;
          // Build team initials from members array or owner
          const members = p.members?.slice(0, 3) || [];
          const overflow = (p.member_count || 0) > 3 ? (p.member_count - 3) : 0;
          return (
            <tr key={p.id} className={styles.row}>
              {/* Name */}
              <td>
                <Link to="/projects" className={styles.projectName}>{p.title || p.name}</Link>
              </td>

              {/* Status */}
              <td>
                <span
                  className={styles.statusBadge}
                  style={STATUS_STYLES[statusKey] || STATUS_STYLES['Active']}
                >
                  {statusKey}
                </span>
              </td>

              {/* Progress */}
              <td>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progress}%`,
                        background: PROGRESS_COLOR[statusKey] || '#6366f1',
                      }}
                    />
                  </div>
                  <span className={styles.progressPct}>{progress}%</span>
                </div>
              </td>

              {/* Team */}
              <td>
                <div className={styles.teamAvatars}>
                  {members.map((m, i) => {
                    const initials = m.first_name
                      ? `${m.first_name[0]}${m.last_name?.[0] || ''}`.toUpperCase()
                      : m.username?.[0]?.toUpperCase() || '?';
                    return (
                      <div
                        key={i}
                        className={styles.avatar}
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        title={m.first_name ? `${m.first_name} ${m.last_name || ''}` : m.username}
                      >
                        {initials}
                      </div>
                    );
                  })}
                  {overflow > 0 && (
                    <div className={styles.avatar} style={{ background: '#d1d5db', color: '#6b7280' }}>
                      +{overflow}
                    </div>
                  )}
                  {members.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>—</span>
                  )}
                </div>
              </td>

              {/* Deadline */}
              <td>
                <span className={styles.deadline}>
                  {p.end_date ? dayjs(p.end_date).format('MMM D, YYYY') : '—'}
                </span>
              </td>

              {/* Priority */}
              <td>
                <span
                  className={styles.priority}
                  style={PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES['Medium']}
                >
                  {priorityKey}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default RecentProjects;
