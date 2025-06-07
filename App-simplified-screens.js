import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, TextInput, Alert 
} from 'react-native';
import { DeviceContext } from './contexts/DeviceContext';
import { useData, useGoals } from './hooks/useData';

const Stack = createNativeStackNavigator();

// Simplified Home Screen - no gesture handlers, no complex components
function SimplifiedHomeScreen({ navigation }) {
  const [taskInput, setTaskInput] = useState('');
  const { tasks, addTask, updateTask } = useData();

  const handleAddTask = useCallback(() => {
    if (!taskInput.trim()) return;
    
    addTask({
      title: taskInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: 0,
      category: 'general'
    });
    Alert.alert('Task Added', `"${taskInput}" has been added.`);
    setTaskInput('');
  }, [taskInput, addTask]);

  const todayTasks = tasks.filter(t => t.day === 0);
  const tomorrowTasks = tasks.filter(t => t.day === 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FocusPatch</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.buttonText}>Goals</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Today ({todayTasks.length} tasks)</Text>
        {todayTasks.map(task => (
          <View key={task.id} style={styles.taskItem}>
            <Text style={styles.taskText}>{task.title}</Text>
            <Text style={styles.taskTime}>{task.time}</Text>
          </View>
        ))}
        
        <Text style={styles.sectionTitle}>Tomorrow ({tomorrowTasks.length} tasks)</Text>
        {tomorrowTasks.slice(0, 3).map(task => (
          <View key={task.id} style={styles.taskItem}>
            <Text style={styles.taskText}>{task.title}</Text>
            <Text style={styles.taskTime}>{task.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          value={taskInput}
          onChangeText={setTaskInput}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Simplified Goals Screen - no gesture handlers, no complex components
function SimplifiedGoalsScreen({ navigation }) {
  const { goals } = useGoals();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Goals ({goals.length})</Text>
        {goals.map(goal => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalTitle}>{goal.icon} {goal.title}</Text>
            <Text style={styles.goalProgress}>
              {goal.completed}/{goal.total} steps completed
            </Text>
            <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AppSimplifiedScreens() {
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
          <Stack.Screen name="Home" component={SimplifiedHomeScreen} />
          <Stack.Screen name="Goals" component={SimplifiedGoalsScreen} />
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
    fontSize: 28,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
  },
  goalItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  goalProgress: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 