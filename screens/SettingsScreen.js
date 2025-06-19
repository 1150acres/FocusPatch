import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { DeviceContext } from '../contexts/DeviceContext';

export default function SettingsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);
  
  // Local state for dark mode that actually works
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        const darkMode = savedTheme === 'dark';
        setIsDarkMode(darkMode);
        
        // Apply web CSS variables immediately
        if (Platform.OS === 'web') {
          const root = document.documentElement;
          if (darkMode) {
            root.setAttribute('data-theme', 'dark');
          } else {
            root.removeAttribute('data-theme');
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Toggle dark mode and persist
  const toggleTheme = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    try {
      await AsyncStorage.setItem('themePreference', newDarkMode ? 'dark' : 'light');
      console.log('🎨 Theme saved:', newDarkMode ? 'dark' : 'light');
      
      // Apply web CSS variables if on web platform
      if (Platform.OS === 'web') {
        const root = document.documentElement;
        if (newDarkMode) {
          root.setAttribute('data-theme', 'dark');
        } else {
          root.removeAttribute('data-theme');
        }
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Theme colors based on isDarkMode state
  const colors = {
    background: isDarkMode ? '#121212' : '#ffffff',
    surface: isDarkMode ? '#1E1E1E' : '#f5f5f5',
    primary: '#2979FF',
    secondary: isDarkMode ? '#00E676' : '#00C853',
    textPrimary: isDarkMode ? '#E0E0E0' : '#212121',
    textSecondary: isDarkMode ? '#A0A0A0' : '#616161',
    divider: isDarkMode ? '#373737' : '#e0e0e0',
    hover: isDarkMode ? '#2A2A2A' : '#f0f0f0',
    caret: isDarkMode ? '#E0E0E0' : '#212121',
  };

  const navigateToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my FocusPatch instance!',
        url: 'exp://192.168.1.56:8081',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={navigateToHome}
          >
            <Text style={[styles.homeIcon, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.surface }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Settings</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.background }]}>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Switch between light and dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.background }]}>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Debug Mode</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Show additional debug information</Text>
            </View>
            <Switch
              value={debugMode}
              onValueChange={(value) => {
                setDebugMode(value);
                if (value) setShowQR(true);
              }}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={debugMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {debugMode && (
            <View style={styles.debugSection}>
              <Text style={[styles.debugTitle, { color: colors.textPrimary }]}>Debug Information</Text>
              <View style={[styles.debugCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>Platform: {Platform.OS}</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>Touchscreen: {hasTouchscreen ? 'Yes' : 'No'}</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>Server: exp://192.168.1.56:8081</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>Theme: {isDarkMode ? 'Dark' : 'Light'}</Text>
              </View>

              {showQR && (
                <View style={[styles.qrContainer, { backgroundColor: colors.background }]}>
                  <QRCode
                    value="exp://192.168.1.56:8081"
                    size={200}
                    backgroundColor={colors.background}
                    color={colors.textPrimary}
                  />
                  <TouchableOpacity 
                    style={[styles.shareButton, { backgroundColor: colors.primary }]}
                    onPress={handleShare}
                  >
                    <Text style={styles.shareButtonText}>Share Instance</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
        
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={navigateToHome}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  homeButton: {
    padding: 8,
    borderRadius: 20,
  },
  homeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingDetails: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  debugSection: {
    marginTop: 16,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
  },
  qrContainer: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shareButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
 