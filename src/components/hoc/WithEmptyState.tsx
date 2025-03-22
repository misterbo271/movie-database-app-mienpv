import React from 'react';
import { 
  View, 
  StyleSheet, 
  Image,
  ImageSourcePropType
} from 'react-native';
import { moderateScale } from '../../utils/ThemeUtil';
import colors from '../../configs/colors';
import CBText from '../CBText';
import CBButton from '../CBButton';

/**
 * Props for WithEmptyState HOC
 * @interface WithEmptyStateProps
 */
interface WithEmptyStateProps {
  /**
   * Data array to check for emptiness
   */
  data: Array<any> | null | undefined;
  /**
   * Custom message to display when data is empty
   */
  emptyMessage?: string;
  /**
   * Custom title to display when data is empty
   */
  emptyTitle?: string;
  /**
   * Custom image to display when data is empty
   */
  emptyImage?: ImageSourcePropType;
  /**
   * Function to call when action button is pressed
   */
  onEmptyAction?: () => void;
  /**
   * Text to display on action button
   */
  actionText?: string;
  /**
   * Whether to show action button
   */
  showAction?: boolean;
  /**
   * Custom empty state component to display
   */
  emptyComponent?: React.ReactNode;
  /**
   * Whether the data is still loading (will not show empty state if true)
   */
  loading?: boolean;
}

/**
 * Default empty state image
 */
const defaultEmptyImage = require('../../assets/images/empty.png');

/**
 * Higher-Order Component that adds empty state handling to a component
 * 
 * @example
 * // Basic usage
 * const MovieList = ({ movies }) => (
 *   <FlatList
 *     data={movies}
 *     renderItem={({ item }) => <MovieItem movie={item} />}
 *     keyExtractor={item => item.id.toString()}
 *   />
 * );
 * 
 * const MovieListWithEmptyState = WithEmptyState(MovieList);
 * 
 * // In parent component:
 * <MovieListWithEmptyState 
 *   data={movies} 
 *   movies={movies} 
 *   emptyMessage="No movies found"
 * />
 * 
 * @example
 * // With custom action
 * <MovieListWithEmptyState 
 *   data={watchlist}
 *   watchlist={watchlist}
 *   emptyTitle="Your watchlist is empty"
 *   emptyMessage="Start adding movies to your watchlist"
 *   showAction={true}
 *   actionText="Explore Movies"
 *   onEmptyAction={() => navigation.navigate('Discover')}
 * />
 */
function WithEmptyState<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithEmptyStateProps> {
  /**
   * Component with empty state handling functionality
   */
  const ComponentWithEmptyState: React.FC<P & WithEmptyStateProps> = ({
    data,
    emptyMessage = 'No items found',
    emptyTitle = 'Nothing Here',
    emptyImage = defaultEmptyImage,
    onEmptyAction,
    actionText = 'Refresh',
    showAction = false,
    emptyComponent,
    loading = false,
    ...props
  }) => {
    // Check if data is empty
    const isEmpty = Array.isArray(data) ? data.length === 0 : !data;

    // If data is empty and not loading, show empty state
    if (isEmpty && !loading) {
      // If custom empty component is provided, use it
      if (emptyComponent) {
        return <>{emptyComponent}</>;
      }

      // Otherwise, show default empty state UI
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={emptyImage}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <CBText variant="h5" style={styles.emptyTitle}>
            {emptyTitle}
          </CBText>
          <CBText variant="body" style={styles.emptyMessage}>
            {emptyMessage}
          </CBText>
          {showAction && onEmptyAction && (
            <CBButton
              title={actionText}
              variant="outline"
              onPress={onEmptyAction}
              style={styles.actionButton}
            />
          )}
        </View>
      );
    }

    // Otherwise, render the wrapped component
    return <WrappedComponent {...(props as P)} />;
  };

  // Set display name for debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithEmptyState.displayName = `WithEmptyState(${wrappedComponentName})`;

  return ComponentWithEmptyState;
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  emptyImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    marginBottom: moderateScale(16),
  },
  emptyTitle: {
    marginBottom: moderateScale(8),
    color: colors.primaryTextColor,
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: moderateScale(24),
    color: colors.secondaryTextColor,
  },
  actionButton: {
    marginTop: moderateScale(8),
    minWidth: moderateScale(120),
  },
});

export default WithEmptyState; 