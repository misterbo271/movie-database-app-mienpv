import { useState, useCallback, useEffect } from 'react';

/**
 * Result interface for API hook
 * @interface ApiResult
 * @template T Type of data returned by the API
 */
interface ApiResult<T> {
  /**
   * Data returned from the API
   */
  data: T | null;
  /**
   * Whether the API call is loading
   */
  loading: boolean;
  /**
   * Error from the API call
   */
  error: Error | null;
  /**
   * Function to execute the API call
   */
  request: (...args: any[]) => Promise<T | null>;
}

/**
 * Configuration options for API hook
 * @interface ApiOptions
 */
interface ApiOptions {
  /**
   * Whether to execute the API call on mount
   */
  runOnMount?: boolean;
  /**
   * Initial data to use before the API call completes
   */
  initialData?: any;
  /**
   * Transform function to apply to the API response
   */
  transformResponse?: (data: any) => any;
  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;
  /**
   * Custom success handler
   */
  onSuccess?: (data: any) => void;
}

/**
 * Custom hook for handling API requests with loading and error states
 * 
 * @template T Type of data returned by the API
 * @param apiFunc The API function to call
 * @param options Configuration options
 * @returns ApiResult object with data, loading, error, and request function
 * 
 * @example
 * // Basic usage
 * const getMovies = () => fetch('/api/movies').then(res => res.json());
 * const { data, loading, error, request } = useApi(getMovies);
 * 
 * useEffect(() => {
 *   request();
 * }, []);
 * 
 * @example
 * // With options
 * const getMovieDetails = (id) => fetch(`/api/movies/${id}`).then(res => res.json());
 * const { 
 *   data: movie, 
 *   loading, 
 *   error, 
 *   request: fetchMovie 
 * } = useApi(getMovieDetails, {
 *   runOnMount: false,
 *   transformResponse: (data) => ({
 *     ...data,
 *     releaseDate: new Date(data.releaseDate)
 *   }),
 *   onSuccess: (data) => console.log('Movie loaded:', data.title),
 *   onError: (err) => console.error('Failed to load movie:', err.message)
 * });
 * 
 * // Call with parameter
 * useEffect(() => {
 *   if (movieId) {
 *     fetchMovie(movieId);
 *   }
 * }, [movieId, fetchMovie]);
 */
function useApi<T>(
  apiFunc: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
): ApiResult<T> {
  const { 
    runOnMount = false, 
    initialData = null,
    transformResponse,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<any[]>([]);
  const [shouldRun, setShouldRun] = useState<boolean>(runOnMount);

  /**
   * Execute the API call
   */
  const request = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunc(...args);
        
        // Transform response if needed
        const transformedData = transformResponse ? transformResponse(response) : response;
        
        setData(transformedData);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(transformedData);
        }
        
        return transformedData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        // Call error callback if provided
        if (onError) {
          onError(error);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, transformResponse, onSuccess, onError]
  );

  /**
   * Store parameters and trigger API call
   */
  const requestWithParams = useCallback(
    (...args: any[]): Promise<T | null> => {
      setParams(args);
      setShouldRun(true);
      return request(...args);
    },
    [request]
  );

  /**
   * Run API call on mount or when shouldRun changes
   */
  useEffect(() => {
    if (shouldRun) {
      request(...params);
      setShouldRun(false);
    }
  }, [shouldRun, request, params]);

  return { data, loading, error, request: requestWithParams };
}

export default useApi; 