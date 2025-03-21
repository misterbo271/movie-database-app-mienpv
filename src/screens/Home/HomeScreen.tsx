import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { appStyles } from '../../configs/styles';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={[appStyles.container]}>
      <View style={[appStyles.centerContent]}>
        <Text style={appStyles.text}>Home</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen; 