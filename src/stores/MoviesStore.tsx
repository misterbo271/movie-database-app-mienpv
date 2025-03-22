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
  original_title?: string;
}

/**
 * Interface for detailed movie information
 */
export interface MovieDetail extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  original_language: string;
  production_companies: { id: number; name: string; logo_path: string; origin_country: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path: string;
    }[];
  };
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
export type MovieCategory = 'now_playing' | 'upcoming' | 'popular' | 'search';

/**
 * User profile information
 */
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  avatar?: {
    gravatar?: {
      hash: string;
    };
    tmdb?: {
      avatar_path: string;
    };
  };
  iso_639_1?: string;
  iso_3166_1?: string;
  include_adult?: boolean;
}

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
  watchlistMovies: Movie[] = [];
  
  // User profile
  userProfile: UserProfile | null = null;
  
  // Current states
  loading: {[key in MovieCategory | 'profile']: boolean} = {
    now_playing: false,
    upcoming: false,
    popular: false,
    search: false,
    profile: false
  };
  
  error: {[key in MovieCategory | 'profile']: string | null} = {
    now_playing: null,
    upcoming: null,
    popular: null,
    search: null,
    profile: null
  };
  
  // Pagination
  currentPage: {[key in MovieCategory]: number} = {
    now_playing: 1,
    upcoming: 1,
    popular: 1,
    search: 1
  };
  
  totalPages: {[key in MovieCategory]: number} = {
    now_playing: 0,
    upcoming: 0,
    popular: 0,
    search: 0
  };

  // Currently viewing movie detail
  currentMovieDetail: MovieDetail | null = null;

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
   * Fetch popular movies with specific sorting
   * @param sortBy The sorting parameter to use
   */
  async fetchPopularMoviesSorted(sortBy: string) {
    console.log(`🔄 Starting fetch for popular movies with sort: ${sortBy}`);
    
    // Set loading state
    runInAction(() => {
      this.loading.popular = true;
      this.error.popular = null;
    });
    
    try {
      // Create API request parameters
      const params = {
        include_adult: false,
        include_video: false,
        language: 'en-US',
        page: 1,
        sort_by: sortBy
      };
      
      console.log('📡 API request params:', params);
      
      // Make the API call
      const response = await movieAPI.get('/discover/movie', { params });
      
      console.log(`✅ API request successful, got ${response.data.results.length} movies`);
      
      // Update the store with the results
      runInAction(() => {
        this.popularMovies = response.data.results;
        this.loading.popular = false;
        
        // Sample output
        if (response.data.results.length > 0) {
          console.log('Sample results:');
          response.data.results.slice(0, 3).forEach((movie: Movie, i: number) => {
            console.log(`  ${i+1}. ${movie.title} (${movie.release_date}) - Rating: ${movie.vote_average}`);
          });
        }
      });
      
    } catch (error) {
      console.error('⚠️ Error fetching sorted popular movies:', error);
      
      runInAction(() => {
        this.loading.popular = false;
        this.error.popular = 'Failed to fetch sorted movies';
      });
    }
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
    
    // Use the default sort parameter: popularity.desc
    await this.fetchPopularMoviesSorted('popularity.desc');
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
   * Search movies by query with enhanced matching and sorting
   * @param query Search query
   * @returns Array of movies matching the query, sorted by release date
   */
  searchMovies = async (query: string): Promise<Movie[]> => {
    // Mark as loading
    runInAction(() => {
      this.loading['search'] = true;
      this.error['search'] = null;
    });
    
    try {
      // Trim the query to remove any leading/trailing whitespace
      const trimmedQuery = query.trim();
      
      // If query is empty after trimming, return empty array
      if (!trimmedQuery) {
        runInAction(() => {
          this.loading['search'] = false;
        });
        return [];
      }
      
      // Split search terms for better matching
      const searchTerms = trimmedQuery.toLowerCase().split(' ');
      
      // Call the search API
      const response = await movieAPI.get<MovieResponse>(
        `/search/movie?query=${encodeURIComponent(trimmedQuery)}`
      );
      
      // Enhanced filtering to include:
      // 1. Partial matches in title/original_title
      // 2. First letter matching (e.g., "CA" matches "Captain America")
      let filteredResults = response.data.results.filter(movie => {
        const title = movie.title.toLowerCase();
        const originalTitle = movie.original_title?.toLowerCase() || '';
        
        // Check if any search term is included in either title
        const hasPartialMatch = searchTerms.some(term => 
          title.includes(term) || originalTitle.includes(term)
        );
        
        // Check for first letter matches
        const hasInitialsMatch = (() => {
          // For a single search term that might be initials (like "CA")
          if (searchTerms.length === 1 && trimmedQuery.length >= 2) {
            const term = searchTerms[0];
            
            // Get words from titles
            const titleWords = title.split(' ');
            const originalTitleWords = originalTitle.split(' ');
            
            // Check if consecutive first letters match the search term
            const titleInitials = titleWords.map(word => word.charAt(0)).join('');
            const originalTitleInitials = originalTitleWords.map(word => word.charAt(0)).join('');
            
            return titleInitials.includes(term) || originalTitleInitials.includes(term);
          }
          return false;
        })();
        
        return hasPartialMatch || hasInitialsMatch;
      });
      
      // Sort results by release date (newest first)
      filteredResults.sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      });
      
      console.log(`Search for "${trimmedQuery}" found ${filteredResults.length} filtered results out of ${response.data.results.length} total`);
      
      runInAction(() => {
        this.loading['search'] = false;
      });
      
      return filteredResults;
    } catch (error) {
      console.error('Error searching movies:', error);
      runInAction(() => {
        this.loading['search'] = false;
        this.error['search'] = axios.isAxiosError(error) 
          ? error.message || `Error ${(error as any).response?.status}` 
          : 'Unknown error';
      });
      return [];
    }
  };

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

  /**
   * Fetch movie details by ID
   * @param movieId The ID of the movie to fetch details for
   * @returns The movie detail object
   */
  async getMovieDetails(movieId: number): Promise<MovieDetail | null> {
    // Mark as loading
    runInAction(() => {
      this.loading['search'] = true; // Reuse search loading state temporarily
      this.error['search'] = null;
    });
    
    try {
      console.log(`Fetching details for movie ID: ${movieId}`);
      
      // Make the API request with append_to_response to fetch credits in the same request
      const response = await movieAPI.get<MovieDetail>(`/movie/${movieId}?language=en-US&append_to_response=credits`);
      
      // Update state with the fetched movie detail
      runInAction(() => {
        this.currentMovieDetail = response.data;
        this.loading['search'] = false;
        console.log(`✅ Movie details loaded successfully for: ${response.data.title}`);
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      
      runInAction(() => {
        this.loading['search'] = false;
        this.error['search'] = axios.isAxiosError(error) 
          ? error.message || `Error ${error.response?.status}` 
          : 'Unknown error';
      });
      
      return null;
    }
  }

  /**
   * Check if a movie is in the watchlist
   * @param movieId The ID of the movie to check
   * @returns true if the movie is in the watchlist, false otherwise
   */
  isInWatchlist(movieId: number): boolean {
    return this.watchlistMovies.some(movie => movie.id === movieId);
  }

  /**
   * Fetch user's watchlist from TMDB API
   * @param page Page number to fetch
   * @param sortBy Sort parameter (e.g., 'created_at.asc', 'created_at.desc', 'title.asc', etc.)
   * @returns Array of movies in the user's watchlist
   */
  async fetchWatchlist(page = 1, sortBy = 'created_at.asc'): Promise<Movie[]> {
    // Mark as loading
    runInAction(() => {
      this.loading.search = true; // Reuse search loading state
      this.error.search = null;
    });
    
    try {
      console.log(`Fetching watchlist for account ID: 21896145, sort by: ${sortBy}, page: ${page}`);
      
      // Make the API request exactly as in the curl command
      const url = `/account/21896145/watchlist/movies?language=en-US&page=${page}&sort_by=${sortBy}`;
      console.log('Requesting URL:', url);
      
      const response = await movieAPI.get<MovieResponse>(url);
      
      // Log the full response for debugging
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('API Response Data Structure:');
      console.log(`- page: ${response.data.page}`);
      console.log(`- total_results: ${response.data.total_results}`);
      console.log(`- total_pages: ${response.data.total_pages}`);
      console.log(`- results.length: ${response.data.results?.length || 0}`);
      
      // Show first result if available
      if (response.data.results && response.data.results.length > 0) {
        console.log('First result structure:');
        const keys = Object.keys(response.data.results[0]);
        console.log('Keys:', keys.join(', '));
      }
      
      // Update the watchlist in the store
      runInAction(() => {
        // Double check we have valid results
        if (Array.isArray(response.data.results)) {
          this.watchlistMovies = response.data.results;
          console.log(`✅ Watchlist loaded successfully with ${response.data.results.length} movies`);
        } else {
          console.error('⚠️ Invalid response format: results is not an array');
          this.watchlistMovies = [];
        }
        
        this.loading.search = false;
        
        // Log some sample watchlist items
        if (this.watchlistMovies.length > 0) {
          console.log('Sample watchlist items:');
          this.watchlistMovies.slice(0, 3).forEach((movie, index) => {
            console.log(`  ${index + 1}. ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'}) - Rating: ${movie.vote_average}`);
          });
        } else {
          console.log('⚠️ No watchlist items found');
        }
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      
      runInAction(() => {
        this.loading.search = false;
        this.error.search = axios.isAxiosError(error) 
          ? error.message || `Error ${error.response?.status}` 
          : 'Unknown error';
        
        // If API call fails, use the local watchlist as fallback
        console.log('Using local watchlist as fallback');
      });
      
      return this.watchlistMovies;
    }
  }

  /**
   * Load watchlist from API with specified sorting
   * @param sortBy Sort parameter for the API request (default: created_at.asc)
   */
  async loadWatchlist(sortBy = 'created_at.asc'): Promise<void> {
    console.log(`Loading watchlist from API with sort: ${sortBy}`);
    
    // Map of sort values to human-readable descriptions for logging
    const sortDescriptions: Record<string, string> = {
      'vote_average.desc': 'highest rated first',
      'vote_average.asc': 'lowest rated first',
      'created_at.asc': 'oldest additions first',
      'created_at.desc': 'newest additions first',
      'title.asc': 'alphabetical A-Z',
      'title.desc': 'alphabetical Z-A',
      'release_date.desc': 'newest releases first',
      'release_date.asc': 'oldest releases first'
    };
    
    console.log(`Sorting watchlist by: ${sortDescriptions[sortBy] || sortBy}`);
    await this.fetchWatchlist(1, sortBy);
  }

  /**
   * Fetch user account details
   * @returns The user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    // Mark as loading
    runInAction(() => {
      this.loading.profile = true;
      this.error.profile = null;
    });
    
    try {
      console.log('Fetching user profile');
      
      // Make the API request with specific account ID
      const response = await movieAPI.get<UserProfile>('/account/21896145');
      
      // Update state with the fetched profile
      runInAction(() => {
        this.userProfile = response.data;
        this.loading.profile = false;
        console.log('✅ User profile loaded successfully');
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      runInAction(() => {
        this.loading.profile = false;
        this.error.profile = axios.isAxiosError(error) 
          ? error.message || `Error ${error.response?.status}` 
          : 'Unknown error';
      });
      
      return null;
    }
  }

  /**
   * Get the user's avatar URL, either from Gravatar or TMDB
   * @returns The URL of the user's avatar or a placeholder
   */
  getUserAvatarUrl(): string {
    if (!this.userProfile || !this.userProfile.avatar) {
      return 'https://via.placeholder.com/150?text=User';
    }
    
    // Use Gravatar if available
    if (this.userProfile.avatar.gravatar?.hash) {
      return `https://secure.gravatar.com/avatar/${this.userProfile.avatar.gravatar.hash}?s=150`;
    }
    
    // Use TMDB avatar if available
    if (this.userProfile.avatar.tmdb?.avatar_path) {
      const path = this.userProfile.avatar.tmdb.avatar_path;
      return path.startsWith('/') 
        ? `${CBConfigs.tmdb.imageBaseUrl}/w150_and_h150_face${path}`
        : path;
    }
    
    // Use placeholder as fallback
    return 'https://via.placeholder.com/150?text=User';
  }

  /**
   * Get user's first initial for avatar fallback
   * @returns The first letter of the user's name or username
   */
  getUserInitial(): string {
    if (!this.userProfile) return '?';
    
    if (this.userProfile.name && this.userProfile.name.length > 0) {
      return this.userProfile.name.charAt(0).toUpperCase();
    }
    
    if (this.userProfile.username && this.userProfile.username.length > 0) {
      return this.userProfile.username.charAt(0).toUpperCase();
    }
    
    return '?';
  }

  /**
   * Add a movie to the watchlist via TMDB API
   * @param movie The movie to add to the watchlist
   * @returns Promise resolving to true if successful
   */
  async addToWatchlist(movie: Movie | MovieDetail): Promise<boolean> {
    // Check if movie is already in watchlist
    if (this.isInWatchlist(movie.id)) {
      console.log(`Movie "${movie.title}" is already in watchlist`);
      return false;
    }

    console.log(`Adding movie: ${movie.title} (ID: ${movie.id}) to watchlist`);
    
    try {
      // Call the TMDB API to add to watchlist
      const response = await movieAPI.post('/account/21896145/watchlist', {
        media_type: 'movie',
        media_id: movie.id,
        watchlist: true
      });
      
      console.log('API watchlist add response:', response.data);
      
      // If API call is successful, update local state
      if (response.data?.success) {
        runInAction(() => {
          this.watchlistMovies.push(movie);
          console.log(`Successfully added "${movie.title}" to watchlist`);
        });
        return true;
      } else {
        console.error('API reported failure to add to watchlist');
        return false;
      }
    } catch (error) {
      console.error('Error adding to watchlist via API:', error);
      return false;
    }
  }

  /**
   * Remove a movie from the watchlist via TMDB API
   * @param movieId The ID of the movie to remove from the watchlist
   * @returns Promise resolving to true if successful
   */
  async removeFromWatchlist(movieId: number): Promise<boolean> {
    // Find the movie in the local watchlist
    const movie = this.watchlistMovies.find(m => m.id === movieId);
    if (!movie) {
      console.log(`Movie with ID: ${movieId} not found in watchlist`);
      return false;
    }
    
    console.log(`Removing movie: ${movie.title} (ID: ${movieId}) from watchlist`);
    
    try {
      // Call the TMDB API to remove from watchlist
      const response = await movieAPI.post('/account/21896145/watchlist', {
        media_type: 'movie',
        media_id: movieId,
        watchlist: false
      });
      
      console.log('API watchlist remove response:', response.data);
      
      // If API call is successful, update local state
      if (response.data?.success) {
        runInAction(() => {
          this.watchlistMovies = this.watchlistMovies.filter(movie => movie.id !== movieId);
          console.log(`Successfully removed movie ID: ${movieId} from watchlist`);
        });
        return true;
      } else {
        console.error('API reported failure to remove from watchlist');
        return false;
      }
    } catch (error) {
      console.error('Error removing from watchlist via API:', error);
      return false;
    }
  }

  /**
   * Toggle movie in watchlist - add if not present, remove if present
   * @param movie The movie to toggle in the watchlist
   * @returns Promise resolving to true if added to watchlist, false if removed
   */
  async toggleWatchlist(movie: Movie | MovieDetail): Promise<boolean> {
    console.log(`Toggling watchlist status for movie: ${movie.title} (ID: ${movie.id})`);
    
    if (this.isInWatchlist(movie.id)) {
      const removed = await this.removeFromWatchlist(movie.id);
      return !removed; // Return false if successfully removed
    } else {
      const added = await this.addToWatchlist(movie);
      return added; // Return true if successfully added
    }
  }
}

// Create a single instance of the store to use throughout the application
export const moviesStore = new MoviesStore();

export default moviesStore; 