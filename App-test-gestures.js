import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { DeviceContext } from './contexts/DeviceContext';

const Stack = createNativeStackNavigator();

// Simple test screens that use DeviceContext
function TestHomeScreen({ navigation }) {
  return (
    <DeviceContext.Consumer>
      {({ hasTouchscreen, isKeyboardListenerActive }) => (
        <View style={styles.container}>
          <Text style={styles.title}>🎯 Test Home Screen</Text>
          <Text style={styles.info}>Platform: {Platform.OS}</Text>
          <Text style={styles.info}>Has Touchscreen: {hasTouchscreen ? 'Yes' : 'No'}</Text>
          <Text style={styles.info}>Keyboard Active: {isKeyboardListenerActive ? 'Yes' : 'No'}</Text>
          <Text style={styles.info}>GestureHandler: Enabled</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.buttonText}>Go to Goals</Text>
          </TouchableOpacity>
        </View>
      )}
    </DeviceContext.Consumer>
  );
}

function TestGoalsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Test Goals Screen</Text>
      <Text style={styles.info}>Testing with GestureHandlerRootView</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppTestGestures() {
  const [hasTouchscreen, setHasTouchscreen] = useState(false);
  const [isKeyboardListenerActive, setIsKeyboardListenerActive] = useState(false);

  // Device detection logic (simplified from original)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Simple touchscreen detection for web
      setHasTouchscreen('ontouchstart' in window || navigator.maxTouchPoints > 0);
    } else {
      // Mobile platforms have touchscreen
      setHasTouchscreen(true);
    }
  }, []);

  const deviceContextValue = {
    hasTouchscreen,
    isKeyboardListenerActive,
  };

  // Conditionally wrap with GestureHandlerRootView (like in original App.js)
  const AppContent = (
    <DeviceContext.Provider value={deviceContextValue}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={TestHomeScreen}
            options={{ title: 'FocusPatch Home' }}
          />
          <Stack.Screen 
            name="Goals" 
            component={TestGoalsScreen}
            options={{ title: 'Goals' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DeviceContext.Provider>
  );

  // Conditionally wrap with GestureHandlerRootView only on non-web platforms
  if (Platform.OS !== 'web') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {AppContent}
      </GestureHandlerRootView>
    );
  }

  return AppContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 