/**
 * pages/reports/ReportsPage.jsx
 * --------------------------------
 * Analytical reports page using Recharts.
 * Pulls live data from projects, tasks, and team APIs.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LuChartBar, LuUsers, LuFolder, LuSquareCheck,
  LuTrendingUp, LuLoader, LuCalendarDays,
} from 'react-icons/lu';

import { getProjectStatistics, getProjects } from '../../services/projectService';
import taskService from '../../services/taskService';
import teamService from '../../services/teamService';
import calendarService from '../../services/calendarService';
import styles from './ReportsPage.module.css';

const COLORS = ['#d9ff4f', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ background: color + '22', color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className={styles.metricValue}>{value ?? '—'}</div>
        <div className={styles.metricLabel}>{label}</div>
        {sub && <div className={styles.metricSub}>{sub}</div>}
      </div>
    </div>
  );
}

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

const ReportsPage = () => {
  const [projectStats, setProjectStats]   = useState(null);
  const [taskStats, setTaskStats]         = useState(null);
  const [teamStats, setTeamStats]         = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [calStats, setCalStats]             = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getProjectStatistics(),
      taskService.getStatistics(),
      teamService.getStatistics(),
      getProjects({ sort: 'newest', per_page: 10 }),
      calendarService.getStatistics(),
    ]).then(([ps, ts, tms, rp, cs]) => {
      if (ps.status === 'fulfilled') setProjectStats(ps.value);
      if (ts.status === 'fulfilled') setTaskStats(ts.value);
      if (tms.status === 'fulfilled') setTeamStats(tms.value?.data?.data || null);
      if (rp.status === 'fulfilled') setRecentProjects(rp.value?.projects || []);
      if (cs.status === 'fulfilled') setCalStats(cs.value);
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

  // Project progress line data
  const progressData = recentProjects.slice(0, 8).map(p => ({
    name: p.title.length > 14 ? p.title.slice(0, 14) + '…' : p.title,
    progress: p.progress || 0,
  }));

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
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports & Analytics</h1>
          <p className={styles.pageSubtitle}>Performance metrics and team insights</p>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className={styles.kpiRow}>
        <MetricCard icon={LuFolder}     label="Total Projects"      value={projectStats?.total}           sub={`${projectStats?.completion_rate ?? 0}% completion`} color="#3b82f6" />
        <MetricCard icon={LuSquareCheck} label="Total Tasks"         value={taskStats?.total}              sub={`${taskStats?.done ?? 0} completed`} color="#22c55e" />
        <MetricCard icon={LuUsers}      label="Team Members"         value={teamStats?.total}              sub={`${teamStats?.by_status?.active ?? 0} active`} color="#d9ff4f" />
        <MetricCard icon={LuTrendingUp} label="Avg Project Progress" value={`${projectStats?.avg_progress ?? 0}%`} color="#8b5cf6" />
      </div>

      {/* ── Charts row 1 ── */}
      <div className={styles.chartsRow}>
        {/* Project status pie */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <LuFolder size={15} />
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
            <LuSquareCheck size={15} />
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

      {/* ── Charts row 2 ── */}
      <div className={styles.chartsRow}>
        {/* Project progress line */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <LuTrendingUp size={15} />
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
            <LuUsers size={15} />
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

      {/* ── Calendar Statistics (Scheduler integration) ── */}
      {calStats && (
        <div className={styles.tableCard}>
          <div className={styles.chartHeader}>
            <LuCalendarDays size={15} />
            <h3>Calendar & Scheduler Statistics</h3>
          </div>
          <div className={styles.calStatGrid}>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#8b5cf6' }}>{calStats.total}</span><span className={styles.calLabel}>Total Events</span></div>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#3b82f6' }}>{calStats.meetings}</span><span className={styles.calLabel}>Meetings</span></div>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#22c55e' }}>{calStats.tasks}</span><span className={styles.calLabel}>Tasks</span></div>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#ef4444' }}>{calStats.deadlines}</span><span className={styles.calLabel}>Deadlines</span></div>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#f59e0b' }}>{calStats.milestones}</span><span className={styles.calLabel}>Milestones</span></div>
            <div className={styles.calStat}><span className={styles.calVal} style={{ color: '#06b6d4' }}>{calStats.leaves}</span><span className={styles.calLabel}>Leaves</span></div>
          </div>
        </div>
      )}

      {/* ── Team role breakdown table ── */}
      {teamRoleData.length > 0 && (
        <div className={styles.tableCard}>
          <div className={styles.chartHeader}>
            <LuChartBar size={15} />
            <h3>Team Role Breakdown</h3>
          </div>
          <div className={styles.roleTable}>
            {teamRoleData.map((r, i) => (
              <div key={r.name} className={styles.roleRow}>
                <div className={styles.roleColorDot} style={{ background: COLORS[i % COLORS.length] }} />
                <span className={styles.roleName}>{r.name}</span>
                <div className={styles.roleBarWrap}>
                  <div
                    className={styles.roleBar}
                    style={{
                      width: `${Math.round((r.count / (teamStats?.total || 1)) * 100)}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
                <span className={styles.roleCount}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
