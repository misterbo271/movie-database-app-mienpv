import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ScrollView, View, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Icon } from '@rneui/themed';
import { moderateScale } from '@utils/ThemeUtil';

// Hooks
import { useMoviesStore } from '@hooks/useStores';

// Components
import colors from '@configs/colors';
import CBDropdown, { DropdownOption } from '@components/CBDropdown';
import CBImage from '@components/CBImage';
import ScreenContainer from '@components/ScreenContainer';
import CBView from '@components/CBView';
import CBText from '@components/CBText';
import CBInput from '@components/CBInput';
import CBButton from '@components/CBButton';
import CBCard from '@components/CBCard';
import WithLoading from '@components/hoc/WithLoading';

// Types
import { Movie, MovieCategory } from '@stores/MoviesStore';

/**
 * Category options for the dropdown filter
 */
const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Popular', value: 'popular' },
];

/**
 * Helper function to format release date
 */
const formatReleaseDate = (releaseDate: string): string => {
  try {
    const date = new Date(releaseDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return releaseDate;
  }
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
  // Access to movies store
  const moviesStore = useMoviesStore();
  
  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption>(CATEGORY_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [visibleMovies, setVisibleMovies] = useState<number>(5); // Số phim hiển thị
  
  // Get data from store based on selected category
  const getMoviesByCategory = (category: string): Movie[] => {
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
  };
  
  // Get loading state from store
  const getLoadingState = (category: MovieCategory): boolean => {
    return moviesStore.loading[category];
  };
  
  // Current movie list based on selected category
  const currentCategoryMovies = getMoviesByCategory(selectedCategory.value as MovieCategory);
  
  // Popular movies for bottom grid (if not already showing popular)
  const popularMovies = moviesStore.popularMovies;
  
  /**
   * Handler for category selection
   * @param option - The selected category option
   */
  const handleCategorySelect = (option: DropdownOption) => {
    setSelectedCategory(option);
    setVisibleMovies(5); // Reset số phim hiển thị khi chuyển category
    const category = option.value as MovieCategory;
    
    // Fetch data if needed
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
  };

  /**
   * Handler for search button press
   * Uses search function from store
   */
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setVisibleMovies(5); // Reset số phim hiển thị khi tìm kiếm mới
      const results = await moviesStore.searchMovies(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }
  };

  /**
   * Handler for movie item press
   * @param movie - The selected movie object
   */
  const handleMoviePress = (movie: Movie) => {
    console.log('Movie pressed:', movie.title);
    // In a real app, this would navigate to movie details
    // navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  /**
   * Handler for load more button press
   * Increases the number of visible movies by 5
   */
  const handleLoadMore = () => {
    setVisibleMovies(prev => prev + 5);
  };

  // Load initial data
  useEffect(() => {
    // Fetch data for initial category
    const initialCategory = selectedCategory.value as MovieCategory;
    
    switch (initialCategory) {
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
    
    // Load popular movies if they're not already being loaded
    if (initialCategory !== 'popular') {
      moviesStore.fetchPopularMovies();
    }
  }, []);


  /**
   * Render the header with logo and filters
   */
  const renderHeader = () => (
    <>
      {/* Header with logo */}
      <CBView style={styles.header}>
        <CBImage 
          source="ic_logo" 
          style={{ width: moderateScale(150), height: moderateScale(50) }} 
          resizeMode="contain"
        />
      </CBView>

      {/* Filter section with dropdown and search */}
      <CBView style={styles.filterContainer}>
        {/* Category dropdown */}
        <CBDropdown
          options={CATEGORY_OPTIONS}
          defaultValue={selectedCategory.value}
          onSelect={handleCategorySelect}
          containerStyle={styles.dropdown}
        />

        {/* Sort button */}
        <CBView define="card" style={styles.sortButton}>
          <CBText variant="body">Sort by</CBText>
          <Icon
            name="chevron-right"
            type="material-community"
            color={colors.primaryColor}
            size={20}
          />
        </CBView>

        {/* Search section */}
        <CBView style={styles.searchContainer}>
          <CBInput
            placeholder="Search for movies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            variant="outline"
            rightIcon={
              <Icon
                name="magnify"
                type="material-community"
                color={colors.primaryColor}
                size={20}
              />
            }
          />
          <CBButton
            title="Search"
            variant="primary"
            onPress={handleSearch}
            style={styles.searchButton}
          />
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
          <CBText variant="h4" style={styles.categoryTitle}>
            Search Results
          </CBText>
          <MovieListWithLoading
            movies={limitedSearchResults}
            loading={isSearching}
            onMoviePress={handleMoviePress}
            listType="grid"
          />
          
          {/* Load more button for search results */}
          {!isSearching && hasMoreSearchResults && (
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
    const limitedMovies = currentCategoryMovies.slice(0, visibleMovies);
    const hasMoreMovies = currentCategoryMovies.length > visibleMovies;
    
    return (
      <CBView style={styles.moviesContainer}>

        
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderMovieSections()}
        {renderEmptyState()}
      </ScrollView>
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
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
  dropdown: {
    marginBottom: moderateScale(16),
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    marginBottom: moderateScale(16),
  },
  searchContainer: {
    marginBottom: moderateScale(16),
  },
  searchButton: {
    marginTop: moderateScale(8),
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
  overview: {
    color: colors.secondaryTextColor,
  },
  loadMoreButton: {
    marginTop: moderateScale(10),
    marginBottom: moderateScale(24),
  },
});

export default HomeScreen; 