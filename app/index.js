import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FocusPatch Home</Text>
        <Link href="/goals" style={styles.link}>
          <Text style={styles.linkText}>Go to Goals</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  link: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
  }
}); 