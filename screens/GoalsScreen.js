import React, { useContext, useCallback, useState, useEffect, useRef } from 'react';
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
  FlatList,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { DeviceContext } from '../contexts/DeviceContext';
import { useGoals } from '../hooks/useData';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Emoji data organized by categories (like Telegram)
const EMOJI_CATEGORIES = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
    '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅',
    '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',
    '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩'
  ],
  'Food & Drink': [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
    '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭',
    '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'
  ],
  'Activities': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿',
    '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️',
    '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊',
    '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'
  ],
  'Travel & Places': [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵',
    '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🪂', '💺', '🚀', '🛰️', '🚉', '🚊', '🚝', '🚞',
    '🚋', '🚃', '🚂', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚃', '🚂', '🚄',
    '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚃', '🚂', '🚄', '🚅', '🚆', '🚇', '🚈',
    '⛵', '🛥️', '🚤', '⛴️', '🛳️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🗺️'
  ],
  'Objects': [
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼',
    '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
    '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸',
    '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️',
    '🪓', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️'
  ],
  'Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️',
    '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯'
  ]
};

// Emoji Picker Component
const EmojiPicker = ({ visible, onClose, onSelectEmoji, currentEmoji }) => {
  const [selectedCategory, setSelectedCategory] = useState('Smileys & People');
  const categories = Object.keys(EMOJI_CATEGORIES);

  const renderEmoji = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.emojiItem,
        item === currentEmoji && styles.selectedEmojiItem
      ]}
      onPress={() => {
        onSelectEmoji(item);
        onClose();
      }}
    >
      <Text style={styles.emojiText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.selectedCategoryTabText
      ]}>
        {category.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.emojiPickerOverlay}>
        <View style={styles.emojiPickerContainer}>
          {/* Header */}
          <View style={styles.emojiPickerHeader}>
            <Text style={styles.emojiPickerTitle}>Choose Emoji</Text>
            <TouchableOpacity onPress={onClose} style={styles.emojiPickerClose}>
              <Text style={styles.emojiPickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {categories.map(renderCategoryTab)}
          </ScrollView>

          {/* Emoji Grid */}
          <FlatList
            data={EMOJI_CATEGORIES[selectedCategory]}
            renderItem={renderEmoji}
            numColumns={8}
            key={selectedCategory}
            style={styles.emojiGrid}
            contentContainerStyle={styles.emojiGridContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};



// Memoized goal step component
const GoalStep = React.memo(({ step, onToggle, onPress, isSelected, selectionMode, isActiveGoal }) => {
  const handleStepPress = (event) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('Step pressed:', step.id, 'selectionMode:', selectionMode, 'isActiveGoal:', isActiveGoal);
      onPress(event);
    }
  };

  const canSelect = Platform.OS === 'web' && typeof window !== 'undefined' && 
    (selectionMode === 'none' || (selectionMode === 'step' && isActiveGoal));
  
  const StepContainer = canSelect ? TouchableOpacity : View;
  const containerProps = canSelect ? { onPress: handleStepPress } : {};

  return (
    <StepContainer 
      style={[
        styles.stepItem,
        isSelected && styles.stepItemSelected
      ]}
      {...containerProps}
    >
      <TouchableOpacity 
        style={[styles.checkbox, step.completed && styles.checkboxCompleted]}
        onPress={() => onToggle(step.id)}
      >
        {step.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text style={[styles.stepText, step.completed && styles.stepTextCompleted]}>
        {step.title}
      </Text>
    </StepContainer>
  );
});
      
