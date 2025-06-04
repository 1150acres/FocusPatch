// Simple in-memory data service for tasks and goals
class DataService {
  constructor() {
    this.tasks = [];
    this.goals = [];
  }

  // Task methods
  getTasks() {
    return this.tasks;
  }

  addTask(task) {
    const newTask = {
      id: Date.now().toString(),
      ...task,
      completed: false,
      createdAt: new Date(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      return this.tasks[index];
    }
    return null;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }

  // Goal methods
  getGoals() {
    return this.goals;
  }

  addGoal(goal) {
    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      completed: false,
      createdAt: new Date(),
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  updateGoal(id, updates) {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index !== -1) {
      this.goals[index] = { ...this.goals[index], ...updates };
      return this.goals[index];
    }
    return null;
  }

  deleteGoal(id) {
    this.goals = this.goals.filter(goal => goal.id !== id);
  }

  // Clear all data
  clearAllData() {
    this.tasks = [];
    this.goals = [];
  }
}

export const dataService = new DataService(); 