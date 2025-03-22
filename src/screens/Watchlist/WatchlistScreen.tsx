import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ListRenderItem, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';

// Components
import CBView from '@components/CBView';
import CBText from '@components/CBText';
import CBImage from '@components/CBImage';
import ScreenContainer from '@components/ScreenContainer';
import CBCard from '@components/CBCard';
import WithEmptyState from '@components/hoc/WithEmptyState';

// Hooks
import { useMoviesStore } from '@hooks/useStores';

// Utils
import { moderateScale } from '@utils/ThemeUtil';
import DateUtil from '@utils/DateUtil';

// Styles & Themes
import colors from '@configs/colors';

// Types
import { RootStackParamList } from '../../types';
import { Movie, UserProfile } from '@stores/MoviesStore';

type WatchlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define the props for WithEmptyState component based on its implementation
interface WithEmptyStateProps {
  data: Array<any> | null | undefined;
  emptyComponent?: React.ReactNode;
  isEmpty?: boolean;
}

// Filter and sort options
const FILTER_OPTIONS = [
  { label: 'Rating', value: 'vote_average.desc' },
  { label: 'Date Added', value: 'created_at.asc' },
  { label: 'Alphabetical', value: 'title.asc' },
  { label: 'Release Date', value: 'release_date.desc' }
];

// Sort order options
const SORT_ORDERS = {
  'vote_average.desc': 'vote_average.asc',
  'vote_average.asc': 'vote_average.desc',
  'created_at.asc': 'created_at.desc',
  'created_at.desc': 'created_at.asc',
  'title.asc': 'title.desc',
  'title.desc': 'title.asc',
  'release_date.desc': 'release_date.asc',
  'release_date.asc': 'release_date.desc'
};

