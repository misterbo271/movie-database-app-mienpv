import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  ImageSourcePropType 
} from 'react-native';
import colors from '../configs/colors';
import { moderateScale } from '../utils/ThemeUtil';
import CBText from './CBText';
import CBImage from './CBImage';

/**
 * Available card variants
 */
type CardVariant = 
  | 'default'
  | 'horizontal'
  | 'featured';

/**
 * Props interface for CBCard component
 * @interface CBCardProps
 */
interface CBCardProps {
  /**
   * Movie title
   */
  title: string;
  /**
   * Image source for the poster
   */
  posterImage?: ImageSourcePropType;
  /**
   * Image source URL for the poster (alternative to posterImage)
   */
  posterUrl?: string;
  /**
   * Release date of the movie
   */
  releaseDate?: string;
  /**
   * Rating score (0-10)
   */
  rating?: number;
  /**
   * Overview or description
   */
  overview?: string;
  /**
   * Card variant
   */
  variant?: CardVariant;
  /**
   * Custom style for the card container
   */
  style?: ViewStyle;
  /**
   * Function called when card is pressed
   */
  onPress?: () => void;
  /**
   * Height of the card (optional)
   */
  height?: number;
  /**
   * Width of the card (optional)
   */
  width?: number;
}

/**
 * A custom card component for displaying movie information
 * 
 * @example
 * // Basic usage
 * <CBCard 
 *   title="Inception"
 *   posterUrl="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
 *   releaseDate="2010-07-16"
 *   rating={8.8}
 *   onPress={() => console.log('Card pressed')}
 * />
 * 
 * @example
 * // Horizontal card with overview
 * <CBCard 
 *   title="The Dark Knight"
 *   posterUrl="https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
 *   releaseDate="2008-07-18"
 *   rating={9.0}
 *   overview="When the menace known as the Joker wreaks havoc and chaos on the people of Gotham..."
 *   variant="horizontal"
 *   onPress={() => navigation.navigate('MovieDetail', { id: 155 })}
 * />
 */
const CBCard: React.FC<CBCardProps> = ({
  title,
  posterImage,
  posterUrl,
  releaseDate,
  rating,
  overview,
  variant = 'default',
  style,
  onPress,
  height,
  width,
}) => {
  // Format release date (YYYY-MM-DD to MMM DD, YYYY)
  const formattedDate = releaseDate ? formatReleaseDate(releaseDate) : '';
  
  // Format rating to display one decimal place
  const formattedRating = rating ? rating.toFixed(1) : '-';

  // Get dimensions based on variant
  const cardDimensions = getCardDimensions(variant, height, width);

  // Render poster image
  const renderPoster = () => (
    <CBImage
      source={posterImage || { uri: posterUrl }}
      style={[
        styles.poster, 
        { 
          height: variant === 'horizontal' ? cardDimensions.height : cardDimensions.height * 0.7,
          width: variant === 'horizontal' ? cardDimensions.width * 0.35 : cardDimensions.width 
        }
      ]}
      resizeMode="cover"
    />
  );

  // Render rating badge
  const renderRating = () => (
    rating ? (
      <View style={styles.ratingBadge}>
        <CBText variant="caption" style={styles.ratingText}>
          {formattedRating}
        </CBText>
      </View>
    ) : null
  );

  // Render card content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'horizontal':
        return (
          <View style={styles.horizontalCard}>
            {renderPoster()}
            <View style={styles.horizontalContent}>
              <CBText variant="h5" numberOfLines={2} style={styles.title}>
                {title}
              </CBText>
              {formattedDate ? (
                <CBText variant="caption" style={styles.releaseDate}>
                  {formattedDate}
                </CBText>
              ) : null}
              {overview ? (
                <CBText variant="body" numberOfLines={3} style={styles.overview}>
                  {overview}
                </CBText>
              ) : null}
              {renderRating()}
            </View>
          </View>
        );
        
      case 'featured':
        return (
          <View style={[styles.featuredCard, cardDimensions]}>
            {renderPoster()}
            <View style={styles.featuredContent}>
              <CBText variant="h4" numberOfLines={2} style={styles.featuredTitle}>
                {title}
              </CBText>
              {formattedDate ? (
                <CBText variant="caption" style={styles.releaseDate}>
                  {formattedDate}
                </CBText>
              ) : null}
              {renderRating()}
            </View>
          </View>
        );
        
      default: // default vertical card
        return (
          <View style={[styles.defaultCard, cardDimensions]}>
            {renderPoster()}
            <View style={styles.defaultContent}>
              <CBText variant="body" numberOfLines={2} style={styles.title}>
                {title}
              </CBText>
              {formattedDate ? (
                <CBText variant="caption" style={styles.releaseDate}>
                  {formattedDate}
                </CBText>
              ) : null}
              {renderRating()}
            </View>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

/**
 * Helper function to format release date
 */
const formatReleaseDate = (releaseDate: string): string => {
  try {
    const date = new Date(releaseDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return releaseDate;
  }
};

/**
 * Helper function to get card dimensions based on variant
 */
const getCardDimensions = (
  variant: CardVariant,
  customHeight?: number,
  customWidth?: number
): { height: number; width: number } => {
  switch (variant) {
    case 'horizontal':
      return {
        height: customHeight || moderateScale(150),
        width: customWidth || moderateScale(300),
      };
    case 'featured':
      return {
        height: customHeight || moderateScale(280),
        width: customWidth || moderateScale(250),
      };
    default: // default vertical card
      return {
        height: customHeight || moderateScale(220),
        width: customWidth || moderateScale(150),
      };
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: moderateScale(8),
    marginHorizontal: moderateScale(4),
    backgroundColor: colors.whiteColor,
    shadowColor: colors.blackColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  defaultCard: {
    flexDirection: 'column',
  },
  horizontalCard: {
    flexDirection: 'row',
  },
  featuredCard: {
    flexDirection: 'column',
  },
  poster: {
    backgroundColor: colors.grayColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  defaultContent: {
    padding: moderateScale(10),
    height: moderateScale(70),
  },
  horizontalContent: {
    flex: 1,
    padding: moderateScale(12),
    justifyContent: 'flex-start',
  },
  featuredContent: {
    padding: moderateScale(12),
    height: moderateScale(80),
  },
  title: {
    marginBottom: moderateScale(4),
  },
  featuredTitle: {
    color: colors.whiteColor,
    marginBottom: moderateScale(6),
  },
  releaseDate: {
    color: colors.tertiaryTextColor,
    marginBottom: moderateScale(6),
  },
  overview: {
    marginTop: moderateScale(6),
    color: colors.secondaryTextColor,
  },
  ratingBadge: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    backgroundColor: colors.primaryColor,
    borderRadius: 12,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: colors.whiteColor,
    fontWeight: 'bold',
  },
});

export default CBCard; 