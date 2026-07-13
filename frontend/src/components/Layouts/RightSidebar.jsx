/**
 * components/Layouts/RightSidebar.jsx
 * ----------------------------------------
 * Fixed right utility sidebar containing:
 * - Mini monthly calendar (dayjs)
 * - Live team stats (from /api/team/statistics)
 * - Recently joined employees
 * - Activity timeline
 * - Upcoming meetings
 */

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { MdChevronLeft, MdChevronRight, MdVideoCall } from 'react-icons/md';
import { LuUsers, LuUserCheck, LuUserMinus } from 'react-icons/lu';

import { activityTimeline, upcomingMeetings } from '../../data/mockData';
import teamService from '../../services/teamService';
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
  const firstDow     = startOfMonth.day(); // 0=Sun

  const days = [];

  // Padding from previous month
  for (let i = 0; i < firstDow; i++) {
    const d = startOfMonth.subtract(firstDow - i, 'day');
    days.push({ date: d, otherMonth: true });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: current.date(i), otherMonth: false });
  }
  // Trailing padding to complete grid
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
      {/* Team Overview */}
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

      {/* Recently Joined */}
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
                <div className={styles.memberRole}>{emp.role}</div>
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

      {/* On Leave */}
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

// ─── Main Component ───────────────────────────────────────────────────────────
const RightSidebar = () => {
  return (
    <aside className={styles.sidebar}>

      {/* Mini Calendar */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Calendar</div>
        <MiniCalendar />
      </div>

      {/* Live Team Stats */}
      <TeamStats />

      {/* Activity Timeline */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recent Activity</div>
        {activityTimeline.map(item => (
          <div key={item.id} className={styles.timelineItem}>
            <div
              className={styles.timelineAvatar}
              style={{ background: item.color + '22', color: item.color }}
            >
              {item.avatar}
            </div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineText}>
                <strong>{item.user}</strong> {item.action} <strong>{item.target}</strong>
              </div>
              <div className={styles.timelineTime}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Meetings */}
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

    </aside>
  );
};

export default RightSidebar;
