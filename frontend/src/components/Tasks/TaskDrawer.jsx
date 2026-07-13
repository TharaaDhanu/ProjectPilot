/**
 * components/Tasks/TaskDrawer.jsx
 * ---------------------------------
 * Right-side sliding detail drawer for a single task.
 * Features:
 *   - Detail fields (Status, Priority, Project, Assignee, Dates)
 *   - Running Timer: shows formatted HH:MM:SS live ticking if active
 *   - Checklist & Subtasks interactive management
 *   - Comments thread with user posting
 */

import React, { useState, useEffect } from 'react';
import {
  MdClose, MdEdit, MdDelete, MdCalendarToday, MdAccessTime,
  MdPlayArrow, MdPause, MdAdd, MdComment, MdAssignmentTurnedIn
} from 'react-icons/md';
import styles from './TaskDrawer.module.css';

const STATUS_COLORS = {
  'To Do':       { bg: 'rgba(107, 114, 128, 0.1)',  color: '#4b5563' },
  'In Progress': { bg: 'rgba(59, 130, 246, 0.12)',  color: '#2563eb' },
  'In Review':   { bg: 'rgba(139, 92, 246, 0.12)',  color: '#7c3aed' },
  'Blocked':    { bg: 'rgba(239, 68, 68, 0.1)',     color: '#dc2626' },
  'Completed':  { bg: 'rgba(34, 197, 94, 0.12)',   color: '#16a34a' },
  'Cancelled':  { bg: 'rgba(156, 163, 175, 0.15)', color: '#6b7280' },
  'Archived':   { bg: 'rgba(30, 27, 53, 0.08)',    color: '#4b5563' },
};

