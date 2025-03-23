/**
 * DateUtil.tsx
 * Utility functions for date formatting and calculations
 * Using moment.js for easy date manipulation
 */

import moment from 'moment';

/**
 * Get the current date as a moment object
 * @returns Current date as moment object
 */
export const getCurrentDate = (): moment.Moment => {
  return moment();
};

/**
 * Get the current date formatted as YYYY-MM-DD
 * @returns Formatted current date string
 */
export const getCurrentDateFormatted = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Get the current day of the month (1-31)
 * @returns Current day of month
 */
export const getCurrentDay = (): number => {
  return moment().date();
};

/**
 * Get the current month (1-12)
 * @returns Current month
 */
export const getCurrentMonth = (): number => {
  // moment months are 0-indexed, so add 1
  return moment().month() + 1;
};

/**
 * Get the current year (4 digits)
 * @returns Current year
 */
export const getCurrentYear = (): number => {
  return moment().year();
};

/**
 * Get the current month and year as a formatted string
 * @returns Current month and year (e.g., "March 2023")
 */
export const getCurrentMonthYear = (): string => {
  return moment().format('MMMM YYYY');
};

/**
 * Get the date N days ago
 * @param days Number of days to go back
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const getDateDaysAgo = (days: number): string => {
  return moment().subtract(days, 'days').format('YYYY-MM-DD');
};

/**
 * Get the date N days in the future
 * @param days Number of days to go forward
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const getDateDaysFromNow = (days: number): string => {
  return moment().add(days, 'days').format('YYYY-MM-DD');
};

/**
 * Get the date N months in the future
 * @param months Number of months to go forward
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const getDateMonthsFromNow = (months: number): string => {
  return moment().add(months, 'months').format('YYYY-MM-DD');
};

/**
 * Format a date string from one format to another
 * @param dateString Date string to format
 * @param inputFormat Input format (default: 'YYYY-MM-DD')
 * @param outputFormat Output format (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  inputFormat = 'YYYY-MM-DD',
  outputFormat = 'MMM DD, YYYY'
): string => {
  if (!dateString) return '';
  
  const date = moment(dateString, inputFormat);
  return date.isValid() ? date.format(outputFormat) : dateString;
};

/**
 * Check if a date is in the past
 * @param dateString Date string to check
 * @param format Format of the date string (default: 'YYYY-MM-DD')
 * @returns True if date is in the past
 */
export const isDateInPast = (dateString: string, format = 'YYYY-MM-DD'): boolean => {
  return moment(dateString, format).isBefore(moment(), 'day');
};

/**
 * Check if a date is in the future
 * @param dateString Date string to check
 * @param format Format of the date string (default: 'YYYY-MM-DD')
 * @returns True if date is in the future
 */
export const isDateInFuture = (dateString: string, format = 'YYYY-MM-DD'): boolean => {
  return moment(dateString, format).isAfter(moment(), 'day');
};

/**
 * Calculate days between two dates
 * @param startDate Start date string
 * @param endDate End date string (default: current date)
 * @param format Format of date strings (default: 'YYYY-MM-DD')
 * @returns Number of days between dates
 */
export const daysBetweenDates = (
  startDate: string,
  endDate = getCurrentDateFormatted(),
  format = 'YYYY-MM-DD'
): number => {
  const start = moment(startDate, format);
  const end = moment(endDate, format);
  return end.diff(start, 'days');
};

/**
 * Get a formatted month and year from a date string (e.g., "August 2023")
 * @param dateString - Date string to format
 * @param inputFormat - Input format of the date string (default: 'YYYY-MM-DD')
 * @returns Month and year string
 */
export const getFormattedMonthYear = (dateString: string, inputFormat: string = 'YYYY-MM-DD'): string => {
  if (!dateString) return '';
  
  try {
    return moment(dateString, inputFormat).format('MMMM YYYY');
  } catch (error) {
    console.error('Error formatting month/year:', error);
    return '';
  }
};

export default {
  getCurrentDate,
  getCurrentDateFormatted,
  getCurrentDay,
  getCurrentMonth,
  getCurrentYear,
  getCurrentMonthYear,
  getDateDaysAgo,
  getDateDaysFromNow,
  getDateMonthsFromNow,
  formatDate,
  isDateInPast,
  isDateInFuture,
  daysBetweenDates,
  getFormattedMonthYear
}; 