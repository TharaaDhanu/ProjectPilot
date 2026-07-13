/**
 * components/Calendar/MiniCalendar.jsx
 * ------------------------------------
 * Reusable compact month calendar. Highlights the selected date and today,
 * and accepts an optional set of dates that have events (for dot markers).
 */

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './MiniCalendar.module.css';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MiniCalendar = ({ selectedDate, onSelectDate, eventDates = [] }) => {
  const [current, setCurrent] = useState(dayjs(selectedDate || new Date()));
  const today = dayjs();

  const startOfMonth = current.startOf('month');
  const daysInMonth = current.daysInMonth();
  const firstDow = startOfMonth.day();

  const days = [];
  for (let i = 0; i < firstDow; i++) {
    days.push({ date: startOfMonth.subtract(firstDow - i, 'day'), otherMonth: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: current.date(i), otherMonth: false });
  }
  const trailing = 42 - days.length;
  for (let i = 1; i <= trailing; i++) {
    days.push({ date: current.endOf('month').add(i, 'day'), otherMonth: true });
  }

  const eventSet = new Set(eventDates.map(d => dayjs(d).format('YYYY-MM-DD')));
  const selKey = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.nav} onClick={() => setCurrent(c => c.subtract(1, 'month'))} aria-label="Previous month">
          <MdChevronLeft size={16} />
        </button>
        <span className={styles.month}>{current.format('MMMM YYYY')}</span>
        <button className={styles.nav} onClick={() => setCurrent(c => c.add(1, 'month'))} aria-label="Next month">
          <MdChevronRight size={16} />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((d, i) => (
          <div key={`wd-${i}`} className={styles.dayName}>{d}</div>
        ))}
        {days.map(({ date, otherMonth }, idx) => {
          const isToday = date.isSame(today, 'day');
          const isSelected = selKey && date.format('YYYY-MM-DD') === selKey;
          const hasEvent = eventSet.has(date.format('YYYY-MM-DD'));
          return (
            <button
              key={idx}
              className={[
                styles.day,
                otherMonth ? styles.other : '',
                isToday ? styles.today : '',
                isSelected ? styles.selected : '',
              ].join(' ')}
              onClick={() => onSelectDate && onSelectDate(date.toDate())}
              aria-label={date.format('D MMM YYYY')}
            >
              {date.date()}
              {hasEvent && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;