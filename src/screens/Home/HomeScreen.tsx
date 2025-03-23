import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Keyboard, TouchableWithoutFeedback, AppState, ScrollView, AppStateStatus } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Icon } from '@rneui/themed';
import { moderateScale } from '@utils/ThemeUtil';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hooks
import { useMoviesStore } from '@hooks/useStores';

// Components
import colors from '@configs/colors';
import CBDropdown, { DropdownOption } from '@components/CBDropdown';
import WithLoading from '@components/hoc/WithLoading';
import { CBHeader, CBImage, CBText, CBView, CBButton, CBCard, ScreenContainer, CBInput } from '@components/index';

// Utils
import DateUtil from '@utils/DateUtil';
import TimeUtil from '@utils/TimeUtil';

// Types
import { Movie, MovieCategory } from '@stores/MoviesStore';

// Storage key for category preference
const STORAGE_KEYS = {
  CATEGORY_PREFERENCE: '@movie_app:category_preference'
};

/**
 * Sort options for movie lists
 */
const SORT_OPTIONS: DropdownOption[] = [
  { label: 'By alphabetical order', value: 'title.asc' },
  { label: 'By rating', value: 'vote_average.desc' },
  { label: 'By release date', value: 'primary_release_date.desc' },
];

/**
 * Category options for the dropdown filter
 */
const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Popular', value: 'popular' },
];

/**
 * Helper function to format release date using DateUtil
 */
const formatReleaseDate = (releaseDate: string): string => {
  if (!releaseDate) return 'N/A';
  return DateUtil.formatDate(releaseDate, 'YYYY-MM-DD', 'MMMM DD, YYYY');
};

/**
 * Helper function to get relative time or coming soon status
 */
const getRelativeReleaseInfo = (releaseDate: string): string => {
  if (!releaseDate) return '';
  
  // Check if movie is upcoming and show "coming soon" label
  if (DateUtil.isDateInFuture(releaseDate)) {
    if (TimeUtil.isComingSoon(releaseDate)) {
      return '🔥 Coming Soon!';
    }
    return `Coming in ${TimeUtil.getTimeUntilString(releaseDate)}`;
  }
  
  // For released movies, show how long ago they were released
  return `Released ${TimeUtil.formatRelativeTime(releaseDate)}`;
};

/**
 * Props interface for the MovieList component
 */
interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  onMoviePress: (movie: Movie) => void;
  listType: 'horizontal' | 'grid';
}

/**
 * MovieList component that displays a list of movies
 * Can render in either horizontal or grid layout
 */
