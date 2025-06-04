import { useState, useCallback } from 'react';

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
  const [tasks, setTasks] = useState(sampleTasks);
  const [upcoming, setUpcoming] = useState(sampleUpcoming);

  const addTask = useCallback((newTask) => {
    const task = {
      id: Date.now().toString(),
      ...newTask
    };
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const removeTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
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
    updateTask,
    isLikelyGoal
  };
}

export function useGoals() {
  const [goals, setGoals] = useState(() => {
    console.log('Initializing goals with sample data');
    return sampleGoals;
  });

  const addGoal = useCallback((newGoal) => {
    console.log('Adding new goal:', newGoal);
    const goal = {
      id: `goal-${Date.now()}`,
      completed: 0,
      total: 0,
      steps: [],
      icon: '🎯',
      ...newGoal
    };
    setGoals(prev => {
      console.log('Previous goals:', prev);
      const updated = [...prev, goal];
      console.log('Updated goals:', updated);
      return updated;
    });
    return goal;
  }, []);

  const removeGoal = useCallback((goalId) => {
    console.log('Removing goal:', goalId);
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  }, []);

  const updateGoal = useCallback((goalId, updates) => {
    console.log('Updating goal:', goalId, updates);
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  }, []);

  return {
    goals,
    addGoal,
    removeGoal,
    updateGoal
  };
} 