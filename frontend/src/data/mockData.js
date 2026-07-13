/**
 * data/mockData.js
 * ----------------
 * All mock data used by Phase 2 Dashboard components.
 * No API calls — pure static JSON for UI demonstration.
 */

// ─── Stat Cards ─────────────────────────────────────────────────────────────
export const statsCards = [
  {
    id: 'total-projects',
    label: 'Total Projects',
    value: 48,
    trend: +12,
    trendLabel: 'vs last month',
    icon: 'FolderOpen',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
  },
  {
    id: 'active-projects',
    label: 'Active Projects',
    value: 14,
    trend: +3,
    trendLabel: 'vs last month',
    icon: 'Activity',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
  },
  {
    id: 'completed-projects',
    label: 'Completed Projects',
    value: 29,
    trend: +8,
    trendLabel: 'vs last month',
    icon: 'CheckCircle',
    color: '#D9FF4F',
    bgColor: 'rgba(217,255,79,0.12)',
  },
  {
    id: 'overdue-projects',
    label: 'Overdue Projects',
    value: 5,
    trend: -2,
    trendLabel: 'vs last month',
    icon: 'AlertTriangle',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
  },
  {
    id: 'total-tasks',
    label: 'Total Tasks',
    value: 342,
    trend: +24,
    trendLabel: 'vs last week',
    icon: 'ClipboardList',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
  },
  {
    id: 'pending-tasks',
    label: 'Pending Tasks',
    value: 87,
    trend: -5,
    trendLabel: 'vs last week',
    icon: 'Clock',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
  },
  {
    id: 'completed-tasks',
    label: 'Completed Tasks',
    value: 255,
    trend: +18,
    trendLabel: 'vs last week',
    icon: 'CheckSquare',
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.1)',
  },
  {
    id: 'team-members',
    label: 'Team Members',
    value: 23,
    trend: +2,
    trendLabel: 'new this month',
    icon: 'Users',
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.1)',
  },
];

// ─── Recent Projects ─────────────────────────────────────────────────────────
export const recentProjects = [
  {
    id: 'p1',
    name: 'E-Commerce Redesign',
    status: 'active',
    progress: 72,
    deadline: '2026-07-28',
    team: ['AK', 'MR', 'JS'],
    priority: 'high',
  },
  {
    id: 'p2',
    name: 'Mobile Banking App',
    status: 'active',
    progress: 45,
    deadline: '2026-08-15',
    team: ['LN', 'PP'],
    priority: 'high',
  },
  {
    id: 'p3',
    name: 'HR Management System',
    status: 'completed',
    progress: 100,
    deadline: '2026-07-01',
    team: ['KS', 'RA', 'TM', 'VB'],
    priority: 'medium',
  },
  {
    id: 'p4',
    name: 'Data Analytics Dashboard',
    status: 'overdue',
    progress: 38,
    deadline: '2026-07-05',
    team: ['DC'],
    priority: 'critical',
  },
  {
    id: 'p5',
    name: 'API Gateway Migration',
    status: 'active',
    progress: 61,
    deadline: '2026-08-30',
    team: ['YL', 'SR'],
    priority: 'medium',
  },
];

// ─── Recent Tasks ─────────────────────────────────────────────────────────────
export const recentTasks = [
  {
    id: 't1',
    title: 'Design authentication flow',
    project: 'Mobile Banking App',
    status: 'in-progress',
    priority: 'high',
    due: '2026-07-15',
    assignee: 'AK',
  },
  {
    id: 't2',
    title: 'Set up CI/CD pipeline',
    project: 'API Gateway Migration',
    status: 'todo',
    priority: 'medium',
    due: '2026-07-18',
    assignee: 'MR',
  },
  {
    id: 't3',
    title: 'Write unit tests for auth module',
    project: 'E-Commerce Redesign',
    status: 'completed',
    priority: 'low',
    due: '2026-07-10',
    assignee: 'JS',
  },
  {
    id: 't4',
    title: 'Database schema optimisation',
    project: 'HR Management System',
    status: 'completed',
    priority: 'high',
    due: '2026-07-01',
    assignee: 'KS',
  },
  {
    id: 't5',
    title: 'Create wireframes for dashboard',
    project: 'Data Analytics Dashboard',
    status: 'overdue',
    priority: 'critical',
    due: '2026-07-04',
    assignee: 'DC',
  },
  {
    id: 't6',
    title: 'Code review: payment module',
    project: 'E-Commerce Redesign',
    status: 'in-progress',
    priority: 'medium',
    due: '2026-07-16',
    assignee: 'LN',
  },
];

// ─── Today's Deadlines ───────────────────────────────────────────────────────
export const todaysDeadlines = [
  { id: 'd1', title: 'Submit design mockups', project: 'E-Commerce Redesign', time: '10:00 AM', urgent: true },
  { id: 'd2', title: 'Team standup meeting', project: 'Mobile Banking App', time: '11:30 AM', urgent: false },
  { id: 'd3', title: 'Client demo presentation', project: 'Data Analytics Dashboard', time: '3:00 PM', urgent: true },
];

