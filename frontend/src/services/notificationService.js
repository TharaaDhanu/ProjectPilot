/**
 * services/notificationService.js
 * -------------------------------
 * API wrapper for Notification endpoints.
 * Follows the pattern of projectService.js and teamService.js.
 *
 * All methods return predictable shapes:
 *   - List methods always return an array (fallback [])
 *   - Count methods always return a number
 *   - Single-object methods return object or null
 */

import api from './api';

/**
 * Safely extract array from backend response.
 * Backend envelope: { success: true, data: { notifications: [...], total: N } }
 * or sometimes: { success: true, data: [...] }
 */
const extractList = (response) => {
  const data = response?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  return [];
};

const extractData = (response) => {
  return response?.data?.data || null;
};

const notificationService = {
  /**
   * Fetch notifications with optional filters.
   * @returns {Array} notifications list
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/api/notifications', { params });
    return extractList(response);
  },

  /**
   * Fetch only unread notifications.
   * @returns {Array} unread notifications list
   */
  getUnread: async (limit = 20) => {
    const response = await api.get('/api/notifications/unread', { params: { limit } });
    return extractList(response);
  },

  /**
   * Create a new notification (admin/system use).
   * @returns {object|null} created notification
   */
  createNotification: async (data) => {
    const response = await api.post('/api/notifications', data);
    return extractData(response);
  },

  /**
   * Get unread count for badge.
   * @returns {number} count
   */
  getUnreadCount: async () => {
    const response = await api.get('/api/notifications/unread-count');
    const data = extractData(response);
    return data?.count ?? 0;
  },

  /**
   * Get summary statistics (total, unread, high_priority, todays_count).
   * @returns {object}
   */
  getSummary: async () => {
    const response = await api.get('/api/notifications/summary');
    return extractData(response);
  },

  /**
   * Get recent activity feed.
   * @returns {Array} activities list
   */
  getRecentActivities: async (limit = 10) => {
    const response = await api.get('/api/notifications/activities', { params: { limit } });
    return extractList(response);
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id) => {
    const response = await api.put(`/api/notifications/read/${id}`);
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification.
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;