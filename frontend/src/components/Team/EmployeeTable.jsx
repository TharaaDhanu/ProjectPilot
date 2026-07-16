/**
 * components/Team/EmployeeTable.jsx
 * ----------------------------------
 * Table view for listing team members.
 */

import React from 'react';
import { LuPencil, LuTrash2, LuEye } from 'react-icons/lu';
import styles from './EmployeeTable.module.css';

const STATUS_COLORS = {
  'Active':   '#22c55e',
  'Busy':     '#f59e0b',
  'On Leave': '#8b5cf6',
  'Offline':  '#6b7280',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const EmployeeTable = ({ employees, onView, onEdit, onDelete }) => {
  if (!employees.length) {
    return (
      <div className={styles.empty}>
        <p>No team members found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>ID</th>
            <th>Role</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Projects</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const statusColor = STATUS_COLORS[emp.status] || '#6b7280';
            const projects = emp.assigned_projects || [];
            return (
              <tr key={emp.id} className={styles.row} onClick={() => onView(emp.id)}>
                <td>
                  <div className={styles.nameCell}>
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.name} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarInitials}>{getInitials(emp.name)}</div>
                    )}
                    <div>
                      <div className={styles.empName}>{emp.name}</div>
                      <div className={styles.empDesig}>{emp.designation || '—'}</div>
                    </div>
                  </div>
                </td>
                <td><span className={styles.empId}>{emp.employee_id || '—'}</span></td>
                <td><span className={styles.rolePill}>{emp.role}</span></td>
                <td>{emp.designation || '—'}</td>
                <td className={styles.emailCell}>{emp.email}</td>
                <td>{emp.phone || '—'}</td>
                <td>
                  <div className={styles.projTags}>
                    {projects.slice(0, 2).map(p => (
                      <span key={p.id} className={styles.projTag}>{p.title}</span>
                    ))}
                    {projects.length > 2 && <span className={styles.projMore}>+{projects.length - 2}</span>}
                    {projects.length === 0 && <span className={styles.none}>None</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.statusChip} style={{ color: statusColor, background: statusColor + '18' }}>
                    <span className={styles.dot} style={{ background: statusColor }} />
                    {emp.status}
                  </div>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className={styles.actions}>
                    <button title="View" className={styles.actionBtn} onClick={() => onView(emp.id)}>
                      <LuEye size={14} />
                    </button>
                    <button title="Edit" className={styles.actionBtn} onClick={() => onEdit(emp)}>
                      <LuPencil size={14} />
                    </button>
                    <button title="Delete" className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => onDelete(emp)}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;