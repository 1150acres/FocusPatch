import { registerRootComponent } from 'expo';
import App from './App';
import AppMinimalTest from './App-minimal-test';
import AppStepByStep from './App-step-by-step';
import AppWebCompatible from './App-web-compatible';

// Register the main App component
// Testing web-compatible version with real HomeScreen
registerRootComponent(AppWebCompatible); 