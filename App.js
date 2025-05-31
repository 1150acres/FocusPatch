import React, { createContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import GoalsScreen from './screens/GoalsScreen';

const Stack = createNativeStackNavigator();

// Create a context to share touchscreen capability across components
export const DeviceContext = createContext({
  hasTouchscreen: false,
  isKeyboardListenerActive: false,
});

export default function App() {
  const [hasTouchscreen, setHasTouchscreen] = useState(false);
  const [isKeyboardListenerActive, setIsKeyboardListenerActive] = useState(false);
  const [navigationRef, setNavigationRef] = useState(null);

  // Detect touchscreen capability when component mounts
  useEffect(() => {
    const detectTouchscreen = () => {
      if (Platform.OS !== 'web') {
        // Native devices are assumed to have touchscreens
        setHasTouchscreen(true);
        return;
      }

      // Web detection - multiple methods for cross-browser compatibility
      const hasTouchApi = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints > 0);
      
      setHasTouchscreen(hasTouchApi);
    };

    detectTouchscreen();
  }, []);

  // Set up keyboard listeners for non-touchscreen devices
  useEffect(() => {
    if (Platform.OS === 'web' && !hasTouchscreen && navigationRef && !isKeyboardListenerActive) {
      const handleKeyDown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return; // Don't handle keyboard events when user is typing
        }

        const currentRoute = navigationRef.getCurrentRoute()?.name;
        
        // Left arrow on Goals screen or right arrow on Home screen
        if ((e.key === 'ArrowLeft' && currentRoute === 'Goals') || 
            (e.key === 'h' && currentRoute === 'Goals')) {
          navigationRef.navigate('Home');
          e.preventDefault();
        } else if ((e.key === 'ArrowRight' && currentRoute === 'Home') || 
                   (e.key === 'g' && currentRoute === 'Home')) {
          navigationRef.navigate('Goals');
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      setIsKeyboardListenerActive(true);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        setIsKeyboardListenerActive(false);
      };
    }
  }, [hasTouchscreen, navigationRef, isKeyboardListenerActive]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DeviceContext.Provider value={{ hasTouchscreen, isKeyboardListenerActive }}>
        <NavigationContainer ref={ref => setNavigationRef(ref)}>
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              animation: 'fade' // Simpler animation that doesn't rely on problematic assets
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DeviceContext.Provider>
    </GestureHandlerRootView>
  );
} 