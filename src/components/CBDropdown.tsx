import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
  
  const toggleDropdown = () => {
    setIsVisible(!isVisible);
  };

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onSelect(option);
    toggleDropdown();
  };

  const renderItem = ({ item, index }: { item: DropdownOption, index: number }) => (
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
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={toggleDropdown}
          activeOpacity={0.7}
        >
          <Text style={appStyles.content}>{selectedOption?.label}</Text>
          <Icon
            name={isVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            type="material"
            color={colors.primaryTextColor}
            size={24}
          />
        </TouchableOpacity>
      
        {isVisible && (
          <View style={styles.dropdown}>
            <View style={styles.dropdownContent}>
              {options.map((item, index) => renderItem({ item, index }))}
            </View>
          </View>
        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 5000,
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
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 5001,
    marginTop: 1,
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