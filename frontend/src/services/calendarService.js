/**
 * services/calendarService.js
 * ----------------------------
 * API call functions for the Calendar/Scheduler module.
 * Follows the pattern of teamService.js and projectService.js.
 */

import api from './api';

const calendarService = {
  /**
   * Fetch all calendar events (manual & virtual) with filters.
   * @param {object} params - { project_id, task_id, employee_id, priority, status, event_type, search }
   */
  getEvents: async (params = {}) => {
    const response = await api.get('/calendar/events/', { params });
    return response.data.data;
  },

  /**
   * Fetch a single manual calendar event by ID.
   */
  getEventById: async (id) => {
    const response = await api.get(`/calendar/events/${id}/`);
    return response.data.data;
  },

  /**
   * Create a new manual calendar event.
   */
  createEvent: async (eventData) => {
    const response = await api.post('/calendar/events/', eventData);
    return response.data.data;
  },

  /**
   * Update an existing manual calendar event.
   */
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/calendar/events/${id}/`, eventData);
    return response.data.data;
  },

  /**
   * Delete a manual calendar event.
   */
  deleteEvent: async (id) => {
    const response = await api.delete(`/calendar/events/${id}/`);
    return response.data.data;
  },

  /**
   * Fetch upcoming calendar events (next 30 days).
   */
  getUpcoming: async (limit = 8) => {
    const response = await api.get('/calendar/upcoming/', { params: { limit } });
    return response.data.data;
  },

  /**
   * Fetch today's schedule items.
   */
  getToday: async () => {
    const response = await api.get('/calendar/today/');
    return response.data.data;
  },

  /**
   * Fetch aggregated statistics.
   */
  getStatistics: async () => {
    const response = await api.get('/calendar/statistics/');
    return response.data.data;
  },

  /**
   * Fetch all sidebar/report aggregates (today's schedule, upcoming
   * deadlines/meetings/tasks, birthdays, on-leave, recent activity, stats).
   */
  getDashboardData: async () => {
    const response = await api.get('/calendar/dashboard/');
    return response.data.data;
  }
};

export default calendarService;
