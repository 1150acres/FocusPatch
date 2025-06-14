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
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { DeviceContext } from '../contexts/DeviceContext';

export default function SettingsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);
  const [debugMode, setDebugMode] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
              onValueChange={(value) => {
                setDebugMode(value);
                if (value) setShowQR(true);
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={debugMode ? '#4a90e2' : '#f4f3f4'}
            />
          </View>

          {debugMode && (
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Debug Information</Text>
              <View style={styles.debugCard}>
                <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
                <Text style={styles.debugText}>Touchscreen: {hasTouchscreen ? 'Yes' : 'No'}</Text>
                <Text style={styles.debugText}>Server: exp://192.168.1.56:8081</Text>
              </View>

              {showQR && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value="exp://192.168.1.56:8081"
                    size={200}
                    backgroundColor="white"
                    color="black"
                  />
                  <TouchableOpacity 
                    style={styles.shareButton}
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
  debugSection: {
    marginTop: 16,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  debugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#4a90e2',
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
 