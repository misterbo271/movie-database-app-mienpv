import { useState, useCallback, useEffect } from 'react';

/**
 * Configuration options for InfiniteScroll hook
 * @interface InfiniteScrollOptions
 * @template T Type of items in the data array
 */
interface InfiniteScrollOptions<T> {
  /**
   * Initial page number to start fetching (default: 1)
   */
  initialPage?: number;
  /**
   * Number of items to fetch per page (default: 20)
   */
  pageSize?: number;
  /**
   * Function to fetch data for a given page
   */
  fetchData: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>;
  /**
   * Whether to fetch data on mount (default: true)
   */
  fetchOnMount?: boolean;
  /**
   * Function to merge existing and new items (default: concatenate arrays)
   */
  mergeData?: (existing: T[], newItems: T[]) => T[];
  /**
   * Function to check if we've reached the end of the list
   */
  hasMoreData?: (data: T[], page: number) => boolean;
}

/**
 * Result interface for InfiniteScroll hook
 * @interface InfiniteScrollResult
 * @template T Type of items in the data array
 */
interface InfiniteScrollResult<T> {
  /**
   * Array of items loaded so far
   */
  data: T[];
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  /**
   * Whether data is currently being loaded
   */
  loading: boolean;
  /**
   * Current page number
   */
  page: number;
  /**
   * Error that occurred during loading, if any
   */
  error: Error | null;
  /**
   * Function to load the next page of data
   */
  loadMore: () => Promise<void>;
  /**
   * Function to refresh all data (reload from first page)
   */
  refresh: () => Promise<void>;
  /**
   * Whether a refresh is in progress
   */
  refreshing: boolean;
}

/**
 * Custom hook for implementing infinite scrolling with pagination
 * 
 * @template T Type of items in the data array
 * @param options Configuration options for the infinite scroll
 * @returns InfiniteScrollResult object with data and control functions
 * 
 * @example
 * // Basic usage
 * const fetchMovies = async (page, pageSize) => {
 *   const response = await fetch(`/api/movies?page=${page}&limit=${pageSize}`);
 *   const data = await response.json();
 *   return { 
 *     items: data.results, 
 *     hasMore: page < data.totalPages 
 *   };
 * };
 * 
 * const {
 *   data: movies,
 *   loading,
 *   hasMore,
 *   loadMore,
 *   refresh,
 *   refreshing,
 *   error
 * } = useInfiniteScroll({ fetchData: fetchMovies });
 * 
 * // FlatList with infinite scrolling
 * <FlatList
 *   data={movies}
 *   renderItem={renderMovie}
 *   keyExtractor={(item) => item.id.toString()}
 *   onEndReached={loadMore}
 *   onEndReachedThreshold={0.5}
 *   refreshing={refreshing}
 *   onRefresh={refresh}
 *   ListFooterComponent={loading && !refreshing ? <ActivityIndicator /> : null}
 * />
 */
function useInfiniteScroll<T>(
  options: InfiniteScrollOptions<T>
): InfiniteScrollResult<T> {
  const {
    initialPage = 1,
    pageSize = 20,
    fetchData,
    fetchOnMount = true,
    mergeData = (existing, newItems) => [...existing, ...newItems],
    hasMoreData,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(initialPage);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load data for the current page
   */
  const loadData = useCallback(
    async (currentPage: number, refresh: boolean = false) => {
      try {
        // Set appropriate loading state
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        
        setError(null);

        // Fetch data for the current page
        const result = await fetchData(currentPage, pageSize);
        
        // Update data state
        setData(prevData => {
          if (refresh) {
            return result.items;
          }
          return mergeData(prevData, result.items);
        });
        
        // Check if there's more data to load
        if (hasMoreData) {
          setHasMore(hasMoreData(result.items, currentPage));
        } else {
          setHasMore(result.hasMore);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error loading data:', error);
      } finally {
        // Reset loading states
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchData, pageSize, mergeData, hasMoreData]
  );

  /**
   * Load the next page of data
   */
  const loadMore = useCallback(async () => {
    if (!loading && !refreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadData(nextPage);
    }
  }, [loading, refreshing, hasMore, page, loadData]);

  /**
   * Refresh all data (reload from first page)
   */
  const refresh = useCallback(async () => {
    setPage(initialPage);
    await loadData(initialPage, true);
  }, [initialPage, loadData]);

  /**
   * Load initial data on mount if fetchOnMount is true
   */
  useEffect(() => {
    if (fetchOnMount) {
      loadData(initialPage);
    }
  }, [fetchOnMount, initialPage, loadData]);

  return {
    data,
    hasMore,
    loading,
    page,
    error,
    loadMore,
    refresh,
    refreshing,
  };
}

export default useInfiniteScroll; 