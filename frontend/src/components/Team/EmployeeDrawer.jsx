/**
 * components/Team/EmployeeDrawer.jsx
 * ------------------------------------
 * Slide-in detail panel showing full employee profile,
 * assigned projects, tasks, and recent activity.
 */

import React from 'react';
import {
  LuX, LuMail, LuPhone, LuBriefcase,
  LuCalendarDays, LuFolderOpen, LuSquareCheck,
  LuHash,
} from 'react-icons/lu';
import styles from './EmployeeDrawer.module.css';

const STATUS_COLORS = {
  'Active':   '#22c55e',
  'Busy':     '#f59e0b',
  'On Leave': '#8b5cf6',
  'Offline':  '#6b7280',
};

const TASK_STATUS_COLORS = {
  'To Do':       '#64748b',
  'In Progress': '#3b82f6',
  'Review':      '#f59e0b',
  'Done':        '#22c55e',
  'Blocked':     '#ef4444',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const EmployeeDrawer = ({ employee, onClose, onEdit }) => {
  if (!employee) return null;

  const statusColor  = STATUS_COLORS[employee.status] || '#6b7280';
  const projects     = employee.assigned_projects || [];
  const tasks        = employee.assigned_tasks || [];
  const doneTasks    = tasks.filter(t => t.status === 'Done').length;
  const completion   = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer panel */}
      <aside className={styles.drawer}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <span className={styles.topTitle}>Employee Profile</span>
          <div className={styles.topActions}>
            <button className={styles.editBtn} onClick={() => onEdit(employee)}>Edit</button>
            <button className={styles.closeBtn} onClick={onClose}><LuX size={16} /></button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.avatarWrap}>
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarInitials}>{getInitials(employee.name)}</div>
              )}
              <span className={styles.statusBadge} style={{ background: statusColor }}>
                {employee.status}
              </span>
            </div>
            <div className={styles.heroInfo}>
              <h2 className={styles.heroName}>{employee.name}</h2>
              <p className={styles.heroDesig}>{employee.designation || 'No Designation'}</p>
              <div className={styles.heroRole}>{employee.role}</div>
            </div>
          </div>

          {/* Completion Bar */}
          {tasks.length > 0 && (
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Task Completion</span>
                <span>{completion}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${completion}%` }} />
              </div>
              <div className={styles.progressSub}>{doneTasks} of {tasks.length} tasks completed</div>
            </div>
          )}

          {/* Details */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact & Info</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <LuHash size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Employee ID</div>
                  <div className={styles.detailValue}>{employee.employee_id || '—'}</div>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuMail size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Email</div>
                  <div className={styles.detailValue}>{employee.email}</div>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuPhone size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Phone</div>
                  <div className={styles.detailValue}>{employee.phone || '—'}</div>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuBriefcase size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Designation</div>
                  <div className={styles.detailValue}>{employee.designation || '—'}</div>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuBriefcase size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Role</div>
                  <div className={styles.detailValue}>{employee.role}</div>
                </div>
              </div>
              <div className={styles.detailItem}>
                <LuCalendarDays size={13} className={styles.detailIcon} />
                <div>
                  <div className={styles.detailLabel}>Joined</div>
                  <div className={styles.detailValue}>{formatDate(employee.joining_date)}</div>
                </div>
              </div>
            </div>
            {employee.bio && (
              <div className={styles.bio}>
                <div className={styles.detailLabel}>Bio</div>
                <p className={styles.bioText}>{employee.bio}</p>
              </div>
            )}
          </section>

          {/* Assigned Projects */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <LuFolderOpen size={14} /> Assigned Projects ({projects.length})
            </h3>
            {projects.length === 0 ? (
              <p className={styles.emptyMsg}>Not assigned to any projects.</p>
            ) : (
              <div className={styles.projectList}>
                {projects.map(p => (
                  <div key={p.id} className={styles.projectItem}>
                    <span className={styles.projectDot} />
                    <span className={styles.projectName}>{p.title}</span>
                    <span className={styles.projectStatus}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Assigned Tasks */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <LuSquareCheck size={14} /> Assigned Tasks ({tasks.length})
            </h3>
            {tasks.length === 0 ? (
              <p className={styles.emptyMsg}>No tasks assigned.</p>
            ) : (
              <div className={styles.taskList}>
                {tasks.slice(0, 8).map(t => {
                  const tc = TASK_STATUS_COLORS[t.status] || '#64748b';
                  return (
                    <div key={t.id} className={styles.taskItem}>
                      <span className={styles.taskDot} style={{ background: tc }} />
                      <span className={styles.taskTitle}>{t.title}</span>
                      <span className={styles.taskStatus} style={{ color: tc }}>{t.status}</span>
                    </div>
                  );
                })}
                {tasks.length > 8 && (
                  <p className={styles.moreMsg}>+{tasks.length - 8} more tasks</p>
                )}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};

export default EmployeeDrawer;