/**
 * components/Layouts/RightSidebar.jsx
 * ----------------------------------------
 * Fixed right utility sidebar containing:
 * - Mini monthly calendar (dayjs)
 * - Live team stats (from /api/team/statistics)
 * - Recently joined employees
 * - Latest notifications
 * - Activity timeline
 * - Upcoming deadlines
 * - Quick Actions
 * - Collapsible with floating button
 */

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight, MdVideoCall, MdNotificationsActive, MdArrowForward } from 'react-icons/md';
import { LuUsers, LuUserCheck, LuUserMinus } from 'react-icons/lu';

import { useSidebar } from '../../context/SidebarContext';
import { upcomingMeetings } from '../../data/mockData';
import teamService from '../../services/teamService';
import notificationService from '../../services/notificationService';
import styles from './RightSidebar.module.css';

// ─── Priority colours ─────────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  high:     '#ef4444',
  medium:   '#f59e0b',
  low:      '#22c55e',
  critical: '#7c3aed',
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = () => {
  const [current, setCurrent] = useState(dayjs());
  const today = dayjs();

  const startOfMonth = current.startOf('month');
  const daysInMonth  = current.daysInMonth();
  const firstDow     = startOfMonth.day();

  const days = [];
  for (let i = 0; i < firstDow; i++) {
    const d = startOfMonth.subtract(firstDow - i, 'day');
    days.push({ date: d, otherMonth: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: current.date(i), otherMonth: false });
  }
  const trailing = 42 - days.length;
  for (let i = 1; i <= trailing; i++) {
    days.push({ date: current.endOf('month').add(i, 'day'), otherMonth: true });
  }

  return (
    <div>
      <div className={styles.calendarHeader}>
        <button
          className={styles.calendarNav}
          onClick={() => setCurrent(c => c.subtract(1, 'month'))}
          aria-label="Previous month"
        >
          <MdChevronLeft size={18} />
        </button>
        <span className={styles.calendarMonth}>
          {current.format('MMMM YYYY')}
        </span>
        <button
          className={styles.calendarNav}
          onClick={() => setCurrent(c => c.add(1, 'month'))}
          aria-label="Next month"
        >
          <MdChevronRight size={18} />
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className={styles.calendarDayName}>{d}</div>
        ))}
        {days.map(({ date, otherMonth }, idx) => {
          const isToday = date.isSame(today, 'day');
          return (
            <button
              key={idx}
              className={[
                styles.calendarDay,
                isToday      ? styles.today      : '',
                otherMonth   ? styles.otherMonth  : '',
              ].join(' ')}
              aria-label={date.format('D MMM YYYY')}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Team Stats ───────────────────────────────────────────────────────────────
const TeamStats = () => {
  const [stats, setStats]         = useState(null);
  const [recent, setRecent]       = useState([]);
  const [onLeave, setOnLeave]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      teamService.getStatistics(),
      teamService.getAll({ sort: 'newest' }),
    ]).then(([statsRes, allRes]) => {
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.data?.data || null);
      }
      if (allRes.status === 'fulfilled') {
        const emps = allRes.value?.data?.data?.employees || [];
        setRecent(emps.slice(0, 3));
        setOnLeave(emps.filter(e => e.status === 'On Leave').slice(0, 3));
      }
    }).catch(err => {
      console.error("Error fetching RightSidebar stats:", err);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const byStatus = stats.by_status || {};

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Team Overview</div>
        <div className={styles.teamStatsGrid}>
          <div className={styles.teamStat}>
            <LuUsers size={14} className={styles.teamStatIcon} style={{ color: '#3b82f6' }} />
            <div>
              <div className={styles.teamStatVal}>{stats.total}</div>
              <div className={styles.teamStatLabel}>Total</div>
            </div>
          </div>
          <div className={styles.teamStat}>
            <LuUserCheck size={14} className={styles.teamStatIcon} style={{ color: '#22c55e' }} />
            <div>
              <div className={styles.teamStatVal}>{byStatus.active || 0}</div>
              <div className={styles.teamStatLabel}>Active</div>
            </div>
          </div>
          <div className={styles.teamStat}>
            <LuUserMinus size={14} className={styles.teamStatIcon} style={{ color: '#8b5cf6' }} />
            <div>
              <div className={styles.teamStatVal}>{byStatus.on_leave || 0}</div>
              <div className={styles.teamStatLabel}>On Leave</div>
            </div>
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Recently Joined</div>
          {recent.map(emp => (
            <div key={emp.id} className={styles.teamMember}>
              <div className={styles.memberAvatar}>
                {emp.avatar
                  ? <img src={emp.avatar} alt={emp.name} className={styles.avatarImg} />
                  : emp.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{emp.name}</div>
                <div className={styles.memberRole}>{emp.designation || emp.role}</div>
              </div>
              <div className={styles.memberStatus} style={{
                background: emp.status === 'Active' ? '#22c55e22' : '#f59e0b22',
                color: emp.status === 'Active' ? '#22c55e' : '#f59e0b',
              }}>
                {emp.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {onLeave.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>On Leave</div>
          {onLeave.map(emp => (
            <div key={emp.id} className={styles.teamMember}>
              <div className={styles.memberAvatar} style={{ background: '#8b5cf622', color: '#8b5cf6' }}>
                {emp.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{emp.name}</div>
                <div className={styles.memberRole}>{emp.designation || emp.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── Latest Notifications ─────────────────────────────────────────────────────
const LatestNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    notificationService.getUnread(5)
      .then(result => {
        // notificationService.getUnread() returns an array directly
        const list = Array.isArray(result) ? result : (result?.notifications || []);
        setNotifs(list);
      })
      .catch(() => {});
  }, []);

  if (notifs.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        Latest Notifications
        <button className={styles.seeAllBtn} onClick={() => navigate('/notifications')}>
          See All <MdArrowForward size={12} />
        </button>
      </div>
      {notifs.slice(0, 4).map(notif => (
        <div key={notif.id} className={styles.notifItem}>
          <div className={styles.notifDot} style={{ background: PRIORITY_COLOR[notif.priority] || '#3b82f6' }} />
          <div className={styles.notifInfo}>
            <div className={styles.notifTitle}>{notif.title || notif.type?.replace(/_/g, ' ')}</div>
            <div className={styles.notifTime}>
              {notif.created_at ? dayjs(notif.created_at).fromNow() : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Activity Timeline ────────────────────────────────────────────────────────
const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    notificationService.getRecentActivities(5)
      .then(setActivities)
      .catch(() => {});
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Recent Activity</div>
      {activities.map(item => (
        <div key={item.id} className={styles.timelineItem}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <div className={styles.timelineText}>
              {item.title || item.type?.replace(/_/g, ' ')}
            </div>
            <div className={styles.timelineTime}>
              {item.created_at ? dayjs(item.created_at).fromNow() : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Upcoming Deadlines (from mockData for now) ──────────────────────────────
const UpcomingDeadlines = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        Quick Actions
      </div>
      <div className={styles.quickActions}>
        <button className={styles.quickActionBtn} onClick={() => navigate('/projects')}>
          <MdNotificationsActive size={16} />
          View Projects
        </button>
        <button className={styles.quickActionBtn} onClick={() => navigate('/tasks')}>
          <MdVideoCall size={16} />
          View Tasks
        </button>
        <button className={styles.quickActionBtn} onClick={() => navigate('/notifications')}>
          <MdArrowForward size={16} />
          All Notifications
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RightSidebar = () => {
  const { rightCollapsed, toggleRight } = useSidebar();

  if (rightCollapsed) {
    return (
      <aside className={`${styles.sidebar} ${styles.collapsed}`}>
        <button 
          className={styles.collapseBtn} 
          onClick={toggleRight}
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <MdChevronRight size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Calendar</div>
        <MiniCalendar />
      </div>

      <TeamStats />
      <LatestNotifications />
      <ActivityTimeline />
      <UpcomingDeadlines />

      {/* Upcoming Meetings (from mockData) */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Upcoming Meetings</div>
        {upcomingMeetings.map(meeting => (
          <div key={meeting.id} className={styles.meetingItem}>
            <div className={styles.meetingIcon}>
              <MdVideoCall size={16} />
            </div>
            <div className={styles.meetingInfo}>
              <div className={styles.meetingTitle}>{meeting.title}</div>
              <div className={styles.meetingTime}>{meeting.time}</div>
              <div className={styles.meetingPlatform}>{meeting.platform}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Collapse Button ── */}
      <button 
        className={styles.collapseBtn} 
        onClick={toggleRight}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
      >
        <MdChevronLeft size={16} />
      </button>
    </aside>
  );
};

export default RightSidebar;