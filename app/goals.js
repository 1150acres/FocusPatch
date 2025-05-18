import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function Goals() {
  const goals = [
    { id: '1', title: 'Start a podcast', completed: 3, total: 10 },
    { id: '2', title: 'Learn React Native', completed: 2, total: 8 },
    { id: '3', title: 'Complete FocusPatch MVP', completed: 1, total: 5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals Screen</Text>
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
              {goal.completed}/{goal.total} steps
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Back to Home</Text>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  goalItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  link: {
    margin: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
  }
}); 