const WatchlistScreen: React.FC = observer(() => {
  // Navigation
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  
  // Store
  const moviesStore = useMoviesStore();
  
  // Local state
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[1]); // Default to "Date Added"
  const [isAscending, setIsAscending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [removingMovieId, setRemovingMovieId] = useState<number | null>(null);
  
  // Computed sort value
  const sortValue = isAscending 
    ? selectedFilter.value 
    : SORT_ORDERS[selectedFilter.value as keyof typeof SORT_ORDERS];

  // Load watchlist data and user profile on mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Load data when sort parameters change
  useEffect(() => {
    if (!loading) {
      loadWatchlist();
    }
  }, [sortValue]);
  
  /**
   * Load user profile and watchlist data
   */
  const loadData = async () => {
    setLoading(true);
    
    try {
      // Fetch user profile
      await moviesStore.getUserProfile();
      
      // Load watchlist with current sort
      await loadWatchlist();
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Load watchlist with current sort parameters
   */
  const loadWatchlist = async () => {
    console.log(`Loading watchlist with sort: ${sortValue}`);
    try {
      // Make the API call
      const watchlistData = await moviesStore.fetchWatchlist(1, sortValue);
      
      // Log the exact data returned
      console.log('=== WATCHLIST API RESPONSE ===');
      console.log(`Total items returned: ${watchlistData.length}`);
      
      // Log the first item as an example
      if (watchlistData.length > 0) {
        console.log('First item example:');
        console.log(JSON.stringify(watchlistData[0], null, 2));
      } else {
        console.log('No items returned from API');
      }
      
      // Log all movie IDs for reference
      console.log('All movie IDs in watchlist:');
      console.log(watchlistData.map(movie => movie.id).join(', '));
    } catch (error) {
      console.error('Error in loadWatchlist:', error);
    }
  };
  
  /**
   * Handle back button press
   */
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  /**
   * Handle movie item press
   * @param movie - The selected movie object
   */
  const handleMoviePress = (movie: Movie) => {
    console.log('Movie pressed:', movie.title);
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };
  
  /**
   * Handle filter option press
   * @param option The filter option that was selected
   */
  const handleFilterPress = (option: typeof FILTER_OPTIONS[0]) => {
    setSelectedFilter(option);
    setFilterMenuOpen(false);
  };
  
  /**
   * Handle sort direction toggle
   */
  const handleSortToggle = () => {
    setIsAscending(!isAscending);
  };
  
  /**
   * Handle remove movie from watchlist
   */
  const handleRemoveMovie = async (movieId: number) => {
    try {
      // Set the removing movie ID
      setRemovingMovieId(movieId);
      
      // Call the async method
      await moviesStore.removeFromWatchlist(movieId);
      
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
    } finally {
      setRemovingMovieId(null);
    }
  };
  
  /**
   * Handle refresh of watchlist
   */
  const handleRefresh = () => {
    loadData();
  };
  
  /**
   * Gets formatted registration date from profile
   */
  const getFormattedJoinDate = (): string => {
    if (!moviesStore.userProfile) return 'Member';
    
    // Use the username as a fallback if no creation date is available
    return `Member since ${DateUtil.getCurrentMonthYear()}`;
  };
  
  /**
   * Render filter options menu
   */
  const renderFilterMenu = () => {
    if (!filterMenuOpen) return null;
    
    return (
      <CBView style={styles.filterMenu}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterMenuItem,
              selectedFilter.value === option.value && styles.filterMenuItemSelected
            ]}
            onPress={() => handleFilterPress(option)}
          >
            <CBText
              variant="body"
              style={[
                styles.filterMenuItemText,
                selectedFilter.value === option.value && styles.filterMenuItemTextSelected
              ]}
            >
              {option.label}
            </CBText>
          </TouchableOpacity>
        ))}
      </CBView>
    );
  };
  
  /**
   * Render avatar with image or initial fallback
   */
  const renderAvatar = () => {
    const avatarUrl = moviesStore.getUserAvatarUrl();
    const hasAvatarImage = avatarUrl !== 'https://via.placeholder.com/150?text=User';
    
    if (hasAvatarImage) {
      return (
        <CBImage
          source={{ uri: avatarUrl }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
      );
    }
    
    return (
      <CBView style={styles.profileAvatar}>
        <CBText variant="h2" style={styles.avatarText}>{moviesStore.getUserInitial()}</CBText>
      </CBView>
    );
  };
  
  /**
   * Render empty state when no movies are in watchlist
   */
  const renderEmptyContent = () => (
    <CBView style={styles.emptyContainer}>
      <CBText variant="h4" style={styles.emptyText}>
        Your watchlist is empty
      </CBText>
      <CBText variant="body" style={styles.emptySubtext}>
        Add movies to your watchlist to see them here
      </CBText>
    </CBView>
  );
  
  // Create the FlatList with empty state
  const MovieList = WithEmptyState(FlatList) as React.ComponentType<
    WithEmptyStateProps & React.ComponentProps<typeof FlatList>
  >;

  return (
    <ScreenContainer backgroundColor={colors.whiteColor}>
      {/* Header with logo */}
      <CBView style={styles.header}>
        <CBImage 
          source="ic_logo" 
          style={{ width: moderateScale(150), height: moderateScale(50) }} 
          resizeMode="contain"
        />
      </CBView>
      
      {/* User Profile Header */}
      <CBView style={styles.profileHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-left" type="material-community" size={30} color={colors.whiteColor} />
        </TouchableOpacity>
        
        <CBView style={styles.profileAvatarContainer}>
          {renderAvatar()}
          
          <CBView style={styles.profileInfo}>
            <CBText variant="h3" style={styles.profileName}>
              {moviesStore.userProfile?.name || moviesStore.userProfile?.username || 'User'}
            </CBText>
            <CBText variant="body" style={styles.profileJoinDate}>
              {getFormattedJoinDate()}
            </CBText>
          </CBView>
        </CBView>
      </CBView>
      
      {/* Watchlist Content */}
      <CBView style={styles.watchlistContainer}>
        <CBText variant="h3" style={styles.watchlistTitle}>
          My Watchlist
        </CBText>
        
        {/* Filter and Sort Options */}
        <CBView style={styles.filterContainer}>
          <CBView style={styles.filterOptions}>
            <CBText variant="caption" style={styles.filterLabel}>Filter by:</CBText>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setFilterMenuOpen(!filterMenuOpen)}
            >
              <CBText variant="button">{selectedFilter.label}</CBText>
              <Icon 
                name={filterMenuOpen ? "chevron-up" : "chevron-down"} 
                type="material-community" 
                size={20} 
                color={colors.primaryColor} 
              />
            </TouchableOpacity>
            
            {/* Filter dropdown menu */}
            {renderFilterMenu()}
          </CBView>
          
          <CBView style={styles.sortContainer}>
            <CBText variant="caption" style={styles.filterLabel}>Order:</CBText>
            <TouchableOpacity style={styles.sortButton} onPress={handleSortToggle}>
              <Icon 
                name={isAscending ? "arrow-up" : "arrow-down"} 
                type="material-community" 
                size={24} 
                color={colors.primaryTextColor} 
              />
            </TouchableOpacity>
          </CBView>
        </CBView>
        
        {/* Basic FlatList for Watchlist Movies */}
        {loading ? (
          <CBView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryColor} />
          </CBView>
        ) : (
          <FlatList
            data={moviesStore.watchlistMovies}
            renderItem={({ item }) => (
              <CBView style={styles.watchlistItemContainer}>
                <TouchableOpacity 
                  style={styles.watchlistItem}
                  onPress={() => handleMoviePress(item)}
                  activeOpacity={0.7}
                >
                  <CBImage 
                    source={{ uri: moviesStore.getPosterUrl(item.poster_path, 'small') }}
                    style={styles.watchlistPoster}
                    resizeMode="cover"
                  />
                  <CBView style={styles.watchlistItemInfo}>
                    <CBText variant="h4" style={styles.watchlistItemTitle} numberOfLines={1}>
                      {item.title}
                    </CBText>
                    <CBText variant="body" style={styles.watchlistItemDate}>
                      {item.release_date ? new Date(item.release_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'No release date'}
                    </CBText>
                    <CBText variant="body" style={styles.watchlistItemOverview} numberOfLines={2}>
                      {item.overview || 'No overview available'}
                    </CBText>
                  </CBView>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveMovie(item.id)}
                  disabled={removingMovieId === item.id}
                >
                  {removingMovieId === item.id ? (
                    <ActivityIndicator size="small" color={colors.primaryColor} />
                  ) : (
                    <Icon name="close" type="material" size={18} color="#999" />
                  )}
                </TouchableOpacity>
              </CBView>
            )}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyContent}
            onRefresh={handleRefresh}
            refreshing={false}
          />
        )}
      </CBView>
    </ScreenContainer>
  );
});

