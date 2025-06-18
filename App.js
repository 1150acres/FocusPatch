import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import { DeviceContext } from './contexts/DeviceContext';

const Stack = createNativeStackNavigator();

const HomeScreenOrig = Platform.OS === 'web'
  ? require('./screens/HomeScreen-web-compatible').default
  : require('./screens/HomeScreen-test').default;

export default function App() {
  const [hasTouchscreen, setHasTouchscreen] = useState(false);
  const [isKeyboardListenerActive, setIsKeyboardListenerActive] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [navigationRef, setNavigationRef] = useState(null);

  // Memoized navigation ref setter to prevent unnecessary re-renders
  const setNavigationRefCallback = useCallback((ref) => {
    setNavigationRef(ref);
  }, []);

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

  // Memoized keyboard event handler to prevent recreation on every render
  const handleKeyDown = useCallback((e) => {
    if (!navigationRef) return;
    
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
  }, [navigationRef]);

  // Set up keyboard listeners for non-touchscreen devices
  useEffect(() => {
    // Only add listeners on web for non-touchscreen devices
    if (Platform.OS !== 'web' || hasTouchscreen || !navigationRef) {
      return;
    }

    // Prevent duplicate listeners
    if (isKeyboardListenerActive) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    setIsKeyboardListenerActive(true);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      setIsKeyboardListenerActive(false);
    };
  }, [hasTouchscreen, navigationRef, isKeyboardListenerActive, handleKeyDown]);

  // iOS keyboard event observers
  useEffect(() => {
    if (Platform.OS === 'ios') {
      console.log('Platform.OS =', Platform.OS); // Log platform before registering listeners
      const onKeyboardShow = () => {
        setIsKeyboardVisible(true);
        console.log('Keyboard shown (iOS)');
      };
      const onKeyboardHide = () => {
        setIsKeyboardVisible(false);
        console.log('Keyboard hidden (iOS)');
      };
      const showSub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
      const hideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  // Context value memoization to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    hasTouchscreen,
    isKeyboardListenerActive,
    isKeyboardVisible,
  }), [hasTouchscreen, isKeyboardListenerActive, isKeyboardVisible]);

  // Wrap the HomeScreen export to inject KeyboardAvoidingView only around the input bar
  function HomeScreenWithKeyboardAvoidingView(props) {
    return <HomeScreenOrig {...props} KeyboardAvoidingView={KeyboardAvoidingView} />;
  }

  const AppContent = (
    <DeviceContext.Provider value={contextValue}>
      <NavigationContainer ref={setNavigationRefCallback}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Home" component={HomeScreenWithKeyboardAvoidingView} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DeviceContext.Provider>
  );

  return Platform.OS === 'web' ? AppContent : (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {AppContent}
    </GestureHandlerRootView>
  );
} 