/**
 * components/Projects/ProjectStats.jsx
 * ----------------------------------------
 * 6 statistics cards at the top of the Projects page.
 * Pulls live data from the backend via the useProjects hook.
 */

import React from 'react';
import {
  MdFolder, MdPending, MdPlayArrow, MdCheckCircle,
  MdArchive, MdTrendingUp,
} from 'react-icons/md';
import styles from './ProjectStats.module.css';

const STAT_CONFIG = [
  { key: 'total',       label: 'Total Projects',    icon: MdFolder,       color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { key: 'planning',    label: 'Planning',           icon: MdPending,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { key: 'active',      label: 'Active',             icon: MdPlayArrow,    color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  { key: 'completed',   label: 'Completed',          icon: MdCheckCircle,  color: '#D9FF4F', bg: 'rgba(217,255,79,0.15)'},
  { key: 'archived',    label: 'Archived',           icon: MdArchive,      color: '#6b7280', bg: 'rgba(107,114,128,0.1)'},
  {
    key: 'completion_rate',
    label: 'Completion Rate',
    icon: MdTrendingUp,
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    suffix: '%',
  },
];

const ProjectStats = ({ stats, loading }) => (
  <div className={styles.grid}>
    {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, suffix = '' }) => (
      <div key={key} className={styles.card}>
        <div className={styles.iconRow}>
          <div className={styles.iconBox} style={{ background: bg }}>
            <Icon size={20} color={color} />
          </div>
        </div>
        {loading ? (
          <div className={styles.skeleton} />
        ) : (
          <>
            <div className={styles.value}>{stats?.[key] ?? 0}{suffix}</div>
            <div className={styles.label}>{label}</div>
          </>
        )}
      </div>
    ))}
  </div>
);

export default ProjectStats;
