/**
 * hooks/useCalendar.js
 * --------------------
 * Custom hook for scheduler state, filtering, stats, and CRUD operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import calendarService from '../services/calendarService';

export const useCalendar = (initialFilters = {}) => {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    project_id: '',
    task_id: '',
    employee_id: '',
    priority: '',
    status: '',
    event_type: '',
    search: '',
    ...initialFilters
  });

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(k => {
        if (filters[k] !== '' && filters[k] !== null) {
          cleanFilters[k] = filters[k];
        }
      });
      const data = await calendarService.getEvents(cleanFilters);
      setEvents(data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch calendar events.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await calendarService.getStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to fetch calendar statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Upcoming Events
  const fetchUpcoming = useCallback(async (limit = 8) => {
    try {
      const data = await calendarService.getUpcoming(limit);
      setUpcoming(data || []);
    } catch (err) {
      console.error('Failed to fetch upcoming calendar events:', err);
    }
  }, []);

  // Fetch Today's Events
  const fetchToday = useCallback(async () => {
    try {
      const data = await calendarService.getToday();
      setTodayEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch today\'s schedule:', err);
    }
  }, []);

  // Fetch aggregated dashboard data (sidebar + reports)
  const fetchDashboard = useCallback(async () => {
    try {
      const data = await calendarService.getDashboardData();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch scheduler dashboard:', err);
    }
  }, []);

  // Sync all on filter change or mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchStats();
    fetchUpcoming();
    fetchToday();
    fetchDashboard();
  }, [fetchStats, fetchUpcoming, fetchToday, fetchDashboard]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      project_id: '',
      task_id: '',
      employee_id: '',
      priority: '',
      status: '',
      event_type: '',
      search: ''
    });
  }, []);

  // Actions
  const handleCreate = async (eventData) => {
    try {
      const newEvent = await calendarService.createEvent(eventData);
      toast.success(`Event "${newEvent.title}" created successfully.`);
      fetchEvents();
      fetchStats();
      fetchUpcoming();
      fetchToday();
      return newEvent;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create calendar event.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const handleUpdate = async (id, eventData) => {
    try {
      const updated = await calendarService.updateEvent(id, eventData);
      toast.success(`Event "${updated.title}" updated successfully.`);
      
      // Update local state immediately
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      fetchStats();
      fetchUpcoming();
      fetchToday();
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update calendar event.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await calendarService.deleteEvent(id);
      toast.success(`Event "${title || 'Event'}" deleted successfully.`);
      setEvents(prev => prev.filter(e => e.id !== id));
      fetchStats();
      fetchUpcoming();
      fetchToday();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete calendar event.';
      toast.error(msg);
    }
  };

  return {
    events,
    upcoming,
    todayEvents,
    statistics,
    loading,
    statsLoading,
    error,
    filters,
    applyFilters,
    resetFilters,
    refreshEvents: fetchEvents,
    refreshStats: fetchStats,
    refreshUpcoming: fetchUpcoming,
    refreshToday: fetchToday,
    handleCreate,
    handleUpdate,
    handleDelete,
    refreshDashboard: fetchDashboard,
    dashboard
  };
};
