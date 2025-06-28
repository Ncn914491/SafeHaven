import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation';
import { requestLocationPermissions } from './src/utils/location';

// Web-specific imports
import WebApp from './web/App';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  useEffect(() => {
    // Request location permissions when the app starts (mobile only)
    if (Platform.OS !== 'web') {
      requestLocationPermissions();
    }
  }, []);

  // Render web app for web platform
  if (Platform.OS === 'web') {
    return <WebApp />;
  }

  // Render mobile app for mobile platforms
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
