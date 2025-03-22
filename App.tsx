import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@screens/Home/HomeScreen';
import WatchlistScreen from '@screens/Watchlist/WatchlistScreen';
import CBIcon from '@components/CBIcon';
import colors from '@configs/colors';
import StoresProvider from '@stores/StoresProvider';

const Tab = createBottomTabNavigator();

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
    </StoresProvider>
  );
}

export default App;
