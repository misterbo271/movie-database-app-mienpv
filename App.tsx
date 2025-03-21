import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/Home/HomeScreen';
import WatchlistScreen from './src/screens/Watchlist/WatchlistScreen';
import CBIcon from './src/components/CBIcon';
import colors from './src/configs/colors';
const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  return (
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
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <CBIcon name="home" type="material-community" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="Watchlist"
            component={WatchlistScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <CBIcon name="bookmark" type="material-community" color={color} size={26} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
