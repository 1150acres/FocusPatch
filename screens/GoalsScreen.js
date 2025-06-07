import React, { useContext, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { DeviceContext } from '../contexts/DeviceContext';
import { useGoals } from '../hooks/useData';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
const GoalCard = React.memo(({ goal, onPress, onLongPress, onToggleStep, onAddStep, isExpanded }) => (
          <View key={goal.id} style={styles.goalCard}>
    <TouchableOpacity 
      style={styles.goalHeader} 
      onPress={() => onPress(goal.id)} 
      onLongPress={onLongPress}
    >
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

export default function GoalsScreen() {
  const navigation = useNavigation();
  const { hasTouchscreen } = useContext(DeviceContext);
  const { goals, addGoal, removeGoal, updateGoal } = useGoals();
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [expandedGoals, setExpandedGoals] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSubtitle, setNewGoalSubtitle] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Debug logging
  useEffect(() => {
    console.log('Current goals:', goals);
  }, [goals]);

  const handleSwipe = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const toggleGoalExpansion = useCallback((goalId) => {
    console.log('Toggling goal expansion:', goalId);
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  }, []);

  const handleStepToggle = useCallback((goalId, stepId) => {
    console.log('Toggling step:', goalId, stepId);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedSteps = goal.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    const completedCount = updatedSteps.filter(step => step.completed).length;
    updateGoal(goalId, {
      steps: updatedSteps,
      completed: completedCount,
      total: updatedSteps.length
    });
  }, [goals, updateGoal]);

  const handleAddStep = useCallback(() => {
    if (!selectedGoal || !newStepTitle.trim()) return;

    const goal = goals.find(g => g.id === selectedGoal);
    if (!goal) return;

    const newStep = {
      id: `step-${Date.now()}`,
      title: newStepTitle.trim(),
      completed: false
    };

    const updatedSteps = [...goal.steps, newStep];
    updateGoal(selectedGoal, {
      steps: updatedSteps,
      total: updatedSteps.length
    });

    setNewStepTitle('');
    setShowModal(false);
    setSelectedGoal(null);
  }, [selectedGoal, newStepTitle, goals, updateGoal]);

  // Add new goal
  const handleAddGoal = useCallback(() => {
    setNewGoalTitle('');
    setNewGoalSubtitle('');
    setNewGoalIcon('🎯');
    setNewGoalModalVisible(true);
  }, []);

  // Create new goal
  const createNewGoal = useCallback(() => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      subtitle: newGoalSubtitle.trim(),
      icon: newGoalIcon,
      completed: 0,
      total: 0,
      steps: [],
      createdAt: new Date().toISOString()
    };

    addGoal(newGoal);
    setNewGoalModalVisible(false);
    setNewGoalTitle('');
    setNewGoalSubtitle('');
    setNewGoalIcon('🎯');
  }, [newGoalTitle, newGoalSubtitle, newGoalIcon, addGoal]);

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
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddGoal}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {goals && goals.length > 0 ? (
          goals.map(goal => (
            <GoalCard 
              key={goal.id}
              goal={goal}
              onPress={toggleGoalExpansion}
              onLongPress={() => {
                Haptics.selectionAsync();
                setSelectedGoalId(goal.id);
                setContextMenuVisible(true);
              }}
              onToggleStep={handleStepToggle}
              onAddStep={() => {
                setSelectedGoal(goal.id);
                setShowModal(true);
              }}
              isExpanded={expandedGoals[goal.id]}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No goals yet. Add your first goal!</Text>
          </View>
        )}
      </ScrollView>

      {/* CONTEXT‐MENU MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={contextMenuVisible}
        onRequestClose={() => setContextMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPressOut={() => setContextMenuVisible(false)}
        >
          <View
            style={{
              width: 260,
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'stretch'
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#eee'
              }}
              onPress={async () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                if (selectedGoalId) {
                  await removeGoal(selectedGoalId);
                }
                setContextMenuVisible(false);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>
                Delete Goal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setContextMenuVisible(false)}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      {/* Add Step Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Step</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter step description"
              value={newStepTitle}
              onChangeText={setNewStepTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setSelectedGoal(null);
                  setNewStepTitle('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddStep}
              >
                <Text style={styles.modalButtonText}>Add Step</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newGoalModalVisible}
        onRequestClose={() => setNewGoalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Goal title"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Goal description (optional)"
              value={newGoalSubtitle}
              onChangeText={setNewGoalSubtitle}
            />
            <View style={styles.iconSelector}>
              <TouchableOpacity 
                style={[styles.iconButton, newGoalIcon === '🎯' && styles.selectedIcon]}
                onPress={() => setNewGoalIcon('🎯')}
              >
                <Text style={styles.iconText}>🎯</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, newGoalIcon === '📚' && styles.selectedIcon]}
                onPress={() => setNewGoalIcon('📚')}
              >
                <Text style={styles.iconText}>📚</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, newGoalIcon === '💪' && styles.selectedIcon]}
                onPress={() => setNewGoalIcon('💪')}
              >
                <Text style={styles.iconText}>💪</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, newGoalIcon === '🎨' && styles.selectedIcon]}
                onPress={() => setNewGoalIcon('🎨')}
              >
                <Text style={styles.iconText}>🎨</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewGoalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={createNewGoal}
              >
                <Text style={styles.modalButtonText}>Create Goal</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#4a90e2',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  iconSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    backgroundColor: '#4a90e2',
  },
  iconText: {
    fontSize: 24,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
}); 