const MovieList: React.FC<MovieListProps> = ({ movies, loading, onMoviePress, listType }) => {
  // Get store reference to use utility functions
  const moviesStore = useMoviesStore();

  
  if (listType === 'horizontal') {
    return (
      <FlatList
        horizontal
        data={movies}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <CBCard
            title={item.title}
            posterUrl={moviesStore.getPosterUrl(item.poster_path)}
            releaseDate={item.release_date}
            rating={item.vote_average}
            variant="default"
            width={moderateScale(150)}
            height={moderateScale(240)}
            onPress={() => onMoviePress(item)}
            style={styles.movieCard}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.horizontalList}
      />
    );
  }

  return (
    <View style={styles.gridContainer}>
      {movies.map(item => (
        <TouchableOpacity 
          key={item.id.toString()}
          style={styles.cardContainer}
          onPress={() => onMoviePress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            {/* Poster image */}
            <CBImage
              source={{ uri: moviesStore.getPosterUrl(item.poster_path) }}
              style={styles.poster}
              resizeMode="cover"
            />
            
            {/* Movie information */}
            <View style={styles.infoContainer}>
              {/* Title */}
              <CBText variant="h5" numberOfLines={2} style={styles.title}>
                {item.title}
              </CBText>
              
              {/* Release date */}
              <CBText variant="caption" style={styles.releaseDate}>
                {formatReleaseDate(item.release_date)}
              </CBText>
              
              {/* Overview */}
              <CBText variant="body" numberOfLines={2} style={styles.overview}>
                {item.overview}
              </CBText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Wrap MovieList with loading HOC
const MovieListWithLoading = WithLoading(MovieList);

/**
 * HorizontalMovieList component specifically for horizontal lists
 * Extracted to prevent nesting VirtualizedLists
 */
const HorizontalMovieList: React.FC<{
  title: string;
  movies: Movie[];
  loading: boolean;
  onMoviePress: (movie: Movie) => void;
}> = ({ title, movies, loading, onMoviePress }) => (
  <View>
    <CBText variant="h4" style={styles.categoryTitle}>
      {title}
    </CBText>
    <MovieListWithLoading
      movies={movies}
      loading={loading}
      onMoviePress={onMoviePress}
      listType="horizontal"
    />
  </View>
);

/**
 * HomeScreen component - Main screen of the app
 * Displays movie lists, category filters, and search functionality
 * Uses MobX for state management
 */
const HomeScreen: React.FC = observer(() => {
  // Navigation
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  // Stores
  const moviesStore = useMoviesStore();
  
  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption>(CATEGORY_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<number>(5); // Number of movies to display
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(SORT_OPTIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  
  // App state reference
  const appState = useRef(AppState.currentState);
  
  // Get data from store based on selected category
  const getMoviesByCategory = useCallback((category: string): Movie[] => {
    switch (category) {
      case 'now_playing':
        return moviesStore.nowPlayingMovies;
      case 'upcoming':
        return moviesStore.upcomingMovies;
      case 'popular':
        return moviesStore.popularMovies;
      default:
        return [];
    }
  }, [moviesStore]);
  
  // Get loading state from store
  const getLoadingState = useCallback((category: MovieCategory): boolean => {
    return moviesStore.loading[category];
  }, [moviesStore]);
  
  // Current movie list based on selected category
  const currentCategoryMovies = getMoviesByCategory(selectedCategory.value as MovieCategory);
  
  // Sort movies based on the selected sort option
  const sortedMovies = useMemo(() => {
    if (!currentCategoryMovies || currentCategoryMovies.length === 0) {
      return [];
    }
    
    // Create a copy to avoid mutating the original data
    const moviesCopy = [...currentCategoryMovies];
    
    // Get sort field and direction from the selected sort option
    const [field, direction] = selectedSort.value.split('.');
    const isAscending = direction === 'asc';
    
    console.log(`Sorting movies by ${field} in ${direction} order`);
    
    return moviesCopy.sort((a, b) => {
      let valueA, valueB;
      
      // Handle special case for sorting by rating
      if (field === 'vote_average') {
        valueA = a.vote_average || 0;
        valueB = b.vote_average || 0;
      }
      // Handle special case for title (case insensitive)
      else if (field === 'title') {
        valueA = a.title?.toLowerCase() || '';
        valueB = b.title?.toLowerCase() || '';
      }
      // Handle special case for release date
      else if (field === 'primary_release_date') {
        valueA = a.release_date ? new Date(a.release_date).getTime() : 0;
        valueB = b.release_date ? new Date(b.release_date).getTime() : 0;
      }
      // Default fallback
      else {
        valueA = (a as any)[field] || '';
        valueB = (b as any)[field] || '';
      }
      
      // Apply sort direction
      if (valueA < valueB) {
        return isAscending ? -1 : 1;
      }
      if (valueA > valueB) {
        return isAscending ? 1 : -1;
      }
      return 0;
    });
  }, [currentCategoryMovies, selectedSort.value]);
  
  // Popular movies for bottom grid (if not already showing popular)
  const popularMovies = moviesStore.popularMovies;
  
  /**
   * Save category preference to AsyncStorage
   */
  const saveCategoryPreference = async (category: string) => {
    try {
      // Use the exact category value for storage
      console.log(`Attempting to save category preference: ${category}`);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_PREFERENCE, category);
      
      // Verify the save by reading it back
      const savedValue = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_PREFERENCE);
      console.log(`Verification - Category preference saved: ${savedValue}`);
    } catch (error) {
      console.error('Error saving category preference:', error);
    }
  };
  
  /**
   * Load saved category preference from AsyncStorage
   */
  const loadCategoryPreference = useCallback(async () => {
    try {
      console.log('Attempting to load category preference from AsyncStorage...');
      const savedCategory = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_PREFERENCE);
      
      console.log(`Raw saved category value from AsyncStorage: "${savedCategory}"`);
      
      if (savedCategory) {
        console.log(`Loaded saved category preference: ${savedCategory}`);
        // Find the category option that matches the saved value
        const categoryOption = CATEGORY_OPTIONS.find(option => option.value === savedCategory);
        
        if (categoryOption) {
          console.log(`Setting category to ${categoryOption.label}`);
          setSelectedCategory(categoryOption);
          
          // Highlight the saved preference briefly to show it was restored
          setTimeout(() => {
            const flashMessage = `Restored your preference: ${categoryOption.label}`;
            console.log(flashMessage);
          }, 1000);
          
          // Fetch data for the saved category
          fetchCategoryMovies(savedCategory as MovieCategory);
          return savedCategory as MovieCategory;
        } else {
          console.warn(`Found saved category "${savedCategory}" but no matching option exists`);
        }
      } else {
        console.log('No saved category preference found, using default');
      }
      
      // If no saved preference or invalid, return default
      return CATEGORY_OPTIONS[0].value as MovieCategory;
    } catch (error) {
      console.error('Error loading category preference:', error);
      return CATEGORY_OPTIONS[0].value as MovieCategory;
    }
  }, []);
  
  /**
   * Fetch movies for the given category
   */
  const fetchCategoryMovies = useCallback((category: MovieCategory) => {
    switch (category) {
      case 'now_playing':
        moviesStore.fetchNowPlayingMovies();
        break;
      case 'upcoming':
        moviesStore.fetchUpcomingMovies();
        break;
      case 'popular':
        moviesStore.fetchPopularMovies();
        break;
    }
  }, [moviesStore]);
  
  /**
   * Handler for category selection
   * @param option - The selected category option
   */
  const handleCategorySelect = (option: DropdownOption) => {
    // Hide keyboard if showing
    Keyboard.dismiss();
    
    console.log(`HomeScreen: Category selected: ${option.label} (${option.value})`);
    
    setSelectedCategory(option);
    setVisibleMovies(5); // Reset number of visible movies when changing category
    const category = option.value as MovieCategory;
    
    // Save the selected category to persistent storage
    saveCategoryPreference(category);
    
    // Fetch data for the selected category
    fetchCategoryMovies(category);
  };

  /**
   * Handler for sort selection
   * @param option - The selected sort option
   */
  const handleSortSelect = (option: DropdownOption) => {
    console.log(`Sort option selected: ${option.label} (${option.value})`);
    
    // Save the selected sort option
    setSelectedSort(option);
    
    // Reset visible movies count
    setVisibleMovies(5);
    
    // No need to call API - sorting happens in the useMemo
  };

  /**
   * Handler for search button press
   * Uses search function from store
   */
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setVisibleMovies(5); // Reset number of visible movies when performing a new search
      const results = await moviesStore.searchMovies(searchQuery);
      setSearchResults(results);
    }
  };

  /**
   * Check if search button should be active
   * @returns boolean
   */
  const isSearchActive = (): boolean => {
    return searchQuery.trim().length > 0;
  };

  /**
   * Handler for movie item press
   * @param movie - The selected movie object
   */
  const handleMoviePress = (movie: Movie) => {
    console.log('Movie pressed:', movie.title);
    // Navigate to movie details
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  /**
   * Handler for load more button press
   * Increases the number of visible movies by 5
   */
  const handleLoadMore = () => {
    setVisibleMovies(prev => prev + 5);
  };

  /**
   * Handler for search input change
   * Just update the query, don't trigger search
   */
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      console.log('HomeScreen: Initializing app, checking for saved category preference...');
      
      // Test AsyncStorage functionality
      await testAsyncStorage();
      
      try {
        // Get the saved category directly
        const savedCategory = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_PREFERENCE);
        console.log(`Direct AsyncStorage read - Category: "${savedCategory}"`);
        
        if (savedCategory) {
          const categoryOption = CATEGORY_OPTIONS.find(option => option.value === savedCategory);
          
          if (categoryOption) {
            console.log(`HomeScreen: Setting initial category to ${categoryOption.label}`);
            setSelectedCategory(categoryOption);
            fetchCategoryMovies(savedCategory as MovieCategory);
          } else {
            console.warn(`Invalid saved category: ${savedCategory}`);
            // Use default if invalid
            fetchCategoryMovies(selectedCategory.value as MovieCategory);
          }
        } else {
          console.log('No saved preference found, using default');
          fetchCategoryMovies(selectedCategory.value as MovieCategory);
        }
      } catch (error) {
        console.error('Error loading category preference:', error);
        fetchCategoryMovies(selectedCategory.value as MovieCategory);
      }
      
      // Load popular movies if they're not already being loaded
      if (selectedCategory.value !== 'popular') {
        moviesStore.fetchPopularMovies();
      }
      
      // For development only - clear storage (uncomment to reset)
      // await AsyncStorage.clear();
      // console.log('Cleared all AsyncStorage data for testing');
    };
    
    initializeApp();
  }, []);
  
  // Add AppState listener for handling app coming to foreground
  useEffect(() => {
    // Handler for app state changes
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground - checking saved preferences');
        
        // Load and apply saved category preference
        const savedCategory = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_PREFERENCE);
        console.log(`App resumed - saved category: ${savedCategory}, current: ${selectedCategory.value}`);
        
        if (savedCategory && savedCategory !== selectedCategory.value) {
          console.log(`Applying saved category preference: ${savedCategory}`);
          const categoryOption = CATEGORY_OPTIONS.find(option => option.value === savedCategory);
          if (categoryOption) {
            setSelectedCategory(categoryOption);
            fetchCategoryMovies(savedCategory as MovieCategory);
          }
        }
      }
      
      // Update the AppState reference
      appState.current = nextAppState;
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Clean up the subscription on unmount
    return () => {
      subscription.remove();
    };
  }, [selectedCategory.value]); // Re-create when selected category changes
  
  /**
   * Test function to verify AsyncStorage is working
   */
  const testAsyncStorage = async () => {
    try {
      // Test writing a value
      const testKey = '@movie_app:test_key';
      const testValue = 'test_' + new Date().toISOString();
      await AsyncStorage.setItem(testKey, testValue);
      console.log(`AsyncStorage Test: Wrote value: ${testValue}`);
      
      // Test reading the value back
      const readValue = await AsyncStorage.getItem(testKey);
      console.log(`AsyncStorage Test: Read value: ${readValue}`);
      
      if (readValue === testValue) {
        console.log('AsyncStorage Test: SUCCESS - Read/write working correctly');
      } else {
        console.error('AsyncStorage Test: FAILED - Read value does not match written value');
      }
    } catch (error) {
      console.error('AsyncStorage Test: ERROR - ', error);
    }
  };

  /**
   * Close all dropdowns when clicking outside
   */
  const closeAllDropdowns = () => {
    console.log('Overlay clicked - closing all dropdowns');
    if (isDropdownOpen) setIsDropdownOpen(false);
    if (isSortDropdownOpen) setIsSortDropdownOpen(false);
    Keyboard.dismiss();
  };

  /**
   * Handler for category dropdown toggle
   */
  const handleCategoryDropdownToggle = (isOpen: boolean) => {
    console.log(`Category dropdown toggled: ${isOpen ? 'open' : 'closed'}`);
    setIsDropdownOpen(isOpen);
    
    // Close the other dropdown if opening this one
    if (isOpen && isSortDropdownOpen) {
      setIsSortDropdownOpen(false);
    }
  };
  
  /**
   * Handler for sort dropdown toggle
   */
  const handleSortDropdownToggle = (isOpen: boolean) => {
    console.log(`Sort dropdown toggled: ${isOpen ? 'open' : 'closed'}`);
    setIsSortDropdownOpen(isOpen);
    
    // Close the other dropdown if opening this one
    if (isOpen && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  /**
   * Render the header with logo and filters
   */
  const renderHeader = () => (
    <>
      {/* Header with logo */}
      <CBHeader 
        type="logo"
        backgroundColor={colors.whiteColor}
      />

      {/* Filter section with dropdown and search */}
      <CBView style={styles.filterContainer}>
        {/* Touchable overlay for closing dropdowns when clicking outside */}
        {(isDropdownOpen || isSortDropdownOpen) && (
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={closeAllDropdowns}
          />
        )}
        
        {/* Category dropdown with current selection */}
        <CBDropdown
          options={CATEGORY_OPTIONS}
          defaultValue={selectedCategory.value}
          onSelect={handleCategorySelect}
          containerStyle={[styles.dropdown, { zIndex: 1002 }]}
          isOpen={isDropdownOpen}
          onToggleDropdown={handleCategoryDropdownToggle}
        />

        {/* Sort dropdown */}
        <CBDropdown
          options={SORT_OPTIONS}
          defaultValue={selectedSort.value}
          onSelect={handleSortSelect}
          containerStyle={[styles.dropdown, { zIndex: 1001 }]}
          isOpen={isSortDropdownOpen}
          onToggleDropdown={handleSortDropdownToggle}
          label="Sort by"
        />

        {/* Search section */}
        <CBView style={styles.searchContainer}>
          <CBInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            variant="outline"
            style={styles.searchInput}
            inputWrapperStyle={styles.searchInputWrapper}
            placeholderTextColor="#9E9E9E"
          />
          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearchActive() ? styles.searchButtonActive : styles.searchButtonInactive
            ]}
            onPress={handleSearch}
          >
            <CBText 
              variant="button" 
              style={styles.searchButtonText}
            >
              Search
            </CBText>
          </TouchableOpacity>
        </CBView>
      </CBView>
    </>
  );

  /**
   * Render movie lists as separate sections
   */
  const renderMovieSections = () => {
    // Display search results if searching
    if (searchQuery.trim() && searchResults.length > 0) {
      // Limit visible search results
      const limitedSearchResults = searchResults.slice(0, visibleMovies);
      const hasMoreSearchResults = searchResults.length > visibleMovies;
      
      return (
        <CBView style={styles.moviesContainer}>
          <CBView style={styles.searchResultsHeader}>
            <CBText variant="h4" style={styles.categoryTitle}>
              Search Results
            </CBText>
            <CBText variant="caption" style={styles.searchInfo}>
              Sorted by newest release date
            </CBText>
          </CBView>
          <MovieListWithLoading
            movies={limitedSearchResults}
            loading={moviesStore.loading.search}
            onMoviePress={handleMoviePress}
            listType="grid"
          />
          
          {/* Load more button for search results */}
          {!moviesStore.loading.search && hasMoreSearchResults && (
            <CBButton
              title="Load More"
              variant="primary"
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
            />
          )}
        </CBView>
      );
    }
    
    // Get loading state for current category
    const isCategoryLoading = getLoadingState(selectedCategory.value as MovieCategory);
    
    // Limit visible movies
    const limitedMovies = sortedMovies.slice(0, visibleMovies);
    const hasMoreMovies = sortedMovies.length > visibleMovies;
    
    return (
      <CBView style={styles.moviesContainer}>
        {/* Show sort information for Popular category */}
        {selectedCategory.value === 'popular' && (
          <CBView style={styles.categoryInfoHeader}>
            <CBText variant="h4" style={styles.categoryTitle}>
              {selectedCategory.label} Movies
            </CBText>
            <CBText variant="caption" style={styles.sortInfo}>
              Sorted by {selectedSort.label.toLowerCase()}
            </CBText>
          </CBView>
        )}
        
        {/* Movie list in grid layout */}
        <MovieListWithLoading
          movies={limitedMovies}
          loading={isCategoryLoading}
          onMoviePress={handleMoviePress}
          listType="grid"
        />
        
        {/* Load more button */}
        {!isCategoryLoading && hasMoreMovies && (
          <CBButton
            title="Load More"
            variant="primary"
            onPress={handleLoadMore}
            style={styles.loadMoreButton}
          />
        )}
      </CBView>
    );
  };
  
  // Render empty view if all data is loading on first load
  const renderEmptyState = () => {
    const allLoading = CATEGORY_OPTIONS.every(
      option => getLoadingState(option.value as MovieCategory) && 
      getMoviesByCategory(option.value as MovieCategory).length === 0
    );
    
    if (allLoading) {
      return (
        <CBView style={styles.emptyState}>
          <CBText variant="h4">Loading Movies...</CBText>
        </CBView>
      );
    }
    
    return null;
  };

  return (
    <ScreenContainer
      safeArea
      withPadding={false}
      backgroundColor={colors.containerColor}
      statusBarStyle="dark-content"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            nestedScrollEnabled={true}
            pointerEvents="box-none"
          >
            {renderHeader()}
            {renderMovieSections()}
            {renderEmptyState()}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </ScreenContainer>
  );
});

