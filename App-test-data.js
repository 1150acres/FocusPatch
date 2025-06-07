import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { DeviceContext } from './contexts/DeviceContext';
import { useData } from './hooks/useData';

const Stack = createNativeStackNavigator();

// Test Home Screen with useData hook
function TestHomeScreen({ navigation }) {
  const { tasks, upcoming } = useData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FocusPatch - Data Test</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.buttonText}>Go to Goals</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.message}>📊 Testing useData Hook</Text>
        <Text style={styles.submessage}>Tasks loaded: {tasks?.length || 0}</Text>
        <Text style={styles.submessage}>Upcoming items: {upcoming?.length || 0}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>First 3 Tasks:</Text>
          {tasks?.slice(0, 3).map((task, index) => (
            <Text key={task.id || index} style={styles.taskItem}>
              • {task.title} - {task.time}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple Goals Screen (no data hooks)
function TestGoalsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals Test</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>🎯 Goals Screen</Text>
        <Text style={styles.submessage}>Testing navigation without complex components</Text>
      </View>
    </SafeAreaView>
  );
}

export default function AppTestData() {
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
          <Stack.Screen name="Home" component={TestHomeScreen} />
          <Stack.Screen name="Goals" component={TestGoalsScreen} />
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
    fontSize: 24,
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
    marginBottom: 10,
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  taskItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
}); 