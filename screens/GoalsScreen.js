import React, { useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { DeviceContext } from '../App';
import { useGoals } from '../hooks/useData';

// Memoized goal card component
const GoalCard = React.memo(({ goal }) => (
  <View style={styles.goalCard}>
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
));

export default function GoalsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);
  const { goals } = useGoals();

  // Navigate to Home when swiped right
  const handleSwipeRight = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // Navigate to Home
  const navigateToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // Render swipe actions
  const renderLeftActions = useCallback(() => {
    return (
      <View style={styles.swipeActions}>
        <Text style={styles.swipeText}>← Home</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Swipeable
        renderLeftActions={renderLeftActions}
        onSwipeableLeftOpen={handleSwipeRight}
        friction={2}
        leftThreshold={40}
        enabled={hasTouchscreen}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
          {hasTouchscreen ? (
            <Text style={styles.navigationHint}>← Swipe right for Home</Text>
          ) : (
            <Text style={styles.navigationHint}>Press Left Arrow or 'H' key for Home</Text>
          )}
        </View>
      
        <ScrollView style={styles.content}>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          <TouchableOpacity style={styles.addGoalButton}>
            <Text style={styles.addGoalText}>Add new goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </Swipeable>
      
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  swipeActions: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    width: 100,
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: '#e0e0e0',
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
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addGoalText: {
    color: '#888',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 