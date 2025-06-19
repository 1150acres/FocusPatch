import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  Animated,
} from 'react-native';
// Disable gesture handlers entirely - we use web mouse events and touch events instead
// This prevents PanGestureHandler errors while maintaining full functionality
let PanGestureHandler = null, State = null;
import { DeviceContext } from '../contexts/DeviceContext';
import { useData } from '../hooks/useData';
import { 
  getCurrentSnappedTime, 
  generateTimeSlots, 
  snapTimeStringToQuarter,
  getTimeSlotPosition,
  positionToTimeString 
} from '../utils/timeUtils';

// Generate 15-minute time slots for the day (6 AM to 11 PM for better UX)
const TIME_SLOTS = generateTimeSlots(6, 23);
const SLOT_HEIGHT = 20; // Height of each 15-minute slot in pixels

const TimeColumn = () => (
  <View style={styles.timeColumn}>
    {TIME_SLOTS.map((slot, idx) => {
      // Only show hour labels (every 4th slot)
      const isHourMark = slot.minutes === 0;
      const isHalfHour = slot.minutes === 30;
      
      return (
        <View key={slot.slotId} style={[styles.timeSlot, { height: SLOT_HEIGHT }]}>
          {isHourMark && (
            <Text style={styles.timeLabel}>{slot.time.replace(' ', '')}</Text>
          )}
          {isHalfHour && (
            <View style={styles.halfHourMark} />
          )}
          {!isHourMark && !isHalfHour && (
            <View style={styles.quarterHourMark} />
          )}
        </View>
      );
    })}
  </View>
);

