/**
 * components/Projects/ProjectFormModal.jsx
 * ------------------------------------------
 * Reusable Create / Edit project modal.
 * mode="create" → blank form
 * mode="edit"   → pre-filled with project data
 */

import React, { useState, useEffect } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import styles from './ProjectFormModal.module.css';

const STATUSES   = ['Planning', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const EMPTY_FORM = {
  title:       '',
  description: '',
  status:      'Planning',
  priority:    'Medium',
  progress:    0,
  start_date:  '',
  end_date:    '',
};

const ProjectFormModal = ({ mode = 'create', project = null, onSave, onClose, saving }) => {
  const [form,  setForm]  = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  // Pre-fill on edit
  useEffect(() => {
    if (mode === 'edit' && project) {
      setForm({
        title:       project.title       || '',
        description: project.description || '',
        status:      project.status      || 'Planning',
        priority:    project.priority    || 'Medium',
        progress:    project.progress    ?? 0,
        start_date:  project.start_date  || '',
        end_date:    project.end_date    || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, project]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError('End date cannot be before start date.');
      return;
    }
    try {
      await onSave({
        ...form,
        progress:   Number(form.progress),
        start_date: form.start_date || null,
        end_date:   form.end_date   || null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button id="project-form-close" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          {/* Error */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pf-title">
              Project Title <span className={styles.required}>*</span>
            </label>
            <input
              id="pf-title"
              type="text"
              className={styles.input}
              placeholder="Enter project title..."
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pf-description">Description</label>
            <textarea
              id="pf-description"
              className={styles.textarea}
              placeholder="Brief project description..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          {/* Status + Priority */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pf-status">Status</label>
              <select
                id="pf-status"
                className={styles.select}
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pf-priority">Priority</label>
              <select
                id="pf-priority"
                className={styles.select}
                value={form.priority}
                onChange={e => handleChange('priority', e.target.value)}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pf-start">Start Date</label>
              <input
                id="pf-start"
                type="date"
                className={styles.input}
                value={form.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pf-end">End Date</label>
              <input
                id="pf-end"
                type="date"
                className={styles.input}
                value={form.end_date}
                onChange={e => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Progress slider */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pf-progress">Progress</label>
            <div className={styles.sliderWrapper}>
              <input
                id="pf-progress"
                type="range"
                min="0"
                max="100"
                step="5"
                className={styles.slider}
                value={form.progress}
                onChange={e => handleChange('progress', e.target.value)}
              />
              <span className={styles.sliderValue}>{form.progress}%</span>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" id="pf-cancel" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="pf-submit" className={styles.submitBtn} disabled={saving}>
              <MdSave size={16} />
              {saving ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
