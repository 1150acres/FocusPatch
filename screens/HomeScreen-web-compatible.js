import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
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

// Add this before the HomeScreen component
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return `${hour} ${ampm}`;
});

const TimeColumn = () => (
  <View style={styles.timeColumn}>
    {HOURS.map((label, idx) => (
      <View key={label} style={styles.timeSlot}>
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
    ))}
  </View>
);

export default function HomeScreen({ navigation }) {
  const [taskInput, setTaskInput] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [lastIndex, setLastIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const { hasTouchscreen } = useContext(DeviceContext);
  const { tasks, addTask, updateTask, deleteTasks } = useData();

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
          {dayTasks.map((task, taskIndex) => {
            // Calculate global index across all days for selection
            const globalIndex = tasks.findIndex(t => t.id === task.id);
            return (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={globalIndex}
                onToggleComplete={onToggleComplete}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  });

  // Handle task selection (web only)
  const handleTaskSelection = useCallback((taskId, index, event) => {
    // Only enable selection on web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web-specific selection logic with keyboard modifiers
      if (event?.ctrlKey || event?.metaKey) {
        // Ctrl/Cmd + click: toggle individual selection
        setSelectedTasks(prev => {
          const newSet = new Set(prev);
          if (newSet.has(taskId)) {
            newSet.delete(taskId);
          } else {
            newSet.add(taskId);
          }
          return newSet;
        });
        setLastIndex(index);
      } else if (event?.shiftKey && lastIndex !== null) {
        // Shift + click: select range
        const start = Math.min(lastIndex, index);
        const end = Math.max(lastIndex, index);
        const allTasks = tasks.filter(task => task.day >= 0 && task.day <= 2); // All visible tasks
        
        setSelectedTasks(prev => {
          const newSet = new Set(prev);
          for (let i = start; i <= end; i++) {
            if (allTasks[i]) {
              newSet.add(allTasks[i].id);
            }
          }
          return newSet;
        });
      } else {
        // Regular click: select only this task
        setSelectedTasks(new Set([taskId]));
        setLastIndex(index);
      }
    }
    // Mobile: no selection functionality - tasks are just display only
  }, [lastIndex, tasks]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedTasks(new Set());
    setLastIndex(null);
  }, []);

  // Handle context menu (right-click)
  const handleContextMenu = useCallback((e, idx, taskId) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      e.preventDefault();
      
      // If the right-clicked task is not already selected, select it
      // If it is already selected, keep the current selection (for multi-delete)
      if (!selectedTasks.has(taskId)) {
        // Task not selected - select just this task
        setSelectedTasks(new Set([taskId]));
        setLastIndex(idx);
      }
      // If task is already selected, keep current selection intact
      
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    }
  }, [selectedTasks]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, []);

  // Add event listeners for outside click and escape key
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMouseDown = (e) => {
      if (contextMenu.visible) {
        // Check if the click is outside the context menu
        const contextMenuElement = e.target.closest('ul');
        if (!contextMenuElement) {
          console.log('🔵 [handleMouseDown] Clicking outside context menu, closing');
          closeContextMenu();
          clearSelection();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (contextMenu.visible) {
          closeContextMenu();
        } else if (selectedTasks.size > 0) {
          clearSelection();
        }
      }
    };

    if (contextMenu.visible || selectedTasks.size > 0) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, selectedTasks.size, closeContextMenu, clearSelection]);

  // Task card component with web-only selection support
  const TaskCard = React.memo(({ task, index, onToggleComplete }) => {
    const isSelected = Platform.OS === 'web' ? selectedTasks.has(task.id) : false;

    const handlePress = useCallback((event) => {
      // Only handle selection on web
      if (Platform.OS === 'web') {
        handleTaskSelection(task.id, index, event);
      }
    }, [task.id, index]);

    const handleRightClick = useCallback((event) => {
      // Only handle context menu on web
      if (Platform.OS === 'web') {
        handleContextMenu(event, index, task.id);
      }
    }, [task.id, index]);

    // Use different components for web vs mobile
    if (Platform.OS === 'web') {
      return (
        <div
          style={{
            ...StyleSheet.flatten([
              styles.taskCard, 
              task.completed && styles.taskCardCompleted,
              isSelected && styles.taskCardSelected
            ]),
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={handlePress}
          onContextMenu={handleRightClick}
        >
          <View style={styles.taskContent}>
            <Text 
              style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {task.title}
            </Text>
            <Text 
              style={styles.taskTime}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {task.time}
            </Text>
          </View>
        </div>
      );
    } else {
      // Mobile version - simple View
      return (
        <View 
          style={[
            styles.taskCard, 
            task.completed && styles.taskCardCompleted
          ]}
        >
          <View style={styles.taskContent}>
            <Text 
              style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {task.title}
            </Text>
            <Text 
              style={styles.taskTime}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {task.time}
            </Text>
          </View>
        </View>
      );
    }
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

  // Handle menu actions
  const onMenuSelect = useCallback(async (action) => {
    console.log('🔵 [onMenuSelect] action:', action);
    const ids = Array.from(selectedTasks);
    console.log('🔵 [onMenuSelect] selected task IDs:', ids);
    
    if (action === 'edit') {
      console.log('Edit tasks:', ids);
      // openEditDialog(ids); // TODO: Implement edit dialog
    } else if (action === 'delete') {
      console.log('🔴 [onMenuSelect] Starting delete for tasks:', ids);
      try {
        await deleteTasks(ids);
        console.log('✅ [onMenuSelect] Delete completed');
      } catch (error) {
        console.error('❌ [onMenuSelect] Delete failed:', error);
      }
    }
    
    console.log('🔵 [onMenuSelect] Closing context menu and clearing selection');
    setContextMenu({ visible: false });
    clearSelection();
  }, [selectedTasks, clearSelection, deleteTasks]);

  // Context Menu Component (web only)
  const ContextMenu = ({ x, y, onSelect }) => {
    if (Platform.OS !== 'web') return null;

    const selectedCount = selectedTasks.size;
    const deleteText = selectedCount > 1 ? `Delete ${selectedCount} tasks` : 'Delete';
    const editText = selectedCount > 1 ? `Edit ${selectedCount} tasks` : 'Edit';

    const handleMenuClick = useCallback((e) => {
      // Prevent event bubbling to avoid closing the menu
      e.stopPropagation();
    }, []);

    return (
      <ul
        style={{ 
          position: 'absolute', 
          top: y, 
          left: x, 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          padding: '4px 0',
          margin: 0,
          listStyle: 'none',
          minWidth: '140px',
          zIndex: 1000,
          border: '1px solid #e0e0e0'
        }}
        onClick={handleMenuClick}
      >
        <li 
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            fontSize: '14px',
            color: '#999'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔵 [ContextMenu] Edit clicked');
            onSelect('edit');
          }}
        >
          {editText}
        </li>
        <li 
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            fontSize: '14px',
            color: '#d32f2f'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔵 [ContextMenu] Delete clicked');
            onSelect('delete');
          }}
        >
          {deleteText}
        </li>
      </ul>
    );
  };

  return (
    <SafeAreaView 
      style={styles.container}
    >
      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onSelect={onMenuSelect} 
        />
      )}
      
      {/* Header */}
      <View style={styles.header}>
        {Platform.OS === 'web' && selectedTasks.size > 0 ? (
          // Selection mode header (web only)
          <>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity 
                style={styles.clearSelectionButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearSelectionText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Normal header
          <>
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
          </>
        )}
      </View>

      {/* Days Container with Time Column */}
      <View style={styles.daysRowWithTime}>
        <TimeColumn />
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
  selectionInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  clearSelectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  clearSelectionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 8, // Reduced spacing to fit more cards
    alignItems: 'center', // Center align for better mobile layout
    minHeight: Platform.select({
      ios: 50, // Smaller height on mobile
      android: 50,
      web: 70,
    }),
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskCardSelected: {
    backgroundColor: Platform.select({
      ios: '#007AFF20', // Light blue background for selection
      android: '#007AFF20',
      web: '#007AFF20',
    }),
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  taskContent: {
    flex: 1,
    flexShrink: 1, // Allow shrinking but prioritize this area
    paddingVertical: Platform.select({
      ios: 8, // Reduced vertical padding for more compact layout
      android: 8,
      web: 15,
    }),
    paddingHorizontal: Platform.select({
      ios: 8, // Minimal horizontal padding to maximize text space
      android: 8,
      web: 15,
    }),
    justifyContent: 'center', // Center content vertically
    minWidth: 0, // Allow flex shrinking to prevent text overflow
    backgroundColor: Platform.select({
      ios: 'rgba(255,255,0,0.3)', // Debug: yellow background on mobile
      android: 'rgba(255,255,0,0.3)',
      web: 'transparent',
    }),
  },
  taskTitle: {
    fontSize: Platform.select({
      ios: 16, // Larger now that we have more space without delete button
      android: 16,
      web: 14,
    }),
    fontWeight: '700', // Bold but not too heavy
    color: Platform.select({
      ios: '#000', // Pure black for maximum contrast
      android: '#000',
      web: '#333',
    }),
    lineHeight: 18, // Tighter line height
    marginBottom: 2, // Reduced margin
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
      ios: 12, // Larger now that we have more space
      android: 12,
      web: 12,
    }),
    color: Platform.select({
      ios: '#666', // Lighter color for secondary text
      android: '#666',
      web: '#666',
    }),
    marginTop: 2, // Reduced margin
    lineHeight: 14, // Tighter line height
    backgroundColor: Platform.select({
      ios: 'rgba(0,0,255,0.2)', // Debug: light blue background
      android: 'rgba(0,0,255,0.2)',
      web: 'transparent',
    }),
  },
  daysRowWithTime: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    minHeight: 24 * 28, // Ensure enough height for 24 slots
  },
  timeColumn: {
    width: 38,
    paddingTop: 48, // To align with day headers
    paddingBottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  timeSlot: {
    height: 28, // More compact slot height
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'right',
    marginRight: 2,
  },
}); 