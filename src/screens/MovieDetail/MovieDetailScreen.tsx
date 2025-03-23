import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, StatusBar } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import { moderateScale } from '@utils/ThemeUtil';

// Components
import { CBIcon, CBHeader, CBImage, CBText, CBView, CBButton, ScreenContainer } from '@components/index';
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
    if (!movie) {
      console.error('Cannot add to watchlist: Movie data is undefined');
      return;
    }
    
    // Reset states
    setIsAddingToWatchlist(true);
    setActionSuccess(false);
    setWatchlistError(null);
    
    console.log(`Attempting to ${isInWatchlist() ? 'remove from' : 'add to'} watchlist: ${movie.title} (ID: ${movie.id})`);
    
    try {
      // Call the async toggleWatchlist method
      const result = await moviesStore.toggleWatchlist(movie);
      
      // Show success state briefly
      setActionSuccess(true);
      
      // Log the result
      console.log('Watchlist toggle result:', result);
      console.log(result 
        ? `Added "${movie.title}" to watchlist` 
        : `Removed "${movie.title}" from watchlist`
      );
      
      // Check if the movie is now in the watchlist
      console.log('Is movie in watchlist after operation?', moviesStore.isInWatchlist(movie.id));
      
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
          <ScreenContainer contentContainerStyle={{paddingTop: moderateScale(0), paddingHorizontal: 0}} backgroundColor={colors.whiteColor}>
              <CBHeader
                type="logo"
                backgroundColor={colors.whiteColor}
              />
            {/* Header with Title and Year */}
            <CBView style={styles.headerContainer}>
              <CBHeader
                type="detail"
                title={`${movie.title}`}
                subtitle={`(${movie.release_date ? movie.release_date.substring(0, 4) : ''})`}
                backgroundColor="#4C95C3"
                textColor={colors.whiteColor}
                showBackButton={true}
                onBackPress={handleBackPress}
              />
            </CBView>

            <CBView style={styles.contentContainer}>
                <CBImage
                    source={{uri: moviesStore.getPosterUrl(movie?.poster_path)}}
                    style={styles.poster}
                    resizeMode="cover"
                />
              <CBView style={styles.infoSection}>
                {/* Rating Badge */}
                <CBView style={styles.ratingBadge}>
                  <CBText variant="body" style={styles.ratingText}>
                    {!!movie?.adult ? 'R21' : 'PG13'}
                  </CBText>
                </CBView>

                {/* Info Row */}
                <CBView style={styles.infoRow}>
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
                <CBView style={styles.statusRow}>
                  <CBView style={styles.statusItem}>
                    <CBText variant="body" style={styles.infoLabel}>
                      Status:
                    </CBText>
                    <CBText variant="body" style={styles.infoValue}>
                      {movie.status}
                    </CBText>
                  </CBView>

                  <CBView style={styles.statusItem}>
                    <CBText variant="body" style={styles.infoLabel}>
                      Original Language:
                    </CBText>
                    <CBText variant="body" style={styles.infoValue}>
                      {movie.original_language?.toUpperCase()}
                    </CBText>
                  </CBView>
                </CBView>
              </CBView>
            </CBView>
            {/* Movie Info Section */}
            <CBView style={styles.detailMoviveSection}>
            {/* User Score Section */}
            <CBView style={{flexDirection: 'row'}}>
              <CBView style={styles.userScoreSection}>
                  <CBView style={styles.scoreCircle}>
                    <CBText variant="h3" style={styles.scoreText}>
                      {Math.round(movie.vote_average * 10)}<CBText variant="caption" style={styles.percentText}>%</CBText>
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
            </CBView>

              {/* Tagline */}
              <CBView style={styles.taglineContainer}>
                <CBText style={styles.taglineText}>
                  {movie?.tagline}
                </CBText>
              </CBView>

              {/* Overview Section */}
              <CBView style={styles.overviewSection}>
                <CBText variant="h2" style={styles.sectionTitle}>
                  Overview
                </CBText>
                <CBText style={styles.overviewText}>
                  {movie?.overview}
                </CBText>
              </CBView>

              {/* Add to Watchlist Button */}
              <CBView style={styles.watchlistButtonContainer}>
                <CBButton
                  title={
                    isAddingToWatchlist 
                      ? "Processing..." 
                      : actionSuccess 
                        ? "Success!" 
                        : isInWatchlist() 
                          ? "Remove From Watchlist" 
                          : "Add To Watchlist"
                  }
                  titleColor={colors.whiteColor}
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

          </ScreenContainer>
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
  contentContainer: {
    backgroundColor: '#4C95C3',
    flexDirection: 'row',
    paddingBottom: moderateScale(30),
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#4C95C3',
  },
  infoSection: {
    backgroundColor: '#4C95C3',
    padding: moderateScale(16),
    paddingTop: moderateScale(0),
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
    marginBottom: moderateScale(10),
  },
  ratingText: {
    color: colors.whiteColor,
    fontSize: moderateScale(16),
  },
  poster: {
    marginLeft: moderateScale(24),
    borderRadius: moderateScale(8),
    width: moderateScale(112),
    height: moderateScale(145),
  },
  infoRow: {
    marginBottom: moderateScale(8),
  },
  infoText: {
    color: colors.whiteColor,
    fontSize: moderateScale(16),
  },
  genreText: {
    color: colors.whiteColor,
    fontSize: moderateScale(16),
  },
  statusRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(4),
  },
  infoLabel: {
    color: colors.whiteColor,
    fontWeight: 'bold',
    marginRight: moderateScale(8),
    fontSize: moderateScale(16),
  },
  infoValue: {
    color: colors.whiteColor,
    fontSize: moderateScale(16),
  },
  detailMoviveSection: {
    backgroundColor: '#00B4E4',
    paddingTop: moderateScale(0),
  },
  userScoreSection: {
    padding: moderateScale(24),
    alignItems: 'flex-start',
  },
  scoreCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
    borderWidth: moderateScale(3),
    borderColor: '#4AFF8A',
  },
  scoreText: {
    color: colors.whiteColor,
    fontWeight: 'bold',
    fontSize: moderateScale(20),
  },
  percentText: {
    color: colors.whiteColor,
    fontSize: moderateScale(12),
    fontWeight: 'normal',
  },
  userScoreLabel: {
    marginTop: moderateScale(10),
    color: colors.whiteColor,
    fontWeight: 'bold',
    fontSize: moderateScale(22),
  },
  creditsSection: {
    flex: 1,
    padding: moderateScale(20),
  },
  creditItem: {
    marginBottom: moderateScale(15),
  },
  creditName: {
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    color: colors.whiteColor,
  },
  creditRole: {
    color: colors.whiteColor,
    fontSize: moderateScale(16),
  },
  taglineContainer: {
    paddingHorizontal: moderateScale(20),
  },
  taglineText: {
    fontStyle: 'italic',
    color: colors.whiteColor,
    fontSize: moderateScale(20),
  },
  overviewSection: {
    padding: moderateScale(20),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: moderateScale(10),
    color: colors.whiteColor,
  },
  overviewText: {
    fontWeight: 'regular',
    lineHeight: moderateScale(24),
    color: colors.whiteColor,
    fontSize: moderateScale(18),
  },
  watchlistButtonContainer: {
    padding: moderateScale(20),
    paddingTop: 0,
    backgroundColor: '#00B4E4',
  },
  watchlistButton: {
    width: '60%',
    height: moderateScale(46),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: colors.whiteColor,
  },
  buttonIcon: {
    marginRight: moderateScale(8),
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
    color: colors.whiteColor,
    marginTop: moderateScale(8),
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
});

export default MovieDetailScreen;