const styles = StyleSheet.create({
  header: {
    marginBottom: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: colors.tabBarColor,
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(28),
    paddingHorizontal: moderateScale(32),
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: moderateScale(16),
    left: moderateScale(16),
    zIndex: 10,
  },
  profileAvatarContainer: {
    marginTop: moderateScale(36),
    flexDirection: 'row',
    alignItems: 'center',

  },
  profileAvatar: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: '#8A56E2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: colors.whiteColor,
    fontSize: moderateScale(32),
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: moderateScale(24),
  },
  profileName: {
    color: colors.whiteColor,
    fontWeight: 'bold',
    marginBottom: moderateScale(4),
  },
  profileJoinDate: {
    color: '#B8C2CC',
    fontSize: moderateScale(14),
  },
  watchlistContainer: {
    flex: 1,
    backgroundColor: colors.whiteColor,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(24),
  },
  watchlistTitle: {
    fontWeight: 'bold',
    marginBottom: moderateScale(16),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
    zIndex: 100,
  },
  filterOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  filterLabel: {
    color: colors.tertiaryTextColor,
    marginRight: moderateScale(8),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryColor,
    paddingBottom: moderateScale(4),
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    padding: moderateScale(4),
  },
  filterMenu: {
    position: 'absolute',
    top: moderateScale(30),
    left: moderateScale(50),
    backgroundColor: colors.whiteColor,
    borderRadius: moderateScale(4),
    padding: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  filterMenuItem: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(4),
  },
  filterMenuItemSelected: {
    backgroundColor: colors.lightPrimaryColor,
  },
  filterMenuItemText: {
    fontSize: moderateScale(14),
  },
  filterMenuItemTextSelected: {
    color: colors.primaryColor,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: moderateScale(16),
  },
  watchlistItemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.whiteColor,
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E3E3E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  watchlistItem: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: moderateScale(24),
  },
  watchlistPoster: {
    width: moderateScale(80),
    height: moderateScale(120),
  },
  watchlistItemInfo: {
    flex: 1,
    padding: moderateScale(12),
    justifyContent: 'space-between',
  },
  watchlistItemTitle: {
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },
  watchlistItemDate: {
    color: colors.tertiaryTextColor,
    fontSize: moderateScale(14),
    marginVertical: moderateScale(4),
  },
  watchlistItemOverview: {
    color: colors.secondaryTextColor,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  removeButton: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    padding: moderateScale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(40),
    paddingHorizontal: moderateScale(24),
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: moderateScale(8),
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 999,
  },
});

export default WatchlistScreen; 