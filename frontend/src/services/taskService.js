/**
 * services/taskService.js
 * ------------------------
 * Axios-based client service for Task Management APIs.
 */

import api from './api';

const taskService = {
  /**
   * Fetch all tasks with optional filters
   * @param {Object} filters - { project_id, assigned_to, status, priority, sort, search }
   */
  getTasks: async (filters = {}) => {
    const response = await api.get('/api/tasks', { params: filters });
    return response.data.data;
  },

  /**
   * Fetch a single task by ID
   */
  getTaskById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Create a new task
   */
  createTask: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data.data;
  },

  /**
   * Update task properties (e.g. status, progress, checklist, timer, etc.)
   */
  updateTask: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data.data;
  },

  /**
   * Permanently delete a task
   */
  deleteTask: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Fetch task statistics (Total, Pending, Completed, status/priority breakdown)
   */
  getStatistics: async () => {
    const response = await api.get('/api/tasks/statistics');
    return response.data.data;
  },

  /**
   * Search tasks by query
   */
  searchTasks: async (query) => {
    const response = await api.get('/api/tasks/search', { params: { query } });
    return response.data.data;
  },

  /**
   * Fetch all registered users in the system (for assignment dropdown)
   */
  getUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data.data;
  },

  /**
   * Fetch user notifications
   * @returns {Array} notifications array
   */
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    const payload = response.data.data;
    // Backend returns { notifications: [...], total: N }
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    return [];
  },

  /**
   * Mark a single notification as read
   */
  markNotificationRead: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async () => {
    const response = await api.post('/api/notifications/read-all');
    return response.data.data;
  },
};

export default taskService;
