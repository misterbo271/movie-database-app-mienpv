import React from 'react';
import { View, ViewProps } from 'react-native';
import colors from '../configs/colors';

/**
 * Available style definitions for CBView
 */
type ViewDefine = 
  | 'primary' 
  | 'secondary' 
  | 'card' 
  | 'rounded' 
  | 'shadow' 
  | 'center' 
  | 'row' 
  | 'column' 
  | 'flex' 
  | string;

/**
 * Props interface for CBView component
 * @interface CBViewProps
 * @extends {ViewProps}
 */
interface CBViewProps extends ViewProps {
  /**
   * Predefined style definition
   */
  define?: ViewDefine;
}

/**
 * Helper function to get the appropriate styles based on the define prop
 * @param define - Style definition name
 * @returns The style object for the view
 */
const getViewStyle = (define?: ViewDefine) => {
  if (!define) return {};

  const styleMap: { [key: string]: any } = {
    primary: {
      backgroundColor: colors.primaryColor
    },
    secondary: {
      backgroundColor: colors.secondaryColor
    },
    card: {
      backgroundColor: colors.whiteColor,
      borderRadius: 8,
      padding: 16
    },
    rounded: {
      borderRadius: 8
    },
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    row: {
      flexDirection: 'row'
    },
    column: {
      flexDirection: 'column'
    },
    flex: {
      flex: 1
    }
  };

  // Handle multiple definitions (space-separated)
  if (define.includes(' ')) {
    const definitions = define.split(' ');
    let combinedStyle = {};

    definitions.forEach(def => {
      if (styleMap[def]) {
        combinedStyle = { ...combinedStyle, ...styleMap[def] };
      }
    });

    return combinedStyle;
  }

  return styleMap[define] || {};
};

/**
 * A custom View component with predefined styles
 * 
 * @example
 * // Basic usage
 * <CBView define="card shadow">
 *   <Text>Content inside a card with shadow</Text>
 * </CBView>
 * 
 * @example
 * // Combining define with additional styles
 * <CBView define="row center" style={{ marginTop: 10 }}>
 *   <Text>Centered Row Content</Text>
 * </CBView>
 */
const CBView: React.FC<CBViewProps> = (props) => {
  const { define, style, ...rest } = props;
  const viewStyle = getViewStyle(define);

  return (
    <View {...rest} style={[viewStyle, style]} />
  );
};

export default CBView; 