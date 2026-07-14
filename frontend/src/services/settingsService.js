/**
 * services/settingsService.js
 * ----------------------------
 * API wrapper for Settings endpoints.
 */

import api from './api';

const settingsService = {
  // ── Profile ────────────────────────────────────────────────────────────────
  getProfile: async () => {
    const response = await api.get('/api/settings/profile');
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/settings/profile', data);
    return response.data.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/api/settings/profile');
    return response.data;
  },

  // ── Preferences ────────────────────────────────────────────────────────────
  getPreferences: async () => {
    const response = await api.get('/api/settings/preferences');
    return response.data.data;
  },

  updatePreferences: async (data) => {
    const response = await api.put('/api/settings/preferences', data);
    return response.data.data;
  },

  // ── Security ───────────────────────────────────────────────────────────────
  getSecurity: async () => {
    const response = await api.get('/api/settings/security');
    return response.data.data;
  },

  updateSecurity: async (data) => {
    const response = await api.put('/api/settings/security', data);
    return response.data.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/api/settings/security/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getLoginHistory: async (limit = 20) => {
    const response = await api.get('/api/settings/security/login-history', { params: { limit } });
    return response.data.data;
  },

  logoutAllSessions: async () => {
    const response = await api.post('/api/settings/security/logout-all');
    return response.data;
  },

  // ── Notification Preferences ───────────────────────────────────────────────
  getNotificationPreferences: async () => {
    const response = await api.get('/api/settings/notification-preferences');
    return response.data.data;
  },

  updateNotificationPreferences: async (data) => {
    const response = await api.put('/api/settings/notification-preferences', data);
    return response.data.data;
  },

  // ── Roles & Permissions ────────────────────────────────────────────────────
  getRoles: async () => {
    const response = await api.get('/api/settings/roles');
    return response.data.data;
  },

  createRole: async (data) => {
    const response = await api.post('/api/settings/roles', data);
    return response.data.data;
  },

  updateRole: async (roleId, data) => {
    const response = await api.put(`/api/settings/roles/${roleId}`, data);
    return response.data.data;
  },

  deleteRole: async (roleId) => {
    const response = await api.delete(`/api/settings/roles/${roleId}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/api/settings/permissions');
    return response.data.data;
  },

  createPermission: async (data) => {
    const response = await api.post('/api/settings/permissions', data);
    return response.data.data;
  },

  assignPermission: async (roleId, permissionId) => {
    const response = await api.post('/api/settings/permissions/assign', {
      role_id: roleId,
      permission_id: permissionId,
    });
    return response.data.data;
  },

  removePermission: async (roleId, permissionId) => {
    const response = await api.post('/api/settings/permissions/remove', {
      role_id: roleId,
      permission_id: permissionId,
    });
    return response.data.data;
  },

  // ── System ─────────────────────────────────────────────────────────────────
  getSystemInfo: async () => {
    const response = await api.get('/api/settings/system');
    return response.data.data;
  },
};

export default settingsService;