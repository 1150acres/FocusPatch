import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DeviceContext } from '../App';

export default function GoalsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const goals = [
    { id: '1', title: 'Start a podcast', completed: 3, total: 6 },
    { id: '2', title: 'Learn React Native', completed: 2, total: 5 },
    { id: '3', title: 'Complete FocusPatch MVP', completed: 1, total: 4 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Goals</Text>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={navigateToHome}
          >
            <Text style={styles.homeIcon}>←</Text>
          </TouchableOpacity>
        </View>
        {hasTouchscreen ? (
          <Text style={styles.navigationHint}>← Touch to return to Home</Text>
        ) : (
          <Text style={styles.navigationHint}>Press Left Arrow or 'H' key for Home</Text>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {goals.map(goal => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  {width: `${(goal.completed / goal.total) * 100}%`}
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {goal.completed}/{goal.total} steps completed
            </Text>
          </View>
        ))}
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
  navigationHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  goalItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
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