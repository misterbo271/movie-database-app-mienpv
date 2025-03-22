/**
 * TimeUtil.tsx
 * Utility functions for calculating remaining time until a target date/time
 * Using moment.js for easy time manipulation
 */

import moment from 'moment';

/**
 * Interface for time until breakdown result
 */
export interface TimeUntilResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isPast: boolean;
}

/**
 * Calculate time remaining until a specific date
 * @param targetDate Target date as a string
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns TimeUntilResult object with breakdown of time components
 */
export const getTimeUntil = (targetDate: string, dateFormat = 'YYYY-MM-DD'): TimeUntilResult => {
  const now = moment();
  const target = moment(targetDate, dateFormat);
  const diff = target.diff(now);
  const duration = moment.duration(diff);
  const isPast = diff < 0;
  
  // Convert to absolute values for past dates
  const absDiff = Math.abs(diff);
  const absDuration = moment.duration(absDiff);
  
  return {
    days: Math.floor(absDuration.asDays()),
    hours: absDuration.hours(),
    minutes: absDuration.minutes(),
    seconds: absDuration.seconds(),
    total: absDiff,
    isPast
  };
};

/**
 * Calculate time remaining until a specific date and time
 * @param targetDateTime Target date and time as a string
 * @param dateTimeFormat Format of the target date and time (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns TimeUntilResult object with breakdown of time components
 */
export const getTimeUntilDateTime = (
  targetDateTime: string,
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'
): TimeUntilResult => {
  return getTimeUntil(targetDateTime, dateTimeFormat);
};

/**
 * Get human-readable string representing time until a date
 * @param targetDate Target date as a string
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns Formatted string like "2 days, 4 hours, 30 minutes"
 */
export const getTimeUntilString = (targetDate: string, dateFormat = 'YYYY-MM-DD'): string => {
  const { days, hours, minutes, isPast } = getTimeUntil(targetDate, dateFormat);
  
  const prefix = isPast ? '' : '';
  const suffix = isPast ? ' ago' : '';
  
  if (days > 0) {
    return `${prefix}${days} day${days !== 1 ? 's' : ''}${suffix}${hours > 0 ? `, ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
  }
  
  if (hours > 0) {
    return `${prefix}${hours} hour${hours !== 1 ? 's' : ''}${suffix}${minutes > 0 ? `, ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
  }
  
  if (minutes > 0) {
    return `${prefix}${minutes} minute${minutes !== 1 ? 's' : ''}${suffix}`;
  }
  
  return isPast ? 'Just now' : 'Less than a minute';
};

/**
 * Check if a date is within a specified number of days from now
 * @param targetDate Target date as a string
 * @param days Number of days to check within
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns Boolean indicating if date is within specified days
 */
export const isWithinDays = (targetDate: string, days: number, dateFormat = 'YYYY-MM-DD'): boolean => {
  const now = moment();
  const target = moment(targetDate, dateFormat);
  const diffDays = Math.abs(target.diff(now, 'days'));
  
  return diffDays <= days;
};

/**
 * Get a user-friendly relative time string
 * @param targetDate Target date as a string
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns String like "2 days ago", "in 3 hours", "a few seconds ago", etc.
 */
export const getRelativeTimeString = (targetDate: string, dateFormat = 'YYYY-MM-DD'): string => {
  const now = moment();
  const target = moment(targetDate, dateFormat);
  
  return target.from(now);
};

/**
 * Format a timestamp in a relative format like "3 hours ago" or "in 2 days"
 * @param timestamp Timestamp to format
 * @returns Relative time string
 */
export const formatRelativeTime = (timestamp: number | string): string => {
  return moment(timestamp).fromNow();
};

/**
 * Check if a date is coming soon (within a week)
 * @param targetDate Target date as a string
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns Boolean indicating if date is coming soon
 */
export const isComingSoon = (targetDate: string, dateFormat = 'YYYY-MM-DD'): boolean => {
  return isWithinDays(targetDate, 7, dateFormat) && !isDatePassed(targetDate, dateFormat);
};

/**
 * Check if a date has already passed
 * @param targetDate Target date as a string
 * @param dateFormat Format of the target date (default: 'YYYY-MM-DD')
 * @returns Boolean indicating if date has passed
 */
export const isDatePassed = (targetDate: string, dateFormat = 'YYYY-MM-DD'): boolean => {
  const now = moment().startOf('day');
  const target = moment(targetDate, dateFormat).startOf('day');
  
  return target.isBefore(now);
};

export default {
  getTimeUntil,
  getTimeUntilDateTime,
  getTimeUntilString,
  isWithinDays,
  getRelativeTimeString,
  formatRelativeTime,
  isComingSoon,
  isDatePassed
}; 