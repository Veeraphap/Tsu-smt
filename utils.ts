
import { Course } from './types';

/**
 * Parses a time string like "09:00-12:00" into start and end minutes from midnight.
 */
export const parseTimeRange = (timeStr: string) => {
  const [startPart, endPart] = timeStr.split('-');
  const [startH, startM] = startPart.split(':').map(Number);
  const [endH, endM] = endPart.split(':').map(Number);
  
  return {
    start: startH * 60 + startM,
    end: endH * 60 + endM
  };
};

/**
 * Checks if two courses have a schedule conflict.
 */
export const hasConflict = (c1: Course, c2: Course): boolean => {
  if (c1.day !== c2.day) return false;
  if (c1.code === c2.code) return false;

  const t1 = parseTimeRange(c1.time);
  const t2 = parseTimeRange(c2.time);

  return t1.start < t2.end && t1.end > t2.start;
};

/**
 * Finds which course in the schedule conflicts with the given course.
 */
export const getConflictingCourse = (target: Course, schedule: Course[]): Course | null => {
  return schedule.find(c => hasConflict(target, c)) || null;
};