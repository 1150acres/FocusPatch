import { createContext } from 'react';
 
// Create a context to share touchscreen capability across components
export const DeviceContext = createContext({
  hasTouchscreen: false,
  isKeyboardListenerActive: false,
}); 