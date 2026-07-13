/**
 * components/Tasks/TaskFormModal.jsx
 * -----------------------------------
 * Reusable modal for creating and editing tasks.
 */

import React, { useState, useEffect } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import styles from './TaskFormModal.module.css';

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Blocked', 'Completed', 'Cancelled', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const EMPTY_FORM = {
  title: '',
  description: '',
  project_id: '',
  assigned_to: '',
  status: 'To Do',
  priority: 'Medium',
  progress: 0,
  start_date: '',
  end_date: '',
  estimated_hours: 0,
  actual_hours: 0,
  labels: '',
};

const TaskFormModal = ({
  mode = 'create',
  task = null,
  projects = [],
  users = [],
  onSave,
  onClose,
  saving,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  // Pre-fill form when editing an existing task
  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        assigned_to: task.assigned_to || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        progress: task.progress ?? 0,
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        estimated_hours: task.estimated_hours ?? 0,
        actual_hours: task.actual_hours ?? 0,
        labels: Array.isArray(task.labels) ? task.labels.join(', ') : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, task]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!form.project_id) {
      setError('Project selection is required.');
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      // Process labels into an array of trimmed strings
      const processedLabels = form.labels
        ? form.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      await onSave({
        ...form,
        project_id: Number(form.project_id),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        progress: Number(form.progress),
        estimated_hours: Number(form.estimated_hours),
        actual_hours: Number(form.actual_hours),
        labels: processedLabels,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button id="task-form-close" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          {/* Error */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-title">
              Task Title <span className={styles.required}>*</span>
            </label>
            <input
              id="tf-title"
              type="text"
              className={styles.input}
              placeholder="Enter task title..."
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-description">Description</label>
            <textarea
              id="tf-description"
              className={styles.textarea}
              placeholder="Brief task description..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Project + Assignee */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-project">
                Project <span className={styles.required}>*</span>
              </label>
              <select
                id="tf-project"
                className={styles.select}
                value={form.project_id}
                onChange={(e) => handleChange('project_id', e.target.value)}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-assignee">Assign To</label>
              <select
                id="tf-assignee"
                className={styles.select}
                value={form.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Priority */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-status">Status</label>
              <select
                id="tf-status"
                className={styles.select}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-priority">Priority</label>
              <select
                id="tf-priority"
                className={styles.select}
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-start">Start Date</label>
              <input
                id="tf-start"
                type="date"
                className={styles.input}
                value={form.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-end">End Date</label>
              <input
                id="tf-end"
                type="date"
                className={styles.input}
                value={form.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Hours Estimation */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-est">Est. Hours</label>
              <input
                id="tf-est"
                type="number"
                min="0"
                step="0.5"
                className={styles.input}
                placeholder="e.g. 8"
                value={form.estimated_hours}
                onChange={(e) => handleChange('estimated_hours', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tf-act">Actual Hours</label>
              <input
                id="tf-act"
                type="number"
                min="0"
                step="0.5"
                className={styles.input}
                placeholder="e.g. 3.5"
                value={form.actual_hours}
                onChange={(e) => handleChange('actual_hours', e.target.value)}
              />
            </div>
          </div>

          {/* Labels (comma separated) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-labels">Labels (comma-separated)</label>
            <input
              id="tf-labels"
              type="text"
              className={styles.input}
              placeholder="e.g. frontend, bug, styling"
              value={form.labels}
              onChange={(e) => handleChange('labels', e.target.value)}
            />
          </div>

          {/* Progress Slider */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-progress">Progress</label>
            <div className={styles.sliderWrapper}>
              <input
                id="tf-progress"
                type="range"
                min="0"
                max="100"
                step="5"
                className={styles.slider}
                value={form.progress}
                onChange={(e) => handleChange('progress', e.target.value)}
              />
              <span className={styles.sliderValue}>{form.progress}%</span>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" id="tf-cancel" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="tf-submit" className={styles.submitBtn} disabled={saving}>
              <MdSave size={16} />
              {saving ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
