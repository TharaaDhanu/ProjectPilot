import React, { useState, useEffect } from 'react';
import { LuX, LuLoader } from 'react-icons/lu';
import { getProjects } from '../../services/projectService';
import taskService from '../../services/taskService';
import styles from './EventFormModal.module.css';

const EVENT_TYPES = [
  'Meeting', 'Deadline', 'Milestone', 'Leave', 'Birthday',
  'Work Anniversary', 'Holiday', 'Reminder', 'Personal'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const REPEAT_TYPES = ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#6b7280'];

const EventFormModal = ({ event, onClose, onSubmit }) => {
  const isEdit = !!event;
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventType, setEventType] = useState(event?.event_type || 'Meeting');
  const [color, setColor] = useState(event?.color || '#3b82f6');
  const [startDate, setStartDate] = useState(event?.start_date || '');
  const [endDate, setEndDate] = useState(event?.end_date || '');
  const [startTime, setStartTime] = useState(event?.start_time || '');
  const [endTime, setEndTime] = useState(event?.end_time || '');
  const [location, setLocation] = useState(event?.location || '');
  
  const [projectId, setProjectId] = useState(event?.project_id || '');
  const [taskId, setTaskId] = useState(event?.task_id || '');
  const [employeeId, setEmployeeId] = useState(event?.employee_id || '');
  
  const [priority, setPriority] = useState(event?.priority || 'Medium');
  const [status, setStatus] = useState(event?.status || 'Confirmed');
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day || false);
  const [repeatType, setRepeatType] = useState(event?.repeat_type || 'None');
  const [reminder, setReminder] = useState(event?.reminder || 'None');
  const [notes, setNotes] = useState(event?.notes || '');

  // Load projects and users on mount
  useEffect(() => {
    setLoadingProjects(true);
    Promise.all([
      getProjects({ per_page: 100 }).catch(() => ({ projects: [] })),
      taskService.getUsers().catch(() => [])
    ]).then(([projData, userData]) => {
      setProjects(projData?.projects || []);
      setUsers(userData || []);
    }).finally(() => setLoadingProjects(false));
  }, []);

  // Load tasks when selected project changes
  useEffect(() => {
    if (projectId) {
      taskService.getTasks({ project_id: projectId })
        .then(data => setTasks(data || []))
        .catch(() => setTasks([]));
    } else {
      setTasks([]);
    }
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!startDate) {
      setError('Start date is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        color,
        start_date: startDate,
        end_date: endDate || startDate,
        start_time: isAllDay ? null : (startTime || null),
        end_time: isAllDay ? null : (endTime || null),
        location: location.trim() || null,
        project_id: projectId ? Number(projectId) : null,
        task_id: taskId ? Number(taskId) : null,
        employee_id: employeeId ? Number(employeeId) : null,
        priority,
        status,
        is_all_day: isAllDay,
        repeat_type: repeatType,
        reminder,
        notes: notes.trim() || null
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Failed to save calendar event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit Event' : 'Schedule Event'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <LuX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            
            {/* Title */}
            <div className={styles.field}>
              <label>Event Title *</label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Weekly Standup, Task Deadline, Client Presentation" 
                required 
              />
            </div>

            {/* Row 1: Event Type & Priority */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Event Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Presets Color Picker */}
            <div className={styles.field}>
              <label>Color Theme</label>
              <div className={styles.colorRow}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorOption} ${color === c ? styles.colorActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Row 2: Start Date & End Date */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Start Date *</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>
            </div>

            {/* Checkbox: All Day */}
            <div className={styles.checkboxField}>
              <label className={styles.chkLabel}>
                <input 
                  type="checkbox" 
                  checked={isAllDay} 
                  onChange={e => setIsAllDay(e.target.checked)} 
                />
                All Day Event
              </label>
            </div>

            {/* Row 3: Start Time & End Time (conditional on all-day) */}
            {!isAllDay && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)} 
                  />
                </div>
                <div className={styles.field}>
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {/* Row 4: Repeat & Location */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Repeat Cycle</label>
                <select value={repeatType} onChange={e => setRepeatType(e.target.value)}>
                  {REPEAT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Location</label>
                <input 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  placeholder="e.g. Conference Room B, Google Meet Link" 
                />
              </div>
            </div>

            {/* Project integration dropdown */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Link Project (Optional)</label>
                <select value={projectId} onChange={e => setProjectId(e.target.value)}>
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Link Task (Optional)</label>
                <select value={taskId} onChange={e => setTaskId(e.target.value)} disabled={!projectId}>
                  <option value="">No Task</option>
                  {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
            </div>

            {/* User assignment */}
            <div className={styles.field}>
              <label>Assignee / Host (Optional)</label>
              <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3} 
                placeholder="Details of the event..." 
              />
            </div>

            {/* Row: Reminder & Status */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Reminder</label>
                <select value={reminder} onChange={e => setReminder(e.target.value)}>
                  {['None', 'At time of event', '10 minutes before', '30 minutes before', '1 hour before', '1 day before'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  {['Confirmed', 'Pending', 'Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.field}>
              <label>Notes</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={2} 
                placeholder="Private notes for this event..." 
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? <LuLoader size={14} className={styles.spin} /> : null}
              {isEdit ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
