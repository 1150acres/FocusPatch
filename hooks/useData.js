import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web-compatible storage wrapper
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage not available, using memory storage');
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn('localStorage not available, using memory storage');
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  }
};

// HELPER: persist the full goals array (including nested steps) into AsyncStorage
async function saveGoalsToStorage(goalsArray) {
  try {
    // Always ensure we're writing an array; if not, fallback to sampleGoals
    const toStore = Array.isArray(goalsArray) ? goalsArray : sampleGoals;
    console.log('🔵 [saveGoalsToStorage] writing goals:', toStore);
    await storage.setItem('@goals', JSON.stringify(toStore));
    console.log('✅ [saveGoalsToStorage] write complete');
  } catch (err) {
    console.error('❌ [saveGoalsToStorage] error:', err);
  }
}

const sampleTasks = [
  {
    id: '1',
    title: 'Work meeting',
    time: '9:00 AM',
    day: 0,
    category: 'work'
  },
  {
    id: '2',
    title: 'Study React',
    time: '2:00 PM',
    day: 0,
    category: 'study'
  },
  {
    id: '3',
    title: 'Call Mom',
    time: '6:00 PM',
    day: 1,
    category: 'personal'
  },
  {
    id: '4',
    title: 'Work on project',
    time: '10:00 AM',
    day: 2,
    category: 'work'
  }
];

const sampleUpcoming = [
  {
    id: 'u1',
    title: 'Doctor Appointment',
    dueDate: 'Today',
    isGoal: false
  },
  {
    id: 'u2',
    title: 'Complete FocusPatch MVP',
    dueDate: 'This week',
    isGoal: true
  },
  {
    id: 'u3',
    title: 'Gym workout',
    dueDate: 'Tomorrow',
    isGoal: false
  }
];

const sampleGoals = [
  {
    id: 'g1',
    title: 'Start a podcast',
    subtitle: 'Launch my own tech podcast',
    icon: '🎙️',
    completed: 3,
    total: 6,
    steps: [
      { id: 'g1-s1', title: 'Research podcast topics', completed: true },
      { id: 'g1-s2', title: 'Buy recording equipment', completed: true },
      { id: 'g1-s3', title: 'Set up recording space', completed: true },
      { id: 'g1-s4', title: 'Record pilot episode', completed: false },
      { id: 'g1-s5', title: 'Edit and publish first episode', completed: false },
      { id: 'g1-s6', title: 'Plan content calendar', completed: false }
    ]
  },
  {
    id: 'g2',
    title: 'Learn React Native',
    subtitle: 'Master mobile app development',
    icon: '📱',
    completed: 2,
    total: 5,
    steps: [
      { id: 'g2-s1', title: 'Complete React Native tutorial', completed: true },
      { id: 'g2-s2', title: 'Build sample app', completed: true },
      { id: 'g2-s3', title: 'Learn navigation patterns', completed: false },
      { id: 'g2-s4', title: 'Implement state management', completed: false },
      { id: 'g2-s5', title: 'Deploy to app store', completed: false }
    ]
  },
  {
    id: 'g3',
    title: 'Complete FocusPatch MVP',
    subtitle: 'Finish ADHD planner app',
    icon: '🎯',
    completed: 1,
    total: 4,
    steps: [
      { id: 'g3-s1', title: 'Design app architecture', completed: true },
      { id: 'g3-s2', title: 'Implement calendar view', completed: false },
      { id: 'g3-s3', title: 'Add goal tracking', completed: false },
      { id: 'g3-s4', title: 'Test with users', completed: false }
    ]
  }
];

