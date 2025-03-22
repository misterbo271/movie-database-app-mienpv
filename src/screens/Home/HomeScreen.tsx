import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, ScrollView, View } from 'react-native';
import colors from '../../configs/colors';
import CBDropdown, { DropdownOption } from '../../components/CBDropdown';
import CBImage from '../../components/CBImage';
import { Icon } from '@rneui/themed';
import { moderateScale } from '../../utils/ThemeUtil';
import ScreenContainer from '../../components/ScreenContainer';
import CBView from '@components/CBView';
import CBText from '@components/CBText';
import CBInput from '@components/CBInput';
import CBButton from '@components/CBButton';
import CBCard from '@components/CBCard';
import WithLoading from '@components/hoc/WithLoading';
import useApi from '@hooks/useApi';
import useDebounce from '@hooks/useDebounce';

/**
 * Movie interface defining the structure of a movie item
 */
interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  rating: number;
  overview: string;
}

// Mock data for movies demonstration
const NOW_PLAYING_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    releaseDate: '1994-09-23',
    rating: 8.7,
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.'
  },
  {
    id: 2,
    title: 'The Godfather',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    releaseDate: '1972-03-14',
    rating: 8.7,
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.'
  },
  {
    id: 3,
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    releaseDate: '2008-07-16',
    rating: 8.5,
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.'
  },
];

const UPCOMING_MOVIES: Movie[] = [
  {
    id: 4,
    title: 'Dune: Part Two',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    releaseDate: '2024-03-01',
    rating: 8.2,
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.'
  },
  {
    id: 5,
    title: 'Ghostbusters: Frozen Empire',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5MpUoF5dgUcJ3o3O80nVmHFCe1z.jpg',
    releaseDate: '2024-03-22',
    rating: 7.1,
    overview: 'When the discovery of an ancient artifact unleashes an evil force, Ghostbusters new and old must join forces to protect their home and save the world from a second ice age.'
  },
  {
    id: 6,
    title: 'Kingdom of the Planet of the Apes',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8rS8P0JWSM2xOlyJCDZ410nMFnV.jpg',
    releaseDate: '2024-05-10',
    rating: 7.5,
    overview: 'Several generations in the future following Caesar\'s reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows.'
  }
];

const POPULAR_MOVIES: Movie[] = [
  {
    id: 7,
    title: 'Oppenheimer',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    releaseDate: '2023-07-19',
    rating: 8.1,
    overview: 'The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.'
  },
  {
    id: 8,
    title: 'Barbie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    releaseDate: '2023-07-21',
    rating: 7.0,
    overview: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.'
  },
  {
    id: 9,
    title: 'Inside Out 2',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vF6QHvTy6HMfwvHzJbRKY3GXoCe.jpg',
    releaseDate: '2024-06-14',
    rating: 8.4,
    overview: 'Follow Riley in her teenage years as new Emotions join the mix, including Anxiety, Envy, Ennui and Embarrassment.'
  }
];

// Map for mock data by category
const MOCK_DATA_BY_CATEGORY = {
  now_playing: NOW_PLAYING_MOVIES,
  upcoming: UPCOMING_MOVIES,
  popular: POPULAR_MOVIES
};

/**
 * Category options for the dropdown filter
 */
const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Popular', value: 'popular' },
];

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
 * 
 * @param movies - Array of movie objects to display
 * @param loading - Whether the list is in loading state
 * @param onMoviePress - Callback function when a movie is pressed
 * @param listType - Layout type ('horizontal' or 'grid')
 */
