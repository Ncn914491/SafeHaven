// src/screens/details/AlertDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AlertDetailScreen = ({ route }) => {
  const { title, description, time } = route?.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || 'No Alert Title'}</Text>
      <Text style={styles.description}>{description || 'No description available.'}</Text>
      <Text style={styles.time}>{time || 'No timestamp provided.'}</Text>
    </View>
  );
};

export default AlertDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  time: {
    fontSize: 14,
    color: 'gray',
  },
});
