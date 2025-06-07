import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { DeviceContext } from './contexts/DeviceContext';

const Stack = createNativeStackNavigator();

// Simplified Home Screen without data hooks
function SimpleHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FocusPatch</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.buttonText}>Go to Goals</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>✅ Navigation Working!</Text>
        <Text style={styles.submessage}>This is the simplified home screen</Text>
      </View>
    </SafeAreaView>
  );
}

// Simplified Goals Screen
function SimpleGoalsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>🎯 Goals Screen Working!</Text>
        <Text style={styles.submessage}>Navigation between screens is functional</Text>
      </View>
    </SafeAreaView>
  );
}

export default function AppMinimal() {
  const contextValue = {
    hasTouchscreen: false,
    isKeyboardListenerActive: false,
  };

  return (
    <DeviceContext.Provider value={contextValue}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Home" component={SimpleHomeScreen} />
          <Stack.Screen name="Goals" component={SimpleGoalsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DeviceContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 