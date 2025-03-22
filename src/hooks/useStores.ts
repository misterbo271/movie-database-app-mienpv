import { useContext } from 'react';
import { StoresContext } from '../stores/StoresProvider';

/**
 * Hook to access stores in components
 * @example
 * // In component
 * const { moviesStore } = useStores();
 * // Using the store
 * const { nowPlayingMovies, loading } = moviesStore;
 */
export const useStores = () => {
  return useContext(StoresContext);
};

/**
 * Hook to access only moviesStore
 * @example
 * // In component
 * const movies = useMoviesStore();
 * // Using the store
 * const { nowPlayingMovies, loading } = movies;
 */
export const useMoviesStore = () => {
  const { moviesStore } = useStores();
  return moviesStore;
};

export default useStores; 