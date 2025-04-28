import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import EmergencyModeScreen from '../screens/auth/EmergencyModeScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import AlertsScreen from '../screens/main/AlertsScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SOSScreen from '../screens/main/SOSScreen';

// Detail Screens
import AlertDetailScreen from '../screens/details/AlertDetailScreen';
import ShelterDetailScreen from '../screens/details/ShelterDetailScreen';
import ReportDetailScreen from '../screens/details/ReportDetailScreen';
import GroupDetailScreen from '../screens/details/GroupDetailScreen';

// Form Screens
import CreateReportScreen from '../screens/forms/CreateReportScreen';
import CreateGroupScreen from '../screens/forms/CreateGroupScreen';
import AddContactScreen from '../screens/forms/AddContactScreen';

// Auth Service
import { getCurrentUser } from '../services/auth';

// Types
import { RootStackParamList, MainTabParamList } from '../types/navigation';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'SOS') {
            iconName = 'alert-circle';
            color = '#ff3b30'; // Always red for SOS
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="SOS" component={SOSScreen} options={{ headerShown: false, tabBarLabel: 'SOS' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // You could return a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
          </>
        ) : (
          // Main app screens
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="AlertDetail" 
              component={AlertDetailScreen} 
              options={{ headerShown: true, title: 'Alert Details' }} 
            />
            <Stack.Screen 
              name="ShelterDetail" 
              component={ShelterDetailScreen} 
              options={{ headerShown: true, title: 'Shelter Information' }} 
            />
            <Stack.Screen 
              name="ReportDetail" 
              component={ReportDetailScreen} 
              options={{ headerShown: true, title: 'Report Details' }} 
            />
            <Stack.Screen 
              name="GroupDetail" 
              component={GroupDetailScreen} 
              options={{ headerShown: true, title: 'Group Details' }} 
            />
            <Stack.Screen 
              name="CreateReport" 
              component={CreateReportScreen} 
              options={{ headerShown: true, title: 'Report Suspicious Activity' }} 
            />
            <Stack.Screen 
              name="CreateGroup" 
              component={CreateGroupScreen} 
              options={{ headerShown: true, title: 'Create Family Group' }} 
            />
            <Stack.Screen 
              name="AddContact" 
              component={AddContactScreen} 
              options={{ headerShown: true, title: 'Add Emergency Contact' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
