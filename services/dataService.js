// Data service for managing tasks and goals
// This will eventually be connected to Firebase for persistence

// Mock data for tasks
const initialTasks = [
  { id: '1', title: 'Work meeting', time: '9.00', day: 0, category: 'work' },
  { id: '2', title: 'Study group', time: '1.00', day: 1, category: 'education' },
  { id: '3', title: 'Call with mentor', time: '12.00', day: 1, category: 'networking' },
  { id: '4', title: 'Side hustle task', time: '35.30', day: 2, category: 'business' },
];

// Mock data for upcoming tasks
const initialUpcoming = [
  { id: '1', title: 'Start a podcast', dueDate: 'Later today', isGoal: true },
  { id: '2', title: 'Side hustle task', dueDate: 'Thu, Mar29' },
  { id: '3', title: 'Submit paper', dueDate: 'Fri. Jun 6' },
];

// Mock data for goals
const initialGoals = [
  { 
    id: '1', 
    title: 'Start a podcast', 
    completed: 3, 
    total: 10,
    icon: '🧠',
    category: 'creative',
    steps: [
      { id: '1-1', title: 'Research podcast hosting platforms', completed: true },
      { id: '1-2', title: 'Create content strategy', completed: true },
      { id: '1-3', title: 'Design podcast artwork', completed: true },
      { id: '1-4', title: 'Record first episode', completed: false },
      { id: '1-5', title: 'Set up social media accounts', completed: false },
      { id: '1-6', title: 'Launch and promote', completed: false },
    ]
  },
  { 
    id: '2', 
    title: 'Finish reading', 
    completed: 6, 
    total: 8,
    icon: '📖',
    subtitle: '2 chapters left',
    category: 'education',
    steps: [
      { id: '2-1', title: 'Read Chapter 1', completed: true },
      { id: '2-2', title: 'Read Chapter 2', completed: true },
      { id: '2-3', title: 'Read Chapter 3', completed: true },
      { id: '2-4', title: 'Read Chapter 4', completed: true },
      { id: '2-5', title: 'Read Chapter 5', completed: true },
      { id: '2-6', title: 'Read Chapter 6', completed: true },
      { id: '2-7', title: 'Read Chapter 7', completed: false },
      { id: '2-8', title: 'Read Chapter 8', completed: false },
    ]
  },
  { 
    id: '3', 
    title: 'Get fit', 
    completed: 0, 
    total: 4,
    icon: '💪',
    category: 'health',
    steps: [
      { id: '3-1', title: 'Join a gym', completed: false },
      { id: '3-2', title: 'Create workout schedule', completed: false },
      { id: '3-3', title: 'Work out 3x per week for a month', completed: false },
      { id: '3-4', title: 'Track progress and adjust plan', completed: false },
    ]
  },
];

// Goal-related keywords for smart categorization
export const goalKeywords = ['podcast', 'business', 'learn', 'create', 'start a', 'begin', 'build', 'develop', 'study', 'practice'];

class DataService {
  constructor() {
    this.tasks = [...initialTasks];
    this.upcoming = [...initialUpcoming];
    this.goals = [...initialGoals];
    this.listeners = new Set();
  }

  // Subscribe to data changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  notify() {
    this.listeners.forEach(listener => listener());
  }

  // Get tasks for a specific day
  getTasksForDay(dayOffset) {
    return this.tasks.filter(task => task.day === dayOffset);
  }

  // Get all tasks
  getTasks() {
    return [...this.tasks];
  }

  // Get upcoming items
  getUpcoming() {
    return [...this.upcoming];
  }

  // Get all goals
  getGoals() {
    return [...this.goals];
  }

  // Add a new task
  addTask(taskData) {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    
    this.tasks.push(newTask);
    this.notify();
    return newTask;
  }

  // Add a new goal
  addGoal(goalData) {
    const newGoal = {
      id: Date.now().toString(),
      completed: 0,
      total: 1,
      icon: '⭐',
      ...goalData,
      createdAt: new Date().toISOString(),
    };
    
    this.goals.push(newGoal);
    this.notify();
    return newGoal;
  }

  // Update task
  updateTask(taskId, updates) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.notify();
      return this.tasks[index];
    }
    return null;
  }

  // Update goal
  updateGoal(goalId, updates) {
    const index = this.goals.findIndex(goal => goal.id === goalId);
    if (index !== -1) {
      this.goals[index] = { ...this.goals[index], ...updates };
      this.notify();
      return this.goals[index];
    }
    return null;
  }

  // Delete task
  deleteTask(taskId) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.notify();
      return true;
    }
    return false;
  }

  // Delete goal
  deleteGoal(goalId) {
    const index = this.goals.findIndex(goal => goal.id === goalId);
    if (index !== -1) {
      this.goals.splice(index, 1);
      this.notify();
      return true;
    }
    return false;
  }

  // Smart categorization: detect if input might be a goal
  isLikelyGoal(input) {
    const lowercaseInput = input.toLowerCase();
    return goalKeywords.some(keyword => 
      lowercaseInput.includes(keyword.toLowerCase())
    );
  }

  // Get tasks by category
  getTasksByCategory(category) {
    return this.tasks.filter(task => task.category === category);
  }

  // Get goals by category
  getGoalsByCategory(category) {
    return this.goals.filter(goal => goal.category === category);
  }
}

// Create and export a singleton instance
export const dataService = new DataService();

// Export individual functions for easier importing
export const {
  getTasks,
  getTasksForDay,
  getUpcoming,
  getGoals,
  addTask,
  addGoal,
  updateTask,
  updateGoal,
  deleteTask,
  deleteGoal,
  isLikelyGoal,
  getTasksByCategory,
  getGoalsByCategory,
  subscribe,
} = dataService; 