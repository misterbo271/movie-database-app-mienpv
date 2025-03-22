import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import colors from '../../configs/colors';

/**
 * Props for WithLoading HOC
 * @interface WithLoadingProps
 */
interface WithLoadingProps {
  /**
   * Whether the component is loading
   */
  loading: boolean;
  /**
   * Custom loading component to display when loading
   */
  loadingComponent?: React.ReactNode;
  /**
   * Size of the loading indicator
   */
  size?: 'small' | 'large';
  /**
   * Color of the loading indicator
   */
  color?: string;
  /**
   * Whether to use overlay style (covers the wrapped component with a semi-transparent background)
   */
  overlay?: boolean;
}

/**
 * Higher-Order Component that adds loading state to a component
 * 
 * @example
 * // Basic usage
 * const YourComponent = ({ data }) => (
 *   <View>
 *     {data.map(item => <Text key={item.id}>{item.name}</Text>)}
 *   </View>
 * );
 * 
 * const YourComponentWithLoading = WithLoading(YourComponent);
 * 
 * // In parent component:
 * <YourComponentWithLoading 
 *   loading={isLoading} 
 *   data={someData} 
 * />
 * 
 * @example
 * // With custom loading component
 * <YourComponentWithLoading 
 *   loading={isLoading} 
 *   loadingComponent={<CustomLoader />}
 *   data={someData} 
 * />
 */
function WithLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  /**
   * Component with loading functionality
   */
  const ComponentWithLoading: React.FC<P & WithLoadingProps> = ({
    loading,
    loadingComponent,
    size = 'large',
    color = colors.primaryColor,
    overlay = false,
    ...props
  }) => {
    // Default loading indicator
    const defaultLoadingIndicator = (
      <View style={[styles.loadingContainer, overlay && styles.overlay]}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );

    // If loading, show loading indicator or custom loading component
    if (loading) {
      return loadingComponent || defaultLoadingIndicator;
    }

    // Otherwise, render the wrapped component
    return <WrappedComponent {...(props as P)} />;
  };

  // Set display name for debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithLoading.displayName = `WithLoading(${wrappedComponentName})`;

  return ComponentWithLoading;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
});

export default WithLoading; 