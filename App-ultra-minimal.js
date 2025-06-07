import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppUltraMinimal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 FocusPatch Ultra Minimal</Text>
      <Text style={styles.subtitle}>Testing basic React Native Web</Text>
      <Text style={styles.status}>✅ If you see this, the core is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
}); 