const MovieList: React.FC<MovieListProps> = ({ movies, loading, onMoviePress, listType }) => {
  if (listType === 'horizontal') {
    return (
      <FlatList
        horizontal
        data={movies}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <CBCard
            title={item.title}
            posterUrl={item.posterUrl}
            releaseDate={item.releaseDate}
            rating={item.rating}
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
        <CBCard
          key={item.id.toString()}
          title={item.title}
          posterUrl={item.posterUrl}
          releaseDate={item.releaseDate}
          rating={item.rating}
          variant="default"
          width={moderateScale(170)}
          height={moderateScale(260)}
          onPress={() => onMoviePress(item)}
          style={styles.gridCard}
        />
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

interface MoviesByCategory {
  [key: string]: {
    data: Movie[];
    isLoaded: boolean;
  };
}

/**
 * HomeScreen component - Main screen of the app
 * Displays movie lists, category filters, and search functionality
 */
const HomeScreen: React.FC = () => {
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption>(CATEGORY_OPTIONS[0]);
  
  // State for search query with debounce
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Track loading state for each category
  const [loading, setLoading] = useState<boolean>(false);
  
  // Store data for each category to avoid reloading
  const [moviesByCategory, setMoviesByCategory] = useState<MoviesByCategory>({
    now_playing: { data: [], isLoaded: false },
    upcoming: { data: [], isLoaded: false },
    popular: { data: [], isLoaded: false },
  });
  
  // Current category movies
  const currentCategoryMovies = useMemo(() => 
    moviesByCategory[selectedCategory.value]?.data || [],
  [moviesByCategory, selectedCategory]);
  
  // Popular movies (for lower section)
  const popularMovies = useMemo(() => 
    moviesByCategory.popular?.data || [],
  [moviesByCategory]);

  /**
   * Load movies for a specific category
   * Only loads if not already loaded
   */
  const loadMoviesForCategory = useCallback((category: string) => {
    // Check if we already have data for this category
    if (moviesByCategory[category]?.isLoaded) {
      console.log(`Data for ${category} already loaded, not fetching again`);
      return;
    }
    
    // Set loading only if we need to fetch new data
    setLoading(true);
    console.log(`Loading data for category: ${category}`);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Use mock data based on category
      const mockData = MOCK_DATA_BY_CATEGORY[category as keyof typeof MOCK_DATA_BY_CATEGORY] || [];
      
      // Update state with new data and mark as loaded
      setMoviesByCategory(prev => ({
        ...prev,
        [category]: {
          data: mockData,
          isLoaded: true
        }
      }));
      
      setLoading(false);
    }, 1000);
  }, [moviesByCategory]);

  /**
   * Handler for category selection
   * @param option - The selected category option
   */
  const handleCategorySelect = (option: DropdownOption) => {
    setSelectedCategory(option);
    loadMoviesForCategory(option.value);
  };

  /**
   * Handler for search button press
   * Uses debounced search query to prevent excessive API calls
   */
  const handleSearch = () => {
    if (debouncedSearchQuery.trim()) {
      // In a real app, this would call the search API
      console.log('Searching for:', debouncedSearchQuery);
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

  // Load initial data for selected category and popular movies
  useEffect(() => {
    // Load selected category data
    loadMoviesForCategory(selectedCategory.value);
    
    // Load popular movies if they're not the currently selected category
    if (selectedCategory.value !== 'popular') {
      loadMoviesForCategory('popular');
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
    // Get loading state for current category and popular section
    const isCategoryLoading = !moviesByCategory[selectedCategory.value]?.isLoaded && loading;
    const isPopularLoading = selectedCategory.value !== 'popular' && 
                            !moviesByCategory.popular?.isLoaded && loading;
    
    return (
      <CBView style={styles.moviesContainer}>
        {/* First horizontal movie section */}
        <HorizontalMovieList
          title={`${selectedCategory.label} Movies`}
          movies={currentCategoryMovies}
          loading={isCategoryLoading}
          onMoviePress={handleMoviePress}
        />
        
        {/* Only show popular section if it's not the current category */}
        {selectedCategory.value !== 'popular' && (
          <>
            {/* Popular movies section header */}
            <CBView style={styles.sectionHeader}>
              <CBText variant="h5">Popular Movies</CBText>
              <CBText 
                variant="caption" 
                define="primary"
                onPress={() => handleCategorySelect(CATEGORY_OPTIONS[2])} // Popular option
              >
                See All
              </CBText>
            </CBView>
            
            {/* Grid movie list */}
            <MovieListWithLoading
              movies={popularMovies}
              loading={isPopularLoading}
              onMoviePress={handleMoviePress}
              listType="grid"
            />
          </>
        )}
      </CBView>
    );
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
      </ScrollView>
    </ScreenContainer>
  );
};

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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(24),
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
});

export default HomeScreen; 