// Memoized goal card component
const GoalCard = React.memo(({ 
  goal, 
  onPress, 
  onLongPress, 
  onToggleStep, 
  onAddStep, 
  isExpanded,
  selectionMode,
  selectedItems,
  selectedGoalForSteps,
  onSelect
}) => {
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);
  
  const isGoalSelected = selectionMode === 'goal' && selectedItems.has(goal.id);
  const isInStepMode = selectionMode === 'step';
  const isActiveGoalForSteps = selectedGoalForSteps === goal.id;
  const shouldDimGoal = isInStepMode && !isActiveGoalForSteps;

  const handleGoalPress = (event) => {
    console.log('Goal pressed:', goal.id, 'event type:', event?.type);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (selectionMode === 'goal') {
        onSelect('goal', goal.id, event);
      } else if (selectionMode === 'step' && !isActiveGoalForSteps) {
        // Switch to this goal for step selection
        onSelect('switchGoal', goal.id, event);
      } else if (selectionMode === 'none') {
        // Start goal selection or expand goal
        if (event && (event.ctrlKey || event.metaKey)) {
          onSelect('goal', goal.id, event);
        } else {
          onPress(goal.id);
        }
      } else {
        onPress(goal.id);
      }
    } else {
      onPress(goal.id);
    }
  };

  const handleStepPress = (stepId, event) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (selectionMode === 'step' && isActiveGoalForSteps) {
        onSelect('step', stepId, event);
      } else if (selectionMode === 'none') {
        // Start step selection - the onSelect handler will set the goal
        onSelect('step', stepId, event);
      }
    }
  };

  const handleTouchStart = (event) => {
    if (Platform.OS !== 'web') {
      console.log('Touch start for goal:', goal.id);
      const timer = setTimeout(() => {
        console.log('Long press triggered via timer for goal:', goal.id);
        onLongPress(event);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = (event) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (Platform.OS !== 'web') {
      handleGoalPress(event);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <View 
      key={goal.id} 
      style={[
        styles.goalCard,
        isGoalSelected && styles.goalCardSelected,
        shouldDimGoal && styles.goalCardDimmed
      ]}
    >
      <View 
        style={[styles.goalHeader, { cursor: Platform.OS === 'web' ? 'pointer' : 'default' }]} 
        onTouchStart={Platform.OS !== 'web' ? handleTouchStart : undefined}
        onTouchEnd={Platform.OS !== 'web' ? handleTouchEnd : undefined}
        onTouchCancel={Platform.OS !== 'web' ? handleTouchCancel : undefined}
        onMouseDown={Platform.OS === 'web' ? () => console.log('🔥 Mouse down for goal:', goal.id) : undefined}
        onContextMenu={Platform.OS === 'web' ? (e) => {
          console.log('🔥 RIGHT CLICK DETECTED on goal:', goal.id);
          console.log('🔥 Event details:', e.type, e.button, e.clientX, e.clientY);
          e.preventDefault();
          e.stopPropagation();
          onLongPress(e);
        } : undefined}
        onClick={Platform.OS === 'web' ? handleGoalPress : undefined}
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
            
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>
                {goal.total > 0 ? `${Math.round((goal.completed / goal.total) * 100 / 5) * 5}%` : '0%'}
              </Text>
            </View>
      
            <Text style={styles.expandIcon}>{isExpanded ? '⌄' : '⌃'}</Text>
      </View>
    
      {isExpanded && (
        <View style={styles.stepsContainer}>
          {goal.steps && goal.steps.map(step => {
            const isStepSelected = selectionMode === 'step' && isActiveGoalForSteps && selectedItems.has(step.id);
            return (
              <GoalStep 
                key={step.id} 
                step={step} 
                onToggle={(stepId) => onToggleStep(goal.id, stepId)}
                onPress={(event) => handleStepPress(step.id, event)}
                isSelected={isStepSelected}
                selectionMode={selectionMode}
                isActiveGoal={isActiveGoalForSteps}
              />
            );
          })}
          
          <TouchableOpacity 
            style={styles.addStepButton}
            onPress={() => onAddStep(goal)}
          >
            <Text style={styles.addStepText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>
      )}
          </View>
  );
});

export default function GoalsScreen() {
  const navigation = useNavigation();
  const { hasTouchscreen } = useContext(DeviceContext);
  const { goals, addGoal, removeGoal, updateGoal } = useGoals();
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [expandedGoals, setExpandedGoals] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSubtitle, setNewGoalSubtitle] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Web-only selection state management
  const [selectionMode, setSelectionMode] = useState('none'); // 'none' | 'goal' | 'step'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedGoalForSteps, setSelectedGoalForSteps] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Current goals:', goals);
  }, [goals]);

  useEffect(() => {
    console.log('🟢 Context menu visible:', contextMenuVisible, 'Selected goal ID:', selectedGoalId);
  }, [contextMenuVisible, selectedGoalId]);

  useEffect(() => {
    console.log('🟢 selectedGoalId state changed to:', selectedGoalId);
  }, [selectedGoalId]);

  // Close context menu when clicking outside (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMouseDown = (e) => {
      if (contextMenuVisible) {
        // Check if the click is outside the context menu
        const contextMenuElement = e.target.closest('[data-context-menu]');
        if (!contextMenuElement) {
          console.log('🔵 [handleMouseDown] Clicking outside context menu, closing');
          setContextMenuVisible(false);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && contextMenuVisible) {
        setContextMenuVisible(false);
      }
    };

    if (contextMenuVisible) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenuVisible]);

  // Handle selection for goals and steps
  const handleSelection = useCallback((type, id, event = null) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('handleSelection called:', type, id, 'currentMode:', selectionMode);
      const isCtrlOrCmd = event && (event.ctrlKey || event.metaKey);
      
      if (type === 'goal') {
        // If nothing selected or switching from step mode, start goal selection
        if (selectionMode === 'none' || selectionMode === 'step') {
          setSelectionMode('goal');
          setSelectedGoalForSteps(null);
          setSelectedItems(new Set([id]));
        } 
        // If already in goal mode
        else if (selectionMode === 'goal') {
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (isCtrlOrCmd) {
              // Ctrl/Cmd+click: toggle
              if (newSet.has(id)) {
                newSet.delete(id);
              } else {
                newSet.add(id);
              }
            } else {
              // Regular click: replace selection
              newSet.clear();
              newSet.add(id);
            }
            
            // If no items selected, exit selection mode
            if (newSet.size === 0) {
              setSelectionMode('none');
            }
            
            return newSet;
          });
        }
      } 
      else if (type === 'step') {
        // Find which goal this step belongs to
        const goalId = selectedGoalForSteps || goals.find(g => 
          g.steps && g.steps.some(s => s.id === id)
        )?.id;
        
        if (!goalId) {
          console.log('Could not find goal for step:', id);
          return;
        }
        
        // If nothing selected or switching from goal mode, start step selection
        if (selectionMode === 'none' || selectionMode === 'goal') {
          setSelectionMode('step');
          setSelectedGoalForSteps(goalId);
          setSelectedItems(new Set([id]));
        }
        // If already in step mode for the same goal
        else if (selectionMode === 'step' && selectedGoalForSteps === goalId) {
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (isCtrlOrCmd) {
              // Ctrl/Cmd+click: toggle
              if (newSet.has(id)) {
                newSet.delete(id);
              } else {
                newSet.add(id);
              }
            } else {
              // Regular click: replace selection
              newSet.clear();
              newSet.add(id);
            }
            
            // If no items selected, exit selection mode
            if (newSet.size === 0) {
              setSelectionMode('none');
              setSelectedGoalForSteps(null);
            }
            
            return newSet;
          });
        }
        // If in step mode for different goal, switch to the new goal
        else if (selectionMode === 'step' && selectedGoalForSteps !== goalId) {
          setSelectedGoalForSteps(goalId);
          setSelectedItems(new Set([id]));
        }
      } 
      else if (type === 'switchGoal') {
        // Switch to step selection for a different goal
        setSelectionMode('step');
        setSelectedGoalForSteps(id);
        setSelectedItems(new Set());
      }
    }
  }, [selectionMode, selectedGoalForSteps, goals]);

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
  const createNewGoal = useCallback(async () => {
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

    try {
      await addGoal(newGoal);
      console.log('✅ New goal created and saved successfully');
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
      return;
    }

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

  // Get selection feedback text
  const getSelectionFeedback = () => {
    if (selectionMode === 'none' || selectedItems.size === 0) return null;
    
    if (selectionMode === 'goal') {
      const count = selectedItems.size;
      return `${count} goal${count === 1 ? '' : 's'} selected`;
    } else if (selectionMode === 'step') {
      const count = selectedItems.size;
      const goal = goals.find(g => g.id === selectedGoalForSteps);
      const goalName = goal ? goal.title : 'Unknown Goal';
      return `${count} step${count === 1 ? '' : 's'} in ${goalName}`;
    }
    return null;
  };

  const clearSelection = () => {
    setSelectionMode('none');
    setSelectedItems(new Set());
    setSelectedGoalForSteps(null);
  };

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

      {/* Selection Feedback Header */}
      {Platform.OS === 'web' && getSelectionFeedback() && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionText}>{getSelectionFeedback()}</Text>
          <TouchableOpacity 
            style={styles.clearSelectionButton}
            onPress={clearSelection}
          >
            <Text style={styles.clearSelectionText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

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
              onLongPress={(event) => {
                console.log('🟡 Long press triggered for goal:', goal.id);
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                
                console.log('🟡 Setting selectedGoalId to:', goal.id);
                setSelectedGoalId(goal.id);
                
                // Position context menu at mouse cursor for web, center for mobile
                if (Platform.OS === 'web' && event && event.clientX !== undefined) {
                  setContextMenuPosition({ x: event.clientX, y: event.clientY });
                  console.log('🟡 Context menu position set to:', { x: event.clientX, y: event.clientY });
                } else {
                  // For mobile or when no mouse position available, use center
                  setContextMenuPosition({ x: 0, y: 0 });
                  console.log('🟡 Context menu position set to center');
                }
                
                console.log('🟡 Setting context menu visible to true');
                setContextMenuVisible(true);
              }}
              onToggleStep={handleStepToggle}
              onAddStep={() => {
                setSelectedGoal(goal.id);
                setShowModal(true);
              }}
              isExpanded={expandedGoals[goal.id]}
              selectionMode={selectionMode}
              selectedItems={selectedItems}
              selectedGoalForSteps={selectedGoalForSteps}
              onSelect={handleSelection}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No goals yet. Add your first goal!</Text>
          </View>
        )}
      </ScrollView>

      {/* CONTEXT MENU (web only, native HTML) */}
      {contextMenuVisible && Platform.OS === 'web' && (
        <ul
          data-context-menu="true"
          style={{
            position: 'absolute',
            top: contextMenuPosition.y || 200,
            left: contextMenuPosition.x || 200,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 8,
            padding: '4px 0',
            minWidth: 140,
            zIndex: 1000,
            border: '1px solid #e0e0e0',
            margin: 0,
            listStyle: 'none',
          }}
          onClick={e => e.stopPropagation()}
        >
          <li
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#d32f2f',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={e => (e.target.style.backgroundColor = 'transparent')}
            onClick={async (e) => {
              e.stopPropagation();
              const selectedCount = selectionMode === 'goal' ? selectedItems.size : 1;
              console.log('🔵 [GoalContextMenu] Delete clicked, selectedCount:', selectedCount);
              if (selectionMode === 'goal' && selectedItems.size > 1) {
                // Delete all selected goals
                const idsToDelete = Array.from(selectedItems);
                await Promise.all(idsToDelete.map(id => removeGoal(id)));
              } else if (selectedGoalId) {
                // Delete single goal
                await removeGoal(selectedGoalId);
              } else {
                console.log('🔴 [GoalContextMenu] No selectedGoalId found');
              }
              clearSelection();
              setContextMenuVisible(false);
              console.log('🔵 [GoalContextMenu] Goal(s) deleted and menu closed');
            }}
          >
            {selectionMode === 'goal' && selectedItems.size > 1
              ? `Delete ${selectedItems.size} goals`
              : 'Delete Goal'}
          </li>
        </ul>
      )}
      {/* CONTEXT MENU (mobile/other platforms) */}
      {contextMenuVisible && Platform.OS !== 'web' && (
        <View
          data-context-menu="true"
          style={{
            position: 'absolute',
            top: contextMenuPosition.y || 200,
            left: contextMenuPosition.x || 200,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderRadius: 8,
            padding: 8,
            minWidth: 140,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        >
          <TouchableOpacity
            style={{ padding: 12 }}
            onPress={async () => {
              if (selectedGoalId) {
                try {
                  await removeGoal(selectedGoalId);
                  clearSelection();
                  setContextMenuVisible(false);
                } catch (error) {
                  console.error('Error removing goal:', error);
                }
              }
            }}
          >
            <Text style={{ fontSize: 14, color: '#d32f2f' }}>Delete Goal</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
              <Text style={styles.iconSelectorLabel}>Choose an icon:</Text>
              <TouchableOpacity 
                style={styles.emojiPickerButton}
                onPress={() => setEmojiPickerVisible(true)}
                onMouseEnter={(event) => {
                  if (Platform.OS === 'web') {
                    const button = event.currentTarget;
                    button.title = 'Click to open emoji picker';
                  }
                }}
              >
                <Text style={styles.currentEmoji}>{newGoalIcon}</Text>
                <Text style={styles.emojiPickerText}>Tap to change</Text>
              </TouchableOpacity>
              
              {/* Quick emoji options */}
              <View style={styles.quickEmojiRow}>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '🎯' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('🎯')}
                >
                  <Text style={styles.quickEmojiText}>🎯</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '📚' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('📚')}
                >
                  <Text style={styles.quickEmojiText}>📚</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '💪' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('💪')}
                >
                  <Text style={styles.quickEmojiText}>💪</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '🎨' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('🎨')}
                >
                  <Text style={styles.quickEmojiText}>🎨</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '🏆' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('🏆')}
                >
                  <Text style={styles.quickEmojiText}>🏆</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickEmojiButton, newGoalIcon === '⭐' && styles.selectedQuickEmoji]}
                  onPress={() => setNewGoalIcon('⭐')}
                >
                  <Text style={styles.quickEmojiText}>⭐</Text>
                </TouchableOpacity>
              </View>
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

      {/* Emoji Picker */}
      <EmojiPicker
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelectEmoji={setNewGoalIcon}
        currentEmoji={newGoalIcon}
      />
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
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  clearSelectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1976d2',
    borderRadius: 6,
  },
  clearSelectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  goalCardSelected: {
    borderWidth: 2,
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  goalCardDimmed: {
    opacity: 0.5,
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
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
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
  stepItemSelected: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    paddingLeft: 8,
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
    marginBottom: 16,
  },
  iconSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emojiPickerButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  currentEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiPickerText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  quickEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  quickEmojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  selectedQuickEmoji: {
    backgroundColor: '#4a90e2',
    transform: [{ scale: 1.1 }],
  },
  quickEmojiText: {
    fontSize: 20,
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
  // Emoji Picker Styles
  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxWidth: 350,
    height: 320,
    overflow: 'hidden',
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  emojiPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emojiPickerClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerCloseText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  categoryTabs: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryTabsContent: {
    paddingHorizontal: 8,
  },
  categoryTab: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 1,
    borderRadius: 4,
  },
  selectedCategoryTab: {
    backgroundColor: '#4a90e2',
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryTabText: {
    color: '#fff',
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    padding: 4,
  },
  emojiItem: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0.5,
    borderRadius: 4,
  },
  selectedEmojiItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  emojiText: {
    fontSize: 18,
  },
}); 