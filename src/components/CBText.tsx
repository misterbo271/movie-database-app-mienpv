import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import colors from '../configs/colors';
import fonts from '../configs/fonts';

/**
 * Available text variants
 */
type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4'
  | 'h5' 
  | 'body' 
  | 'bodyBold'
  | 'caption'
  | 'button';

/**
 * Available text colors as define prop
 */
type TextDefine = 
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'white'
  | 'black'
  | 'error'
  | string;

/**
 * Props interface for CBText component
 * @interface CBTextProps
 * @extends {TextProps}
 */
interface CBTextProps extends TextProps {
  /**
   * Text variant (determines font size and weight)
   */
  variant?: TextVariant;
  /**
   * Predefined color style
   */
  define?: TextDefine;
  /**
   * Whether the text should be centered
   */
  center?: boolean;
  /**
   * Whether the text should be bold
   */
  bold?: boolean;
}

/**
 * Helper function to get text color from define prop
 * @param define - Color definition
 * @returns The color string
 */
const getTextColor = (define?: TextDefine): string => {
  if (!define) return colors.primaryTextColor;

  const colorMap: { [key: string]: string } = {
    primary: colors.primaryColor,
    secondary: colors.secondaryColor,
    tertiary: colors.tertiaryColor,
    white: colors.whiteColor,
    black: colors.blackColor,
    error: colors.errorTextColor,
  };

  return colorMap[define] || colors.primaryTextColor;
};

/**
 * A custom Text component with typography variants and predefined styles
 * 
 * @example
 * // Basic usage
 * <CBText variant="h1" define="primary">Heading Text</CBText>
 * 
 * @example
 * // Body text with custom style
 * <CBText variant="body" center style={{ marginTop: 10 }}>
 *   Some body text that is centered
 * </CBText>
 */
const CBText: React.FC<CBTextProps> = (props) => {
  const { variant = 'body', define, center, bold, style, ...rest } = props;
  
  // Get base style from variant
  const variantStyle = fonts.fontStyles[variant] || fonts.fontStyles.body;
  
  // Get text color from define
  const textColor = getTextColor(define);
  
  // Additional styles
  const additionalStyles = {
    ...(center && styles.center),
    ...(bold && styles.bold),
    color: textColor,
  };

  return (
    <Text 
      {...rest} 
      style={[variantStyle, additionalStyles, style]} 
    />
  );
};

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  bold: {
    fontFamily: fonts.fontFamily.bold,
  },
});

export default CBText; 