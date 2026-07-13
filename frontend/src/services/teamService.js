/**
 * services/teamService.js
 * -----------------------
 * API wrapper for the Team Management endpoints.
 * Uses the shared `api` Axios instance which:
 *   - reads the JWT from localStorage key 'pp_token' (correct key)
 *   - auto-redirects to /login on 401 (expired/invalid token)
 *   - sets Content-Type: application/json
 */

import api from './api';

const teamService = {
  getAll: (params = {}) =>
    api.get('/team/', { params }),

  getStatistics: () =>
    api.get('/team/statistics'),

  getById: (id) =>
    api.get(`/team/${id}`),

  create: (data) =>
    api.post('/team/', data),

  update: (id, data) =>
    api.put(`/team/${id}`, data),

  remove: (id) =>
    api.delete(`/team/${id}`),
};

export default teamService;
