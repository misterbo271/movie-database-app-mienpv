import React from 'react';
import { 
  View, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ViewStyle,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import colors from '../configs/colors';
import { moderateScale } from '../utils/ThemeUtil';

/**
 * Props for ScreenContainer component
 * @interface ScreenContainerProps
 */
interface ScreenContainerProps {
  /**
   * Child components to render inside the container
   */
  children: React.ReactNode;
  /**
   * Whether to use scroll view instead of regular view
   */
  scroll?: boolean;
  /**
   * Whether to use keyboard avoiding view
   */
  keyboardAvoiding?: boolean;
  /**
   * Whether to use safe area view
   */
  safeArea?: boolean;
  /**
   * Whether the screen is currently refreshing (for pull-to-refresh)
   */
  refreshing?: boolean;
  /**
   * Function to call when pull-to-refresh is triggered
   */
  onRefresh?: () => void;
  /**
   * Status bar color
   */
  statusBarColor?: string;
  /**
   * Status bar style ('default' | 'light-content' | 'dark-content')
   */
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  /**
   * Whether to hide the status bar
   */
  statusBarHidden?: boolean;
  /**
   * Background color for the screen
   */
  backgroundColor?: string;
  /**
   * Additional style for the container
   */
  containerStyle?: ViewStyle;
  /**
   * Additional style for the content container
   */
  contentContainerStyle?: ViewStyle;
  /**
   * Whether to add padding to the content
   */
  withPadding?: boolean;
}

/**
 * A reusable screen container component with common configurations
 * 
 * @example
 * // Basic usage with scroll
 * <ScreenContainer scroll>
 *   <YourScreenContent />
 * </ScreenContainer>
 * 
 * @example
 * // With pull-to-refresh
 * <ScreenContainer 
 *   scroll 
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 *   backgroundColor={colors.primaryColor}
 *   statusBarStyle="light-content"
 * >
 *   <YourScreenContent />
 * </ScreenContainer>
 */
const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll = false,
  keyboardAvoiding = false,
  safeArea = true,
  refreshing = false,
  onRefresh,
  statusBarColor,
  statusBarStyle = 'default',
  statusBarHidden = false,
  backgroundColor = colors.containerColor,
  containerStyle,
  contentContainerStyle,
  withPadding = true,
}) => {
  // Prepare container and content styles
  const containerStyles = [
    styles.container,
    { backgroundColor },
    containerStyle,
  ];
  
  const contentStyles = [
    styles.contentContainer,
    withPadding && styles.contentWithPadding,
    contentContainerStyle,
  ];

  // Render content based on props
  const renderContent = () => {
    // Base content
    let content = children;

    // Wrap in scroll view if needed
    if (scroll) {
      content = (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentStyles}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryColor]}
                tintColor={colors.primaryColor}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    } else {
      content = <View style={contentStyles}>{children}</View>;
    }

    // Wrap in keyboard avoiding view if needed
    if (keyboardAvoiding) {
      content = (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      );
    }

    return content;
  };

  // Render with or without safe area
  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor || backgroundColor}
        barStyle={statusBarStyle}
        hidden={statusBarHidden}
      />
      {safeArea ? (
        <SafeAreaView style={containerStyles}>
          {renderContent()}
        </SafeAreaView>
      ) : (
        <View style={containerStyles}>
          {renderContent()}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentWithPadding: {
    padding: moderateScale(16),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ScreenContainer; 