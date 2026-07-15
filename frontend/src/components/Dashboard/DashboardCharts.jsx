/**
 * components/Dashboard/DashboardCharts.jsx
 * ------------------------------------------
 * Four Recharts components — now driven by live backend data:
 * 1. Weekly Productivity  (tasks by day of week from recentTasks)
 * 2. Project Status     (projects by status — bar)
 * 3. Task Status          (PieChart from taskStats)
 * 4. Team Workload        (horizontal bar by assignee)
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis,
  CartesianGrid,
} from 'recharts';
import styles from './DashboardCharts.module.css';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      {label && <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#1E1B35', fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── 1. Weekly Productivity ───────────────────────────────────────────────────
const WeeklyProductivity = ({ recentTasks = [] }) => {
  const data = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0).map((_, i) => ({ day: days[i], tasks: 0 }));
    recentTasks.forEach((t) => {
      if (t.created_at) {
        const d = new Date(t.created_at).getDay();
        counts[d].tasks += 1;
      }
    });
    // Rotate so Monday is first
    return [...counts.slice(1), counts[0]];
  }, [recentTasks]);

  return (
    <div id="chart-weekly-productivity" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Weekly Productivity</span>
        <span className={styles.cardBadge}>This Period</span>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#6366f1' }} />Tasks Created</div>
      </div>
    </div>
  );
};

// ─── 2. Project Status Distribution ──────────────────────────────────────────
const ProjectStatusChart = ({ projectStats }) => {
  const data = useMemo(() => {
    if (!projectStats) return [];
    return [
      { name: 'Planning',    value: projectStats.planning  || 0, fill: '#f59e0b' },
      { name: 'Active',      value: projectStats.active    || 0, fill: '#6366f1' },
      { name: 'On Hold',     value: projectStats.on_hold   || 0, fill: '#ef4444' },
      { name: 'Completed',   value: projectStats.completed || 0, fill: '#22c55e' },
      { name: 'Archived',    value: projectStats.archived  || 0, fill: '#9ca3af' },
    ].filter((d) => d.value > 0);
  }, [projectStats]);

  return (
    <div id="chart-project-progress" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Project Status</span>
        <span className={styles.cardBadge}>{projectStats?.total || 0} Total</span>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="value" name="Projects" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── 3. Task Status Pie ───────────────────────────────────────────────────────
const TaskStatusChart = ({ taskStats }) => {
  const data = useMemo(() => {
    if (!taskStats?.statuses) return [];
    const colorMap = {
      'To Do':       '#6b7280',
      'In Progress': '#6366f1',
      'In Review':   '#8b5cf6',
      'Blocked':     '#ef4444',
      'Completed':   '#22c55e',
      'Cancelled':   '#9ca3af',
      'Archived':    '#d1d5db',
    };
    return Object.entries(taskStats.statuses)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: colorMap[name] || '#6366f1' }));
  }, [taskStats]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div id="chart-task-status" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Task Status</span>
        <span className={styles.cardBadge}>{total} Total</span>
      </div>
      <div className={styles.chartWrapper} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={52} outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: item.color }} />
                  {item.name}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E1B35' }}>{item.value}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: total ? `${(item.value / total) * 100}%` : '0%', background: item.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 4. Team Workload ─────────────────────────────────────────────────────────
const TeamWorkload = ({ recentTasks = [] }) => {
  const data = useMemo(() => {
    const map = {};
    recentTasks.forEach((t) => {
      if (t.assigned_name) {
        map[t.assigned_name] = (map[t.assigned_name] || 0) + 1;
      }
    });
    const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    return Object.entries(map)
      .map(([name, tasks], i) => ({ name, tasks, fill: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 6);
  }, [recentTasks]);

  return (
    <div id="chart-team-workload" className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Team Workload</span>
        <span className={styles.cardBadge}>Tasks / Member</span>
      </div>
      <div className={styles.chartWrapper}>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: '0.8125rem' }}>
            No assigned tasks yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="tasks" name="Tasks" radius={[0, 6, 6, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────
const DashboardCharts = ({ taskStats, projectStats, recentTasks = [], recentProjects = [] }) => (
  <div className={styles.grid}>
    <WeeklyProductivity recentTasks={recentTasks} />
    <ProjectStatusChart projectStats={projectStats} />
    <TaskStatusChart taskStats={taskStats} />
    <TeamWorkload recentTasks={recentTasks} />
  </div>
);

export default DashboardCharts;