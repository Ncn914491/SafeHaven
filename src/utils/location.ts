import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

// Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

/**
 * Requests location permissions from the user
 * @returns A boolean indicating if permissions were granted
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'SafeHaven needs location access to show nearby alerts and resources. Please enable location services in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Request background location permissions on supported platforms
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location',
          'For the best experience, please allow SafeHaven to access your location in the background. This helps us send you critical alerts even when the app is closed.',
          [{ text: 'OK' }]
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Gets the current location of the device
 * @returns The current location data or null if unavailable
 */
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      const permissionGranted = await requestLocationPermissions();
      if (!permissionGranted) return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Starts watching the user's location with updates
 * @param callback - Function to call with location updates
 * @returns A function to stop watching location
 */
export const watchLocation = async (
  callback: (location: LocationData) => void
): Promise<() => void> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      const permissionGranted = await requestLocationPermissions();
      if (!permissionGranted) throw new Error('Location permission not granted');
    }
    
    const watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        });
      }
    );
    
    return () => {
      watchId.remove();
    };
  } catch (error) {
    console.error('Error watching location:', error);
    throw error;
  }
};

/**
 * Calculates the distance between two points in kilometers
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns The distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Converts degrees to radians
 * @param deg - Degrees
 * @returns Radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
