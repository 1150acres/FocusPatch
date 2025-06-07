import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppDebug() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎯 FocusPatch Debug Mode</Text>
      <Text style={styles.subtext}>If you can see this, React Native Web is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
}); 