/**
 * components/Projects/ProjectToolbar.jsx
 * ----------------------------------------
 * Search, filter, sort controls + grid/list toggle + New Project button.
 */

import React, { useState, useRef } from 'react';
import { MdSearch, MdGridView, MdViewList, MdAdd } from 'react-icons/md';
import styles from './ProjectToolbar.module.css';

const STATUSES  = ['', 'Planning', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Archived'];
const PRIORITIES = ['', 'Low', 'Medium', 'High', 'Critical'];
const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'name_asc',   label: 'Name A → Z' },
  { value: 'name_desc',  label: 'Name Z → A' },
  { value: 'priority',   label: 'Priority' },
  { value: 'progress',   label: 'Progress' },
  { value: 'start_date', label: 'Start Date' },
  { value: 'end_date',   label: 'End Date' },
];

const ProjectToolbar = ({ filters, onFilterChange, view, onViewChange, onNewProject }) => {
  const [searchVal, setSearchVal] = useState(filters.search || '');
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: val });
    }, 350);
  };

  return (
    <div className={styles.toolbar}>
      {/* Search */}
      <div className={styles.searchWrapper}>
        <MdSearch className={styles.searchIcon} />
        <input
          id="project-search"
          type="text"
          className={styles.searchInput}
          placeholder="Search projects..."
          value={searchVal}
          onChange={handleSearch}
          aria-label="Search projects"
        />
      </div>

      {/* Status filter */}
      <select
        id="project-filter-status"
        className={styles.select}
        value={filters.status || ''}
        onChange={e => onFilterChange({ status: e.target.value })}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {STATUSES.filter(Boolean).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        id="project-filter-priority"
        className={styles.select}
        value={filters.priority || ''}
        onChange={e => onFilterChange({ priority: e.target.value })}
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.filter(Boolean).map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        id="project-sort"
        className={styles.select}
        value={filters.sort || 'newest'}
        onChange={e => onFilterChange({ sort: e.target.value })}
        aria-label="Sort projects"
      >
        {SORTS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <div className={styles.spacer} />

      {/* Grid / List toggle */}
      <div className={styles.viewToggle} role="group" aria-label="View mode">
        <button
          id="view-grid-btn"
          className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
          onClick={() => onViewChange('grid')}
          aria-label="Grid view"
          title="Grid view"
        >
          <MdGridView />
        </button>
        <button
          id="view-list-btn"
          className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
          onClick={() => onViewChange('list')}
          aria-label="List view"
          title="List view"
        >
          <MdViewList />
        </button>
      </div>

      {/* New Project */}
      <button
        id="new-project-btn"
        className={styles.newBtn}
        onClick={onNewProject}
      >
        <MdAdd size={18} />
        New Project
      </button>
    </div>
  );
};

export default ProjectToolbar;
