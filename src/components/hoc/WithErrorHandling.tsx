import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  ImageSourcePropType
} from 'react-native';
import { moderateScale } from '../../utils/ThemeUtil';
import colors from '../../configs/colors';
import CBText from '../CBText';
import CBButton from '../CBButton';

/**
 * Props for WithErrorHandling HOC
 * @interface WithErrorHandlingProps
 */
interface WithErrorHandlingProps {
  /**
   * Whether there is an error to display
   */
  error: boolean | string | Error | null;
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  /**
   * Custom error image to display
   */
  errorImage?: ImageSourcePropType;
  /**
   * Function to call when retry button is pressed
   */
  onRetry?: () => void;
  /**
   * Text to display on retry button
   */
  retryText?: string;
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  /**
   * Custom error component to display
   */
  errorComponent?: React.ReactNode;
}

/**
 * Default error image
 */
const defaultErrorImage = require('../../assets/images/error.png');

/**
 * Higher-Order Component that adds error handling to a component
 * 
 * @example
 * // Basic usage
 * const YourComponent = ({ data }) => (
 *   <View>
 *     {data.map(item => <Text key={item.id}>{item.name}</Text>)}
 *   </View>
 * );
 * 
 * const YourComponentWithErrorHandling = WithErrorHandling(YourComponent);
 * 
 * // In parent component:
 * <YourComponentWithErrorHandling 
 *   error={error} 
 *   onRetry={fetchData}
 *   data={someData} 
 * />
 * 
 * @example
 * // With custom error message
 * <YourComponentWithErrorHandling 
 *   error={error}
 *   errorMessage="Unable to load movies. Please try again later."
 *   onRetry={fetchData}
 *   data={someData} 
 * />
 */
function WithErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithErrorHandlingProps> {
  /**
   * Component with error handling functionality
   */
  const ComponentWithErrorHandling: React.FC<P & WithErrorHandlingProps> = ({
    error,
    errorMessage,
    errorImage = defaultErrorImage,
    onRetry,
    retryText = 'Try Again',
    showRetry = true,
    errorComponent,
    ...props
  }) => {
    // Helper function to extract error message
    const getErrorMessage = (error: boolean | string | Error | null): string => {
      if (!error) return '';
      if (typeof error === 'string') return error;
      if (error instanceof Error) return error.message;
      return errorMessage || 'Something went wrong. Please try again.';
    };

    // If there's an error, show error state
    if (error) {
      // If custom error component is provided, use it
      if (errorComponent) {
        return <>{errorComponent}</>;
      }

      // Otherwise, show default error UI
      return (
        <View style={styles.errorContainer}>
          <Image 
            source={errorImage}
            style={styles.errorImage}
            resizeMode="contain"
          />
          <CBText variant="h5" style={styles.errorTitle}>
            Oops!
          </CBText>
          <CBText variant="body" style={styles.errorMessage}>
            {getErrorMessage(error)}
          </CBText>
          {showRetry && onRetry && (
            <CBButton
              title={retryText}
              variant="primary"
              onPress={onRetry}
              style={styles.retryButton}
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
  ComponentWithErrorHandling.displayName = `WithErrorHandling(${wrappedComponentName})`;

  return ComponentWithErrorHandling;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  errorImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    marginBottom: moderateScale(16),
  },
  errorTitle: {
    marginBottom: moderateScale(8),
    color: colors.primaryTextColor,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: moderateScale(24),
    color: colors.secondaryTextColor,
  },
  retryButton: {
    marginTop: moderateScale(8),
    minWidth: moderateScale(120),
  },
});

export default WithErrorHandling; 