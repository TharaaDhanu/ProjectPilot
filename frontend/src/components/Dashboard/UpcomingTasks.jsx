/**
 * components/Dashboard/UpcomingTasks.jsx
 * ----------------------------------------
 * Today's Deadlines horizontal card with navigation.
 */

import React, { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './UpcomingTasks.module.css';

const TodaysDeadlines = ({ tasks = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleTasks = tasks.slice(0, 3);
  const hasMultiple = visibleTasks.length > 1;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : visibleTasks.length - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < visibleTasks.length - 1 ? prev + 1 : 0));
  };

  if (tasks.length === 0) {
    return null;
  }

  const currentTask = visibleTasks[currentIndex] || visibleTasks[0];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Today's Deadlines</span>
        <div className={styles.divider} />
        <span className={styles.totalBadge}>{tasks.length}</span>
      </div>

      <div className={styles.deadlinesContainer}>
        {hasMultiple && (
          <button
            className={styles.navBtn}
            onClick={goPrev}
            aria-label="Previous deadline"
          >
            <MdChevronLeft size={18} />
          </button>
        )}

        <div className={styles.deadlineMiniCard}>
          <div className={styles.deadlineTitle}>{currentTask.title}</div>
          <div className={styles.deadlineStatus}>
            {currentTask.status || 'In Progress'}
          </div>
        </div>

        {hasMultiple && (
          <button
            className={styles.navBtn}
            onClick={goNext}
            aria-label="Next deadline"
          >
            <MdChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TodaysDeadlines;