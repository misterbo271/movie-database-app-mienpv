import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@screens/Home/HomeScreen';
import WatchlistScreen from '@screens/Watchlist/WatchlistScreen';
import MovieDetailScreen from '@screens/MovieDetail/MovieDetailScreen';
import CBIcon from '@components/CBIcon';
import colors from '@configs/colors';
import StoresProvider from '@stores/StoresProvider';
import { RootStackParamList } from './src/types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Create stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
  </Stack.Navigator>
);

const WatchlistStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Watchlist" component={WatchlistScreen} />
    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
  </Stack.Navigator>
);

function App(): React.JSX.Element {
  return (
    <StoresProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: colors.primaryColor,
              tabBarInactiveTintColor: colors.whiteColor,
              tabBarStyle: {
                backgroundColor: colors.tabBarColor,
                borderTopWidth: 0,
                height: 70,
                paddingTop: 10,
              },
              headerShown: false,
              tabBarShowLabel: false,
            }}
          >
            <Tab.Screen
              name="HomeTab"
              component={HomeStack}
              options={{
                tabBarIcon: ({ color }) => (
                  <CBIcon name="home" type="material-community" color={color} size={26} />
                ),
              }}
            />
            <Tab.Screen
              name="WatchlistTab"
              component={WatchlistStack}
              options={{
                tabBarIcon: ({ color }) => (
                  <CBIcon name="bookmark" type="material-community" color={color} size={26} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </StoresProvider>
  );
}

export default App;
