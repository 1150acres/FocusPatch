import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

// Custom hook for subscribing to data changes
export function useData() {
  const [tasks, setTasks] = useState(dataService.getTasks());
  const [upcoming, setUpcoming] = useState(dataService.getUpcoming());
  const [goals, setGoals] = useState(dataService.getGoals());

  useEffect(() => {
    // Subscribe to data changes
    const unsubscribe = dataService.subscribe(() => {
      setTasks(dataService.getTasks());
      setUpcoming(dataService.getUpcoming());
      setGoals(dataService.getGoals());
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return {
    tasks,
    upcoming,
    goals,
    // Expose service methods
    addTask: dataService.addTask.bind(dataService),
    addGoal: dataService.addGoal.bind(dataService),
    updateTask: dataService.updateTask.bind(dataService),
    updateGoal: dataService.updateGoal.bind(dataService),
    deleteTask: dataService.deleteTask.bind(dataService),
    deleteGoal: dataService.deleteGoal.bind(dataService),
    isLikelyGoal: dataService.isLikelyGoal.bind(dataService),
    getTasksForDay: dataService.getTasksForDay.bind(dataService),
  };
}

// Hook for tasks only (for components that only need tasks)
export function useTasks() {
  const [tasks, setTasks] = useState(dataService.getTasks());

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setTasks(dataService.getTasks());
    });

    return unsubscribe;
  }, []);

  return {
    tasks,
    addTask: dataService.addTask.bind(dataService),
    updateTask: dataService.updateTask.bind(dataService),
    deleteTask: dataService.deleteTask.bind(dataService),
    getTasksForDay: dataService.getTasksForDay.bind(dataService),
  };
}

// Hook for goals only (for components that only need goals)
export function useGoals() {
  const [goals, setGoals] = useState(dataService.getGoals());

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setGoals(dataService.getGoals());
    });

    return unsubscribe;
  }, []);

  return {
    goals,
    addGoal: dataService.addGoal.bind(dataService),
    updateGoal: dataService.updateGoal.bind(dataService),
    deleteGoal: dataService.deleteGoal.bind(dataService),
  };
} 