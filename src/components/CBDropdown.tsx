import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  LayoutChangeEvent,
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
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

const CBDropdown: React.FC<CBDropdownProps> = ({
  options,
  defaultValue,
  onSelect,
  containerStyle,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | undefined>(
    defaultValue ? options.find(option => option.value === defaultValue) : options[0]
  );
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<View>(null);
  
  // Measure button position when dropdown is opened
  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPosition({
          top: pageY + height,
          left: pageX,
          width: width,
        });
        setIsVisible(true);
      });
    }
  };
  
  const toggleDropdown = () => {
    if (!isVisible) {
      measureButton();
    } else {
      setIsVisible(false);
    }
  };

  const closeDropdown = () => {
    setIsVisible(false);
  };

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onSelect(option);
    closeDropdown();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={toggleDropdown}
          activeOpacity={0.7}
          ref={buttonRef}
        >
          <Text style={appStyles.content}>{selectedOption?.label}</Text>
          <Icon
            name={isVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            type="material"
            color={colors.primaryTextColor}
            size={24}
          />
        </TouchableOpacity>
      
        <Modal
          visible={isVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeDropdown}
        >
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.dropdown,
                  {
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }
                ]}
              >
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownContainer: {
    position: 'relative',
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
    borderColor: '#E6E6E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 5001,
  },
  dropdownContent: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  option: {
    marginHorizontal: 8,
    borderRadius: 3,
    paddingVertical: 12,
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