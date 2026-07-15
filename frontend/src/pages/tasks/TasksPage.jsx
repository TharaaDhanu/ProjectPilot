/**
 * pages/tasks/TasksPage.jsx
 * --------------------------
 * Full Tasks module page.
 *
 * Sections:
 * 1. Header (breadcrumb + title)
 * 2. Statistics cards
 * 3. Toolbar (search, filters, sort, view toggle, new task button)
 * 4. Kanban board | List table (toggled)
 *
 * Modals: Create, Edit, Delete (Confirm)
 * Drawer: TaskDrawer (right-side detail panel)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdInbox, MdWarning, MdAdd } from 'react-icons/md';
import { toast } from 'react-toastify';

import DashboardLayout   from '../../components/Layouts/DashboardLayout';
import TaskStats         from '../../components/Tasks/TaskStats';
import TaskToolbar       from '../../components/Tasks/TaskToolbar';
import KanbanBoard       from '../../components/Tasks/KanbanBoard';
import TaskTable         from '../../components/Tasks/TaskTable';
import TaskFormModal     from '../../components/Tasks/TaskFormModal';
import TaskDrawer        from '../../components/Tasks/TaskDrawer';
import ConfirmModal      from '../../components/Projects/ConfirmModal';
import { useTasks }      from '../../hooks/useTasks';
import { useAuth }       from '../../hooks/useAuth';
import { getProjects }   from '../../services/projectService';
import styles            from './TasksPage.module.css';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCards = () => (
  <div className={styles.skelGrid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={styles.skelCard}>
        <div className={styles.skelLine} style={{ height: 18, width: '60%' }} />
        <div className={styles.skelLine} style={{ height: 14, width: '90%' }} />
        <div className={styles.skelLine} style={{ height: 6,  width: '100%' }} />
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { user } = useAuth();
  const {
    tasks, stats, users,
    loading, statsLoading, error,
    filters, applyFilters,
    handleCreate, handleUpdate, handleDelete,
    handleArchive, handleRestore, handleDuplicate,
    handleFavorite, handleMoveTask,
  } = useTasks();

  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  // Modal state
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selectedTask, setSelectedTask] = useState(null);
  const [saving, setSaving] = useState(false);

  // Drawer state
  const [drawerTask, setDrawerTask] = useState(null);

  // Load projects for dropdowns
  useEffect(() => {
    getProjects({ per_page: 100 })
      .then((data) => setProjects(data.projects || []))
      .catch(() => {});
  }, []);

  // ── Open handlers ────────────────────────────────────────────────────
  const openCreate  = ()  => { setSelectedTask(null); setModal('create'); };
  const openEdit    = (t) => { setSelectedTask(t);    setModal('edit'); };
  const openDelete  = (id, title) => { setSelectedTask({ id, title }); setModal('delete'); };
  const openView    = (t) => setDrawerTask(t);
  const closeModal  = ()  => { setModal(null); setSelectedTask(null); };
  const closeDrawer = ()  => setDrawerTask(null);

  // ── Save: create ─────────────────────────────────────────────────────
  const onSaveCreate = async (data) => {
    setSaving(true);
    try {
      await handleCreate(data);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Save: edit ───────────────────────────────────────────────────────
  const onSaveEdit = async (data) => {
    setSaving(true);
    try {
      const updated = await handleUpdate(selectedTask.id, data);
      closeModal();
      if (drawerTask?.id === selectedTask.id) {
        setDrawerTask((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm: delete ──────────────────────────────────────────────────
  const onConfirmDelete = async () => {
    setSaving(true);
    try {
      await handleDelete(selectedTask.id, selectedTask.title);
      closeModal();
      if (drawerTask?.id === selectedTask.id) closeDrawer();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Drawer inline update (timer, checklist, subtask, comments) ───────
  const onDrawerUpdate = async (id, data) => {
    try {
      const updated = await handleUpdate(id, data);
      setDrawerTask((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    }
  };

  // ── Drawer: shortcuts ────────────────────────────────────────────────
  const onDrawerEdit   = (t) => { closeDrawer(); openEdit(t); };
  const onDrawerDelete = (id, title) => { closeDrawer(); openDelete(id, title); };

  // ── Drag-and-drop Kanban move ────────────────────────────────────────
  const onMoveTask = async (taskId, newStatus) => {
    await handleMoveTask(taskId, newStatus);
    // Keep drawer in sync
    if (drawerTask?.id === taskId) {
      setDrawerTask((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Active tasks (non-archived) for display
  const displayTasks = tasks;

  return (
    <DashboardLayout pageTitle="Tasks">
      <div className={styles.page}>

        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/"><MdHome size={13} /> Dashboard</Link>
            <MdChevronRight size={14} />
            Tasks
          </div>
        </div>

        {/* ── Stats ── */}
        <TaskStats stats={stats} loading={statsLoading} />

        {/* ── Toolbar ── */}
        <TaskToolbar
          filters={filters}
          onFilterChange={applyFilters}
          view={view}
          onViewChange={setView}
          onNewTask={openCreate}
          users={users}
          projects={projects}
        />

        {/* ── Error Banner ── */}
        {error && (
          <div className={styles.errorBanner}>
            <MdWarning size={18} /> {error}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <SkeletonCards />
        ) : displayTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MdInbox size={44} /></div>
            <div className={styles.emptyTitle}>No tasks found</div>
            <div className={styles.emptyText}>
              {filters.search || filters.status || filters.priority || filters.project_id
                ? 'Try adjusting your filters or search term.'
                : 'Create your first task to get started.'}
            </div>
            {!filters.search && !filters.status && !filters.priority && !filters.project_id && (
              <button className={styles.emptyBtn} onClick={openCreate} id="empty-create-task-btn">
                <MdAdd size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Create Task
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <KanbanBoard
            tasks={displayTasks}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDelete}
            onArchive={(id) => handleArchive(id)}
            onRestore={(id) => handleRestore(id)}
            onDuplicate={handleDuplicate}
            onFavorite={handleFavorite}
            onMoveTask={onMoveTask}
          />
        ) : (
          <TaskTable
            tasks={displayTasks}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDelete}
            onArchive={(id) => handleArchive(id)}
            onRestore={(id) => handleRestore(id)}
            onDuplicate={handleDuplicate}
            onFavorite={handleFavorite}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {(modal === 'create' || modal === 'edit') && (
        <TaskFormModal
          mode={modal}
          task={selectedTask}
          projects={projects}
          users={users}
          onSave={modal === 'create' ? onSaveCreate : onSaveEdit}
          onClose={closeModal}
          saving={saving}
        />
      )}

      {modal === 'delete' && selectedTask && (
        <ConfirmModal
          title="Delete Task"
          message={`Are you sure you want to permanently delete <strong>"${selectedTask.title}"</strong>? This action cannot be undone.`}
          confirmLabel="Delete Task"
          variant="danger"
          onConfirm={onConfirmDelete}
          onClose={closeModal}
          loading={saving}
        />
      )}

      {/* ── Drawer ── */}
      {drawerTask && (
        <TaskDrawer
          task={drawerTask}
          onClose={closeDrawer}
          onEdit={onDrawerEdit}
          onDelete={onDrawerDelete}
          onUpdate={onDrawerUpdate}
          currentUser={user}
        />
      )}

    </DashboardLayout>
  );
};

export default TasksPage;