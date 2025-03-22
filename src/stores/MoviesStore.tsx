import { makeAutoObservable, runInAction } from 'mobx';
import CBConfigs from '../configs/CBConfigs';
import axios from 'axios';
import DateUtil from '@utils/DateUtil';

/**
 * Interface for a movie item
 */
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

/**
 * Interface for API response
 */
interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

/**
 * Types of movie listings
 */
export type MovieCategory = 'now_playing' | 'upcoming' | 'popular';

// Create axios instance with default config
const movieAPI = axios.create({
  baseURL: CBConfigs.tmdb.baseUrl,
  headers: {
    'Authorization': `Bearer ${CBConfigs.tmdb.accessToken}`,
    'Content-Type': 'application/json'
  }
});

/**
 * MoviesStore: Manages state and business logic related to movies
 * using MobX to track and update state automatically
 */
class MoviesStore {
  // Movies data by category
  nowPlayingMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  
  // Current states
  loading: {[key in MovieCategory]: boolean} = {
    now_playing: false,
    upcoming: false,
    popular: false
  };
  
  error: {[key in MovieCategory]: string | null} = {
    now_playing: null,
    upcoming: null,
    popular: null
  };
  
  // Pagination
  currentPage: {[key in MovieCategory]: number} = {
    now_playing: 1,
    upcoming: 1,
    popular: 1
  };
  
  totalPages: {[key in MovieCategory]: number} = {
    now_playing: 0,
    upcoming: 0,
    popular: 0
  };

  constructor() {
    // Make all properties observable
    makeAutoObservable(this);
  }

  /**
   * Fetch now playing movies
   * @param forceRefresh Force refresh data even if already loaded
   */
  async fetchNowPlayingMovies(forceRefresh = false) {
    if (this.nowPlayingMovies.length > 0 && !forceRefresh) {
      console.log('Using cached now playing movies');
      return;
    }
    
    await this.fetchMoviesByCategory('now_playing');
  }

  /**
   * Fetch upcoming movies
   * @param forceRefresh Force refresh data even if already loaded
   */
  async fetchUpcomingMovies(forceRefresh = false) {
    if (this.upcomingMovies.length > 0 && !forceRefresh) {
      console.log('Using cached upcoming movies');
      return;
    }
    
    await this.fetchMoviesByCategory('upcoming');
  }

  /**
   * Fetch popular movies
   * @param forceRefresh Force refresh data even if already loaded
   */
  async fetchPopularMovies(forceRefresh = false) {
    if (this.popularMovies.length > 0 && !forceRefresh) {
      console.log('Using cached popular movies');
      return;
    }
    
    await this.fetchMoviesByCategory('popular');
  }

  /**
   * Fetch movies by category
   * @param category Movie category (now_playing, upcoming, popular)
   * @param page Page number
   */
  async fetchMoviesByCategory(category: MovieCategory, page = 1) {
    // Mark as loading
    runInAction(() => {
      this.loading[category] = true;
      this.error[category] = null;
    });
    
    try {
      // Determine API endpoint and parameters based on category
      let endpoint = '';
      let params: Record<string, any> = {
        language: 'en-US',
        page: page,
        include_adult: false,
        include_video: false
      };
      
      switch (category) {
        case 'now_playing':
          // Using discover endpoint for now playing movies (released in the last 60 days)
          endpoint = '/discover/movie';
          
          // Get dates using DateUtil
          const pastDateStr = DateUtil.getDateDaysAgo(60);
          const currentDateStr = DateUtil.getCurrentDateFormatted();
          
          params = {
            include_adult: false,
            include_video: false,
            language: 'en-US',
            page: page,
            sort_by: 'popularity.desc',
            with_release_type: '2|3', // 2=Theatrical, 3=Digital
            'release_date.gte': pastDateStr,
            'release_date.lte': currentDateStr
          };
          break;
          
        case 'popular':
          // Using discover endpoint with popularity sorting for popular movies
          endpoint = '/discover/movie';
          params = {
            ...params,
            sort_by: 'popularity.desc'
          };
          break;
          
        case 'upcoming':
          // Using discover endpoint for upcoming movies as specified in the curl command
          endpoint = '/discover/movie';
          
          // Get dates using DateUtil
          const tomorrowStr = DateUtil.getDateDaysFromNow(1);
          const maxDateStr = DateUtil.getDateMonthsFromNow(2);
          
          params = {
            include_adult: false,
            include_video: false,
            language: 'en-US',
            page: page,
            sort_by: 'popularity.desc',
            with_release_type: '2|3', // 2=Theatrical, 3=Digital
            'release_date.gte': tomorrowStr,
            'release_date.lte': maxDateStr
          };
          break;
          
        default:
          throw new Error('Invalid category');
      }
      
      // Call API using axios
      const response = await movieAPI.get<MovieResponse>(endpoint, { params });
      
      // Show some sample movies
      if (response.data.results.length > 0) {
        console.log('📽️ Sample movies:');
        response.data.results.slice(0, 3).forEach((movie, index) => {
          console.log(`  ${index + 1}. ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'}) - Rating: ${movie.vote_average}`);
        });
      }
      
      // Update state with new data
      runInAction(() => {
        // Save data to corresponding category variable
        switch (category) {
          case 'now_playing':
            this.nowPlayingMovies = response.data.results;
            break;
          case 'upcoming':
            this.upcomingMovies = response.data.results;
            break;
          case 'popular':
            this.popularMovies = response.data.results;
            break;
        }
        
        // Save pagination information
        this.currentPage[category] = response.data.page;
        this.totalPages[category] = response.data.total_pages;
        
        // Mark as loaded
        this.loading[category] = false;
        console.log(`✅ ${category.toUpperCase()} movies loaded successfully\n`);
      });
      
    } catch (error) {
      runInAction(() => {
        this.loading[category] = false;
        this.error[category] = axios.isAxiosError(error) 
          ? error.message || `Error ${error.response?.status}` 
          : 'Unknown error';
        console.error(`❌ Error fetching ${category} movies:`, error);
      });
    }
  }

