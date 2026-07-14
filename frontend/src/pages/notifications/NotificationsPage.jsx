/**
 * pages/notifications/NotificationsPage.jsx
 * ------------------------------------------
 * Full notifications management page with:
 * - Summary cards (Total, Unread, High Priority, Today)
 * - Search, filter, sort
 * - Notification list with mark read / delete
 * - Activity timeline
 */

import React, { useState, useCallback } from 'react';
import {
  MdNotifications,
  MdMarkEmailRead,
  MdSearch,
  MdFilterList,
  MdSort,
  MdNotificationsOff,
  MdToday,
  MdPriorityHigh,
  MdEmail,
} from 'react-icons/md';

import DashboardLayout from '../../components/Layouts/DashboardLayout';
import NotificationCard from '../../components/Notifications/NotificationCard';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './NotificationsPage.module.css';

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'project_updated', label: 'Project Updated' },
  { value: 'project_completed', label: 'Project Completed' },
  { value: 'task_assigned', label: 'Task Assigned' },
  { value: 'task_updated', label: 'Task Updated' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'employee_added', label: 'Employee Added' },
  { value: 'employee_removed', label: 'Employee Removed' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'deadline_reminder', label: 'Deadline Reminder' },
  { value: 'system_alert', label: 'System Alert' },
];

const DATE_FILTER_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const NotificationsPage = () => {
  const {
    notifications,
    total,
    unreadCount,
    summary,
    activities,
    loading,
    error,
    setParams,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    refreshAll,
  } = useNotifications({ limit: 50 });

  // ── Local filter state ────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const applyFilters = useCallback(() => {
    const params = {
      limit: 50,
      offset: 0,
      sort: sortBy,
      search: search || undefined,
    };
    if (filterStatus === 'unread') params.unread_only = true;
    if (filterStatus === 'read') params.read_only = true;
    if (filterPriority) params.priority = filterPriority;
    if (filterType) params.type = filterType;
    if (filterDate) params.date_filter = filterDate;
    setParams(params);
  }, [search, filterStatus, filterPriority, filterType, filterDate, sortBy, setParams]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  // ── Summary cards data ────────────────────────────────────────────────
  const summaryCards = [
    {
      label: 'Total Notifications',
      value: summary?.total ?? total,
      icon: MdNotifications,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      label: 'Unread',
      value: summary?.unread ?? unreadCount,
      icon: MdEmail,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      label: 'High Priority',
      value: summary?.high_priority ?? 0,
      icon: MdPriorityHigh,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
    },
    {
      label: "Today's Notifications",
      value: summary?.todays_count ?? 0,
      icon: MdToday,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
    },
  ];

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className={styles.page}>
        {/* ── Summary Cards ── */}
        <div className={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <div key={card.label} className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: card.bg, color: card.color }}>
                <card.icon size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <div className={styles.summaryValue}>{card.value}</div>
                <div className={styles.summaryLabel}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by title, message, project, task..."
              value={search}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <MdFilterList size={16} />
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setTimeout(applyFilters, 0); }}
              >
                {FILTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <select
              className={styles.filterSelect}
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setTimeout(applyFilters, 0); }}
            >
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setTimeout(applyFilters, 0); }}
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setTimeout(applyFilters, 0); }}
            >
              {DATE_FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className={styles.filterGroup}>
              <MdSort size={16} />
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setTimeout(applyFilters, 0); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.toolbarActions}>
            {unreadCount > 0 && (
              <button className={styles.actionBtn} onClick={handleMarkAllAsRead}>
                <MdMarkEmailRead size={16} />
                Mark All Read
              </button>
            )}
            <button className={styles.actionBtn} onClick={refreshAll}>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Notification List ── */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <MdNotificationsOff size={48} />
              <p>Failed to load notifications</p>
              <span>{error}</span>
              <button className={styles.retryBtn} onClick={refreshAll}>Retry</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <MdNotificationsOff size={48} />
              <p>No notifications found</p>
              <span>Try adjusting your filters or search terms</span>
            </div>
          ) : (
            <div className={styles.notifList}>
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  onMarkRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Activity Timeline ── */}
        {activities.length > 0 && (
          <div className={styles.timelineSection}>
            <h3 className={styles.timelineTitle}>Recent Activity Timeline</h3>
            <div className={styles.timeline}>
              {activities.map((activity) => (
                <div key={activity.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineType}>
                        {activity.title || activity.type?.replace(/_/g, ' ')}
                      </span>
                      <span className={styles.timelineTime}>
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleString()
                          : ''}
                      </span>
                    </div>
                    <p className={styles.timelineMessage}>{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;