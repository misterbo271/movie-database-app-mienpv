import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { appStyles } from '../../configs/styles';
import { Text, Divider } from '@rneui/themed';
import CBIcon from '../../components/CBIcon';

const WatchlistScreen: React.FC = () => {
  return (
    <SafeAreaView style={[appStyles.container]}>
      <View style={styles.content}>
        <Text h3 style={styles.title}>My Watchlist</Text>
        
        <Divider style={styles.divider} />
        
        <View style={[appStyles.centerContent, styles.emptyContainer]}>
          <CBIcon
            name="bookmark-outline"
            type="material-community"
            define="tertiary"
            size={60}
            containerStyle={styles.iconContainer}
          />
          <Text style={styles.emptyText}>Your watchlist is empty</Text>
          <Text style={styles.emptySubText}>
            Add movies to your watchlist to see them here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1C2C',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  divider: {
    backgroundColor: 'white',
    height: 1,
    width: '80%',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: 'white',
  },
});

export default WatchlistScreen; 