/**
 * Styles for the HomeScreen component
 */
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'column',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    position: 'relative',
  },
  dropdown: {
    marginBottom: 0,
    position: 'relative',
    zIndex: 1001,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    marginBottom: moderateScale(16),
  },
  searchContainer: {
    marginBottom: moderateScale(16),
    position: 'relative',
  },
  searchInput: {
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: '#E3E3E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputWrapper: {
    backgroundColor: colors.whiteColor,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    height: moderateScale(48),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonActive: {
    backgroundColor: colors.primaryColor,
  },
  searchButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  searchButtonText: {
    color: colors.whiteColor,
    fontWeight: '600',
  },
  moviesContainer: {
    paddingHorizontal: moderateScale(16),
  },
  categoryTitle: {
    marginBottom: moderateScale(16),
  },
  horizontalList: {
    paddingBottom: moderateScale(16),
  },
  gridContainer: {
    flexDirection: 'column',
    paddingBottom: moderateScale(24),
    width: '100%',
  },
  gridList: {
    paddingBottom: moderateScale(24),
    alignItems: 'center',
  },
  movieCard: {
    marginRight: moderateScale(12),
  },
  gridCard: {
    margin: moderateScale(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(24),
    marginBottom: moderateScale(16),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(50),
  },
  cardContainer: {
    backgroundColor: colors.whiteColor,
    borderRadius: moderateScale(8),
    marginVertical: moderateScale(10),
    marginHorizontal: moderateScale(5),
    padding: moderateScale(1),
    width: '98%',
    alignSelf: 'center',
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    // Android shadow
    elevation: 8,
    overflow: 'visible',
  },
  cardContent: {
    borderRadius: moderateScale(12),
    borderWidth: 0,
    flexDirection: 'row',
  },
  poster: {
    width: moderateScale(100),
    height: moderateScale(150),
    borderTopLeftRadius: moderateScale(8),
    borderBottomLeftRadius: moderateScale(8),
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: moderateScale(10),
    justifyContent: 'center',
  },
  title: {
    marginBottom: moderateScale(8),
  },
  releaseDate: {
    color: colors.tertiaryTextColor,
    marginBottom: moderateScale(12),
  },
  releaseInfo: {
    marginBottom: moderateScale(8),
    fontWeight: '500',
  },
  upcomingText: {
    color: colors.primaryColor,
  },
  releasedText: {
    color: colors.tertiaryTextColor,
  },
  overview: {
    color: colors.secondaryTextColor,
  },
  loadMoreButton: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(24),
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  searchInfo: {
    color: colors.tertiaryTextColor,
  },
  categoryInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  sortInfo: {
    color: colors.tertiaryTextColor,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    width: 5000, // Much larger than screen
    height: 5000, // Much larger than screen
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
});

export default HomeScreen; 