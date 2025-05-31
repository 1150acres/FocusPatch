import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { format, addDays } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import { DeviceContext } from '../App';

// Mock data for tasks
const mockTasks = [
  { id: '1', title: 'Work meeting', time: '9.00', day: 0 },
  { id: '2', title: 'Study group', time: '1.00', day: 1 },
  { id: '3', title: 'Call with mentor', time: '12.00', day: 1 },
  { id: '4', title: 'Side hustle task', time: '35.30', day: 2 },
];

// Mock data for upcoming tasks
const mockUpcoming = [
  { id: '1', title: 'Start a podcast', dueDate: 'Later today', isGoal: true },
  { id: '2', title: 'Side hustle task', dueDate: 'Thu, Ma29' },
  { id: '3', title: 'Submit paper', dueDate: 'Fri. Jun 6' },
];

// Goal-related keywords to detect long-term goals
const goalKeywords = ['podcast', 'business', 'learn', 'create', 'start a', 'begin', 'build'];

export default function HomeScreen({ navigation }) {
  const [taskInput, setTaskInput] = useState('');
  const { hasTouchscreen } = useContext(DeviceContext);

  // Function to handle adding a new task
  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    
    // Check if input contains goal-related keywords
    const mightBeGoal = goalKeywords.some(keyword => 
      taskInput.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (mightBeGoal) {
      // Navigate to Goals screen for goal-related tasks
      navigation.navigate('Goals');
    } else {
      // For regular tasks, just show an alert (in a real app, we would add it to state)
      Alert.alert('Task Added', `"${taskInput}" has been added to your tasks.`);
    }
    
    // Clear the input
    setTaskInput('');
  };

  // Navigate to Goals when swiped left
  const handleSwipeLeft = () => {
    navigation.navigate('Goals');
  };

  // Render swipe actions
  const renderRightActions = () => {
    return (
      <View style={styles.swipeActions}>
        <Text style={styles.swipeText}>Goals →</Text>
      </View>
    );
  };

  // Render day column with tasks
  const renderDayColumn = (dayOffset) => {
    const date = addDays(new Date(), dayOffset);
    const dayName = dayOffset === 0 ? 'Monday' : dayOffset === 1 ? 'Tuesay' : 'Wedsay';
    const dayText = format(date, 'MMM d');
    
    // Filter tasks for this day
    const dayTasks = mockTasks.filter(task => task.day === dayOffset);
    
    return (
      <View style={styles.dayColumn}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayDate}>{dayText}</Text>
        </View>
        
        {dayTasks.map(task => (
          <View 
            key={task.id} 
            style={[
              styles.taskCard,
              task.title.includes('Work') ? styles.blueTask :
              task.title.includes('Study') ? styles.cyanTask :
              task.title.includes('Call') ? styles.greenTask :
              styles.yellowTask
            ]}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskTime}>{task.time}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableRightOpen={handleSwipeLeft}
        friction={2}
        rightThreshold={40}
        enabled={hasTouchscreen}
      >
        <View style={styles.header}>
          <Text style={styles.title}>FocusPatch</Text>
          {hasTouchscreen ? (
            <Text style={styles.navigationHint}>Swipe left for Goals →</Text>
          ) : (
            <Text style={styles.navigationHint}>Press Right Arrow or 'G' key for Goals →</Text>
          )}
        </View>
      
        <ScrollView>
          <View style={styles.calendarContainer}>
            {renderDayColumn(0)}
            {renderDayColumn(1)}
            {renderDayColumn(2)}
          </View>
          
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            
            {mockUpcoming.map(item => (
              <TouchableOpacity 
                key={item.id}
                style={styles.upcomingTask}
                onPress={() => item.isGoal && navigation.navigate('Goals')}
              >
                <View style={styles.upcomingIconContainer}>
                  <Text style={styles.upcomingIcon}>
                    {item.isGoal ? '☰' : '👍'}
                  </Text>
                </View>
                <View style={styles.upcomingDetails}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                </View>
                <Text style={styles.upcomingDate}>{item.dueDate}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Swipeable>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to do?"
          value={taskInput}
          onChangeText={setTaskInput}
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
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  calendarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  swipeActions: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    width: 100,
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  dayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayDate: {
    fontSize: 14,
    color: '#888',
  },
  taskCard: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  blueTask: {
    backgroundColor: '#4a90e2',
  },
  cyanTask: {
    backgroundColor: '#50b7c1',
  },
  greenTask: {
    backgroundColor: '#5cb85c',
  },
  yellowTask: {
    backgroundColor: '#f1c40f',
  },
  taskTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskTime: {
    color: '#fff',
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  upcomingTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  upcomingIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#eee',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingIcon: {
    fontSize: 16,
    color: '#888',
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
  },
  upcomingDate: {
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4a90e2',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
