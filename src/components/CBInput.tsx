import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Keyboard,
} from 'react-native';
import colors from '../configs/colors';
import fonts from '../configs/fonts';
import CBText from './CBText';
import { moderateScale } from '../utils/ThemeUtil';

/**
 * Input variants for different visual styles
 */
type InputVariant = 
  | 'default'
  | 'filled'
  | 'outline';

// Create a type for the outside click handler with blur method
interface OutsideClickHandler {
  (): void;
  blurInput?: () => void;
}

/**
 * Props interface for CBInput component
 * @interface CBInputProps
 * @extends {TextInputProps}
 */
interface CBInputProps extends TextInputProps {
  /**
   * Label text displayed above the input
   */
  label?: string;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Input variant (determines appearance)
   */
  variant?: InputVariant;
  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether to show a password toggle icon
   */
  isPassword?: boolean;
  /**
   * Custom styles for the container
   */
  containerStyle?: ViewStyle;
  /**
   * Custom styles for the input wrapper
   */
  inputWrapperStyle?: ViewStyle;
  /**
   * Custom styles for the input
   */
  inputStyle?: TextStyle;
  /**
   * Required field indicator
   */
  required?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Callback when input is focused
   */
  onInputFocus?: () => void;
  /**
   * Callback when input should be blurred (when touching outside)
   */
  onOutsideClick?: OutsideClickHandler;
}

/**
 * A custom text input component with various styling options and features
 * 
 * @example
 * // Basic usage
 * <CBInput 
 *   label="Email" 
 *   placeholder="Enter your email"
 *   onChangeText={(text) => console.log(text)} 
 * />
 * 
 * @example
 * // Password input with validation error
 * <CBInput 
 *   label="Password" 
 *   isPassword={true}
 *   error="Password must be at least 8 characters"
 *   variant="outline"
 * />
 */
const CBInput: React.FC<CBInputProps> = (props) => {
  const {
    label,
    error,
    helperText,
    variant = 'default',
    leftIcon,
    rightIcon,
    isPassword = false,
    containerStyle,
    inputWrapperStyle,
    inputStyle,
    required = false,
    disabled = false,
    onInputFocus,
    onOutsideClick,
    ...restProps
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  const inputRef = useRef<TextInput>(null);

  // Get the input container style based on variant and state
  const inputContainerStyle = getInputContainerStyle(variant, isFocused, !!error, disabled);

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Handle input focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onInputFocus) {
      onInputFocus();
    }
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
  };

  // Handle input blur
  const handleBlur = (e: any) => {
    console.log('CBInput: handleBlur called');
    setIsFocused(false);
    if (restProps.onBlur) {
      restProps.onBlur(e);
    }
  };

  // Public method to blur the input from outside
  const blurInput = () => {
    console.log('CBInput: blurInput called');
    
    // Bỏ focus khỏi input
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Cập nhật state ngay lập tức để đảm bảo UI phản ứng
    setIsFocused(false);
    
    // Đảm bảo bàn phím biến mất
    Keyboard.dismiss();
  };

  // Handle outside click through useEffect when onOutsideClick changes
  useEffect(() => {
    if (onOutsideClick) {
      // Expose the blur method to parent component
      onOutsideClick.blurInput = blurInput;
    }
    return () => {
      if (onOutsideClick && onOutsideClick.blurInput) {
        onOutsideClick.blurInput = undefined;
      }
    };
  }, [onOutsideClick]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <CBText 
            variant="caption" 
            style={styles.label}
          >
            {label}
          </CBText>
          {required && <CBText style={styles.requiredIndicator}>*</CBText>}
        </View>
      )}

      <View 
        style={[
          styles.inputContainer,
          inputContainerStyle,
          inputWrapperStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <TextInput
          {...restProps}
          ref={inputRef}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : undefined,
            inputStyle,
            disabled ? styles.disabledInput : undefined,
          ]}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.grayTextColor}
          editable={!disabled}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={toggleSecureEntry}
          >
            {/* You can use an eye icon here from your icon set */}
            <CBText variant="caption">
              {secureTextEntry ? 'Show' : 'Hide'}
            </CBText>
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {(error || helperText) && (
        <CBText 
          variant="caption" 
          style={[
            styles.helperText,
            error ? styles.errorText : {}
          ]}
        >
          {error || helperText}
        </CBText>
      )}
    </View>
  );
};

/**
 * Helper function to get the input container style based on variant and state
 */
const getInputContainerStyle = (
  variant: InputVariant,
  isFocused: boolean,
  hasError: boolean,
  disabled: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {};

  // Variant specific styles
  switch (variant) {
    case 'filled':
      baseStyle.backgroundColor = '#F0F0F0'; // Light gray background
      baseStyle.borderBottomWidth = 1;
      
      baseStyle.borderBottomColor = colors.grayColor;
      break;
    case 'outline':
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.grayColor;
      break;
    default: // default variant
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = '#E3E3E3';
      baseStyle.borderBottomWidth = 1;
      baseStyle.borderBottomColor = colors.grayColor;
      break;
  }

  // Focus state
  if (isFocused) {
    if (variant === 'outline') {
      baseStyle.borderColor = colors.primaryColor;
    } else {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = '#E3E3E3';
      baseStyle.borderBottomColor = colors.primaryColor;
    }
  }

  // Error state
  if (hasError) {
    if (variant === 'outline') {
      baseStyle.borderColor = colors.errorTextColor;
    } else {
      baseStyle.borderBottomColor = colors.errorTextColor;
    }
  }

  // Disabled state
  if (disabled) {
    baseStyle.opacity = 0.5;
  }

  return baseStyle;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: moderateScale(6),
  },
  label: {
    color: colors.primaryTextColor,
    fontFamily: fonts.fontFamily.semibold,
  },
  requiredIndicator: {
    color: colors.errorTextColor,
    marginLeft: moderateScale(2),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: moderateScale(12),
    height: moderateScale(44),
  },
  input: {
    flex: 1,
    fontFamily: fonts.fontFamily.semibold,
    fontSize: moderateScale(16),
    color: colors.primaryTextColor,
    padding: 0,
    height: '100%',
 
  },
  inputWithLeftIcon: {
    paddingLeft: moderateScale(8),
  },
  inputWithRightIcon: {
    paddingRight: moderateScale(8),
  },
  leftIconContainer: {
    marginRight: moderateScale(8),
  },
  rightIconContainer: {
    marginLeft: moderateScale(8),
  },
  helperText: {
    marginTop: moderateScale(4),
    color: colors.tertiaryTextColor,
  },
  errorText: {
    color: colors.errorTextColor,
  },
  disabledInput: {
    color: colors.grayColor,
  },
});

export default CBInput; 