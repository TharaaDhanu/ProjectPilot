/**
 * services/projectService.js
 * ---------------------------
 * Typed API call functions for the Project module.
 * Follows the exact pattern of authService.js.
 * All functions return response.data.data from the backend envelope.
 */

import api from './api';

/**
 * Fetch paginated, filtered, sorted project list.
 * @param {object} params - { status, priority, search, sort, page, per_page }
 * @returns {Promise<{ projects, total, page, pages, per_page }>}
 */
export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/api/projects', { params });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch projects.';
    throw new Error(message);
  }
};

/**
 * Fetch a single project by ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const getProject = async (id) => {
  try {
    const response = await api.get(`/api/projects/${id}`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch project.';
    throw new Error(message);
  }
};

/**
 * Create a new project.
 * @param {object} data - { title, description, status, priority, progress, start_date, end_date }
 * @returns {Promise<object>}
 */
export const createProject = async (data) => {
  try {
    const response = await api.post('/api/projects', data);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create project.';
    throw new Error(message);
  }
};

/**
 * Update an existing project.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateProject = async (id, data) => {
  try {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update project.';
    throw new Error(message);
  }
};

/**
 * Permanently delete a project.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteProject = async (id) => {
  try {
    await api.delete(`/api/projects/${id}`);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete project.';
    throw new Error(message);
  }
};

/**
 * Archive a project (sets status → Archived).
 * @param {number} id
 * @returns {Promise<object>}
 */
export const archiveProject = async (id) => {
  try {
    const response = await api.patch(`/api/projects/${id}/archive`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to archive project.';
    throw new Error(message);
  }
};

/**
 * Restore an archived project.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const restoreProject = async (id) => {
  try {
    const response = await api.patch(`/api/projects/${id}/restore`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to restore project.';
    throw new Error(message);
  }
};

/**
 * Fetch project statistics for current user.
 * @returns {Promise<{ total, planning, active, completed, archived, completion_rate }>}
 */
export const getProjectStatistics = async () => {
  try {
    const response = await api.get('/api/projects/statistics');
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch statistics.';
    throw new Error(message);
  }
};
