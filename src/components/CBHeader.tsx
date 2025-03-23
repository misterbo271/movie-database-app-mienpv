import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { moderateScale } from '@utils/ThemeUtil';

// Components
import CBView from './CBView';
import CBText from './CBText';
import CBImage from './CBImage';

// Styles & Themes
import colors from '@configs/colors';

export type CBHeaderProps = {
  /**
   * Type of header to display
   * - 'logo': Shows the app logo (default)
   * - 'detail': Shows a title with optional back button
   */
  type?: 'logo' | 'detail';
  
  /**
   * Title text to display (for detail header)
   */
  title?: string;
  
  /**
   * Subtitle text to display (for detail header)
   */
  subtitle?: string;
  
  /**
   * Whether to show a back button (for detail header)
   */
  showBackButton?: boolean;
  
  /**
   * Handler for back button press
   */
  onBackPress?: () => void;
  
  /**
   * Background color for the header
   */
  backgroundColor?: string;
  
  /**
   * Text color for the header
   */
  textColor?: string;
  
  /**
   * Additional style for the container
   */
  containerStyle?: object;
};

/**
 * CBHeader component for displaying app headers
 * Can be used for both the main app header with logo and detail screens with titles
 */
const CBHeader: React.FC<CBHeaderProps> = ({
  type = 'logo',
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  backgroundColor = colors.primaryColor,
  textColor = colors.whiteColor,
  containerStyle,
}) => {
  // Render logo header (e.g. HomeScreen)
  if (type === 'logo') {
    return (
      <CBView style={[styles.logoHeader, { backgroundColor }, containerStyle]}>
        <CBImage 
          source="ic_logo" 
          style={styles.logo} 
          resizeMode="contain"
        />
      </CBView>
    );
  }
  
  // Render detail header (e.g. MovieDetailScreen)
  return (
    <View style={[styles.detailHeader, { backgroundColor }, containerStyle]}>
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          disabled={!onBackPress}
        >
          <Icon 
            name="chevron-left" 
            type="material-community" 
            color={textColor} 
            size={30} 
          />
        </TouchableOpacity>
      )}
      
      <CBView style={styles.titleContainer}>
        <CBText variant="h3" style={[styles.title, { color: textColor }]}>
          {title}
        </CBText>
        
        {subtitle && (
          <CBText variant="caption" style={[styles.subtitle, { color: textColor }]}>
            {subtitle}
          </CBText>
        )}
      </CBView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoHeader: {
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: moderateScale(150), 
    height: moderateScale(50),
  },
  detailHeader: {
    paddingTop: moderateScale(70),
    paddingBottom: moderateScale(30),
    paddingHorizontal: moderateScale(20),
    width: '100%',
    position: 'relative',
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
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: moderateScale(4),
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default CBHeader; 