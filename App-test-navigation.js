import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();

// Simple test screens
function TestHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Test Home Screen</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Goals')}
      >
        <Text style={styles.buttonText}>Go to Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

function TestGoalsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Test Goals Screen</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppTestNavigation() {
  return (
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
  );
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
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 