import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import colors from '../../configs/colors';
import CBDropdown, { DropdownOption } from '../../components/CBDropdown';
import CBImage from '../../components/CBImage';
import { Icon } from '@rneui/themed';
import { moderateScale } from '../../utils/ThemeUtil';
import { appStyles } from '../../configs/styles';

const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Popular', value: 'popular' },
];

const HomeScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption>(CATEGORY_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCategorySelect = (option: DropdownOption) => {
    setSelectedCategory(option);
    console.log('Selected category:', option.value);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <SafeAreaView style={appStyles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <CBImage 
            source="ic_logo" 
            style={{ width: moderateScale(150), height: moderateScale(50) }} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.filterContainer}>
          <CBDropdown
            options={CATEGORY_OPTIONS}
            defaultValue={selectedCategory.value}
            onSelect={handleCategorySelect}
            containerStyle={styles.dropdown}
          />

          <TouchableOpacity style={styles.sortButton}>
            <Text style={appStyles.content}>Sort by</Text>
            <Icon
              name="chevron-right"
              type="material-community"
              color={colors.primaryTextColor}
              size={20}
            />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nơi hiển thị danh sách phim */}
        <View style={styles.moviesContainer}>
          <Text style={styles.categoryTitle}>{selectedCategory.label} Movies</Text>
          {/* Danh sách phim sẽ được thêm sau */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dropdown: {
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.whiteColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.whiteColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: '#E6E6E6',
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchButtonText: {
    color: colors.primaryTextColor,
    fontWeight: '500',
  },
  moviesContainer: {
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryTextColor,
    marginBottom: 16,
  },
});

export default HomeScreen; 