const PRIORITY_COLORS = {
  'Low':      { bg: 'rgba(34, 197, 94, 0.1)',   color: '#16a34a' },
  'Medium':   { bg: 'rgba(245, 158, 11, 0.1)',  color: '#d97706' },
  'High':     { bg: 'rgba(239, 68, 68, 0.1)',   color: '#dc2626' },
  'Critical': { bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' },
};

const PROGRESS_FILL = {
  'To Do':       '#6b7280',
  'In Progress': '#3b82f6',
  'In Review':   '#8b5cf6',
  'Blocked':    '#ef4444',
  'Completed':  '#22c55e',
  'Cancelled':  '#9ca3af',
  'Archived':   '#9ca3af',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

const TaskDrawer = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
  currentUser
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Live Timer effect
  useEffect(() => {
    if (!task) return;
    
    // Set initial timer seconds
    setSecondsElapsed(task.timer_elapsed || 0);

    if (!task.timer_running || !task.timer_started_at) return;

    const startTime = new Date(task.timer_started_at).getTime();
    
    const interval = setInterval(() => {
      const liveSeconds = task.timer_elapsed + Math.floor((Date.now() - startTime) / 1000);
      setSecondsElapsed(liveSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [task]);

  if (!task) return null;

  const sc = STATUS_COLORS[task.status]   || { bg: '#f3f4f6', color: '#6b7280' };
  const pc = PRIORITY_COLORS[task.priority] || { bg: '#f3f4f6', color: '#6b7280' };

  // Timer Toggling
  const handleToggleTimer = async () => {
    try {
      await onUpdate(task.id, { timer_running: !task.timer_running });
    } catch (err) {
      console.error('Failed to update timer:', err);
    }
  };

  // Checklist Actions
  const handleToggleChecklist = async (index) => {
    const updated = task.checklist.map((item, idx) =>
      idx === index ? { ...item, completed: !item.completed } : item
    );
    await onUpdate(task.id, { checklist: updated });
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = { text: newChecklistText.trim(), completed: false };
    await onUpdate(task.id, { checklist: [...(task.checklist || []), newItem] });
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = async (index) => {
    const updated = task.checklist.filter((_, idx) => idx !== index);
    await onUpdate(task.id, { checklist: updated });
  };

  // Subtask Actions
  const handleToggleSubtask = async (index) => {
    const updated = task.subtasks.map((sub, idx) =>
      idx === index ? { ...sub, completed: !sub.completed } : sub
    );
    await onUpdate(task.id, { subtasks: updated });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newItem = { title: newSubtaskText.trim(), completed: false };
    await onUpdate(task.id, { subtasks: [...(task.subtasks || []), newItem] });
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = async (index) => {
    const updated = task.subtasks.filter((_, idx) => idx !== index);
    await onUpdate(task.id, { subtasks: updated });
  };

  // Comments Actions
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user_name: currentUser?.name || 'You',
      text: newCommentText.trim(),
      created_at: new Date().toISOString(),
    };
    await onUpdate(task.id, { comments: [...(task.comments || []), newComment] });
    setNewCommentText('');
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div id="task-drawer" className={styles.drawer}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.projectTitle}>{task.project_title || 'General'}</div>
            <h2 className={styles.title}>{task.title}</h2>
            <div className={styles.badges}>
              <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
                {task.status}
              </span>
              <span className={styles.badge} style={{ background: pc.bg, color: pc.color }}>
                {task.priority}
              </span>
            </div>
          </div>
          <button id="drawer-close-btn" className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
            <MdClose />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Description */}
          {task.description && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Description</div>
              <p className={styles.description}>{task.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Progress</div>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressPct}>{task.progress}% Complete</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${task.progress}%`,
                    background: PROGRESS_FILL[task.status] || '#6366f1'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Timer Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Task Timer & Hours</div>
            <div className={styles.timerCard}>
              <div className={styles.timerRow}>
                <div className={styles.timerDisplay}>
                  <div className={styles.timerVal}>{formatTime(secondsElapsed)}</div>
                  <div className={styles.timerSubLabel}>Active tracking time</div>
                </div>
                <button
                  onClick={handleToggleTimer}
                  className={`${styles.timerBtn} ${task.timer_running ? styles.timerRunning : ''}`}
                  title={task.timer_running ? 'Pause Timer' : 'Start Timer'}
                >
                  {task.timer_running ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
                  <span>{task.timer_running ? 'Pause' : 'Start'}</span>
                </button>
              </div>

              <div className={styles.hoursGrid}>
                <div className={styles.hourItem}>
                  <div className={styles.hourLabel}>Estimated</div>
                  <div className={styles.hourValue}>{task.estimated_hours}h</div>
                </div>
                <div className={styles.hourItem}>
                  <div className={styles.hourLabel}>Logged Actual</div>
                  <div className={styles.hourValue}>
                    {task.timer_running 
                      ? (secondsElapsed / 3600).toFixed(2)
                      : task.actual_hours}h
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Assignee Grid */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Details</div>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}><MdCalendarToday size={12} /> Start Date</div>
                <div className={styles.detailValue}>{formatDate(task.start_date)}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}><MdCalendarToday size={12} /> End Date</div>
                <div className={styles.detailValue}>{formatDate(task.end_date)}</div>
              </div>
              <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                <div className={styles.detailLabel}>Assignee</div>
                <div className={styles.assigneeRow}>
                  <div className={styles.avatar}>{getInitials(task.assigned_name)}</div>
                  <div className={styles.assigneeInfo}>
                    <div className={styles.assigneeName}>{task.assigned_name || 'Unassigned'}</div>
                    <div className={styles.assigneeEmail}>{task.assigned_email || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Checklist</div>
            <div className={styles.listContainer}>
              {(task.checklist || []).map((item, idx) => (
                <div key={idx} className={styles.listItem}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(idx)}
                    className={styles.checkbox}
                  />
                  <span className={`${styles.itemText} ${item.completed ? styles.completed : ''}`}>
                    {item.text}
                  </span>
                  <button className={styles.itemDelete} onClick={() => handleDeleteChecklistItem(idx)}>
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddChecklistItem} className={styles.addForm}>
                <input
                  type="text"
                  placeholder="Add item to checklist..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className={styles.addInput}
                />
                <button type="submit" className={styles.addBtn} aria-label="Add checklist item">
                  <MdAdd size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Subtasks */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Subtasks</div>
            <div className={styles.listContainer}>
              {(task.subtasks || []).map((sub, idx) => (
                <div key={idx} className={styles.listItem}>
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => handleToggleSubtask(idx)}
                    className={styles.checkbox}
                  />
                  <span className={`${styles.itemText} ${sub.completed ? styles.completed : ''}`}>
                    {sub.title}
                  </span>
                  <button className={styles.itemDelete} onClick={() => handleDeleteSubtask(idx)}>
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddSubtask} className={styles.addForm}>
                <input
                  type="text"
                  placeholder="Add subtask..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  className={styles.addInput}
                />
                <button type="submit" className={styles.addBtn} aria-label="Add subtask">
                  <MdAdd size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Comments */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}><MdComment size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Comments</div>
            <div className={styles.commentsList}>
              {(task.comments || []).map((c, idx) => (
                <div key={c.id || idx} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentUser}>{c.user_name}</span>
                    <span className={styles.commentTime}>
                      {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={styles.commentText}>{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <textarea
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className={styles.commentInput}
                rows={2}
              />
              <button type="submit" className={styles.commentSubmit}>
                Post Comment
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button id="drawer-edit-btn" className={styles.editBtn} onClick={() => onEdit(task)}>
            <MdEdit size={14} /> Edit Task
          </button>
          <button id="drawer-delete-btn" className={styles.deleteBtn} onClick={() => onDelete(task.id, task.title)}>
            <MdDelete size={14} /> Delete
          </button>
        </div>

      </div>
    </>
  );
};

export default TaskDrawer;
