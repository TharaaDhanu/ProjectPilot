/**
 * components/Tasks/TaskToolbar.jsx
 * ---------------------------------
 * Toolbar for searching, filtering, sorting, and view-toggling tasks.
 */

import React from 'react';
import { MdSearch, MdGridView, MdList, MdAdd } from 'react-icons/md';
import styles from './TaskToolbar.module.css';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Blocked', 'Completed', 'Cancelled', 'Archived'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'name_asc',   label: 'Name (A-Z)' },
  { value: 'name_desc',  label: 'Name (Z-A)' },
  { value: 'priority',   label: 'Priority' },
  { value: 'progress',   label: 'Progress' },
  { value: 'start_date', label: 'Start Date' },
  { value: 'end_date',   label: 'End Date' },
];

const TaskToolbar = ({
  filters,
  onFilterChange,
  view,
  onViewChange,
  onNewTask,
  users = [],
  projects = [],
}) => {
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const handleSelectChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className={styles.toolbar}>
      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <MdSearch className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Search tasks, descriptions..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className={styles.searchInput}
          aria-label="Search tasks"
        />
      </div>

      {/* Filters Group */}
      <div className={styles.filtersGroup}>
        {/* Project Filter */}
        <select
          value={filters.project_id || ''}
          onChange={(e) => handleSelectChange('project_id', e.target.value)}
          className={styles.select}
          aria-label="Filter by project"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assigned_to || ''}
          onChange={(e) => handleSelectChange('assigned_to', e.target.value)}
          className={styles.select}
          aria-label="Filter by assignee"
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleSelectChange('status', e.target.value)}
          className={styles.select}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleSelectChange('priority', e.target.value)}
          className={styles.select}
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        {/* Sort Filter */}
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleSelectChange('sort', e.target.value)}
          className={styles.select}
          aria-label="Sort tasks"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions: View Toggle + Create Btn */}
      <div className={styles.actionsGroup}>
        <div className={styles.toggleWrapper} role="group" aria-label="View toggle">
          <button
            className={`${styles.toggleBtn} ${view === 'grid' ? styles.active : ''}`}
            onClick={() => onViewChange('grid')}
            title="Kanban Board View"
            aria-label="Kanban Board view"
          >
            <MdGridView size={16} />
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'list' ? styles.active : ''}`}
            onClick={() => onViewChange('list')}
            title="List Table View"
            aria-label="List Table view"
          >
            <MdList size={16} />
          </button>
        </div>

        <button className={styles.newBtn} onClick={onNewTask} id="new-task-btn">
          <MdAdd size={16} />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
};

export default TaskToolbar;
