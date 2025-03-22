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
            {/* Movie Backdrop */}
            <View style={styles.backdropContainer}>
              <CBImage
                source={{ uri: moviesStore.getPosterUrl(movie.backdrop_path, 'large') }}
                style={styles.backdropImage}
                resizeMode="cover"
              />
              <View style={styles.backdropOverlay} />
            </View>
            
            {/* Movie Info Header */}
            <CBView style={styles.contentContainer}>
              {/* Poster and Basic Info */}
              <CBView style={styles.headerRow}>
                <CBImage
                  source={{ uri: moviesStore.getPosterUrl(movie.poster_path, 'medium') }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                
                <CBView style={styles.headerInfo}>
                  <CBText variant="h3" style={styles.movieTitle}>
                    {movie.title} {movie.release_date && `(${movie.release_date.substring(0, 4)})`}
                  </CBText>
                  
                  {movie.tagline && (
                    <CBText variant="caption" style={styles.tagline}>
                      {movie.tagline}
                    </CBText>
                  )}
                  
                  <CBView style={styles.detailsRow}>
                    {movie.release_date && (
                      <CBText variant="body" style={styles.releaseDate}>
                        {formatReleaseInfo(movie.release_date, 'SG')}
                      </CBText>
                    )}
                    
                    <CBView style={styles.genreContainer}>
                      {movie.genres?.map((genre, index) => (
                        <CBText key={genre.id} variant="body" style={styles.genreText}>
                          {genre.name}{index < movie.genres.length - 1 ? ', ' : ''}
                        </CBText>
                      ))}
                    </CBView>
                    
                    {movie.runtime > 0 && (
                      <CBText variant="body" style={styles.runtime}>
                        {formatRuntime(movie.runtime)}
                      </CBText>
                    )}
                  </CBView>
                  
                  {/* Rating Circle */}
                  <CBView style={styles.ratingContainer}>
                    <CBView style={styles.ratingCircle}>
                      <CBText variant="h4" style={styles.ratingText}>
                        {Math.round(movie.vote_average * 10)}
                      </CBText>
                    </CBView>
                    <CBText variant="caption" style={styles.ratingLabel}>
                      User Score
                    </CBText>
                  </CBView>
                  
                  {/* Status */}
                  <CBText variant="body" style={styles.statusText}>
                    Status: {movie.status}
                  </CBText>
                  
                  {/* Original Language */}
                  <CBText variant="body" style={styles.languageText}>
                    Original Language: {movie.original_language?.toUpperCase()}
                  </CBText>
                </CBView>
              </CBView>
              
              {/* Overview Section */}
              <CBView style={styles.overviewSection}>
                <CBText variant="h4" style={styles.sectionTitle}>
                  Overview
                </CBText>
                <CBText variant="body" style={styles.overviewText}>
                  {movie.overview || 'No overview available.'}
                </CBText>
              </CBView>
              
              {/* Credits Section - Director */}
              {movie.credits?.crew?.some(person => person.job === 'Director') && (
                <CBView style={styles.creditsSection}>
                  <CBText variant="h4" style={styles.sectionTitle}>
                    Director
                  </CBText>
                  {movie.credits.crew
                    .filter(person => person.job === 'Director')
                    .map(director => (
                      <CBText key={director.id} variant="body" style={styles.crewText}>
                        {director.name}
                      </CBText>
                    ))}
                </CBView>
              )}
              
              {/* Writer Section */}
              {movie.credits?.crew?.some(person => 
                person.department === 'Writing' || person.job === 'Screenplay' || person.job === 'Story'
              ) && (
                <CBView style={styles.creditsSection}>
                  <CBText variant="h4" style={styles.sectionTitle}>
                    Writer
                  </CBText>
                  {movie.credits.crew
                    .filter(person => 
                      person.department === 'Writing' || person.job === 'Screenplay' || person.job === 'Story'
                    )
                    .slice(0, 2)
                    .map(writer => (
                      <CBText key={writer.id} variant="body" style={styles.crewText}>
                        {writer.name}
                      </CBText>
                    ))}
                </CBView>
              )}
              
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
      {/* Back Button - Absolute Positioned */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Icon 
          name="arrow-left" 
          type="material-community" 
          color={colors.whiteColor} 
          size={30}
        />
      </TouchableOpacity>
      
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Movie Detail Content */}
      <MovieDetailContent loading={loading} />
    </ScreenContainer>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    height: moderateScale(220),
    width: '100%',
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(24),
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: moderateScale(24),
  },
  posterImage: {
    width: moderateScale(100),
    height: moderateScale(150),
    borderRadius: 8,
    marginTop: -moderateScale(40),
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  headerInfo: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryTextColor,
    marginBottom: 4,
  },
  tagline: {
    fontStyle: 'italic',
    color: colors.tertiaryTextColor,
    marginBottom: 8,
  },
  detailsRow: {
    marginBottom: 12,
  },
  releaseDate: {
    color: colors.secondaryTextColor,
    marginBottom: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  genreText: {
    color: colors.secondaryTextColor,
  },
  runtime: {
    color: colors.secondaryTextColor,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    color: colors.whiteColor,
    fontWeight: 'bold',
  },
  ratingLabel: {
    color: colors.secondaryTextColor,
  },
  statusText: {
    color: colors.secondaryTextColor,
    marginBottom: 4,
  },
  languageText: {
    color: colors.secondaryTextColor,
  },
  overviewSection: {
    marginBottom: moderateScale(24),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryTextColor,
    marginBottom: 8,
  },
  overviewText: {
    color: colors.secondaryTextColor,
    lineHeight: 24,
  },
  creditsSection: {
    marginBottom: moderateScale(16),
  },
  crewText: {
    color: colors.secondaryTextColor,
  },
  watchlistButtonContainer: {
    marginTop: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  watchlistButton: {
    minWidth: moderateScale(120),
  },
  buttonIcon: {
    marginRight: moderateScale(8),
  },
  backButton: {
    position: 'absolute',
    top: moderateScale(40),
    left: moderateScale(16),
    zIndex: 100,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
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