/**
 * components/Tasks/KanbanBoard.jsx
 * ---------------------------------
 * Drag-and-drop board for tasks across statuses:
 * To Do, In Progress, In Review, Blocked, Completed, Archived.
 */

import React, { useState } from 'react';
import {
  LuListTodo, LuPlay, LuSquareCheck,
  LuOctagonAlert, LuArchive
} from 'react-icons/lu';
import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { status: 'To Do',       label: 'To Do',       icon: LuListTodo,     class: 'todoIcon' },
  { status: 'In Progress', label: 'In Progress', icon: LuPlay,         class: 'inprogressIcon' },
  { status: 'In Review',   label: 'In Review',   icon: LuSquareCheck,  class: 'inreviewIcon' },
  { status: 'Blocked',    label: 'Blocked',     icon: LuOctagonAlert, class: 'blockedIcon' },
  { status: 'Completed',  label: 'Completed',   icon: LuSquareCheck,  class: 'completedIcon' },
  { status: 'Archived',   label: 'Archived',    icon: LuArchive,      class: 'archivedIcon' }
];

const KanbanBoard = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onFavorite,
  onMoveTask
}) => {
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = Number(taskIdStr);
      onMoveTask(taskId, targetStatus);
    }
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const IconComponent = col.icon;

        return (
          <div
            key={col.status}
            className={`${styles.column} ${dragOverCol === col.status ? styles.dragOver : ''}`}
            onDragOver={e => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.status)}
          >
            {/* Column Header */}
            <div className={styles.colHeader}>
              <div className={styles.colTitleWrapper}>
                <span className={`${styles.colIcon} ${styles[col.class]}`}>
                  <IconComponent size={14} />
                </span>
                <h3 className={styles.colTitle}>{col.label}</h3>
              </div>
              <span className={styles.countBadge}>{colTasks.length}</span>
            </div>

            {/* Cards List */}
            <div className={styles.cardsList}>
              {colTasks.length === 0 ? (
                <div className={styles.emptyCol}>
                  Drop tasks here
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    onDuplicate={onDuplicate}
                    onFavorite={onFavorite}
                    dragHandlers={{
                      draggable: true,
                      onDragStart: (e) => handleDragStart(e, task.id)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
