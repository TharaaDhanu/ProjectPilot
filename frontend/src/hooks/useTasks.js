/**
 * hooks/useTasks.js
 * -----------------
 * Reusable hook for loading tasks, statistics, assignable users,
 * and performing task mutations (create, update, delete, timer, comments).
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import taskService from '../services/taskService';

export const useTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    pending_tasks: 0,
    completion_rate: 0,
    priorities: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    statuses: { 'To Do': 0, 'In Progress': 0, 'In Review': 0, Blocked: 0, Completed: 0, Cancelled: 0, Archived: 0 }
  });
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    project_id: '',
    assigned_to: '',
    status: '',
    priority: '',
    sort: 'newest',
    search: '',
    ...initialFilters
  });

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean empty string values from filters
      const cleanFilters = {};
      Object.keys(filters).forEach(k => {
        if (filters[k] !== '') cleanFilters[k] = filters[k];
      });
      const data = await taskService.getTasks(cleanFilters);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await taskService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch task stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Users (for dropdowns)
  const fetchUsers = useCallback(async () => {
    try {
      const data = await taskService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch assignees:', err);
    }
  }, []);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await taskService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Run on mount / filters update
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchNotifications();
  }, [fetchStats, fetchUsers, fetchNotifications]);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Actions
  const handleCreate = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      toast.success(`Task "${newTask.title}" created successfully.`);
      fetchTasks();
      fetchStats();
      fetchNotifications();
      return newTask;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task.';
      throw new Error(msg);
    }
  };

  const handleUpdate = async (id, taskData) => {
    try {
      const updated = await taskService.updateTask(id, taskData);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      fetchStats();
      fetchNotifications();
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task.';
      throw new Error(msg);
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await taskService.deleteTask(id);
      toast.success(`Task "${title}" deleted successfully.`);
      setTasks(prev => prev.filter(t => t.id !== id));
      fetchStats();
      fetchNotifications();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      toast.error(msg);
    }
  };

  const handleArchive = async (id) => {
    try {
      await handleUpdate(id, { status: 'Archived' });
      toast.success('Task archived successfully.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await handleUpdate(id, { status: 'To Do' });
      toast.success('Task restored successfully.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDuplicate = async (task) => {
    try {
      const dupData = {
        title: `${task.title} (Copy)`,
        description: task.description,
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        status: 'To Do',
        priority: task.priority,
        progress: 0,
        estimated_hours: task.estimated_hours,
        labels: task.labels || [],
        checklist: (task.checklist || []).map(c => ({ ...c, completed: false })),
        subtasks: (task.subtasks || []).map(s => ({ ...s, completed: false }))
      };
      await handleCreate(dupData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFavorite = async (id, isFavorite) => {
    try {
      await handleUpdate(id, { is_favorite: isFavorite });
      toast.info(isFavorite ? 'Added to favorites.' : 'Removed from favorites.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Kanban drag and drop update
  const handleMoveTask = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await taskService.updateTask(taskId, { status: newStatus });
      fetchStats();
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move task.');
      fetchTasks(); // rollback
    }
  };

  // Mark single notification read
  const handleMarkNotifRead = async (notifId) => {
    try {
      await taskService.markNotificationRead(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all read
  const handleMarkAllNotifsRead = async () => {
    try {
      await taskService.markAllNotificationsRead();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    tasks,
    stats,
    users,
    notifications,
    loading,
    statsLoading,
    error,
    filters,
    applyFilters,
    fetchTasks,
    fetchStats,
    fetchNotifications,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchive,
    handleRestore,
    handleDuplicate,
    handleFavorite,
    handleMoveTask,
    handleMarkNotifRead,
    handleMarkAllNotifsRead,
  };
};
