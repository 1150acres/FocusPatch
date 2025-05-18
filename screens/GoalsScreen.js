import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

// Mock data for goals
const mockGoals = [
  { 
    id: '1', 
    title: 'Start a podcast', 
    completed: 3, 
    total: 10,
    icon: '🧠'
  },
  { 
    id: '2', 
    title: 'Finish reading', 
    completed: 6, 
    total: 8,
    icon: '📖',
    subtitle: '2 chapters left'
  },
  { 
    id: '3', 
    title: 'Get fit', 
    completed: 0, 
    total: 10,
    icon: '💪'
  },
];

export default function GoalsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {mockGoals.map(goal => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalIconContainer}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
            </View>
            
            <View style={styles.goalDetails}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.subtitle ? (
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
              ) : (
                <Text style={styles.goalProgress}>
                  {goal.completed}/{goal.total} steps completed
                </Text>
              )}
              
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    {width: `${(goal.completed / goal.total) * 100}%`}
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addGoalButton}>
          <Text style={styles.addGoalText}>Add new goal</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
  },
  addGoalButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  backButton: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4a90e2',
  },
}); 