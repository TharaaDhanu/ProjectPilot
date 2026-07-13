/**
 * components/Dashboard/DashboardCards.jsx
 * -----------------------------------------
 * 8 stat cards fed by live backend data:
 * Total/Active/Completed/Overdue Projects
 * Total/Pending/Completed Tasks + Team Members
 */

import React from 'react';
import {
  MdFolder, MdAutoGraph, MdCheckCircle, MdWarning,
  MdAssignment, MdAccessTime, MdCheckBox, MdGroup,
} from 'react-icons/md';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import styles from './DashboardCards.module.css';

const CARDS = [
  {
    id: 'total-projects',
    label: 'Total Projects',
    icon: MdFolder,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
    getValue: (ps) => ps?.total ?? 0,
  },
  {
    id: 'active-projects',
    label: 'Active Projects',
    icon: MdAutoGraph,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
    getValue: (ps) => ps?.active ?? 0,
  },
  {
    id: 'completed-projects',
    label: 'Completed Projects',
    icon: MdCheckCircle,
    color: '#D9FF4F',
    bgColor: 'rgba(217,255,79,0.12)',
    getValue: (ps) => ps?.completed ?? 0,
  },
  {
    id: 'overdue-projects',
    label: 'Archived Projects',
    icon: MdWarning,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    getValue: (ps) => ps?.archived ?? 0,
  },
  {
    id: 'total-tasks',
    label: 'Total Tasks',
    icon: MdAssignment,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
    getValue: (_, ts) => ts?.total_tasks ?? 0,
  },
  {
    id: 'pending-tasks',
    label: 'Pending Tasks',
    icon: MdAccessTime,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    getValue: (_, ts) => ts?.pending_tasks ?? 0,
  },
  {
    id: 'completed-tasks',
    label: 'Completed Tasks',
    icon: MdCheckBox,
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.1)',
    getValue: (_, ts) => ts?.completed_tasks ?? 0,
  },
  {
    id: 'team-members',
    label: 'Team Members',
    icon: MdGroup,
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.1)',
    getValue: (_, __, u) => u?.length ?? 0,
  },
];

const StatCard = ({ id, label, value, icon: Icon, color, bgColor, loading }) => (
  <div
    id={`stat-card-${id}`}
    className={styles.card}
    style={{ '--card-color': color, '--card-bg': bgColor }}
  >
    <div className={styles.header}>
      <div className={styles.iconWrapper}>
        <Icon size={22} />
      </div>
    </div>
    {loading ? (
      <div className={styles.skeleton} />
    ) : (
      <>
        <div className={styles.value}>{Number(value).toLocaleString()}</div>
        <div className={styles.label}>{label}</div>
      </>
    )}
  </div>
);

const DashboardCards = ({
  projectStats,
  taskStats,
  users = [],
  projectStatsLoading = false,
  taskStatsLoading = false,
}) => (
  <div className={styles.grid}>
    {CARDS.map((card) => {
      const isProjectCard = card.id.includes('project');
      const isTeamCard = card.id === 'team-members';
      const loading = isTeamCard
        ? taskStatsLoading
        : isProjectCard
          ? projectStatsLoading
          : taskStatsLoading;

      return (
        <StatCard
          key={card.id}
          id={card.id}
          label={card.label}
          value={card.getValue(projectStats, taskStats, users)}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          loading={loading}
        />
      );
    })}
  </div>
);

export default DashboardCards;
