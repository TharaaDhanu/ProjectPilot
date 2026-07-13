/**
 * components/Calendar/EventDetailsDrawer.jsx
 * ------------------------------------------
 * Reusable right-side drawer that displays the full details of a calendar
 * event (manual or virtual). Supports editing and deleting manual events.
 */

import React from 'react';
import {
  LuX, LuPencil, LuTrash2, LuClock, LuMapPin, LuAlignLeft,
  LuFlag, LuCircleDot, LuUser, LuFolder, LuSquareCheck, LuRepeat,
  LuCalendar, LuStickyNote,
} from 'react-icons/lu';
import styles from './EventDetailsDrawer.module.css';

// Event-type → icon + accent colour mapping (reused across the app)
export const EVENT_META = {
  Project:          { icon: '📁', color: '#3b82f6' },
  Task:             { icon: '✅', color: '#22c55e' },
  Meeting:          { icon: '📅', color: '#8b5cf6' },
  Deadline:         { icon: '⏰', color: '#ef4444' },
  Milestone:        { icon: '🏁', color: '#f59e0b' },
  Leave:            { icon: '🏖️', color: '#06b6d4' },
  Birthday:         { icon: '🎂', color: '#ec4899' },
  'Work Anniversary': { icon: '🎗️', color: '#f59e0b' },
  Holiday:          { icon: '🎉', color: '#10b981' },
  Reminder:         { icon: '🔔', color: '#eab308' },
  Personal:         { icon: '👤', color: '#6b7280' },
};

const PRIORITY_COLOR = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

const STATUS_COLOR = {
  Confirmed: '#22c55e',
  Pending: '#f59e0b',
  Cancelled: '#ef4444',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (t) => {
  if (!t) return null;
  // t may be "HH:MM:SS" or "HH:MM"
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hr12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hr12}:${m} ${ampm}`;
};

const DetailRow = ({ icon: Icon, label, value, color }) => (
  <div className={styles.detailRow}>
    <div className={styles.detailIcon} style={{ color: color || '#94a3b8' }}>
      <Icon size={15} />
    </div>
    <div className={styles.detailBody}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value || '—'}</span>
    </div>
  </div>
);

const EventDetailsDrawer = ({ event, onClose, onEdit, onDelete }) => {
  if (!event) return null;

  const meta = EVENT_META[event.event_type] || EVENT_META.Personal;
  const isVirtual = event.is_virtual;
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Event details"
      >
        {/* Accent header */}
        <div className={styles.header} style={{ background: `${meta.color}1a`, borderColor: `${meta.color}55` }}>
          <div className={styles.headerTop}>
            <span className={styles.typeBadge} style={{ background: meta.color, color: '#fff' }}>
              {meta.icon} {event.event_type}
            </span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <LuX size={18} />
            </button>
          </div>
          <h2 className={styles.title}>{event.title}</h2>
          {event.description && <p className={styles.desc}>{event.description}</p>}
        </div>

        <div className={styles.body}>
          <DetailRow icon={LuCalendar} label="Start Date" value={formatDate(event.start_date)} color={meta.color} />
          <DetailRow icon={LuCalendar} label="End Date" value={formatDate(event.end_date)} color={meta.color} />

          {!event.is_all_day && (startTime || endTime) && (
            <DetailRow
              icon={LuClock}
              label="Time"
              value={`${startTime || '—'}${endTime ? ` – ${endTime}` : ''}`}
            />
          )}
          {event.is_all_day && <DetailRow icon={LuClock} label="Time" value="All day" />}

          {event.location && <DetailRow icon={LuMapPin} label="Location" value={event.location} />}

          {event.priority && (
            <DetailRow
              icon={LuFlag}
              label="Priority"
              value={
                <span className={styles.chip} style={{ background: `${PRIORITY_COLOR[event.priority] || '#6b7280'}22`, color: PRIORITY_COLOR[event.priority] || '#6b7280' }}>
                  {event.priority}
                </span>
              }
            />
          )}

          {event.status && (
            <DetailRow
              icon={LuCircleDot}
              label="Status"
              value={
                <span className={styles.chip} style={{ background: `${STATUS_COLOR[event.status] || '#6b7280'}22`, color: STATUS_COLOR[event.status] || '#6b7280' }}>
                  {event.status}
                </span>
              }
            />
          )}

          {event.project_title && <DetailRow icon={LuFolder} label="Project" value={event.project_title} />}
          {event.task_title && <DetailRow icon={LuSquareCheck} label="Task" value={event.task_title} />}
          {event.employee_name && <DetailRow icon={LuUser} label="Assigned Employee" value={event.employee_name} />}
          {event.repeat_type && event.repeat_type !== 'None' && (
            <DetailRow icon={LuRepeat} label="Repeat" value={event.repeat_type} />
          )}

          {event.notes && (
            <div className={styles.notesBlock}>
              <div className={styles.detailIcon} style={{ color: '#94a3b8' }}><LuStickyNote size={15} /></div>
              <div>
                <span className={styles.detailLabel}>Notes</span>
                <p className={styles.notesText}>{event.notes}</p>
              </div>
            </div>
          )}

          {event.created_by != null && (
            <p className={styles.meta}>Created by {event.creator_name || 'Unknown'}</p>
          )}
        </div>

        {/* Footer actions (manual events only) */}
        {!isVirtual && (
          <div className={styles.footer}>
            <button className={styles.editBtn} onClick={() => onEdit(event)}>
              <LuPencil size={15} /> Edit
            </button>
            <button className={styles.deleteBtn} onClick={() => onDelete(event)}>
              <LuTrash2 size={15} /> Delete
            </button>
          </div>
        )}
        {isVirtual && (
          <div className={styles.footer}>
            <span className={styles.virtualNote}>
              <LuAlignLeft size={13} /> Auto-generated from {event.event_type === 'Task' ? 'a task' : event.event_type === 'Project' ? 'a project' : 'team data'}.
            </span>
          </div>
        )}
      </aside>
    </div>
  );
};

export default EventDetailsDrawer;