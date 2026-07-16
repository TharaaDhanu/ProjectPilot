/**
 * pages/team/TeamPage.jsx
 * -----------------------
 * Enterprise Team Management page.
 * Features: Stats, Search, Filters, Sort, Grid/Table view toggle,
 *           Employee drawer, Create/Edit modal, Delete confirm.
 */

import React, { useState } from 'react';
import {
  LuUsers, LuUserCheck, LuUserMinus, LuBriefcase,
  LuSearch, LuPlus, LuLayoutGrid, LuList,
  LuFilter, LuLoader, LuCircleAlert, LuRefreshCw,
  LuTrash2, LuX,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight } from 'react-icons/md';

import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useTeam } from '../../hooks/useTeam';
import EmployeeCard from '../../components/Team/EmployeeCard';
import EmployeeTable from '../../components/Team/EmployeeTable';
import EmployeeDrawer from '../../components/Team/EmployeeDrawer';
import EmployeeFormModal from '../../components/Team/EmployeeFormModal';
import styles from './TeamPage.module.css';

const ROLES = [
  'All Roles', 'Admin', 'Manager', 'Employee',
];

const DESIGNATIONS = [
  'All Designations',
  'Project Manager',
  'Team Lead',
  'Senior Developer',
  'Developer',
  'QA Engineer',
  'UI/UX Designer',
  'Designer',
  'Business Analyst',
  'Intern',
];

const STATUSES = ['All Statuses', 'Active', 'Busy', 'On Leave', 'Offline'];

const SORTS = [
  { value: 'name_asc', label: 'Name A→Z' },
  { value: 'name_desc', label: 'Name Z→A' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'role', label: 'Role' },
  { value: 'designation', label: 'Designation' },
  { value: 'joining_date', label: 'Joining Date' },
];

const STATUS_COLORS = {
  'Active':   '#22c55e',
  'Busy':     '#f59e0b',
  'On Leave': '#8b5cf6',
  'Offline':  '#6b7280',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color + '22', color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className={styles.statValue}>{value ?? '—'}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const TeamPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    employees, statistics, loading, error,
    search, setSearch,
    filterRole, setFilterRole,
    filterDesignation, setFilterDesignation,
    filterStatus, setFilterStatus,
    sort, setSort,
    selectedEmployee, openDrawer, closeDrawer,
    isFormOpen, editTarget, deleteTarget, setDeleteTarget,
    openCreateForm, openEditForm, closeForm,
    handleCreate, handleUpdate, handleDelete,
    refresh,
  } = useTeam();

  const stats = statistics || {};
  const byStatus = stats.by_status || {};

  const handleFormSubmit = (data) => {
    if (editTarget) return handleUpdate(editTarget.id, data);
    return handleCreate(data);
  };

  return (
    <DashboardLayout pageTitle="Team">
      <div className={styles.page}>

        {/* ── Page Header (Breadcrumb only) ── */}
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/"><MdHome size={13} /> Dashboard</Link>
            <MdChevronRight size={14} />
            Team
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className={styles.statsRow}>
          <StatCard icon={LuUsers}     label="Total Members"  value={stats.total}          color="#3b82f6" />
          <StatCard icon={LuUserCheck} label="Active"         value={byStatus.active}       color="#22c55e" />
          <StatCard icon={LuBriefcase} label="Busy"           value={byStatus.busy}         color="#f59e0b" />
          <StatCard icon={LuUserMinus} label="On Leave"       value={byStatus.on_leave}     color="#8b5cf6" />
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchBox}>
            <LuSearch size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, email, ID, role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}><LuX size={12} /></button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <LuFilter size={14} />
            Filters
          </button>

          {/* Sort */}
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* View toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LuLayoutGrid size={15} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <LuList size={15} />
            </button>
          </div>

          {/* Add Employee button */}
          <button className={styles.addBtn} onClick={openCreateForm}>
            <LuPlus size={16} />
            Add Employee
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label>Role</label>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value === 'All Roles' ? '' : e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Designation</label>
              <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value === 'All Designations' ? '' : e.target.value)}>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value === 'All Statuses' ? '' : e.target.value)}>
                {STATUSES.map(s => (
                  <option key={s} value={s === 'All Statuses' ? '' : s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              className={styles.clearFilters}
              onClick={() => { setFilterRole(''); setFilterDesignation(''); setFilterStatus(''); }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Designation breakdown pills ── */}
        {stats.by_designation && (
          <div className={styles.deptRow}>
            {Object.entries(stats.by_designation).map(([desig, count]) => (
              <button
                key={desig}
                className={`${styles.deptPill} ${filterDesignation === desig ? styles.deptPillActive : ''}`}
                onClick={() => setFilterDesignation(filterDesignation === desig ? '' : desig)}
              >
                {desig} <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Main content ── */}
        {loading ? (
          <div className={styles.loader}>
            <LuLoader size={28} className={styles.spin} />
            <span>Loading team members…</span>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <LuCircleAlert size={20} />
            <span>{error}</span>
            <button onClick={refresh}>Retry</button>
          </div>
        ) : employees.length === 0 ? (
          <div className={styles.empty}>
            <LuUsers size={48} />
            <h3>No employees found</h3>
            <p>Try adjusting filters or add your first team member.</p>
            <button onClick={openCreateForm} className={styles.addBtn}>
              <LuPlus size={16} /> Add Employee
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.grid}>
            {employees.map(emp => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onView={openDrawer}
                onEdit={openEditForm}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onView={openDrawer}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
          />
        )}

        {/* ── Employee Drawer ── */}
        {selectedEmployee && (
          <EmployeeDrawer
            employee={selectedEmployee}
            onClose={closeDrawer}
            onEdit={(emp) => { closeDrawer(); openEditForm(emp); }}
          />
        )}

        {/* ── Create / Edit Modal ── */}
        {isFormOpen && (
          <EmployeeFormModal
            employee={editTarget}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* ── Delete Confirm ── */}
        {deleteTarget && (
          <div className={styles.deleteOverlay}>
            <div className={styles.deleteModal}>
              <div className={styles.deleteIcon}><LuTrash2 size={24} /></div>
              <h3>Delete Employee?</h3>
              <p>This will permanently remove <strong>{deleteTarget.name}</strong> from the system. This action cannot be undone.</p>
              <div className={styles.deleteActions}>
                <button className={styles.deleteCancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(deleteTarget.id)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamPage;