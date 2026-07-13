/**
 * hooks/useProjects.js
 * ---------------------
 * Reusable hook for managing project state.
 * Provides: projects list, stats, loading/error states, and all CRUD operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getProjects,
  getProjectStatistics,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
} from '../services/projectService';

const DEFAULT_FILTERS = {
  status:   '',
  priority: '',
  search:   '',
  sort:     'newest',
  page:     1,
  per_page: 20,
};

export const useProjects = () => {
  const [projects,    setProjects]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error,       setError]       = useState(null);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, pages: 1 });
  const [filters,     setFilters]     = useState(DEFAULT_FILTERS);

  // ── Fetch list ──────────────────────────────────────────────────────
  const fetchProjects = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, ...overrides };
      const data   = await getProjects(params);
      setProjects(data.projects);
      setPagination({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Fetch statistics ────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getProjectStatistics();
      setStats(data);
    } catch {
      // stats are non-critical — fail silently
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update filters and reload ────────────────────────────────────────
  const applyFilters = useCallback((newFilters) => {
    const merged = { ...filters, ...newFilters, page: 1 };
    setFilters(merged);
    fetchProjects(merged);
  }, [filters, fetchProjects]);

  // ── CRUD operations ──────────────────────────────────────────────────
  const handleCreate = useCallback(async (data) => {
    const project = await createProject(data);
    toast.success(`"${project.title}" created!`);
    await fetchProjects();
    await fetchStats();
    return project;
  }, [fetchProjects, fetchStats]);

  const handleUpdate = useCallback(async (id, data) => {
    const project = await updateProject(id, data);
    toast.success(`"${project.title}" updated!`);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    await fetchStats();
    return project;
  }, [fetchStats]);

  const handleDelete = useCallback(async (id, title) => {
    await deleteProject(id);
    toast.success(`"${title}" deleted.`);
    setProjects(prev => prev.filter(p => p.id !== id));
    await fetchStats();
  }, [fetchStats]);

  const handleArchive = useCallback(async (id) => {
    const project = await archiveProject(id);
    toast.success(`"${project.title}" archived.`);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    await fetchStats();
    return project;
  }, [fetchStats]);

  const handleRestore = useCallback(async (id) => {
    const project = await restoreProject(id);
    toast.success(`"${project.title}" restored.`);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    await fetchStats();
    return project;
  }, [fetchStats]);

  return {
    projects,
    stats,
    loading,
    statsLoading,
    error,
    pagination,
    filters,
    applyFilters,
    fetchProjects,
    fetchStats,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchive,
    handleRestore,
  };
};
