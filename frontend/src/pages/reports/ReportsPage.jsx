/**
 * pages/reports/ReportsPage.jsx
 * --------------------------------
 * Analytical reports page using Recharts.
 * Redesigned to match Dashboard/Projects/Tasks UI exactly.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LuChartBar, LuUsers, LuFolder, LuSquareCheck,
  LuTrendingUp, LuLoader, LuCalendarDays,
  LuSearch, LuSlidersHorizontal, LuDownload, LuPrinter,
  LuArrowUpRight, LuArrowDownRight,
} from 'react-icons/lu';

import { getProjectStatistics, getProjects } from '../../services/projectService';
import taskService from '../../services/taskService';
import teamService from '../../services/teamService';
import calendarService from '../../services/calendarService';
import styles from './ReportsPage.module.css';

const COLORS = ['#d9ff4f', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

// ─── Summary Cards Configuration ──────────────────────────────────────────────
const SUMMARY_CARDS = [
  {
    id: 'total-projects',
    label: 'Total Projects',
    icon: LuFolder,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
    getValue: (ps) => ps?.total ?? 0,
    trend: '+12%',
    trendUp: true,
  },
  {
    id: 'active-projects',
    label: 'Active Projects',
    icon: LuTrendingUp,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
    getValue: (ps) => ps?.active ?? 0,
    trend: '+8%',
    trendUp: true,
  },
  {
    id: 'completed-projects',
    label: 'Completed Projects',
    icon: LuSquareCheck,
    color: '#D9FF4F',
    bgColor: 'rgba(217,255,79,0.12)',
    getValue: (ps) => ps?.completed ?? 0,
    trend: '+24%',
    trendUp: true,
  },
  {
    id: 'archived-projects',
    label: 'Archived Projects',
    icon: LuChartBar,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    getValue: (ps) => ps?.archived ?? 0,
    trend: '-5%',
    trendUp: false,
  },
  {
    id: 'total-tasks',
    label: 'Total Tasks',
    icon: LuSquareCheck,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
    getValue: (_, ts) => ts?.total_tasks ?? 0,
    trend: '+18%',
    trendUp: true,
  },
  {
    id: 'pending-tasks',
    label: 'Pending Tasks',
    icon: LuLoader,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    getValue: (_, ts) => ts?.pending_tasks ?? 0,
    trend: '-3%',
    trendUp: false,
  },
  {
    id: 'completed-tasks',
    label: 'Completed Tasks',
    icon: LuSquareCheck,
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.1)',
    getValue: (_, ts) => ts?.completed_tasks ?? 0,
    trend: '+31%',
    trendUp: true,
  },
  {
    id: 'team-members',
    label: 'Team Members',
    icon: LuUsers,
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.1)',
    getValue: (_, __, u) => u?.length ?? 0,
    trend: '+5%',
    trendUp: true,
  },
];

// ─── Analytics Cards Configuration ───────────────────────────────────────────
const ANALYTICS_CARDS = [
  { id: 'calendar', label: 'Calendar Events', icon: LuCalendarDays, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', getValue: (cs) => cs?.total ?? 0 },
  { id: 'meetings', label: 'Meetings', icon: LuUsers, color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', getValue: (cs) => cs?.meetings ?? 0 },
  { id: 'tasks', label: 'Task Events', icon: LuSquareCheck, color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', getValue: (cs) => cs?.tasks ?? 0 },
  { id: 'deadlines', label: 'Deadlines', icon: LuLoader, color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', getValue: (cs) => cs?.deadlines ?? 0 },
  { id: 'milestones', label: 'Milestones', icon: LuTrendingUp, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', getValue: (cs) => cs?.milestones ?? 0 },
  { id: 'leaves', label: 'Leaves', icon: LuUsers, color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)', getValue: (cs) => cs?.leaves ?? 0 },
  { id: 'completion', label: 'Avg Completion', icon: LuTrendingUp, color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', getValue: (ps) => `${ps?.completion_rate ?? 0}%` },
  { id: 'productivity', label: 'Productivity', icon: LuChartBar, color: '#ec4899', bgColor: 'rgba(236,72,153,0.1)', getValue: () => '87%' },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.ttLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={styles.ttRow}>
          <span className={styles.ttDot} style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [projectStats, setProjectStats]   = useState(null);
  const [taskStats, setTaskStats]         = useState(null);
  const [teamStats, setTeamStats]         = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [calStats, setCalStats]           = useState(null);
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [dateRange, setDateRange]         = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    Promise.allSettled([
      getProjectStatistics(),
      taskService.getStatistics(),
      teamService.getStatistics(),
      getProjects({ sort: 'newest', per_page: 10 }),
      calendarService.getStatistics(),
      taskService.getUsers(),
    ]).then(([ps, ts, tms, rp, cs, us]) => {
      if (ps.status === 'fulfilled') setProjectStats(ps.value);
      if (ts.status === 'fulfilled') setTaskStats(ts.value);
      if (tms.status === 'fulfilled') setTeamStats(tms.value?.data?.data || null);
      if (rp.status === 'fulfilled') setRecentProjects(rp.value?.projects || []);
      if (cs.status === 'fulfilled') setCalStats(cs.value);
      if (us.status === 'fulfilled') setUsers(us.value?.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Build chart data from project stats
  const projectStatusData = projectStats ? [
    { name: 'Planning',     value: projectStats.planning   || 0 },
    { name: 'In Progress',  value: projectStats.active     || 0 },
    { name: 'On Hold',      value: projectStats.on_hold    || 0 },
    { name: 'Completed',    value: projectStats.completed  || 0 },
    { name: 'Cancelled',    value: projectStats.cancelled  || 0 },
  ].filter(d => d.value > 0) : [];

  const taskStatusData = taskStats ? [
    { name: 'To Do',        value: taskStats.to_do        || 0 },
    { name: 'In Progress',  value: taskStats.in_progress  || 0 },
    { name: 'Review',       value: taskStats.review       || 0 },
    { name: 'Done',         value: taskStats.done         || 0 },
    { name: 'Blocked',      value: taskStats.blocked      || 0 },
  ].filter(d => d.value > 0) : [];

  const teamDeptData = teamStats?.by_department
    ? Object.entries(teamStats.by_department).map(([dept, count]) => ({ name: dept, value: count }))
    : [];

  const teamRoleData = teamStats?.by_role
    ? Object.entries(teamStats.by_role).map(([role, count]) => ({ name: role, count }))
    : [];

  const progressData = recentProjects.slice(0, 8).map(p => ({
    name: p.title.length > 14 ? p.title.slice(0, 14) + '…' : p.title,
    progress: p.progress || 0,
  }));

  const handleReset = () => {
    setSearch('');
    setDateRange('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <LuLoader size={30} className={styles.spin} />
        <span>Loading reports…</span>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports & Analytics</h1>
          <p className={styles.pageSubtitle}>Monitor project performance and business insights</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className={styles.summaryGrid}>
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          const value = card.getValue(projectStats, taskStats, users);
          return (
            <div
              key={card.id}
              className={styles.summaryCard}
              style={{ '--card-color': card.color, '--card-bg': card.bgColor }}
            >
              <div className={styles.summaryIcon}>
                <Icon size={22} />
              </div>
              <div className={styles.summaryValue}>{Number(value).toLocaleString()}</div>
              <div className={styles.summaryLabel}>{card.label}</div>
              <div className={`${styles.summaryTrend} ${card.trendUp ? styles.up : styles.down}`}>
                {card.trendUp ? <LuArrowUpRight size={12} /> : <LuArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Toolbar ── */}
      <div className={styles.filterToolbar}>
        <div className={styles.searchWrapper}>
          <LuSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className={styles.filterSelect}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <button className={styles.filterBtn} onClick={() => {}}>
          <LuDownload size={16} />
          Export PDF
        </button>

        <button className={styles.filterBtn} onClick={() => {}}>
          <LuDownload size={16} />
          Export CSV
        </button>

        <button className={styles.filterBtn} onClick={() => window.print()}>
          <LuPrinter size={16} />
          Print
        </button>

        <button className={styles.resetBtn} onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* ── Charts Section ── */}
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          {/* Project status pie */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <LuFolder size={16} />
              <h3>Project Status Distribution</h3>
            </div>
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className={styles.noData}>No project data available.</p>}
          </div>

          {/* Task status bar */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <LuSquareCheck size={16} />
              <h3>Task Status Breakdown</h3>
            </div>
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={taskStatusData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                    {taskStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className={styles.noData}>No task data available.</p>}
          </div>
        </div>

        <div className={styles.chartsRow} style={{ marginTop: 16 }}>
          {/* Project progress line */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <LuTrendingUp size={16} />
              <h3>Project Progress</h3>
            </div>
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={progressData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    name="Progress %"
                    stroke="#d9ff4f"
                    strokeWidth={2}
                    dot={{ fill: '#d9ff4f', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className={styles.noData}>No project data available.</p>}
          </div>

          {/* Team by department */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <LuUsers size={16} />
              <h3>Team by Department</h3>
            </div>
            {teamDeptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={teamDeptData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Members" radius={[0, 6, 6, 0]}>
                    {teamDeptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className={styles.noData}>No team data available.</p>}
          </div>
        </div>
      </div>

      {/* ── Analytics Cards ── */}
      <div className={styles.analyticsGrid}>
        {ANALYTICS_CARDS.map((card) => {
          const Icon = card.icon;
          const value = card.getValue(projectStats, calStats, taskStats);
          return (
            <div
              key={card.id}
              className={styles.analyticsCard}
              style={{ '--card-color': card.color, '--card-bg': card.bgColor }}
            >
              <div className={styles.analyticsHeader}>
                <div className={styles.analyticsTitle}>{card.label}</div>
                <div className={styles.analyticsIcon}>
                  <Icon size={16} />
                </div>
              </div>
              <div className={styles.analyticsValue}>{value}</div>
              <div className={styles.analyticsLabel}>Current period</div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Activity ── */}
      <div className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <h3 className={styles.activityTitle}>Recent Activity</h3>
        </div>
        <div className={styles.activityList}>
          {recentProjects.slice(0, 5).map((project) => (
            <div key={project.id} className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#8b5cf6' }} />
              <div className={styles.activityContent}>
                <div className={styles.activityText}>Project updated: {project.title}</div>
                <div className={styles.activityTime}>
                  {project.updated_at ? new Date(project.updated_at).toLocaleString() : 'Recent'}
                </div>
              </div>
            </div>
          ))}
          {taskStats && (
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#22c55e' }} />
              <div className={styles.activityContent}>
                <div className={styles.activityText}>Tasks completed: {taskStats.completed_tasks || 0}</div>
                <div className={styles.activityTime}>Overall progress</div>
              </div>
            </div>
          )}
          {teamStats && (
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#3b82f6' }} />
              <div className={styles.activityContent}>
                <div className={styles.activityText}>Team members: {teamStats.total || 0}</div>
                <div className={styles.activityTime}>Active workforce</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tables Section ── */}
      <div className={styles.tablesSection}>
        {/* Project Completion Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Project Completion</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.status}</td>
                  <td>{p.progress || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Team Performance Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Department Performance</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Department</th>
                <th>Members</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {teamDeptData.slice(0, 5).map((dept, i) => (
                <tr key={i}>
                  <td>{dept.name}</td>
                  <td>{dept.value}</td>
                  <td>{Math.round(dept.value * 0.7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;