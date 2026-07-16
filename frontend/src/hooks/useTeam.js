/**
 * hooks/useTeam.js
 * ----------------
 * Central state hook for the Team Management module.
 * Provides employees list, statistics, search/filter/sort state,
 * and all CRUD handlers with loading/error state management.
 */

import { useState, useEffect, useCallback } from 'react';
import teamService from '../services/teamService';

export function useTeam() {
  const [employees, setEmployees]     = useState([]);
  const [statistics, setStatistics]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError]             = useState(null);

  // Search / filter / sort state
  const [search, setSearch]           = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort]               = useState('name_asc');

  // Selected employee for drawer
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Modal state
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterDesignation) params.designation = filterDesignation;
      if (filterStatus) params.status = filterStatus;
      if (sort) params.sort = sort;

      const res = await teamService.getAll(params);
      setEmployees(res.data?.data?.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterDesignation, filterStatus, sort]);

  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await teamService.getStatistics();
      setStatistics(res.data?.data || null);
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Open employee detail drawer
  const openDrawer = useCallback(async (employeeId) => {
    try {
      const res = await teamService.getById(employeeId);
      setSelectedEmployee(res.data?.data?.employee || null);
    } catch {
      // fallback: use existing data
      const emp = employees.find(e => e.id === employeeId);
      setSelectedEmployee(emp || null);
    }
  }, [employees]);

  const closeDrawer = () => setSelectedEmployee(null);

  // CRUD handlers
  const handleCreate = async (data) => {
    const res = await teamService.create(data);
    await fetchEmployees();
    await fetchStatistics();
    setIsFormOpen(false);
    return res.data?.data?.employee;
  };

  const handleUpdate = async (id, data) => {
    const res = await teamService.update(id, data);
    await fetchEmployees();
    await fetchStatistics();
    setEditTarget(null);
    setIsFormOpen(false);
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(res.data?.data?.employee || null);
    }
    return res.data?.data?.employee;
  };

  const handleDelete = async (id) => {
    await teamService.remove(id);
    await fetchEmployees();
    await fetchStatistics();
    setDeleteTarget(null);
    if (selectedEmployee?.id === id) setSelectedEmployee(null);
  };

  const openCreateForm = () => {
    setEditTarget(null);
    setIsFormOpen(true);
  };

  const openEditForm = (employee) => {
    setEditTarget(employee);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
  };

  return {
    employees,
    statistics,
    loading,
    statsLoading,
    error,
    // Search/filter/sort
    search, setSearch,
    filterRole, setFilterRole,
    filterDesignation, setFilterDesignation,
    filterStatus, setFilterStatus,
    sort, setSort,
    // Drawer
    selectedEmployee,
    openDrawer,
    closeDrawer,
    // Modal
    isFormOpen,
    editTarget,
    deleteTarget,
    setDeleteTarget,
    openCreateForm,
    openEditForm,
    closeForm,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    refresh: fetchEmployees,
  };
}