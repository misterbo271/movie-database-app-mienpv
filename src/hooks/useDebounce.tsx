import { useState, useEffect } from 'react';

/**
 * A custom hook that delays updating a value until after a specified delay
 * Useful for search inputs to avoid excessive API calls while typing
 * 
 * @template T The type of the value to debounce
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * // Basic usage for search input
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * // Update search term on input change
 * const handleSearch = (text) => {
 *   setSearchTerm(text);
 * };
 * 
 * // Use the debounced value for API calls
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchMovies(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
function useDebounce<T>(value: T, delay: number = 500): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has elapsed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  // Return the debounced value
  return debouncedValue;
}

export default useDebounce; 