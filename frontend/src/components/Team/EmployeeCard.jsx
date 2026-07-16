/**
 * components/Team/EmployeeCard.jsx
 * --------------------------------
 * Grid card displaying an employee's key info with status bubble,
 * role badge, designation, project tags, and action menu.
 */

import React, { useState } from 'react';
import {
  LuUser, LuBriefcase, LuPhone, LuMail,
  LuFolderOpen, LuEllipsisVertical, LuPencil, LuTrash2,
  LuEye, LuCalendarDays,
} from 'react-icons/lu';
import styles from './EmployeeCard.module.css';

const STATUS_COLORS = {
  'Active':   '#22c55e',
  'Busy':     '#f59e0b',
  'On Leave': '#8b5cf6',
  'Offline':  '#6b7280',
};

const ROLE_COLORS = {
  'Admin':             '#f97316',
  'Manager':           '#3b82f6',
  'Employee':          '#64748b',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const EmployeeCard = ({ employee, onView, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColor = STATUS_COLORS[employee.status] || '#6b7280';
  const roleColor   = ROLE_COLORS[employee.role] || '#64748b';
  const projects    = employee.assigned_projects || [];

  return (
    <div className={styles.card}>
      {/* Status indicator */}
      <div className={styles.statusDot} style={{ background: statusColor }} title={employee.status} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          {employee.avatar ? (
            <img src={employee.avatar} alt={employee.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarInitials} style={{ background: roleColor + '22', color: roleColor }}>
              {getInitials(employee.name)}
            </div>
          )}
        </div>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(v => !v)}>
          <LuEllipsisVertical size={16} />
        </button>
        {menuOpen && (
          <div className={styles.menu}>
            <button onClick={() => { onView(employee.id); setMenuOpen(false); }}>
              <LuEye size={13} /> View Details
            </button>
            <button onClick={() => { onEdit(employee); setMenuOpen(false); }}>
              <LuPencil size={13} /> Edit
            </button>
            <button className={styles.menuDelete} onClick={() => { onDelete(employee); setMenuOpen(false); }}>
              <LuTrash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Name & Designation */}
      <div className={styles.nameBlock}>
        <h3 className={styles.name}>{employee.name}</h3>
        <p className={styles.designation}>{employee.designation || 'No Designation'}</p>
      </div>

      {/* Role badge */}
      <div className={styles.roleBadge} style={{ background: roleColor + '22', color: roleColor, borderColor: roleColor + '44' }}>
        {employee.role}
      </div>

      {/* Info rows */}
      <div className={styles.infoRows}>
        {employee.email && (
          <div className={styles.infoRow}>
            <LuMail size={12} />
            <span>{employee.email}</span>
          </div>
        )}
        {employee.phone && (
          <div className={styles.infoRow}>
            <LuPhone size={12} />
            <span>{employee.phone}</span>
          </div>
        )}
        {employee.employee_id && (
          <div className={styles.infoRow}>
            <LuUser size={12} />
            <span>{employee.employee_id}</span>
          </div>
        )}
        {employee.joining_date && (
          <div className={styles.infoRow}>
            <LuCalendarDays size={12} />
            <span>Joined {new Date(employee.joining_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Project tags */}
      {projects.length > 0 && (
        <div className={styles.projects}>
          <LuFolderOpen size={11} className={styles.projectIcon} />
          {projects.slice(0, 2).map(p => (
            <span key={p.id} className={styles.projectTag}>{p.title}</span>
          ))}
          {projects.length > 2 && (
            <span className={styles.projectMore}>+{projects.length - 2}</span>
          )}
        </div>
      )}

      {/* Status chip */}
      <div className={styles.statusChip} style={{ background: statusColor + '22', color: statusColor }}>
        <span className={styles.statusDotInline} style={{ background: statusColor }} />
        {employee.status}
      </div>
    </div>
  );
};

export default EmployeeCard;