import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle 
} from 'react-native';
import colors from '../configs/colors';
import fonts from '../configs/fonts';
import CBText from './CBText';
import { moderateScale } from '../utils/ThemeUtil';

/**
 * Available button variants
 */
type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost';

/**
 * Available button sizes
 */
type ButtonSize = 
  | 'small'
  | 'medium'
  | 'large';

/**
 * Props interface for CBButton component
 * @interface CBButtonProps
 * @extends {TouchableOpacityProps}
 */
interface CBButtonProps extends TouchableOpacityProps {
  /**
   * Button text
   */
  title: string;
  /**
   * Button variant (determines appearance)
   */
  variant?: ButtonVariant;
  /**
   * Button size
   */
  size?: ButtonSize;
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;
  /**
   * Whether the button is rounded
   */
  rounded?: boolean;
  /**
   * Whether the button is full width
   */
  fullWidth?: boolean;
  /**
   * Icon to display before the title
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the title
   */
  rightIcon?: React.ReactNode;
}

/**
 * A custom Button component with different variants and sizes
 * 
 * @example
 * // Basic usage
 * <CBButton 
 *   title="Press Me" 
 *   variant="primary" 
 *   onPress={() => console.log('Button pressed')} 
 * />
 * 
 * @example
 * // Loading button with rounded corners
 * <CBButton 
 *   title="Loading" 
 *   variant="secondary" 
 *   loading={true} 
 *   rounded 
 * />
 */
const CBButton: React.FC<CBButtonProps> = (props) => {
  const { 
    title, 
    variant = 'primary', 
    size = 'medium', 
    loading = false, 
    rounded = false,
    fullWidth = false, 
    leftIcon, 
    rightIcon,
    style, 
    disabled,
    ...rest 
  } = props;

  // Get button styles based on variant
  const buttonStyle = getButtonStyle(variant);
  
  // Get button size style
  const sizeStyle = getButtonSizeStyle(size);
  
  // Text color based on variant
  const textColor = getTextColor(variant);
  
  // Button text size based on button size
  const textSize = getTextSize(size);
  
  // Additional styles
  const additionalStyles: ViewStyle = {
    ...(rounded && styles.rounded),
    ...(fullWidth && styles.fullWidth),
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      style={[styles.button, buttonStyle, sizeStyle, additionalStyles, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {leftIcon}
          <CBText 
            variant={textSize} 
            style={[styles.text, { color: textColor }]}
          >
            {title}
          </CBText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Helper function to get button style based on variant
 */
const getButtonStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return styles.primaryButton;
    case 'secondary':
      return styles.secondaryButton;
    case 'outline':
      return styles.outlineButton;
    case 'ghost':
      return styles.ghostButton;
    default:
      return styles.primaryButton;
  }
};

/**
 * Helper function to get button size style
 */
const getButtonSizeStyle = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return styles.smallButton;
    case 'medium':
      return styles.mediumButton;
    case 'large':
      return styles.largeButton;
    default:
      return styles.mediumButton;
  }
};

/**
 * Helper function to get text color based on button variant
 */
const getTextColor = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return colors.whiteColor;
    case 'outline':
      return colors.primaryColor;
    case 'ghost':
      return colors.primaryColor;
    default:
      return colors.whiteColor;
  }
};

/**
 * Helper function to get text size based on button size
 */
const getTextSize = (size: ButtonSize): 'button' | 'body' | 'bodyBold' => {
  switch (size) {
    case 'small':
      return 'body';
    case 'large':
      return 'bodyBold';
    default:
      return 'button';
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  primaryButton: {
    backgroundColor: colors.primaryColor,
  },
  secondaryButton: {
    backgroundColor: colors.secondaryColor,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primaryColor,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(12),
  },
  mediumButton: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
  },
  largeButton: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(20),
  },
  rounded: {
    borderRadius: 50,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
    fontFamily: fonts.fontFamily.semibold,
  },
});

export default CBButton; 