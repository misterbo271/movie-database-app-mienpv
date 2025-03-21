import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen from '@screens/Home/HomeScreen';
import WatchlistScreen from '@screens/Watchlist/WatchlistScreen';

const Tab = createBottomTabNavigator();


const HomeIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 16 }}>🏠</Text>
);

const WatchlistIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 16 }}>📋</Text>
);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#E21221',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: {
              backgroundColor: '#1F1C2C',
              borderTopWidth: 0,
            },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color }) => <HomeIcon color={color} />,
            }}
          />
          <Tab.Screen
            name="Watchlist"
            component={WatchlistScreen}
            options={{
              tabBarLabel: 'Watchlist',
              tabBarIcon: ({ color }) => <WatchlistIcon color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
