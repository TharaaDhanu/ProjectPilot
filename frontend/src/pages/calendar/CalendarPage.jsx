/**
 * pages/calendar/CalendarPage.jsx
 * ---------------------------------
 * Enterprise Scheduler — upgraded Calendar module for ProjectPilot.
 *
 * Features
 *  - Month / Week / Day / Agenda views
 *  - Compact colored event chips (max 3 + "+More")
 *  - Right-side event detail drawer
 *  - Professional create/edit modal
 *  - Top toolbar: Today, Prev, Next, view switch, search, filter, create
 *  - Right sidebar: mini calendar, today's schedule, upcoming deadlines/
 *    meetings/tasks, recent activity, birthdays, employees on leave, stats
 *  - Project / Task / Team integration (virtual events)
 *  - Loading skeletons + empty states + toast notifications
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  LuChevronLeft, LuChevronRight, LuCalendarDays, LuPlus, LuSearch,
  LuSlidersHorizontal, LuCalendar, LuClock, LuFlag, LuUsers, LuStar,
  LuBriefcase, LuBell, LuCake, LuPlane, LuActivity, LuList,
  LuGrid3X3, LuColumns3, LuLoader, LuInbox,
} from 'react-icons/lu';

import DashboardLayout from '../../components/Layouts/DashboardLayout';
import calendarService from '../../services/calendarService';
import { useCalendar } from '../../hooks/useCalendar';
import EventFormModal from '../../components/Calendar/EventFormModal';
import EventDetailsDrawer, { EVENT_META } from '../../components/Calendar/EventDetailsDrawer';
import MiniCalendar from '../../components/Calendar/MiniCalendar';
import styles from './CalendarPage.module.css';

const VIEWS = [
  { key: 'month', label: 'Month', icon: LuGrid3X3 },
  { key: 'week', label: 'Week', icon: LuColumns3 },
  { key: 'day', label: 'Day', icon: LuCalendar },
  { key: 'agenda', label: 'Agenda', icon: LuList },
];

const EVENT_TYPE_FILTERS = [
  'All', 'Meeting', 'Deadline', 'Milestone', 'Leave', 'Birthday',
  'Work Anniversary', 'Holiday', 'Reminder', 'Project', 'Task',
];

const PRIORITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];

// ── Helpers ────────────────────────────────────────────────────────────────
const parseDate = (iso) => (iso ? dayjs(iso) : null);

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hr12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hr12}:${m} ${ampm}`;
};

const eventMatchesDay = (ev, day) => {
  const start = parseDate(ev.start_date);
  const end = parseDate(ev.end_date) || start;
  if (!start) return false;
  // Birthdays / anniversaries match by month+day each year
  if (ev.event_type === 'Birthday' || ev.event_type === 'Work Anniversary') {
    return start.month() === day.month() && start.date() === day.date();
  }
  return (start.isBefore(day, 'day') || start.isSame(day, 'day')) &&
         (end.isAfter(day, 'day') || end.isSame(day, 'day'));
};

const CalendarPage = () => {
  const {
    events, loading, statistics, error,
    filters, applyFilters, resetFilters,
    handleCreate, handleUpdate, handleDelete,
  } = useCalendar();

  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(dayjs());      // current month/week/day anchor
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // ── Load dashboard aggregates (sidebar) ──
  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const data = await calendarService.getDashboardData();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load scheduler dashboard:', err);
    } finally {
      setDashLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ── Filtering (client-side on top of backend filters) ──
  const visibleEvents = useMemo(() => {
    return events.filter((ev) => {
      if (filters.event_type && filters.event_type !== 'All' && ev.event_type !== filters.event_type) return false;
      if (filters.priority && filters.priority !== 'All' && ev.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${ev.title} ${ev.description || ''} ${ev.location || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const eventDates = useMemo(
    () => visibleEvents.map((e) => e.start_date).filter(Boolean),
    [visibleEvents]
  );

  // ── Navigation ──
  const goToday = () => { setCursor(dayjs()); setSelectedDate(dayjs()); };
  const goPrev = () => {
    if (view === 'month') setCursor((c) => c.subtract(1, 'month'));
    else if (view === 'week') setCursor((c) => c.subtract(1, 'week'));
    else setCursor((c) => c.subtract(1, 'day'));
  };
  const goNext = () => {
    if (view === 'month') setCursor((c) => c.add(1, 'month'));
    else if (view === 'week') setCursor((c) => c.add(1, 'week'));
    else setCursor((c) => c.add(1, 'day'));
  };

  const title = useMemo(() => {
    if (view === 'month') return cursor.format('MMMM YYYY');
    if (view === 'week') {
      const start = cursor.startOf('week');
      const end = cursor.endOf('week');
      return `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
    }
    if (view === 'day') return cursor.format('dddd, MMMM D, YYYY');
    return 'Agenda';
  }, [view, cursor]);

  // ── Month grid ──
  const monthDays = useMemo(() => {
    const start = cursor.startOf('month').startOf('week');
    const days = [];
    for (let i = 0; i < 42; i++) days.push(start.add(i, 'day'));
    return days;
  }, [cursor]);

  // ── Week grid ──
  const weekDays = useMemo(() => {
    const start = cursor.startOf('week');
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  }, [cursor]);

  // ── Handlers ──
  const openCreate = (presetDate) => {
    setEditingEvent(null);
    if (presetDate) {
      // pass a partial event so the modal pre-fills the date
      setEditingEvent({ start_date: dayjs(presetDate).format('YYYY-MM-DD') });
    }
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setDetailEvent(null);
    setEditingEvent(ev);
    setModalOpen(true);
  };

  const onModalSubmit = async (payload) => {
    if (editingEvent && editingEvent.id && !editingEvent.is_virtual) {
      await handleUpdate(editingEvent.id, payload);
    } else {
      await handleCreate(payload);
    }
    setModalOpen(false);
    setEditingEvent(null);
    loadDashboard();
  };

  const onDelete = async (ev) => {
    if (window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) {
      await handleDelete(ev.id, ev.title);
      setDetailEvent(null);
      loadDashboard();
    }
  };

  // ── Render event chip ──
  const renderChip = (ev, showTime = false) => {
    const meta = EVENT_META[ev.event_type] || EVENT_META.Personal;
    const color = ev.color || meta.color;
    return (
      <button
        key={ev.id}
        className={styles.chip}
        style={{ background: `${color}22`, borderColor: `${color}55`, color }}
        onClick={(e) => { e.stopPropagation(); setDetailEvent(ev); }}
        title={ev.title}
      >
        <span className={styles.chipDot} style={{ background: color }} />
        {showTime && ev.start_time && !ev.is_all_day && (
          <span className={styles.chipTime}>{formatTime(ev.start_time)}</span>
        )}
        <span className={styles.chipLabel}>{ev.title}</span>
      </button>
    );
  };

  const isLoading = loading || dashLoading;

  return (
    <DashboardLayout pageTitle="Calendar">
      <div className={styles.page}>
        {/* ── Header + Toolbar ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Scheduler</h1>
            <p className={styles.pageSubtitle}>Plan meetings, deadlines, projects & team events</p>
          </div>

          <div className={styles.toolbar}>
            <button className={styles.todayBtn} onClick={goToday}>Today</button>
            <div className={styles.navGroup}>
              <button className={styles.navBtn} onClick={goPrev} aria-label="Previous"><LuChevronLeft size={16} /></button>
              <button className={styles.navBtn} onClick={goNext} aria-label="Next"><LuChevronRight size={16} /></button>
            </div>
            <h2 className={styles.viewTitle}>{title}</h2>

            <div className={styles.viewSwitch}>
              {VIEWS.map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.key}
                    className={`${styles.viewBtn} ${view === v.key ? styles.viewBtnActive : ''}`}
                    onClick={() => setView(v.key)}
                  >
                    <Icon size={14} /> {v.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.toolActions}>
              <button className={styles.iconBtn} onClick={() => setSearchOpen((s) => !s)} aria-label="Search" title="Search">
                <LuSearch size={16} />
              </button>
              <button className={styles.iconBtn} onClick={() => setFilterOpen((f) => !f)} aria-label="Filter" title="Filter">
                <LuSlidersHorizontal size={16} />
              </button>
              <button className={styles.createBtn} onClick={() => openCreate()}>
                <LuPlus size={16} /> Create Event
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className={styles.searchBar}>
              <LuSearch size={15} />
              <input
                autoFocus
                placeholder="Search events by title, description, location…"
                value={filters.search}
                onChange={(e) => applyFilters({ search: e.target.value })}
              />
            </div>
          )}

          {/* Filter bar */}
          {filterOpen && (
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Type</span>
                <div className={styles.pills}>
                  {EVENT_TYPE_FILTERS.map((t) => (
                    <button
                      key={t}
                      className={`${styles.pill} ${filters.event_type === t ? styles.pillActive : ''}`}
                      onClick={() => applyFilters({ event_type: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Priority</span>
                <div className={styles.pills}>
                  {PRIORITY_FILTERS.map((p) => (
                    <button
                      key={p}
                      className={`${styles.pill} ${filters.priority === p ? styles.pillActive : ''}`}
                      onClick={() => applyFilters({ priority: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button className={styles.resetBtn} onClick={resetFilters}>Reset</button>
            </div>
          )}
        </div>

        <div className={styles.layout}>
          {/* ── Main calendar area ── */}
          <div className={styles.mainCard}>
            {isLoading ? (
              <SkeletonView view={view} />
            ) : error ? (
              <div className={styles.errorState}>
                <LuInbox size={32} />
                <p>Failed to load calendar events.</p>
                <span>{error}</span>
              </div>
            ) : visibleEvents.length === 0 && view === 'month' ? (
              <div className={styles.emptyState}>
                <LuCalendarDays size={40} />
                <h3>No events this period</h3>
                <p>Create your first event or sync projects & tasks.</p>
                <button className={styles.createBtn} onClick={() => openCreate()}><LuPlus size={15} /> Create Event</button>
              </div>
            ) : (
              <>
                {view === 'month' && (
                  <>
                    <div className={styles.weekdays}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className={styles.weekday}>{d}</div>
                      ))}
                    </div>
                    <div className={styles.monthGrid}>
                      {monthDays.map((day) => {
                        const inMonth = day.month() === cursor.month();
                        const isToday = day.isSame(dayjs(), 'day');
                        const dayEvents = visibleEvents.filter((ev) => eventMatchesDay(ev, day));
                        const shown = dayEvents.slice(0, 3);
                        const extra = dayEvents.length - shown.length;
                        return (
                          <div
                            key={day.format('YYYY-MM-DD')}
                            className={[
                              styles.dayCell,
                              inMonth ? '' : styles.dayCellOther,
                              isToday ? styles.today : '',
                            ].join(' ')}
                            onClick={() => { setSelectedDate(day); setView('day'); setCursor(day); }}
                          >
                            <span className={styles.dayNum}>{day.date()}</span>
                            <div className={styles.chipList}>
                              {shown.map((ev) => renderChip(ev))}
                              {extra > 0 && (
                                <span className={styles.moreChips}>+{extra} more</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {view === 'week' && (
                  <div className={styles.weekView}>
                    <div className={styles.weekHead}>
                      {weekDays.map((day) => (
                        <div key={day.format('YYYY-MM-DD')} className={`${styles.weekHeadCell} ${day.isSame(dayjs(), 'day') ? styles.today : ''}`}>
                          <span className={styles.weekDayName}>{day.format('ddd')}</span>
                          <span className={styles.weekDayNum}>{day.date()}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.weekBody}>
                      {weekDays.map((day) => {
                        const dayEvents = visibleEvents.filter((ev) => eventMatchesDay(ev, day));
                        return (
                          <div key={day.format('YYYY-MM-DD')} className={styles.weekCol} onClick={() => { setSelectedDate(day); setView('day'); setCursor(day); }}>
                            {dayEvents.length === 0 && <span className={styles.noEv}>—</span>}
                            {dayEvents.map((ev) => renderChip(ev, true))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === 'day' && (
                  <div className={styles.dayView}>
                    {(() => {
                      const dayEvents = visibleEvents
                        .filter((ev) => eventMatchesDay(ev, cursor))
                        .sort((a, b) => (a.start_time || '99').localeCompare(b.start_time || '99'));
                      if (dayEvents.length === 0) {
                        return (
                          <div className={styles.emptyState}>
                            <LuCalendar size={36} />
                            <h3>Nothing scheduled</h3>
                            <p>{cursor.format('MMMM D, YYYY')}</p>
                            <button className={styles.createBtn} onClick={() => openCreate(cursor)}><LuPlus size={15} /> Add Event</button>
                          </div>
                        );
                      }
                      return dayEvents.map((ev) => {
                        const meta = EVENT_META[ev.event_type] || EVENT_META.Personal;
                        const color = ev.color || meta.color;
                        return (
                          <button key={ev.id} className={styles.dayEventRow} style={{ borderLeftColor: color }} onClick={() => setDetailEvent(ev)}>
                            <span className={styles.dayEventTime}>
                              {ev.is_all_day ? 'All day' : (ev.start_time ? formatTime(ev.start_time) : '—')}
                            </span>
                            <span className={styles.dayEventDot} style={{ background: color }} />
                            <span className={styles.dayEventTitle}>{ev.title}</span>
                            <span className={styles.dayEventType} style={{ color }}>{ev.event_type}</span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}

                {view === 'agenda' && (
                  <div className={styles.agendaView}>
                    {(() => {
                      const sorted = [...visibleEvents].sort((a, b) => {
                        const da = parseDate(a.start_date); const db = parseDate(b.start_date);
                        if (!da) return 1; if (!db) return -1;
                        return da.isBefore(db) ? -1 : 1;
                      });
                      if (sorted.length === 0) {
                        return <div className={styles.emptyState}><LuList size={36} /><h3>No events</h3></div>;
                      }
                      // group by month
                      const groups = {};
                      sorted.forEach((ev) => {
                        const key = parseDate(ev.start_date)?.format('MMMM YYYY') || 'Undated';
                        (groups[key] = groups[key] || []).push(ev);
                      });
                      return Object.entries(groups).map(([month, evs]) => (
                        <div key={month} className={styles.agendaGroup}>
                          <div className={styles.agendaMonth}>{month}</div>
                          {evs.map((ev) => {
                            const meta = EVENT_META[ev.event_type] || EVENT_META.Personal;
                            const color = ev.color || meta.color;
                            const d = parseDate(ev.start_date);
                            return (
                              <button key={ev.id} className={styles.agendaItem} onClick={() => setDetailEvent(ev)}>
                                <div className={styles.agendaDate}>
                                  <span className={styles.agendaDay}>{d ? d.format('D') : '—'}</span>
                                  <span className={styles.agendaMon}>{d ? d.format('MMM') : ''}</span>
                                </div>
                                <span className={styles.agendaDot} style={{ background: color }} />
                                <div className={styles.agendaInfo}>
                                  <span className={styles.agendaTitle}>{ev.title}</span>
                                  <span className={styles.agendaMeta}>
                                    {ev.event_type}
                                    {ev.start_time && !ev.is_all_day ? ` · ${formatTime(ev.start_time)}` : ''}
                                    {ev.location ? ` · ${ev.location}` : ''}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}><LuCalendarDays size={15} /><h3>Mini Calendar</h3></div>
              <MiniCalendar
                selectedDate={selectedDate.toDate()}
                onSelectDate={(d) => { setSelectedDate(dayjs(d)); setCursor(dayjs(d)); setView('day'); }}
                eventDates={eventDates}
              />
            </div>

            <SideSection
              icon={LuClock} title="Today's Schedule"
              loading={dashLoading} empty={!dashboard?.today_schedule?.length}
              emptyText="Nothing scheduled today."
            >
              {dashboard?.today_schedule?.map((ev) => <EventMiniRow key={ev.id} ev={ev} onClick={() => setDetailEvent(ev)} />)}
            </SideSection>

            <SideSection
              icon={LuFlag} title="Upcoming Deadlines"
              loading={dashLoading} empty={!dashboard?.upcoming_deadlines?.length}
              emptyText="No upcoming deadlines."
            >
              {dashboard?.upcoming_deadlines?.map((ev) => <EventMiniRow key={ev.id} ev={ev} onClick={() => setDetailEvent(ev)} />)}
            </SideSection>

            <SideSection
              icon={LuUsers} title="Upcoming Meetings"
              loading={dashLoading} empty={!dashboard?.upcoming_meetings?.length}
              emptyText="No upcoming meetings."
            >
              {dashboard?.upcoming_meetings?.map((ev) => <EventMiniRow key={ev.id} ev={ev} onClick={() => setDetailEvent(ev)} />)}
            </SideSection>

            <SideSection
              icon={LuBriefcase} title="Upcoming Tasks"
              loading={dashLoading} empty={!dashboard?.upcoming_tasks?.length}
              emptyText="No upcoming tasks."
            >
              {dashboard?.upcoming_tasks?.map((ev) => <EventMiniRow key={ev.id} ev={ev} onClick={() => setDetailEvent(ev)} />)}
            </SideSection>

            <SideSection
              icon={LuActivity} title="Recent Activity"
              loading={dashLoading} empty={!dashboard?.recent_activity?.length}
              emptyText="No recent activity."
            >
              {dashboard?.recent_activity?.map((ev) => (
                <div key={ev.id} className={styles.activityItem}>
                  <span className={styles.activityDot} style={{ background: ev.color || '#8b5cf6' }} />
                  <span className={styles.activityText}>{ev.title}</span>
                  <span className={styles.activityTime}>
                    {ev.created_at ? dayjs(ev.created_at).format('MMM D') : ''}
                  </span>
                </div>
              ))}
            </SideSection>

            <SideSection
              icon={LuCake} title="Birthdays"
              loading={dashLoading} empty={!dashboard?.birthdays?.length}
              emptyText="No upcoming birthdays."
            >
              {dashboard?.birthdays?.map((ev) => (
                <div key={ev.id} className={styles.birthdayItem}>
                  <span className={styles.birthdayIcon}>🎂</span>
                  <span className={styles.birthdayName}>{ev.employee_name}</span>
                  <span className={styles.birthdayDate}>{dayjs(ev.start_date).format('MMM D')}</span>
                </div>
              ))}
            </SideSection>

            <SideSection
              icon={LuPlane} title="Employees On Leave"
              loading={dashLoading} empty={!dashboard?.employees_on_leave?.length}
              emptyText="No one is on leave."
            >
              {dashboard?.employees_on_leave?.map((emp) => (
                <div key={emp.id} className={styles.leaveItem}>
                  <div className={styles.leaveAvatar}>{emp.name?.charAt(0).toUpperCase()}</div>
                  <div className={styles.leaveInfo}>
                    <span className={styles.leaveName}>{emp.name}</span>
                    <span className={styles.leaveRole}>{emp.designation || emp.role}</span>
                  </div>
                  <span className={styles.leaveChip}>On Leave</span>
                </div>
              ))}
            </SideSection>

            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}><LuStar size={15} /><h3>Quick Statistics</h3></div>
              {dashLoading || !dashboard?.quick_stats ? (
                <div className={styles.statSkeleton} />
              ) : (
                <div className={styles.quickStats}>
                  <Stat value={dashboard.quick_stats.total} label="Total" color="#8b5cf6" />
                  <Stat value={dashboard.quick_stats.meetings} label="Meetings" color="#3b82f6" />
                  <Stat value={dashboard.quick_stats.tasks} label="Tasks" color="#22c55e" />
                  <Stat value={dashboard.quick_stats.deadlines} label="Deadlines" color="#ef4444" />
                  <Stat value={dashboard.quick_stats.milestones} label="Milestones" color="#f59e0b" />
                  <Stat value={dashboard.quick_stats.leaves} label="Leaves" color="#06b6d4" />
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── Modals / Drawers ── */}
        {modalOpen && (
          <EventFormModal
            event={editingEvent}
            onClose={() => { setModalOpen(false); setEditingEvent(null); }}
            onSubmit={onModalSubmit}
          />
        )}

        {detailEvent && (
          <EventDetailsDrawer
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Sidebar section wrapper ──────────────────────────────────────────────────
const SideSection = ({ icon: Icon, title, loading, empty, emptyText, children }) => (
  <div className={styles.sideCard}>
    <div className={styles.sideCardHeader}><Icon size={15} /><h3>{title}</h3></div>
    {loading ? (
      <div className={styles.listSkeleton} />
    ) : empty ? (
      <p className={styles.emptyMsg}>{emptyText}</p>
    ) : (
      <div className={styles.sideList}>{children}</div>
    )}
  </div>
);

const EventMiniRow = ({ ev, onClick }) => {
  const meta = EVENT_META[ev.event_type] || EVENT_META.Personal;
  const color = ev.color || meta.color;
  return (
    <button className={styles.miniRow} onClick={onClick}>
      <span className={styles.miniDot} style={{ background: color }} />
      <span className={styles.miniTitle}>{ev.title}</span>
      <span className={styles.miniDate}>
        {ev.start_time && !ev.is_all_day ? formatTime(ev.start_time) : (ev.start_date ? dayjs(ev.start_date).format('MMM D') : '')}
      </span>
    </button>
  );
};

const Stat = ({ value, label, color }) => (
  <div className={styles.qStat}>
    <span className={styles.qVal} style={{ color }}>{value ?? 0}</span>
    <span className={styles.qLabel}>{label}</span>
  </div>
);

const SkeletonView = ({ view }) => (
  <div className={styles.skeleton}>
    <LuLoader size={28} className={styles.spin} />
    <span>Loading scheduler…</span>
  </div>
);

export default CalendarPage;