export function useData() {
  const [tasks, setTasks] = useState([]);
  const [upcoming, setUpcoming] = useState(sampleUpcoming);

  async function loadTasksFromStorage() {
    try {
      const raw = await storage.getItem('@tasks');
      if (!raw) {
        return sampleTasks;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : sampleTasks;
    } catch (err) {
      console.error('❌ [loadTasksFromStorage] error parsing:', err);
      return sampleTasks;
    }
  }

  async function saveTasksToStorage(tasksArray) {
    try {
      const toStore = Array.isArray(tasksArray) ? tasksArray : sampleTasks;
      console.log('🔵 [saveTasks] writing:', toStore);
      await storage.setItem('@tasks', JSON.stringify(toStore));
      console.log('✅ [saveTasks] write complete');
    } catch (err) {
      console.error('❌ [saveTasks] error:', err);
    }
  }

  useEffect(() => {
    (async () => {
      console.log('🔵 [loadTasks] reading from AsyncStorage');
      const stored = await loadTasksFromStorage();
      console.log('✅ [loadTasks] got:', stored);
      setTasks(stored);
    })();
  }, []);

  const addTask = useCallback(async (newTask) => {
    // Import time snapping function dynamically to avoid circular dependencies
    const { snapTimeStringToQuarter } = await import('../utils/timeUtils');
    
    // Snap the time to 15-minute intervals
    const snappedTime = newTask.time ? snapTimeStringToQuarter(newTask.time) : newTask.time;
    
    const task = { 
      id: Date.now().toString(), 
      ...newTask,
      time: snappedTime
    };
    let updated = [];
    await setTasks(prev => {
      updated = [...prev, task];
      return updated;
    });
    try {
      await saveTasksToStorage(updated);
    } catch (err) {
      console.error('❌ [addTask] saveTasks error:', err);
    }
    return task;
  }, []);

  const removeTask = useCallback(async (id) => {
    let updated = [];
    await setTasks(prev => {
      updated = prev.filter(task => task.id !== id);
      return updated;
    });
    try {
      await saveTasksToStorage(updated);
    } catch (err) {
      console.error('❌ [removeTask] saveTasks error:', err);
    }
  }, []);

  const deleteTasks = useCallback(async (taskIds) => {
    console.log('🔵 [deleteTasks] deleting tasks:', taskIds);
    let updated = [];
    await setTasks(prev => {
      updated = prev.filter(task => !taskIds.includes(task.id));
      return updated;
    });
    try {
      await saveTasksToStorage(updated);
      console.log('✅ [deleteTasks] deleted successfully');
    } catch (err) {
      console.error('❌ [deleteTasks] saveTasks error:', err);
    }
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    let updated = [];
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      
      const newUpdates = typeof updates === 'function' ? updates(task) : updates;
      updated = prev.map(t =>
        t.id === id ? { ...t, ...newUpdates } : t
      );
      return updated;
    });
    try {
      await saveTasksToStorage(updated);
    } catch (err) {
      console.error('❌ [updateTask] saveTasks error:', err);
    }
  }, []);

  const isLikelyGoal = useCallback((text) => {
    const goalKeywords = ['goal', 'achieve', 'complete', 'finish', 'project', 'learn', 'master', 'habit', 'routine'];
    const lowerText = text.toLowerCase();
    return goalKeywords.some(keyword => lowerText.includes(keyword));
  }, []);

  return {
    tasks,
    upcoming,
    addTask,
    removeTask,
    deleteTasks,
    updateTask,
    isLikelyGoal
  };
}

export function useGoals() {
  const [goals, setGoals] = useState([]);

  async function loadGoalsFromStorage() {
    try {
      const raw = await storage.getItem('@goals');
      if (!raw) {
        return sampleGoals;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : sampleGoals;
    } catch (err) {
      console.error('❌ [loadGoalsFromStorage] parse error:', err);
      return sampleGoals;
    }
  }

  useEffect(() => {
    (async () => {
      console.log('🔵 [loadGoals] reading from AsyncStorage');
      const stored = await loadGoalsFromStorage();
      console.log('✅ [loadGoals] got:', stored);
      setGoals(stored);
    })();
  }, []);

  const addGoal = useCallback(async (newGoal) => {
    console.log('Adding new goal:', newGoal);
    const goal = {
      id: `goal-${Date.now()}`,
      completed: 0,
      total: 0,
      steps: [],
      icon: '🎯',
      ...newGoal
    };
    let updatedGoals = [];
    setGoals(prev => {
      console.log('Previous goals:', prev);
      updatedGoals = [...prev, goal];
      console.log('Updated goals:', updatedGoals);
      return updatedGoals;
    });
    
    // Persist the changes to storage
    try {
      await saveGoalsToStorage(updatedGoals);
      console.log('✅ [addGoal] save complete for goal:', goal.id);
    } catch (err) {
      console.error('❌ [addGoal] saveGoalsToStorage error:', err);
    }
    
    return goal;
  }, []);

  const removeGoal = useCallback((goalId) => {
    console.log('[removeGoal] Called with goalId:', goalId);
    return new Promise((resolve, reject) => {
      let updatedGoals = [];
      setGoals(prev => {
        console.log('[removeGoal] Previous goals:', prev);
        updatedGoals = prev.filter(goal => goal.id !== goalId);
        console.log('[removeGoal] Updated goals after filter:', updatedGoals);
        return updatedGoals;
      });
      // Persist the changes to storage
      saveGoalsToStorage(updatedGoals)
        .then(() => {
          console.log('[removeGoal] saveGoalsToStorage complete. Final goals:', updatedGoals);
          resolve(goalId);
        })
        .catch((err) => {
          console.error('[removeGoal] saveGoalsToStorage error:', err);
          reject(err);
        });
    });
  }, []);

  const updateGoal = useCallback(async (goalId, updates) => {
    console.log('Updating goal (persisting):', goalId, updates);

    // 1. Build the new array of goals by merging updates into the target goal:
    let updatedGoals = [];
    setGoals(prevGoals => {
      updatedGoals = prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      );
      return updatedGoals;
    });

    // 2. Now persist the entire updatedGoals array (including nested steps) to AsyncStorage:
    try {
      await saveGoalsToStorage(updatedGoals);
      console.log('✅ [updateGoal] save complete for goal:', goalId);
    } catch (err) {
      console.error('❌ [updateGoal] saveGoalsToStorage error:', err);
    }
  }, []);

  return {
    goals,
    addGoal,
    removeGoal,
    updateGoal
  };
} 