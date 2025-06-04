import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DeviceContext } from '../App';

export default function HomeScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>FocusPatch</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        {hasTouchscreen ? (
          <Text style={styles.navigationHint}>Touch interface detected</Text>
        ) : (
          <Text style={styles.navigationHint}>Keyboard interface detected</Text>
        )}
      </View>
    
      <ScrollView style={styles.content}>
        <View style={styles.calendarContainer}>
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>Monday</Text>
              <Text style={styles.dayDate}>Dec 16</Text>
            </View>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>Work meeting</Text>
              <Text style={styles.taskTime}>9:00 AM</Text>
            </View>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>Study React</Text>
              <Text style={styles.taskTime}>2:00 PM</Text>
            </View>
          </View>
          
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>Tuesday</Text>
              <Text style={styles.dayDate}>Dec 17</Text>
            </View>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>Call Mom</Text>
              <Text style={styles.taskTime}>6:00 PM</Text>
            </View>
          </View>
          
          <View style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>Wednesday</Text>
              <Text style={styles.dayDate}>Dec 18</Text>
            </View>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>Work on project</Text>
              <Text style={styles.taskTime}>10:00 AM</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.upcomingContainer}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          
          <View style={styles.upcomingTask}>
            <View style={styles.upcomingIconContainer}>
              <Text style={styles.upcomingIcon}>👍</Text>
            </View>
            <View style={styles.upcomingDetails}>
              <Text style={styles.upcomingTitle}>Doctor Appointment</Text>
            </View>
            <Text style={styles.upcomingDate}>Today</Text>
          </View>
          
          <View style={styles.upcomingTask}>
            <View style={styles.upcomingIconContainer}>
              <Text style={styles.upcomingIcon}>☰</Text>
            </View>
            <View style={styles.upcomingDetails}>
              <Text style={styles.upcomingTitle}>Complete FocusPatch MVP</Text>
            </View>
            <Text style={styles.upcomingDate}>This week</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.navButtonText}>Goals →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.navButtonText}>Settings ⚙️</Text>
        </TouchableOpacity>
      </View>
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
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  settingsIcon: {
    fontSize: 24,
  },
  navigationHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  dayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayDate: {
    fontSize: 14,
    color: '#888',
  },
  taskCard: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
  },
  taskTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskTime: {
    color: '#fff',
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  upcomingTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  upcomingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingIcon: {
    fontSize: 16,
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    color: '#333',
  },
  upcomingDate: {
    fontSize: 14,
    color: '#888',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  navButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 