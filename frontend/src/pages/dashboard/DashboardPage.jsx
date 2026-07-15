/**
 * pages/dashboard/DashboardPage.jsx
 * ------------------------------------
 * Main dashboard page — hooked up to live backend data.
 *
 * Fetches:
 *   - Project statistics (useProjects)
 *   - Task statistics + recent tasks (useTasks)
 *   - Notifications for ActivityTimeline (useTasks)
 *
 * Passes real data down to all child components.
 */

import React, { useCallback, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { MdNotifications } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import DashboardLayout   from '../../components/Layouts/DashboardLayout';
import DashboardCards    from '../../components/Dashboard/DashboardCards';
import DashboardCharts   from '../../components/Dashboard/DashboardCharts';
import RecentProjects    from '../../components/Dashboard/RecentProjects';
import RecentTasks       from '../../components/Dashboard/RecentTasks';
import QuickActions      from '../../components/Dashboard/QuickActions';
import ActivityTimeline  from '../../components/Dashboard/ActivityTimeline';
import TodaysDeadlines   from '../../components/Dashboard/UpcomingTasks';
import UpcomingTasksList from '../../components/Dashboard/UpcomingTasksList';
import ProjectFormModal  from '../../components/Projects/ProjectFormModal';
import TaskFormModal     from '../../components/Tasks/TaskFormModal';

import { useAuth }       from '../../hooks/useAuth';
import { useProjects }   from '../../hooks/useProjects';
import { useTasks }      from '../../hooks/useTasks';
import { getProjects }   from '../../services/projectService';
import calendarService   from '../../services/calendarService';
import notificationService from '../../services/notificationService';
import { toast }         from 'react-toastify';
import styles            from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user } = useAuth();

  // ── Data hooks ────────────────────────────────────────────────────────
  const {
    projects,
    stats: projectStats,
    loading: projectsLoading,
    statsLoading: projectStatsLoading,
    handleCreate: handleCreateProject,
    handleUpdate: handleUpdateProject,
    fetchProjects,
    fetchStats: fetchProjectStats,
  } = useProjects();

  const {
    tasks,
    stats: taskStats,
    users,
    notifications,
    statsLoading: taskStatsLoading,
    handleCreate: handleCreateTask,
    handleMarkNotifRead,
    handleMarkAllNotifsRead,
  } = useTasks({ sort: 'newest' });

  // ── Quick-action modals ───────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | 'project' | 'task'
  const [saving, setSaving] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const openProjectModal = useCallback(async () => {
    setModal('project');
  }, []);

  const openTaskModal = useCallback(async () => {
    // Load all projects for the task form dropdown
    try {
      const data = await getProjects({ per_page: 100 });
      setAllProjects(data.projects || []);
    } catch {
      setAllProjects(projects);
    }
    setModal('task');
  }, [projects]);

  const closeModal = () => setModal(null);

  const onSaveProject = async (data) => {
    setSaving(true);
    try {
      await handleCreateProject(data);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onSaveTask = async (data) => {
    setSaving(true);
    try {
      await handleCreateTask(data);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Upcoming tasks: non-completed, sorted by end_date ─────────────────
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled' && t.status !== 'Archived')
    .sort((a, b) => {
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return new Date(a.end_date) - new Date(b.end_date);
    })
    .slice(0, 5);

  // ── Today's deadlines ─────────────────────────────────────────────────
  const today = dayjs().format('YYYY-MM-DD');
  const todaysDeadlines = tasks.filter(
    (t) => t.end_date === today && t.status !== 'Completed'
  );

  // ── Recent tasks for dashboard strip ─────────────────────────────────
  const recentTasks = tasks.slice(0, 6);

  // ── Recent projects ───────────────────────────────────────────────────
  const recentProjects = projects.slice(0, 5);

  // ── Notification integration ──────────────────────────────────────────
  const navigate = useNavigate();
  const [notifSummary, setNotifSummary] = useState(null);
  const [latestNotifs, setLatestNotifs] = useState([]);

  useEffect(() => {
    notificationService.getSummary()
      .then(setNotifSummary)
      .catch(() => {});
    notificationService.getUnread(5)
      .then(result => setLatestNotifs(result.notifications || []))
      .catch(() => {});
  }, []);

  // ── Calendar integration: upcoming events + today's meetings ──
  const [calDash, setCalDash] = useState(null);
  useEffect(() => {
    calendarService.getDashboardData()
      .then(setCalDash)
      .catch(() => {});
  }, []);

  const upcomingEvents = calDash?.upcoming_deadlines?.concat(calDash?.upcoming_meetings || []) || [];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className={styles.page}>

        {/* ── Top Two-Column Layout ── */}
        <div className={styles.topRow}>
          {/* Left Column: Today's Deadlines + Stats */}
          <div className={styles.leftCol}>
            <TodaysDeadlines tasks={todaysDeadlines} />
            <DashboardCards
              projectStats={projectStats}
              taskStats={taskStats}
              users={users}
              projectStatsLoading={projectStatsLoading}
              taskStatsLoading={taskStatsLoading}
            />
          </div>

          {/* Right Column: Quick Actions */}
          <div className={styles.rightCol}>
            <QuickActions
              onNewProject={openProjectModal}
              onNewTask={openTaskModal}
            />
          </div>
        </div>

        {/* ── Notification Summary Card ── */}
        {notifSummary && notifSummary.unread > 0 && (
          <div className={styles.notifBanner}>
            <div className={styles.notifBannerIcon}>
              <MdNotifications size={20} />
            </div>
            <div className={styles.notifBannerInfo}>
              <div className={styles.notifBannerTitle}>
                You have {notifSummary.unread} unread notification{notifSummary.unread !== 1 ? 's' : ''}
              </div>
              <div className={styles.notifBannerSub}>
                {notifSummary.todays_count > 0 && `${notifSummary.todays_count} today`}
                {notifSummary.high_priority > 0 && (notifSummary.todays_count > 0 ? ' · ' : '')}
                {notifSummary.high_priority > 0 && `${notifSummary.high_priority} high priority`}
              </div>
            </div>
            <button className={styles.notifBannerBtn} onClick={() => navigate('/notifications')}>
              View All
            </button>
          </div>
        )}

        {/* ── Latest Notifications Row ── */}
        {latestNotifs.length > 0 && (
          <div className={styles.latestNotifs}>
            {latestNotifs.slice(0, 3).map(notif => (
              <div key={notif.id} className={styles.latestNotifCard} onClick={() => navigate('/notifications')}>
                <div className={styles.latestNotifDot} style={{
                  background: notif.priority === 'critical' ? '#ef4444' : notif.priority === 'high' ? '#f59e0b' : '#3b82f6'
                }} />
                <div className={styles.latestNotifContent}>
                  <div className={styles.latestNotifTitle}>{notif.title || notif.type?.replace(/_/g, ' ')}</div>
                  <div className={styles.latestNotifMsg}>{notif.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Charts ── */}
        <DashboardCharts
          taskStats={taskStats}
          projectStats={projectStats}
          recentTasks={tasks}
          recentProjects={projects}
        />

        {/* ── Recent Projects ── */}
        <RecentProjects projects={recentProjects} loading={projectsLoading} />

        {/* ── Bottom row ── */}
        <div className={styles.bottomRow}>
          <RecentTasks tasks={recentTasks} />
          <div>
            <UpcomingTasksList tasks={upcomingTasks} />
            <ActivityTimeline
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
            />
          </div>
        </div>

        {/* ── Upcoming Events (Calendar integration) ── */}
        {upcomingEvents.length > 0 && (
          <div className={styles.eventsCard}>
            <div className={styles.eventsHeader}>
              <span className={styles.eventsTitle}>📅 Upcoming Events</span>
              <span className={styles.eventsCount}>{upcomingEvents.length}</span>
            </div>
            <div className={styles.eventsList}>
              {upcomingEvents.slice(0, 5).map((ev) => (
                <div key={ev.id} className={styles.eventRow}>
                  <span className={styles.eventDot} style={{ background: ev.color || '#8b5cf6' }} />
                  <span className={styles.eventName}>{ev.title}</span>
                  <span className={styles.eventType}>{ev.event_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {modal === 'project' && (
        <ProjectFormModal
          mode="create"
          onSave={onSaveProject}
          onClose={closeModal}
          saving={saving}
        />
      )}

      {modal === 'task' && (
        <TaskFormModal
          mode="create"
          projects={allProjects}
          users={users}
          onSave={onSaveTask}
          onClose={closeModal}
          saving={saving}
        />
      )}

    </DashboardLayout>
  );
};

export default DashboardPage;