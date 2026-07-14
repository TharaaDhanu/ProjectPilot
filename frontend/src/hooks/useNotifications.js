/**
 * hooks/useNotifications.js
 * -------------------------
 * Custom hook for notification state management.
 * Provides notifications list, unread count, CRUD operations, and polling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

const POLL_INTERVAL = 30000; // 30 seconds

export const useNotifications = (initialParams = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    limit: 20,
    offset: 0,
    sort: 'newest',
    ...initialParams,
  });

  const pollRef = useRef(null);

  // ── Fetch notifications with current params ────────
  const fetchNotifications = useCallback(async (overrideParams) => {
    try {
      const mergedParams = { ...params, ...(overrideParams || {}) };
      const result = await notificationService.getNotifications(mergedParams);
      setNotifications(result.notifications || []);
      setTotal(result.total || 0);
      setError(null);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      return null;
    } finally {
      setLoading(false);
    }
  }, [params]);

  // ── Fetch unread count ──────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch {
      // silent
    }
  }, []);

  // ── Fetch summary ───────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const data = await notificationService.getSummary();
      setSummary(data);
    } catch {
      // silent
    }
  }, []);

  // ── Fetch activities ─────────────────────────────────
  const fetchActivities = useCallback(async (limit = 10) => {
    try {
      const data = await notificationService.getRecentActivities(limit);
      setActivities(data || []);
    } catch {
      // silent
    }
  }, []);

  // ── Initial fetch + polling ──────────────────────────
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchSummary();
    fetchActivities();

    // Poll for new notifications
    pollRef.current = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update params and refetch ────────────────────────
  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
    setLoading(true);
  }, []);

  // Re-fetch when params change
  useEffect(() => {
    if (loading) {
      fetchNotifications();
    }
  }, [params, loading, fetchNotifications]);

  // ── Mark single as read ──────────────────────────────
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as read');
    }
  }, []);

  // ── Mark all as read ────────────────────────────────
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark all as read');
    }
  }, []);

  // ── Delete notification ─────────────────────────────
  const handleDelete = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notification');
    }
  }, [notifications]);

  // ── Refresh all data ─────────────────────────────────
  const refreshAll = useCallback(() => {
    setLoading(true);
    fetchNotifications();
    fetchUnreadCount();
    fetchSummary();
    fetchActivities();
  }, [fetchNotifications, fetchUnreadCount, fetchSummary, fetchActivities]);

  return {
    // State
    notifications,
    total,
    unreadCount,
    summary,
    activities,
    loading,
    error,
    params,

    // Actions
    setParams: updateParams,
    fetchNotifications,
    fetchUnreadCount,
    fetchSummary,
    fetchActivities,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    refreshAll,
  };
};

export default useNotifications;