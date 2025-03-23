import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, StatusBar } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import { moderateScale } from '@utils/ThemeUtil';

// Components
import CBView from '@components/CBView';
import CBText from '@components/CBText';
import CBImage from '@components/CBImage';
import CBButton from '@components/CBButton';
import CBHeader from '@components/CBHeader';
import ScreenContainer from '@components/ScreenContainer';
import WithLoading from '@components/hoc/WithLoading';

// Hooks
import { useMoviesStore } from '@hooks/useStores';

// Utils
import DateUtil from '@utils/DateUtil';

// Styles & Themes
import colors from '@configs/colors';

// Types
import { MovieDetail } from '@stores/MoviesStore';

// Define the navigation param list type directly here if import doesn't work
type RootStackParamList = {
  Home: undefined;
  Watchlist: undefined;
  MovieDetail: { movieId: number };
};

type MovieDetailScreenRouteProp = RouteProp<RootStackParamList, 'MovieDetail'>;
type MovieDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * MovieDetailScreen component displays detailed information about a specific movie
 */
const MovieDetailScreen: React.FC = observer(() => {
  // Navigation and route
  const navigation = useNavigation<MovieDetailScreenNavigationProp>();
  const route = useRoute<MovieDetailScreenRouteProp>();
  const { movieId } = route.params;
  
  // Store and state
  const moviesStore = useMoviesStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState<boolean>(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  
  // Get movie details when component mounts
  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);
  
  /**
   * Fetch movie details from the API
   */
  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const movieDetail = await moviesStore.getMovieDetails(movieId);
      
      if (!movieDetail) {
        setError('Failed to load movie details. Please try again.');
      } else {
        setMovie(movieDetail);
      }
    } catch (err) {
      console.error('Error in fetchMovieDetails:', err);
      setError('An error occurred while loading movie details.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle retry button press
   */
  const handleRetry = () => {
    fetchMovieDetails();
  };
  
  /**
   * Format release date with region information
   * @param releaseDate - Release date string
   * @param region - Region code (optional)
   */
  const formatReleaseInfo = (releaseDate: string, region?: string) => {
    if (!releaseDate) return 'N/A';
    const formattedDate = DateUtil.formatDate(releaseDate, 'YYYY-MM-DD', 'DD/MM/YYYY');
    return region ? `${formattedDate} (${region})` : formattedDate;
  };
  
  /**
   * Format runtime to hours and minutes
   * @param minutes - Runtime in minutes
   */
  const formatRuntime = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  /**
   * Handle add to watchlist button press
   */
  const handleAddToWatchlist = async () => {
    if (!movie) return;
    
    // Reset states
    setIsAddingToWatchlist(true);
    setActionSuccess(false);
    setWatchlistError(null);
    
    try {
      // Call the async toggleWatchlist method
      const result = await moviesStore.toggleWatchlist(movie);
      
      // Show success state briefly
      setActionSuccess(true);
      
      // Log the result
      console.log(result 
        ? `Added "${movie.title}" to watchlist` 
        : `Removed "${movie.title}" from watchlist`
      );
      
      // Clear success state after a delay
      setTimeout(() => {
        setActionSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error toggling watchlist status:', error);
      setWatchlistError('Failed to update watchlist. Please try again.');
      
      // Clear error after a delay
      setTimeout(() => {
        setWatchlistError(null);
      }, 3000);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };
  
  /**
   * Check if the current movie is in the watchlist
   */
  const isInWatchlist = (): boolean => {
    if (!movie) return false;
    return moviesStore.isInWatchlist(movie.id);
  };
  
  /**
   * Handle back button press
   */
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // Create the content component
  const MovieDetailContentComponent = () => {
    // Show error state if there's an error
    if (error) {
      return (
        <CBView style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            type="material-community"
            size={60}
            color={colors.errorTextColor}
          />
          <CBText variant="h4" style={styles.errorText}>{error}</CBText>
          <CBButton
            title="Retry"
            variant="primary"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </CBView>
      );
    }
    
    // Show empty state if no movie data
    if (!movie && !loading) {
      return (
        <CBView style={styles.errorContainer}>
          <Icon
            name="movie-outline"
            type="material-community"
            size={60}
            color={colors.secondaryTextColor}
          />
          <CBText variant="h4" style={styles.emptyText}>Movie information not available</CBText>
          <CBButton
            title="Go Back"
            variant="secondary"
            onPress={handleBackPress}
            style={styles.retryButton}
          />
        </CBView>
      );
    }
    
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {movie && (
          <>
            {/* Header with Title and Year - Now using CBHeader */}
            <CBHeader 
              type="detail"
              title={`${movie.title} ${movie.release_date ? `(${movie.release_date.substring(0, 4)})` : ''}`}
              backgroundColor="#4BA5D1"
              showBackButton={true}
              onBackPress={handleBackPress}
            />
            
            {/* Movie Info Section */}
            <CBView style={styles.infoSection}>
              {/* Basic Info Row */}
              <CBView style={styles.infoRow}>
                <CBText variant="body" style={styles.infoLabel}>
                  PG13
                </CBText>
                
                <CBText variant="body" style={styles.infoText}>
                  {movie.release_date && formatReleaseInfo(movie.release_date, 'SG')} • {formatRuntime(movie.runtime)}
                </CBText>
              </CBView>
              
              {/* Genre Row */}
              <CBView style={styles.infoRow}>
                <CBText variant="body" style={styles.genreText}>
                  {movie.genres?.map((genre, index) => (
                    `${genre.name}${index < movie.genres.length - 1 ? ', ' : ''}`
                  )).join('')}
                </CBText>
              </CBView>
              
              {/* Status and Language */}
              <CBView style={styles.infoRow}>
                <CBText variant="body" style={styles.infoLabel}>
                  Status:
                </CBText>
                <CBText variant="body" style={styles.infoValue}>
                  {movie.status}
                </CBText>
              </CBView>
              
              <CBView style={styles.infoRow}>
                <CBText variant="body" style={styles.infoLabel}>
                  Original Language:
                </CBText>
                <CBText variant="body" style={styles.infoValue}>
                  {movie.original_language?.toUpperCase()}
                </CBText>
              </CBView>
            </CBView>
            
            {/* User Score Section */}
            <CBView style={styles.userScoreSection}>
              <CBView style={styles.scoreCircle}>
                <CBText variant="h3" style={styles.scoreText}>
                  {Math.round(movie.vote_average * 10)}
                </CBText>
              </CBView>
              <CBText variant="h4" style={styles.userScoreLabel}>
                User Score
              </CBText>
            </CBView>
            
            {/* Credits Section */}
            <CBView style={styles.creditsSection}>
              {movie.credits?.crew?.some(person => person.job === 'Director') && (
                <CBView style={styles.creditItem}>
                  <CBText variant="h5" style={styles.creditName}>
                    {movie.credits.crew
                      .filter(person => person.job === 'Director')
                      .map(director => director.name)
                      .join(', ')}
                  </CBText>
                  <CBText variant="body" style={styles.creditRole}>
                    Director, Writer
                  </CBText>
                </CBView>
              )}
              
              {movie.credits?.crew?.some(person => 
                person.department === 'Writing' || person.job === 'Screenplay' || person.job === 'Story'
              ) && (
                <CBView style={styles.creditItem}>
                  <CBText variant="h5" style={styles.creditName}>
                    {movie.credits.crew
                      .filter(person => 
                        person.department === 'Writing' || person.job === 'Screenplay' || person.job === 'Story'
                      )
                      .slice(0, 2)
                      .map(writer => writer.name)
                      .join(', ')}
                  </CBText>
                  <CBText variant="body" style={styles.creditRole}>
                    Writer
                  </CBText>
                </CBView>
              )}
            </CBView>
            
            {/* Tagline */}
            {movie.tagline && (
              <CBView style={styles.taglineContainer}>
                <CBText variant="caption" style={styles.taglineText}>
                  "{movie.tagline}"
                </CBText>
              </CBView>
            )}
            
            {/* Overview Section */}
            <CBView style={styles.overviewSection}>
              <CBText variant="h4" style={styles.sectionTitle}>
                Overview
              </CBText>
              <CBText variant="body" style={styles.overviewText}>
                {movie.overview || 'No overview available.'}
              </CBText>
            </CBView>
            
            {/* Add to Watchlist Button */}
            <CBView style={styles.watchlistButtonContainer}>
              <CBButton
                title={
                  actionSuccess 
                    ? "Success!" 
                    : isInWatchlist() 
                      ? "Remove From Watchlist" 
                      : "Add To Watchlist"
                }
                variant={actionSuccess ? "secondary" : "primary"}
                onPress={handleAddToWatchlist}
                style={styles.watchlistButton}
                loading={isAddingToWatchlist}
                leftIcon={
                  !isAddingToWatchlist && (
                    <Icon 
                      name={actionSuccess 
                        ? "check-circle" 
                        : isInWatchlist() 
                          ? "bookmark" 
                          : "bookmark-outline"
                      } 
                      type="material-community" 
                      color={colors.whiteColor} 
                      size={20}
                      style={styles.buttonIcon} 
                    />
                  )
                }
              />
              
              {watchlistError && (
                <CBText variant="caption" style={styles.errorMessage}>
                  {watchlistError}
                </CBText>
              )}
            </CBView>
          </>
        )}
      </ScrollView>
    );
  };
  
  // Apply the WithLoading HOC
  const MovieDetailContent = WithLoading(MovieDetailContentComponent);
  
  return (
    <ScreenContainer
      withPadding={false}
      safeArea={false}
      backgroundColor={colors.containerColor}
      statusBarStyle="light-content"
      statusBarColor="transparent"
      statusBarHidden={false}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Movie Detail Content */}
      <MovieDetailContent loading={loading} />
    </ScreenContainer>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.whiteColor,
  },
  headerContainer: {
    backgroundColor: '#4BA5D1', // Light blue header color
    paddingTop: moderateScale(70),
    paddingBottom: moderateScale(30),
    paddingHorizontal: moderateScale(20),
    width: '100%',
  },
  movieTitleHeader: {
    color: colors.whiteColor,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#4BA5D1', // Same light blue as header
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  infoLabel: {
    color: colors.whiteColor,
    fontWeight: 'bold',
    marginRight: moderateScale(8),
  },
  infoText: {
    color: colors.whiteColor,
  },
  infoValue: {
    color: colors.whiteColor,
  },
  genreText: {
    color: colors.whiteColor,
  },
  userScoreSection: {
    backgroundColor: '#64B5D9', // Slightly lighter blue
    padding: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#28a745', // Green for score
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(15),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoreText: {
    color: colors.whiteColor,
    fontWeight: 'bold',
    fontSize: moderateScale(22),
  },
  userScoreLabel: {
    color: colors.whiteColor,
    fontWeight: 'bold',
  },
  creditsSection: {
    padding: moderateScale(20),
    backgroundColor: colors.whiteColor,
  },
  creditItem: {
    marginBottom: moderateScale(15),
  },
  creditName: {
    fontWeight: 'bold',
    color: colors.primaryTextColor,
  },
  creditRole: {
    color: colors.secondaryTextColor,
  },
  taglineContainer: {
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(10),
    backgroundColor: colors.whiteColor,
  },
  taglineText: {
    fontStyle: 'italic',
    color: colors.secondaryTextColor,
  },
  overviewSection: {
    padding: moderateScale(20),
    backgroundColor: colors.whiteColor,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: moderateScale(10),
    color: colors.primaryTextColor,
  },
  overviewText: {
    lineHeight: moderateScale(24),
    color: colors.secondaryTextColor,
  },
  watchlistButtonContainer: {
    padding: moderateScale(20),
    paddingTop: 0,
    backgroundColor: colors.whiteColor,
  },
  watchlistButton: {
    width: '100%',
    borderRadius: moderateScale(30),
  },
  buttonIcon: {
    marginRight: moderateScale(8),
  },
  backButton: {
    position: 'absolute',
    top: moderateScale(40),
    left: moderateScale(16),
    zIndex: 100,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  errorText: {
    color: colors.errorTextColor,
    textAlign: 'center',
    marginVertical: moderateScale(16),
  },
  emptyText: {
    color: colors.secondaryTextColor,
    textAlign: 'center',
    marginVertical: moderateScale(16),
  },
  retryButton: {
    marginTop: moderateScale(16),
    minWidth: moderateScale(120),
  },
  errorMessage: {
    color: colors.errorTextColor,
    marginTop: moderateScale(8),
    fontSize: moderateScale(12),
  },
});

export default MovieDetailScreen; 