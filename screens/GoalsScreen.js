import React, { useContext, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { DeviceContext } from '../App';
import { useGoals } from '../hooks/useData';

// Memoized goal step component
const GoalStep = React.memo(({ step, onToggle }) => (
  <TouchableOpacity style={styles.stepItem} onPress={() => onToggle(step.id)}>
    <View style={[styles.checkbox, step.completed && styles.checkboxCompleted]}>
      {step.completed && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={[styles.stepText, step.completed && styles.stepTextCompleted]}>
      {step.title}
    </Text>
  </TouchableOpacity>
));

// Memoized goal card component
const GoalCard = React.memo(({ goal, onPress, onToggleStep, onAddStep, isExpanded }) => (
  <View style={styles.goalCard}>
    <TouchableOpacity style={styles.goalHeader} onPress={() => onPress(goal.id)}>
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
      
      <Text style={styles.expandIcon}>{isExpanded ? '⌄' : '⌃'}</Text>
    </TouchableOpacity>
    
    {isExpanded && (
      <View style={styles.stepsContainer}>
        {goal.steps && goal.steps.map(step => (
          <GoalStep 
            key={step.id} 
            step={step} 
            onToggle={(stepId) => onToggleStep(goal.id, stepId)}
          />
        ))}
        
        <TouchableOpacity 
          style={styles.addStepButton}
          onPress={() => onAddStep(goal)}
        >
          <Text style={styles.addStepText}>+ Add Step</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
));

export default function GoalsScreen({ navigation }) {
  const { hasTouchscreen } = useContext(DeviceContext);
  const { goals, updateGoal } = useGoals();
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newStepTitle, setNewStepTitle] = useState('');

  // Navigate to Home when swiped right
  const handleSwipeRight = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // Navigate to Home
  const navigateToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  // Toggle goal expansion
  const handleGoalPress = useCallback((goalId) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  }, [expandedGoal]);

  // Toggle step completion
  const handleToggleStep = useCallback((goalId, stepId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.steps) return;

    const updatedSteps = goal.steps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    const completedSteps = updatedSteps.filter(step => step.completed).length;
    
    updateGoal(goalId, {
      steps: updatedSteps,
      completed: completedSteps
    });
  }, [goals, updateGoal]);

  // Open add step modal
  const handleAddStep = useCallback((goal) => {
    setSelectedGoal(goal);
    setNewStepTitle('');
    setModalVisible(true);
  }, []);

  // Add new step to goal
  const addStepToGoal = useCallback(() => {
    if (!selectedGoal || !newStepTitle.trim()) return;

    const newStep = {
      id: `${selectedGoal.id}-${Date.now()}`,
      title: newStepTitle.trim(),
      completed: false
    };

    const goal = goals.find(g => g.id === selectedGoal.id);
    const updatedSteps = [...(goal.steps || []), newStep];
    
    updateGoal(selectedGoal.id, {
      steps: updatedSteps,
      total: updatedSteps.length
    });

    setNewStepTitle('');
    setModalVisible(false);
  }, [selectedGoal, newStepTitle, goals, updateGoal]);

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
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onPress={handleGoalPress}
              onToggleStep={handleToggleStep}
              onAddStep={handleAddStep}
              isExpanded={expandedGoal === goal.id}
            />
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

      {/* Add Step Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Step to "{selectedGoal?.title}"
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter step description..."
              value={newStepTitle}
              onChangeText={setNewStepTitle}
              autoFocus
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addStepToGoal}
                disabled={!newStepTitle.trim()}
              >
                <Text style={[styles.saveButtonText, !newStepTitle.trim() && styles.disabledText]}>
                  Add Step
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  expandIcon: {
    fontSize: 20,
    color: '#666',
    marginLeft: 8,
  },
  stepsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4a90e2',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4a90e2',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  addStepButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addStepText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
}); 