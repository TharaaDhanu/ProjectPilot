/**
 * components/Team/EmployeeFormModal.jsx
 * --------------------------------------
 * Create / Edit modal for employee profiles.
 * Fetches available projects to allow multi-project assignment.
 */

import React, { useState, useEffect } from 'react';
import { LuX, LuLoader } from 'react-icons/lu';
import { getProjects } from '../../services/projectService';
import styles from './EmployeeFormModal.module.css';

const ROLES = [
  'Super Admin', 'Admin', 'Project Manager', 'Team Lead',
  'Senior Developer', 'Developer', 'Designer', 'QA Engineer',
  'Intern', 'Employee',
];

const STATUSES = ['Active', 'Busy', 'On Leave', 'Offline'];

const DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'QA', 'Marketing',
  'Sales', 'HR', 'Finance', 'Operations', 'Management',
];

function buildDefault(employee) {
  return {
    name:        employee?.name || '',
    email:       employee?.email || '',
    role:        employee?.role || 'Employee',
    designation: employee?.designation || '',
    department:  employee?.department || '',
    employee_id: employee?.employee_id || '',
    phone:       employee?.phone || '',
    avatar:      employee?.avatar || '',
    joining_date:employee?.joining_date || '',
    status:      employee?.status || 'Active',
    bio:         employee?.bio || '',
    password:    '',
    project_ids: (employee?.assigned_projects || []).map(p => p.id),
  };
}

const EmployeeFormModal = ({ employee, onClose, onSubmit }) => {
  const isEdit = !!employee;
  const [form, setForm]           = useState(buildDefault(employee));
  const [projects, setProjects]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    getProjects({ per_page: 100 }).then(data => {
      setProjects(data?.projects || []);
    }).catch(() => setProjects([]));
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleProject = (id) => {
    setForm(f => ({
      ...f,
      project_ids: f.project_ids.includes(id)
        ? f.project_ids.filter(pid => pid !== id)
        : [...f.project_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.joining_date) delete payload.joining_date;
      if (!payload.password) delete payload.password;
      if (isEdit && !payload.password) delete payload.password;
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save employee.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className={styles.closeBtn} onClick={onClose}><LuX size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>

            {/* Row 1 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" required />
              </div>
              <div className={styles.field}>
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" required />
              </div>
            </div>

            {/* Row 2 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Role</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Designation</label>
                <input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Senior Engineer" />
              </div>
              <div className={styles.field}>
                <label>Department</label>
                <select value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Employee ID</label>
                <input value={form.employee_id} onChange={e => set('employee_id', e.target.value)} placeholder="EMP0001 (auto if blank)" />
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 0000" />
              </div>
            </div>

            {/* Row 5 */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Joining Date</label>
                <input type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Avatar URL</label>
                <input value={form.avatar} onChange={e => set('avatar', e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {/* Password (only for create, optional for edit) */}
            {!isEdit && (
              <div className={styles.field}>
                <label>Temporary Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Leave blank for default" />
              </div>
            )}

            {/* Bio */}
            <div className={styles.field}>
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Short bio..." />
            </div>

            {/* Project Assignment */}
            {projects.length > 0 && (
              <div className={styles.field}>
                <label>Assign to Projects</label>
                <div className={styles.projectPicker}>
                  {projects.map(p => (
                    <label key={p.id} className={`${styles.projectChk} ${form.project_ids.includes(p.id) ? styles.projectChkActive : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.project_ids.includes(p.id)}
                        onChange={() => toggleProject(p.id)}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? <LuLoader size={14} className={styles.spin} /> : null}
              {isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
