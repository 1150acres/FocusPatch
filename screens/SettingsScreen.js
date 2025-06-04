import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { DeviceContext } from '../App';

export default function SettingsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);
  const [debugMode, setDebugMode] = useState(false);

  const navigateToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={navigateToHome}
          >
            <Text style={styles.homeIcon}>←</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>Debug Mode</Text>
              <Text style={styles.settingSubtitle}>Show additional debug information</Text>
            </View>
            <Switch
              value={debugMode}
              onValueChange={setDebugMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={debugMode ? '#4a90e2' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
        
      <TouchableOpacity 
        style={styles.backButton}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  homeButton: {
    padding: 8,
    borderRadius: 20,
  },
  homeIcon: {
    fontSize: 24,
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  settingCard: {
    backgroundColor: '#fff',
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
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  backButton: {
    backgroundColor: '#4a90e2',
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
