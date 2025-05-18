// TODO: Add real Firebase config later

export function initFirebase() {
  // Placeholder for Firebase initialization
  console.log("Firebase placeholder initialized");
}

export function getTasks() {
  // Mock data for development
  return [
    { id: '1', title: 'Team meeting', time: '10:00 AM', completed: false },
    { id: '2', title: 'Write report', time: '1:00 PM', completed: false },
  ];
}

export function getGoals() {
  // Mock data for development
  return [
    { 
      id: '1', 
      title: 'Start a podcast', 
      completed: 3, 
      total: 10 
    },
    { 
      id: '2', 
      title: 'Learn React Native', 
      completed: 2, 
      total: 8 
    },
  ];
} 