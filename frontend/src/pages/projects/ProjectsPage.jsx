/**
 * pages/projects/ProjectsPage.jsx
 * ---------------------------------
 * Full Projects module page.
 *
 * Sections:
 * 1. Header (breadcrumb + title)
 * 2. Statistics cards
 * 3. Toolbar (search, filters, sort, view toggle, new project button)
 * 4. Grid view  — ProjectCard components
 *    List view  — ProjectListTable
 * 5. Pagination
 *
 * Modals: Create, Edit, Delete (Confirm), Archive (Confirm)
 * Drawer: ProjectDrawer (right-side detail panel)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdFolderOff, MdAdd, MdWarning } from 'react-icons/md';
import { toast } from 'react-toastify';

import DashboardLayout   from '../../components/Layouts/DashboardLayout';
import ProjectStats      from '../../components/Projects/ProjectStats';
import ProjectToolbar    from '../../components/Projects/ProjectToolbar';
import ProjectCard       from '../../components/Projects/ProjectCard';
import ProjectListTable  from '../../components/Projects/ProjectRow';
import ProjectFormModal  from '../../components/Projects/ProjectFormModal';
import ConfirmModal      from '../../components/Projects/ConfirmModal';
import ProjectDrawer     from '../../components/Projects/ProjectDrawer';
import { useProjects }   from '../../hooks/useProjects';
import styles            from './ProjectsPage.module.css';

// ─── Loading skeletons ────────────────────────────────────────────────────────
const SkeletonGrid = () => (
  <div className={styles.skelGrid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={styles.skelCard}>
        <div className={styles.skelLine} style={{ height: 20, width: '60%' }} />
        <div className={styles.skelLine} style={{ height: 14, width: '90%' }} />
        <div className={styles.skelLine} style={{ height: 14, width: '75%' }} />
        <div className={styles.skelLine} style={{ height: 6,  width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className={styles.skelLine} style={{ height: 12, width: '40%' }} />
          <div className={styles.skelLine} style={{ height: 12, width: '25%' }} />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const {
    projects, stats, loading, statsLoading, error,
    pagination, filters, applyFilters,
    handleCreate, handleUpdate, handleDelete, handleArchive, handleRestore,
  } = useProjects();

  const [view, setView] = useState('grid'); // 'grid' | 'list'

  // Modal state
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete' | 'archive'
  const [selectedProject, setSelectedProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Drawer state
  const [drawerProject, setDrawerProject] = useState(null);

  // ── Open handlers ──────────────────────────────────────────────────
  const openCreate  = () => { setSelectedProject(null); setModal('create'); };
  const openEdit    = (p) => { setSelectedProject(p); setModal('edit'); };
  const openDelete  = (p) => { setSelectedProject(p); setModal('delete'); };
  const openArchive = (p) => { setSelectedProject(p); setModal('archive'); };
  const openView    = (p) => setDrawerProject(p);
  const closeModal  = () => { setModal(null); setSelectedProject(null); };
  const closeDrawer = () => setDrawerProject(null);

  // ── Save: create ───────────────────────────────────────────────────
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

  // ── Save: edit ─────────────────────────────────────────────────────
  const onSaveEdit = async (data) => {
    setSaving(true);
    try {
      await handleUpdate(selectedProject.id, data);
      closeModal();
      if (drawerProject?.id === selectedProject.id) {
        setDrawerProject(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm: delete ────────────────────────────────────────────────
  const onConfirmDelete = async () => {
    setSaving(true);
    try {
      await handleDelete(selectedProject.id, selectedProject.title);
      closeModal();
      if (drawerProject?.id === selectedProject.id) closeDrawer();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm: archive ───────────────────────────────────────────────
  const onConfirmArchive = async () => {
    setSaving(true);
    try {
      await handleArchive(selectedProject.id);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Restore (no modal needed) ──────────────────────────────────────
  const onRestore = async (project) => {
    try {
      await handleRestore(project.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Drawer: edit / delete shortcuts ───────────────────────────────
  const onDrawerEdit   = (p) => { closeDrawer(); openEdit(p); };
  const onDrawerDelete = (p) => { closeDrawer(); openDelete(p); };

  // ── Pagination ─────────────────────────────────────────────────────
  const goToPage = (p) => applyFilters({ page: p });

  return (
    <DashboardLayout pageTitle="Projects">
      <div className={styles.page}>

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/"><MdHome size={13} /> Dashboard</Link>
            <MdChevronRight size={14} />
            Projects
          </div>
        </div>

        {/* ── Statistics ── */}
        <ProjectStats stats={stats} loading={statsLoading} />

        {/* ── Toolbar ── */}
        <ProjectToolbar
          filters={filters}
          onFilterChange={applyFilters}
          view={view}
          onViewChange={setView}
          onNewProject={openCreate}
        />

        {/* ── Error banner ── */}
        {error && (
          <div className={styles.errorBanner}>
            <MdWarning size={18} /> {error}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <SkeletonGrid />
        ) : projects.length === 0 ? (
          <div className={styles.grid}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <MdFolderOff />
              </div>
              <div className={styles.emptyTitle}>No projects found</div>
              <div className={styles.emptyText}>
                {filters.search || filters.status || filters.priority
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first project to get started.'}
              </div>
              {!filters.search && !filters.status && !filters.priority && (
                <button id="empty-create-btn" className={styles.emptyBtn} onClick={openCreate}>
                  <MdAdd size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Create Project
                </button>
              )}
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className={styles.grid}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={openView}
                onEdit={openEdit}
                onDelete={openDelete}
                onArchive={openArchive}
                onRestore={onRestore}
              />
            ))}
          </div>
        ) : (
          <ProjectListTable
            projects={projects}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDelete}
            onArchive={openArchive}
            onRestore={onRestore}
          />
        )}

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${pagination.page === p ? styles.current : ''}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <span className={styles.pageInfo}>of {pagination.total} projects</span>
            <button
              className={styles.pageBtn}
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {(modal === 'create' || modal === 'edit') && (
        <ProjectFormModal
          mode={modal}
          project={selectedProject}
          onSave={modal === 'create' ? onSaveCreate : onSaveEdit}
          onClose={closeModal}
          saving={saving}
        />
      )}

      {modal === 'delete' && selectedProject && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to permanently delete <strong>"${selectedProject.title}"</strong>? This action cannot be undone.`}
          confirmLabel="Delete Project"
          variant="danger"
          onConfirm={onConfirmDelete}
          onClose={closeModal}
          loading={saving}
        />
      )}

      {modal === 'archive' && selectedProject && (
        <ConfirmModal
          title="Archive Project"
          message={`Archive <strong>"${selectedProject.title}"</strong>? It will be hidden from active views but can be restored later.`}
          confirmLabel="Archive Project"
          variant="warning"
          onConfirm={onConfirmArchive}
          onClose={closeModal}
          loading={saving}
        />
      )}

      {/* ── Drawer ── */}
      {drawerProject && (
        <ProjectDrawer
          project={drawerProject}
          onClose={closeDrawer}
          onEdit={onDrawerEdit}
          onDelete={onDrawerDelete}
        />
      )}

    </DashboardLayout>
  );
};

export default ProjectsPage;