export default function HomeScreen({ navigation }) {
  const [taskInput, setTaskInput] = useState('');
  const [inputHeight, setInputHeight] = useState(48); // Start with single line height
  const [shouldTrackHeight, setShouldTrackHeight] = useState(false); // Only track height when needed
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [lastIndex, setLastIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const { hasTouchscreen } = useContext(DeviceContext);
  const { tasks, addTask, updateTask, deleteTasks } = useData();

  // Inject clean scrollbar CSS for web (like ChatGPT)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Clean scrollbar styling like ChatGPT */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #565869;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6c6d7a;
        }
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #565869 transparent;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Get current date and calculate day offsets
  const baseDate = useMemo(() => new Date(), []);

  // Memoized day column component with time-based positioning
  const DayColumn = React.memo(({ dayOffset, tasks, baseDate, onToggleComplete, onTaskDragEnd, onTaskResize }) => {
    const { date, dayName, dayText, dayTasks, timeSlotHeight } = useMemo(() => {
      // Use native JavaScript instead of date-fns
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);
      
      // Fixed typos in day names
      const dayName = dayOffset === 0 ? 'Monday' : dayOffset === 1 ? 'Tuesday' : 'Wednesday';
      
      // Format date manually
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayText = `${months[date.getMonth()]} ${date.getDate()}`;
      
      const dayTasks = tasks.filter(task => task.day === dayOffset);
      
      // Calculate total height for the time grid
      const timeSlotHeight = TIME_SLOTS.length * SLOT_HEIGHT;
      
      return { date, dayName, dayText, dayTasks, timeSlotHeight };
    }, [dayOffset, tasks, baseDate]);

    return (
      <View 
        style={styles.dayColumn}
        dataSet={{ dayColumn: dayOffset }}
        nativeID={`day-column-${dayOffset}`}
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dayDate}>{dayText}</Text>
        </View>
        
        {/* Time Grid Background */}
        <View style={[styles.timeGrid, { height: timeSlotHeight }]}>
          {TIME_SLOTS.map((slot, idx) => (
            <View 
              key={slot.slotId} 
              style={[
                styles.timeGridSlot, 
                { height: SLOT_HEIGHT },
                slot.minutes === 0 && styles.hourGridSlot
              ]} 
            />
          ))}
          
          {/* Positioned Tasks */}
          {dayTasks.map((task, taskIndex) => {
            // Calculate global index across all days for selection
            const globalIndex = tasks.findIndex(t => t.id === task.id);
            
            // Calculate position based on task time
            const yPosition = getTimeSlotPosition(task.time, SLOT_HEIGHT, 6); // Start at 6 AM
            
            return (
              <View
                key={task.id}
                style={[
                  styles.positionedTaskContainer,
                  { top: yPosition }
                ]}
              >
                <DraggableTaskCard 
                  task={task} 
                  index={globalIndex}
                  onToggleComplete={onToggleComplete}
                  onDragEnd={onTaskDragEnd}
                  onResize={onTaskResize}
                />
              </View>
            );
          })}
        </View>
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

  // Helper function to determine which day column a position is over
  const getTargetDayFromPosition = useCallback((clientX, clientY) => {
    if (Platform.OS !== 'web') return null;
    
    try {
      // Get the element at the cursor position
      const elementAtPosition = document.elementFromPoint(clientX, clientY);
      if (!elementAtPosition) return null;
      
      // Traverse up the DOM tree to find a day column
      let currentElement = elementAtPosition;
      let maxDepth = 10; // Prevent infinite loops
      
      while (currentElement && maxDepth > 0) {
        // Check if this element is a day column
        if (currentElement.id && currentElement.id.startsWith('day-column-')) {
          const dayIndex = parseInt(currentElement.id.replace('day-column-', ''));
          if (!isNaN(dayIndex)) {
            return dayIndex;
          }
        }
        
        // Check data attributes
        if (currentElement.getAttribute && currentElement.getAttribute('data-day-column')) {
          const dayIndex = parseInt(currentElement.getAttribute('data-day-column'));
          if (!isNaN(dayIndex)) {
            return dayIndex;
          }
        }
        
        currentElement = currentElement.parentElement;
        maxDepth--;
      }
      
      // Fallback: calculate based on horizontal position
      // Assuming three equal-width columns
      const dayColumns = document.querySelectorAll('[id^="day-column-"]');
      if (dayColumns.length > 0) {
        const firstColumn = dayColumns[0];
        const rect = firstColumn.getBoundingClientRect();
        const columnWidth = rect.width;
        const leftmostX = rect.left;
        
        const relativeX = clientX - leftmostX;
        const columnIndex = Math.floor(relativeX / columnWidth);
        
        if (columnIndex >= 0 && columnIndex < 3) {
          return columnIndex;
        }
      }
      
    } catch (error) {
      console.warn('Error detecting target day column:', error);
    }
    
    return null;
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

  // Draggable Task Card Component
  const DraggableTaskCard = React.memo(({ task, index, onToggleComplete, onDragEnd, onResize }) => {
    const translateY = new Animated.Value(0);
    const scale = new Animated.Value(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [webTranslateY, setWebTranslateY] = useState(0);
    const [webHeight, setWebHeight] = useState(0);
    const isSelected = Platform.OS === 'web' ? selectedTasks.has(task.id) : false;
    
    // Calculate task height based on duration (default to 1 slot = 15 minutes)
    const taskDuration = task.duration || 15; // Default 15 minutes
    const taskHeight = Math.max(SLOT_HEIGHT, (taskDuration / 15) * SLOT_HEIGHT);

    const handlePress = useCallback((event) => {
      // Only handle selection on web if not dragging
      if (Platform.OS === 'web' && !isDragging) {
        handleTaskSelection(task.id, index, event);
      }
    }, [task.id, index, isDragging]);

    const handleRightClick = useCallback((event) => {
      // Only handle context menu on web
      if (Platform.OS === 'web') {
        handleContextMenu(event, index, task.id);
      }
    }, [task.id, index]);

    // Web drag handlers
    const handleMouseDown = useCallback((event) => {
      if (Platform.OS === 'web') {
        event.preventDefault();
        const startY = event.clientY;
        const startX = event.clientX;
        const initialPosition = getTimeSlotPosition(task.time, SLOT_HEIGHT, 6);
        setIsDragging(true);
        
        const handleMouseMove = (e) => {
          const deltaY = e.clientY - startY;
          const deltaX = e.clientX - startX;
          
          // Calculate snapped position for visual feedback
          const newPosition = initialPosition + deltaY;
          const newTime = positionToTimeString(newPosition, SLOT_HEIGHT, 6);
          const snappedTime = snapTimeStringToQuarter(newTime);
          const snappedPosition = getTimeSlotPosition(snappedTime, SLOT_HEIGHT, 6);
          const snappedDelta = snappedPosition - initialPosition;
          
          // Use snapped position for visual feedback
          setWebTranslateY(snappedDelta);
          
          // Add visual feedback for cross-day dragging
          if (Math.abs(deltaX) > 50) {
            // Change cursor or add visual indicator for cross-day drag
            document.body.style.cursor = 'move';
            
            // Highlight potential drop zones
            const targetDay = getTargetDayFromPosition(e.clientX, e.clientY);
            
            // Remove previous highlights
            document.querySelectorAll('[id^="day-column-"]').forEach(col => {
              col.style.backgroundColor = '';
              col.style.borderColor = '';
            });
            
            // Highlight current target
            if (targetDay !== null && targetDay !== task.day) {
              const targetColumn = document.getElementById(`day-column-${targetDay}`);
              if (targetColumn) {
                targetColumn.style.backgroundColor = '#007AFF10';
                targetColumn.style.borderColor = '#007AFF';
                targetColumn.style.borderWidth = '2px';
                targetColumn.style.borderStyle = 'dashed';
              }
            }
          } else {
            document.body.style.cursor = 'grabbing';
            
            // Remove highlights when not cross-dragging
            document.querySelectorAll('[id^="day-column-"]').forEach(col => {
              col.style.backgroundColor = '';
              col.style.borderColor = '';
              col.style.borderWidth = '';
              col.style.borderStyle = '';
            });
          }
        };

        const handleMouseUp = (e) => {
          const deltaY = e.clientY - startY;
          const deltaX = e.clientX - startX;
          setIsDragging(false);
          
          // Reset cursor and clean up visual feedback
          document.body.style.cursor = '';
          
          // Remove all column highlights
          document.querySelectorAll('[id^="day-column-"]').forEach(col => {
            col.style.backgroundColor = '';
            col.style.borderColor = '';
            col.style.borderWidth = '';
            col.style.borderStyle = '';
          });
          
          // Check if dropped on a different day column
          const targetDay = getTargetDayFromPosition(e.clientX, e.clientY);
          
          // Calculate new time based on drag position
          const moved = Math.abs(deltaY) > 10 || Math.abs(deltaX) > 50;
          
          if (moved) {
            const newPosition = initialPosition + deltaY;
            const newTime = positionToTimeString(newPosition, SLOT_HEIGHT, 6);
            const snappedTime = snapTimeStringToQuarter(newTime);
            
            // If dropped on a different day or time changed
            if ((targetDay !== null && targetDay !== task.day) || 
                (snappedTime && snappedTime !== task.time)) {
              onDragEnd(task.id, snappedTime, targetDay !== null ? targetDay : task.day);
            }
          }
          
          // Reset position
          setWebTranslateY(0);
          
          // Remove event listeners
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }, [task.id, task.time, task.day, onDragEnd, translateY]);

    // Web resize handlers
    const handleResizeMouseDown = useCallback((event) => {
      if (Platform.OS === 'web') {
        event.preventDefault();
        event.stopPropagation(); // Prevent dragging when resizing
        const startY = event.clientY;
        const initialHeight = taskHeight;
        setIsResizing(true);
        
        const handleMouseMove = (e) => {
          const deltaY = e.clientY - startY;
          const newHeight = Math.max(SLOT_HEIGHT, initialHeight + deltaY);
          
          // Snap to 15-minute intervals
          const snappedSlots = Math.round(newHeight / SLOT_HEIGHT);
          const snappedHeight = snappedSlots * SLOT_HEIGHT;
          
          setWebHeight(snappedHeight - initialHeight);
        };

        const handleMouseUp = (e) => {
          const deltaY = e.clientY - startY;
          setIsResizing(false);
          
          // Calculate new duration based on height change
          if (Math.abs(deltaY) > 5) {
            const newHeight = Math.max(SLOT_HEIGHT, initialHeight + deltaY);
            const snappedSlots = Math.round(newHeight / SLOT_HEIGHT);
            const newDuration = snappedSlots * 15; // 15 minutes per slot
            
            if (newDuration !== taskDuration && onResize) {
              onResize(task.id, newDuration);
            }
          }
          
          // Reset height
          setWebHeight(0);
          
          // Remove event listeners
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }, [task.id, taskHeight, taskDuration, onResize]);

    // Mobile gesture handlers
    const onGestureEvent = useCallback((event) => {
      const { translationY } = event.nativeEvent;
      
      // Calculate snapped position for visual feedback
      const initialPosition = getTimeSlotPosition(task.time, SLOT_HEIGHT, 6);
      const newPosition = initialPosition + translationY;
      const newTime = positionToTimeString(newPosition, SLOT_HEIGHT, 6);
      const snappedTime = snapTimeStringToQuarter(newTime);
      const snappedPosition = getTimeSlotPosition(snappedTime, SLOT_HEIGHT, 6);
      const snappedDelta = snappedPosition - initialPosition;
      
      // Use snapped position for visual feedback
      translateY.setValue(snappedDelta);
    }, [translateY, task.time]);

    const onHandlerStateChange = useCallback((event) => {
      const { state, translationY } = event.nativeEvent;
      
      if (state === State.BEGAN) {
        setIsDragging(true);
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: true,
        }).start();
      } else if (state === State.END || state === State.CANCELLED) {
        setIsDragging(false);
        
        // Calculate new time based on drag position
        if (Math.abs(translationY) > 10) { // Only if dragged significantly
          const newPosition = getTimeSlotPosition(task.time, SLOT_HEIGHT, 6) + translationY;
          const newTime = positionToTimeString(newPosition, SLOT_HEIGHT, 6);
          
          // Snap to 15-minute intervals
          const snappedTime = snapTimeStringToQuarter(newTime);
          
          if (snappedTime && snappedTime !== task.time) {
            // For mobile, we only support time changes, not day changes
            // Cross-day dragging is a web-only feature due to complexity
            onDragEnd(task.id, snappedTime, task.day);
          }
        }
        
        // Reset animations
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [task.id, task.time, task.day, onDragEnd, translateY, scale]);

    const TaskCardContent = () => {
      // Format duration for display
      const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
      };

      return (
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
            {task.time} {task.duration && `• ${formatDuration(task.duration)}`}
          </Text>
        </View>
      );
    };

    // Use different components for web vs mobile
    if (Platform.OS === 'web') {
      return (
        <div
          style={{
            ...StyleSheet.flatten([
              styles.taskCard, 
              task.completed && styles.taskCardCompleted,
              isSelected && styles.taskCardSelected,
              (isDragging || isResizing) && styles.taskCardDragging
            ]),
            cursor: isDragging ? 'grabbing' : isResizing ? 'ns-resize' : 'grab',
            userSelect: 'none',
            transform: `translateY(${webTranslateY}px)`,
            height: `${taskHeight + webHeight}px`,
            position: 'relative',
          }}
          onClick={handlePress}
          onContextMenu={handleRightClick}
          onMouseDown={handleMouseDown}
        >
          <TaskCardContent />
          {/* Resize Handle */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '6px',
              cursor: 'ns-resize',
              backgroundColor: 'transparent',
              borderBottom: isResizing ? '2px solid #007AFF' : '2px solid transparent',
              transition: isResizing ? 'none' : 'border-color 0.2s ease',
            }}
            onMouseDown={handleResizeMouseDown}
            onMouseEnter={(e) => {
              if (!isResizing && !isDragging) {
                e.target.style.borderBottomColor = '#007AFF40';
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                e.target.style.borderBottomColor = 'transparent';
              }
            }}
          />
        </div>
      );
    } else {
      // Mobile version - simple TouchableOpacity without gesture handlers
      return (
        <TouchableOpacity
          style={[
            styles.taskCard, 
            task.completed && styles.taskCardCompleted,
            { height: taskHeight }
          ]}
          onPress={() => onToggleComplete(task.id)}
          activeOpacity={0.7}
        >
          <TaskCardContent />
        </TouchableOpacity>
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

  // Handle task drag end
  const handleTaskDragEnd = useCallback((taskId, newTime, newDay) => {
    updateTask(taskId, (task) => ({
      ...task,
      time: newTime,
      ...(newDay !== undefined && { day: newDay })
    }));
  }, [updateTask]);

  // Handle task resize
  const handleTaskResize = useCallback((taskId, newDuration) => {
    updateTask(taskId, (task) => ({
      ...task,
      duration: newDuration
    }));
  }, [updateTask]);

  // Handle adding new task
  const handleAddTask = useCallback(() => {
    if (!taskInput.trim()) return;
    
    // Use snapped time instead of exact current time
    const snappedTime = getCurrentSnappedTime();
    
    addTask({
      title: taskInput,
      time: snappedTime,
      day: 0, // Add to today by default
      category: 'general',
      duration: 30 // Default 30 minutes
    });
    
    setTaskInput('');
    setInputHeight(48); // Reset to single line height
    setShouldTrackHeight(false); // Reset height tracking
  }, [taskInput, addTask]);

  // Handle content size change for dynamic height
  const handleContentSizeChange = useCallback((event) => {
    if (!shouldTrackHeight) return; // Don't track height initially
    
    const { height } = event.nativeEvent.contentSize;
    
    // Only expand if we have multiple lines or very long single line
    // For single line, content height should be around 24px (lineHeight)
    const singleLineThreshold = 26; // Slightly higher than 24px to account for variations
    const minInputHeight = 48; // Our target single-line height
    const maxInputHeight = 120; // Maximum allowed height
    
    // Only expand if content is definitely larger than single line
    if (height > singleLineThreshold) {
      // Calculate new height: content + padding (12px top + 12px bottom)
      const newHeight = Math.min(height + 24, maxInputHeight);
      setInputHeight(newHeight);
    } else {
      // Keep at minimum height for single line
      setInputHeight(minInputHeight);
    }
  }, [shouldTrackHeight]);

  // Handle key press for Enter vs Shift+Enter
  const handleKeyPress = useCallback((event) => {
    if (Platform.OS === 'web') {
      const { key, shiftKey } = event.nativeEvent;
      
      if (key === 'Enter') {
        if (shiftKey) {
          // Shift+Enter: Allow new line and enable height tracking
          setShouldTrackHeight(true);
          return;
        } else {
          // Enter: Add task
          event.preventDefault();
          handleAddTask();
        }
      }
    }
  }, [handleAddTask]);

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
    <SafeAreaView style={styles.container}>
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
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  onTaskDragEnd={handleTaskDragEnd}
                  onTaskResize={handleTaskResize}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      {/* Task Input - Bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.taskInput, { height: inputHeight }]}
            placeholder="Message FocusPatch"
            value={taskInput}
            onChangeText={setTaskInput}
            onKeyPress={handleKeyPress}
            returnKeyType="done"
            blurOnSubmit={false}
            multiline={true}
            textAlignVertical="top"
            scrollEnabled={false}
            onContentSizeChange={handleContentSizeChange}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#343541',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#202123',
    borderBottomWidth: 1,
    borderBottomColor: '#565869',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
    paddingVertical: 16,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginBottom: Platform.select({
      ios: 20,
      android: 20,
      web: 0,
    }),
    minHeight: 76,
    alignItems: 'flex-end',
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#40414f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#565869',
    color: '#ffffff',
    ...Platform.select({
      web: {
        outline: 'none',
        resize: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '24px',
        transition: 'all 0.2s ease',
        ':focus': {
          borderColor: '#10a37f',
          backgroundColor: '#40414f',
          boxShadow: '0 0 0 1px #10a37f',
        },
        '::placeholder': {
          color: '#8e8ea0',
        },
      },
      ios: {
        textAlignVertical: 'top',
      },
      android: {
        textAlignVertical: 'top',
      },
    }),
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
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 1,
    alignItems: 'center',
    minHeight: SLOT_HEIGHT - 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
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
  taskCardDragging: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
    }),
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  taskContent: {
    flex: 1,
    flexShrink: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    lineHeight: 14,
    marginBottom: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskTime: {
    fontSize: 10,
    color: '#666',
    lineHeight: 12,
  },
  daysRowWithTime: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
    height: TIME_SLOTS.length * SLOT_HEIGHT, // Fixed height for time grid
  },
  timeColumn: {
    width: 50,
    paddingTop: 48, // To align with day headers
    paddingBottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  timeSlot: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  timeLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
    marginRight: 4,
    fontWeight: '500',
  },
  halfHourMark: {
    width: 8,
    height: 0.5,
    backgroundColor: '#ccc',
    marginRight: 4,
  },
  quarterHourMark: {
    width: 4,
    height: 0.5,
    backgroundColor: '#e0e0e0',
    marginRight: 4,
  },
  timeGrid: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fafafa',
  },
  timeGridSlot: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  hourGridSlot: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  positionedTaskContainer: {
    position: 'absolute',
    left: 4,
    right: 4,
    minHeight: SLOT_HEIGHT - 2,
    zIndex: 1,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    cursor: 'ns-resize',
    backgroundColor: 'transparent',
  },
}); 