// ─── Recent Notifications ────────────────────────────────────────────────────
export const recentNotifications = [
  { id: 'n1', type: 'mention', message: 'Alex mentioned you in E-Commerce Redesign', time: '5m ago', read: false },
  { id: 'n2', type: 'deadline', message: 'Task "Write unit tests" is due tomorrow', time: '1h ago', read: false },
  { id: 'n3', type: 'comment', message: 'Maria left a comment on your task', time: '2h ago', read: true },
  { id: 'n4', type: 'assigned', message: 'You were assigned to API Gateway Migration', time: '3h ago', read: true },
  { id: 'n5', type: 'completed', message: 'HR Management System marked as complete', time: '1d ago', read: true },
];

// ─── Activity Timeline ───────────────────────────────────────────────────────
export const activityTimeline = [
  { id: 'a1', user: 'Alex K.', action: 'completed task', target: 'Design Review', time: '09:15 AM', avatar: 'AK', color: '#6366f1' },
  { id: 'a2', user: 'Maria R.', action: 'created project', target: 'Mobile Banking App', time: '08:40 AM', avatar: 'MR', color: '#22c55e' },
  { id: 'a3', user: 'John S.', action: 'commented on', target: 'Auth Module', time: '08:10 AM', avatar: 'JS', color: '#f59e0b' },
  { id: 'a4', user: 'You', action: 'updated status of', target: 'API Gateway Migration', time: 'Yesterday', avatar: 'ME', color: '#D9FF4F' },
  { id: 'a5', user: 'Kim S.', action: 'closed task', target: 'DB Schema optimisation', time: 'Yesterday', avatar: 'KS', color: '#ec4899' },
  { id: 'a6', user: 'Dave C.', action: 'added files to', target: 'Analytics Dashboard', time: '2d ago', avatar: 'DC', color: '#06b6d4' },
];

// ─── Upcoming Tasks ──────────────────────────────────────────────────────────
export const upcomingTasksList = [
  { id: 'ut1', title: 'Finalize API docs', due: 'Today', priority: 'high' },
  { id: 'ut2', title: 'Sprint planning session', due: 'Tomorrow', priority: 'medium' },
  { id: 'ut3', title: 'Deploy staging environment', due: 'Jul 16', priority: 'high' },
  { id: 'ut4', title: 'Investor deck update', due: 'Jul 18', priority: 'low' },
];

// ─── Upcoming Meetings ───────────────────────────────────────────────────────
export const upcomingMeetings = [
  { id: 'm1', title: 'Client Demo', time: '3:00 PM Today', attendees: ['AK', 'MR'], platform: 'Zoom' },
  { id: 'm2', title: 'Design Review', time: '10:00 AM Tomorrow', attendees: ['JS', 'LN', 'KS'], platform: 'Meet' },
  { id: 'm3', title: 'Sprint Retrospective', time: 'Jul 17 · 2:00 PM', attendees: ['DC', 'YL', 'SR'], platform: 'Teams' },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────
export const weeklyProductivityData = [
  { day: 'Mon', tasks: 12, projects: 3 },
  { day: 'Tue', tasks: 19, projects: 5 },
  { day: 'Wed', tasks: 8,  projects: 2 },
  { day: 'Thu', tasks: 24, projects: 7 },
  { day: 'Fri', tasks: 16, projects: 4 },
  { day: 'Sat', tasks: 6,  projects: 1 },
  { day: 'Sun', tasks: 4,  projects: 1 },
];

export const projectProgressData = [
  { month: 'Feb', completed: 4, started: 6 },
  { month: 'Mar', completed: 7, started: 9 },
  { month: 'Apr', completed: 5, started: 8 },
  { month: 'May', completed: 10, started: 12 },
  { month: 'Jun', completed: 8, started: 11 },
  { month: 'Jul', completed: 6, started: 14 },
];

export const taskStatusData = [
  { name: 'Completed', value: 255, color: '#D9FF4F' },
  { name: 'In Progress', value: 68, color: '#6366f1' },
  { name: 'Pending',    value: 19, color: '#f59e0b' },
  { name: 'Overdue',   value: 8,  color: '#ef4444' },
];

export const teamWorkloadData = [
  { name: 'Alex K.',  tasks: 14, fill: '#6366f1' },
  { name: 'Maria R.', tasks: 9,  fill: '#22c55e' },
  { name: 'John S.',  tasks: 7,  fill: '#f59e0b' },
  { name: 'Kim S.',   tasks: 11, fill: '#ec4899' },
  { name: 'Dave C.',  tasks: 6,  fill: '#06b6d4' },
];