  /**
   * Search movies by keyword
   * @param query Search keyword
   * @param page Page number
   */
  async searchMovies(query: string, page = 1): Promise<Movie[]> {
    if (!query.trim()) {
      return [];
    }
    
    try {
      console.log(`\n🔎 SEARCHING MOVIES: "${query}" - Page ${page}`);
      
      // Call API using axios
      const response = await movieAPI.get<MovieResponse>('/search/movie', {
        params: {
          query: query,
          language: 'en-US',
          page: page
        }
      });
      
      // Log results for debugging
      console.log(`✅ Search Results:`, {
        query: query,
        resultsCount: response.data.results.length,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages
      });
      
      // Show some sample results
      if (response.data.results.length > 0) {
        console.log('📽️ Top search results:');
        response.data.results.slice(0, 5).forEach((movie, index) => {
          console.log(`  ${index + 1}. ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'}) - Rating: ${movie.vote_average}`);
        });
        console.log('\n');
      } else {
        console.log('❓ No results found for this search query\n');
      }
      
      return response.data.results;
      
    } catch (error) {
      console.error('❌ Error searching movies:', error);
      return [];
    }
  }

  /**
   * Convert poster path from TMDB API to full image URL
   * @param posterPath Poster path from API (e.g. "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg")
   * @param size Poster size (small, medium, large, original)
   * @returns Full image URL or placeholder image URL if poster_path is null/empty
   */
  getPosterUrl(posterPath: string | null, size: 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
    // Return placeholder image URL if posterPath is null or empty
    if (!posterPath || posterPath.trim() === '') {
      return 'https://via.placeholder.com/500x750?text=No+Image+Available';
    }
    
    // If posterPath is already a complete URL, return it as is
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    
    // Ensure the path starts with a slash as required by TMDB API
    // The TMDB API expects paths in format: /pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg
    const path = posterPath.startsWith('/') ? posterPath : `/${posterPath}`;
    
    // Construct the full URL using the configuration
    // Example: https://media.themoviedb.org/t/p/w500/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg
    return `${CBConfigs.tmdb.imageBaseUrl}/${CBConfigs.tmdb.posterSize[size]}${path}`;
  }

  /**
   * Refresh all data
   */
  async refreshAllMovies() {
    await Promise.all([
      this.fetchNowPlayingMovies(true),
      this.fetchUpcomingMovies(true),
      this.fetchPopularMovies(true)
    ]);
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    runInAction(() => {
      this.nowPlayingMovies = [];
      this.upcomingMovies = [];
      this.popularMovies = [];
      
      Object.keys(this.currentPage).forEach(key => {
        const category = key as MovieCategory;
        this.currentPage[category] = 1;
        this.totalPages[category] = 0;
      });
    });
  }
}

// Create a single instance of the store to use throughout the application
export const moviesStore = new MoviesStore();

export default moviesStore; 