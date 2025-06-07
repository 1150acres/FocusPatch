import React, { useState, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { DeviceContext } from '../contexts/DeviceContext';
import { useData } from '../hooks/useData';

export default function HomeScreen({ navigation }) {
  const [taskInput, setTaskInput] = useState('');
  const { hasTouchscreen } = useContext(DeviceContext);
  const { tasks, addTask, updateTask } = useData();

  // Get current date and calculate day offsets
  const baseDate = useMemo(() => new Date(), []);

  // Memoized day column component
  const DayColumn = React.memo(({ dayOffset, tasks, baseDate, onToggleComplete }) => {
    const { date, dayName, dayText, dayTasks } = useMemo(() => {
      // Use native JavaScript instead of date-fns
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);
      
      // Fixed typos in day names
      const dayName = dayOffset === 0 ? 'Monday' : dayOffset === 1 ? 'Tuesday' : 'Wednesday';
      
      // Format date manually
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayText = `${months[date.getMonth()]} ${date.getDate()}`;
      
      const dayTasks = tasks.filter(task => task.day === dayOffset);
      
      return { date, dayName, dayText, dayTasks };
    }, [dayOffset, tasks, baseDate]);

    return (
      <View style={styles.dayColumn}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayDate}>{dayText}</Text>
        </View>
        <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
          {dayTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleComplete={onToggleComplete}
            />
          ))}
        </ScrollView>
      </View>
    );
  });

  // Simplified task card component without checkboxes
  const TaskCard = React.memo(({ task, onToggleComplete }) => {
    const handleDelete = useCallback(() => {
      if (Platform.OS === 'web') {
        if (window.confirm(`Delete "${task.title}"?`)) {
          // Delete task logic would go here
          console.log('Delete task:', task.id);
        }
      } else {
        Alert.alert(
          'Delete Task',
          `Delete "${task.title}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete task:', task.id) }
          ]
        );
      }
    }, [task]);

    return (
      <View style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          <Text style={styles.taskTime}>{task.time}</Text>
        </View>
        
        {/* Delete button */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  });

  // Handle task completion toggle
  const handleToggleComplete = useCallback((taskId) => {
    updateTask(taskId, (task) => ({
      ...task,
      completed: !task.completed
    }));
  }, [updateTask]);

  // Handle adding new task
  const handleAddTask = useCallback(() => {
    if (!taskInput.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    addTask({
      title: taskInput,
      time: timeString,
      day: 0, // Add to today by default
      category: 'general'
    });
    
    setTaskInput('');
  }, [taskInput, addTask]);

  // Calculate statistics
  const stats = useMemo(() => {
    const todayTasks = tasks.filter(task => task.day === 0);
    const completedToday = todayTasks.filter(task => task.completed).length;
    const totalToday = todayTasks.length;
    const dueTodayCount = todayTasks.length;
    
    return {
      completedToday,
      totalToday,
      dueTodayCount,
      completionRatio: totalToday > 0 ? `${completedToday}/${totalToday}` : '0/0'
    };
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>FocusPatch</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.goalsButton}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.goalsButtonText}>🎯 Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completionRatio}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.dueTodayCount}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
      </View>

      {/* Days Container */}
      <View style={styles.daysContainer}>
        {[0, 1, 2].map(dayOffset => (
          <DayColumn
            key={dayOffset}
            dayOffset={dayOffset}
            tasks={tasks}
            baseDate={baseDate}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </View>

      {/* Task Input - Bottom */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.taskInput}
          placeholder="Add a new task..."
          value={taskInput}
          onChangeText={setTaskInput}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  goalsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Platform.select({
      ios: 15,
      android: 15,
      web: 20,
    }), // Reduced padding on mobile for more space
    paddingTop: 15,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: Platform.select({
      ios: 3,
      android: 3,
      web: 5,
    }), // Reduced margins on mobile for more space
    backgroundColor: 'white',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  dayHeader: {
    padding: Platform.select({
      ios: 12,
      android: 12,
      web: 15,
    }), // Reduced padding on mobile
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  dayName: {
    fontSize: Platform.select({
      ios: 14,
      android: 14,
      web: 16,
    }), // Slightly smaller on mobile to save space
    fontWeight: 'bold',
    color: '#333',
  },
  dayDate: {
    fontSize: Platform.select({
      ios: 11,
      android: 11,
      web: 12,
    }),
    color: '#666',
    marginTop: 2,
  },
  tasksContainer: {
    flex: 1,
    padding: Platform.select({
      ios: 8,
      android: 8,
      web: 10,
    }), // Reduced padding on mobile for more content space
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10, // Increased spacing between cards
    alignItems: 'stretch', // Changed to stretch for better layout
    minHeight: 70, // Increased minimum height for better text visibility
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
    padding: 15, // Increased padding for better spacing
    justifyContent: 'center', // Center content vertically
    backgroundColor: Platform.select({
      ios: 'rgba(255,255,0,0.3)', // Debug: yellow background on mobile
      android: 'rgba(255,255,0,0.3)',
      web: 'transparent',
    }),
  },
  taskTitle: {
    fontSize: Platform.select({
      ios: 20, // Even larger for better visibility
      android: 20,
      web: 14,
    }),
    fontWeight: '800', // Extra bold text
    color: Platform.select({
      ios: '#000', // Pure black for maximum contrast
      android: '#000',
      web: '#333',
    }),
    lineHeight: 24,
    marginBottom: 4, // Add space between title and time
    backgroundColor: Platform.select({
      ios: 'rgba(0,255,0,0.2)', // Debug: light green background
      android: 'rgba(0,255,0,0.2)',
      web: 'transparent',
    }),
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskTime: {
    fontSize: Platform.select({
      ios: 16, // Even larger for debugging
      android: 16,
      web: 12,
    }),
    color: Platform.select({
      ios: '#000', // Pure black for debugging
      android: '#000',
      web: '#666',
    }),
    marginTop: 4,
    lineHeight: 18,
    backgroundColor: Platform.select({
      ios: 'rgba(0,0,255,0.2)', // Debug: light blue background
      android: 'rgba(0,0,255,0.2)',
      web: 'transparent',
    }),
  },
  deleteButton: {
    width: 36, // Larger touch target for mobile
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 24, // Larger for mobile
    fontWeight: 'bold',
  },
}); 