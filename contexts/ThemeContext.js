import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  console.log('🎨 [ThemeProvider] Initializing...');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Apply theme to web document when theme changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      applyWebTheme(isDarkMode);
    }
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      console.log('🎨 [ThemeContext] Loading theme preference...');
      const savedTheme = await AsyncStorage.getItem('themePreference');
      console.log('🎨 [ThemeContext] Saved theme:', savedTheme);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
      console.log('🎨 [ThemeContext] Theme loaded successfully');
    } catch (error) {
      console.error('🎨 [ThemeContext] Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
      console.log('🎨 [ThemeContext] Loading complete');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    try {
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const applyWebTheme = (darkMode) => {
    if (typeof document !== 'undefined') {
      // Remove existing theme CSS
      const existingStyle = document.getElementById('theme-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add new theme CSS
      const style = document.createElement('style');
      style.id = 'theme-css';
      style.textContent = `
        :root {
          --color-bg: ${darkMode ? '#121212' : '#ffffff'};
          --color-surface: ${darkMode ? '#1E1E1E' : '#f5f5f5'};
          --color-primary: #2979FF;
          --color-secondary: ${darkMode ? '#00E676' : '#00C853'};
          --text-primary: ${darkMode ? '#E0E0E0' : '#212121'};
          --text-secondary: ${darkMode ? '#A0A0A0' : '#616161'};
          --divider: ${darkMode ? '#373737' : '#e0e0e0'};
          --hover: ${darkMode ? '#2A2A2A' : '#f0f0f0'};
          --caret: ${darkMode ? '#E0E0E0' : '#212121'};
        }

        body {
          background-color: var(--color-bg);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#565869' : '#c0c0c0'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6c6d7a' : '#a0a0a0'};
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#565869 transparent' : '#c0c0c0 transparent'};
        }
      `;
      document.head.appendChild(style);

      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  };

  // Theme colors based on the design tokens
  const theme = {
    colors: {
      background: isDarkMode ? '#121212' : '#ffffff',
      surface: isDarkMode ? '#1E1E1E' : '#f5f5f5',
      primary: '#2979FF',
      secondary: isDarkMode ? '#00E676' : '#00C853',
      textPrimary: isDarkMode ? '#E0E0E0' : '#212121',
      textSecondary: isDarkMode ? '#A0A0A0' : '#616161',
      divider: isDarkMode ? '#373737' : '#e0e0e0',
      hover: isDarkMode ? '#2A2A2A' : '#f0f0f0',
      caret: isDarkMode ? '#E0E0E0' : '#212121',
    },
    isDarkMode,
    toggleTheme,
    isLoading,
  };

  console.log('🎨 [ThemeProvider] Theme object:', {
    isDarkMode,
    isLoading,
    backgroundColors: theme.colors.background,
  });

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 