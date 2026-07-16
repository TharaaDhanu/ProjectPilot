/**
 * pages/reports/ReportsPage.jsx
 * --------------------------------
 * Analytical reports page using Recharts.
 * Redesigned to match Dashboard/Projects/Tasks UI exactly.
 * Includes full-page PDF export via html2canvas + jspdf.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LuChartBar, LuUsers, LuFolder, LuSquareCheck,
  LuTrendingUp, LuLoader, LuCalendarDays,
  LuFileDown,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight } from 'react-icons/md';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { getProjectStatistics, getProjects } from '../../services/projectService';
import taskService from '../../services/taskService';
import teamService from '../../services/teamService';
import calendarService from '../../services/calendarService';
import styles from './ReportsPage.module.css';

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

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
  const pageRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [projectStats, setProjectStats] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [calStats, setCalStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const teamDesignationData = teamStats?.by_designation
    ? Object.entries(teamStats.by_designation).map(([desig, count]) => ({ name: desig, value: count }))
    : [];

  const progressData = recentProjects.slice(0, 8).map(p => ({
    name: p.title.length > 14 ? p.title.slice(0, 14) + '\u2026' : p.title,
    progress: p.progress || 0,
  }));

  // ─── Full-page PDF Export ─────────────────────────────────────────────────
  const exportPDF = async () => {
    if (!pageRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F7F8FC',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save('projectpilot-report.pdf');
      toast.success('Report exported as PDF successfully.');
    } catch (err) {
      toast.error('Failed to export PDF. Please try again.');
      console.error('PDF export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Reports">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div className={styles.breadcrumb}>
              <Link to="/"><MdHome size={13} /> Dashboard</Link>
              <MdChevronRight size={14} />
              Reports
            </div>
          </div>
          <div className={styles.loader}>
            <LuLoader size={30} className={styles.spin} />
            <span>Loading reports\u2026</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Reports">
      <div className={styles.page}>

        {/* ── Page Header with Export Button ── */}
        <div className={styles.pageHeaderRow}>
          <div className={styles.breadcrumb}>
            <Link to="/"><MdHome size={13} /> Dashboard</Link>
            <MdChevronRight size={14} />
            Reports
          </div>
          <button
            className={styles.exportPdfBtn}
            onClick={exportPDF}
            disabled={exporting}
            title="Export as PDF"
          >
            <LuFileDown size={16} />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>

        {/* ── Content wrapper for PDF capture ── */}
        <div ref={pageRef} className={styles.reportContent}>

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
                      <Legend formatter={v => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span>} />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
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

            <div className={styles.chartsRow} style={{ marginTop: 0 }}>
              {/* Project progress line */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <LuTrendingUp size={16} />
                  <h3>Project Progress</h3>
                </div>
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={progressData} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        name="Progress %"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className={styles.noData}>No project data available.</p>}
              </div>

              {/* Team by designation */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <LuUsers size={16} />
                  <h3>Team by Designation</h3>
                </div>
                {teamDesignationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={teamDesignationData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Members" radius={[0, 6, 6, 0]}>
                        {teamDesignationData.map((_, i) => (
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
              <h3 className={styles.tableTitle}>Project Completion</h3>
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
              <h3 className={styles.tableTitle}>Designation Performance</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>Members</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {teamDesignationData.slice(0, 5).map((desig, i) => (
                    <tr key={i}>
                      <td>{desig.name}</td>
                      <td>{desig.value}</td>
                      <td>{Math.round(desig.value * 0.7)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;