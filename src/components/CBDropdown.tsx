import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Icon } from '@rneui/themed';
import colors from '../configs/colors';
import fonts from '../configs/fonts';
import { appStyles } from '../configs/styles';

export type DropdownOption = {
  label: string;
  value: string;
};

interface CBDropdownProps {
  options: DropdownOption[];
  defaultValue?: string;
  onSelect: (option: DropdownOption) => void;
  containerStyle?: any;
  isOpen?: boolean;
  onToggleDropdown?: (isOpen: boolean) => void;
  label?: string;
}

const CBDropdown: React.FC<CBDropdownProps> = ({
  options,
  defaultValue,
  onSelect,
  containerStyle,
  isOpen,
  onToggleDropdown,
  label,
}) => {
  // Use internal state if isOpen prop is not provided
  const [internalIsVisible, setInternalIsVisible] = useState<boolean>(false);
  const isVisible = isOpen !== undefined ? isOpen : internalIsVisible;
  
  const [selectedOption, setSelectedOption] = useState<DropdownOption | undefined>(
    defaultValue ? options.find(option => option.value === defaultValue) : options[0]
  );
  
  const toggleDropdown = () => {
    const newState = !isVisible;
    if (onToggleDropdown) {
      onToggleDropdown(newState);
    } else {
      setInternalIsVisible(newState);
    }
  };

  const closeDropdown = () => {
    if (onToggleDropdown) {
      onToggleDropdown(false);
    } else {
      setInternalIsVisible(false);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onSelect(option);
    closeDropdown();
  };

  // Update internal state when isOpen prop changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setInternalIsVisible(isOpen);
    }
  }, [isOpen]);

  // Get screen dimensions for overlay
  const { width, height } = Dimensions.get('window');

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={[
          styles.dropdownButton, 
          isVisible ? styles.dropdownButtonOpen : null
        ]} 
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={appStyles.content}>{label || selectedOption?.label}</Text>
        <Icon
          name={isVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          type="material"
          color={colors.primaryTextColor}
          size={24}
        />
      </TouchableOpacity>
      
      {isVisible && (
        <>
          {/* Full screen transparent overlay to capture taps outside */}
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View 
              style={[
                styles.touchableOverlay, 
                { 
                  position: 'absolute',
                  width: width, 
                  height: height,
                  top: -100,
                  left: -20,
                }
              ]} 
            />
          </TouchableWithoutFeedback>
          
          {/* Dropdown content */}
          <View style={styles.dropdownContent}>
            {options.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  selectedOption?.value === item.value && styles.selectedOption,
                  index === 0 && styles.firstOption,
                  index === options.length - 1 && styles.lastOption,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    selectedOption?.value === item.value && styles.selectedOptionText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
  },
  touchableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.whiteColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },
  dropdownContent: {
    position: 'relative',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderTopWidth: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  option: {
    marginHorizontal: 8,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.grayColor,
    marginVertical: 4,
  },
  firstOption: {
    marginTop: 8,
  },
  lastOption: {
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: colors.primaryColor,
  },
  optionText: {
    fontSize: 16,
    color: colors.primaryTextColor,
    fontFamily: fonts.fontFamily.regular,
  },
  selectedOptionText: {
    color: colors.whiteColor,
    fontFamily: fonts.fontFamily.semibold,
  },
});

export default CBDropdown; 