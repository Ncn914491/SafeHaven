import { 
  ref, 
  push, 
  set, 
  onValue, 
  query, 
  orderByChild, 
  startAt, 
  endAt, 
  off,
  get,
  update,
  remove,
  DatabaseReference
} from 'firebase/database';
import { database } from '../config/firebase';
import { getCurrentLocation, calculateDistance, LocationData } from '../utils/location';
import { DEFAULT_ALERT_RADIUS_KM } from '@env';

// Types
export interface Alert {
  id?: string;
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  location: LocationData;
  createdAt: number;
  expiresAt: number;
  createdBy: string;
  isActive: boolean;
}

export enum AlertType {
  NATURAL_DISASTER = 'natural_disaster',
  FIRE = 'fire',
  MEDICAL = 'medical',
  SECURITY = 'security',
  INFRASTRUCTURE = 'infrastructure',
  OTHER = 'other'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Creates a new alert in the database
 * @param alert - The alert data to create
 * @returns The created alert with its ID
 */
export const createAlert = async (alert: Omit<Alert, 'id'>): Promise<Alert> => {
  try {
    const alertsRef = ref(database, 'alerts');
    const newAlertRef = push(alertsRef);
    const alertWithId = { ...alert, id: newAlertRef.key };
    
    await set(newAlertRef, alertWithId);
    return alertWithId;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Updates an existing alert
 * @param alertId - The ID of the alert to update
 * @param updates - The fields to update
 */
export const updateAlert = async (alertId: string, updates: Partial<Alert>): Promise<void> => {
  try {
    const alertRef = ref(database, `alerts/${alertId}`);
    await update(alertRef, updates);
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

/**
 * Deactivates an alert
 * @param alertId - The ID of the alert to deactivate
 */
export const deactivateAlert = async (alertId: string): Promise<void> => {
  try {
    await updateAlert(alertId, { isActive: false });
  } catch (error) {
    console.error('Error deactivating alert:', error);
    throw error;
  }
};

/**
 * Deletes an alert
 * @param alertId - The ID of the alert to delete
 */
export const deleteAlert = async (alertId: string): Promise<void> => {
  try {
    const alertRef = ref(database, `alerts/${alertId}`);
    await remove(alertRef);
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

/**
 * Gets an alert by ID
 * @param alertId - The ID of the alert to get
 * @returns The alert data or null if not found
 */
export const getAlertById = async (alertId: string): Promise<Alert | null> => {
  try {
    const alertRef = ref(database, `alerts/${alertId}`);
    const snapshot = await get(alertRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Alert;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting alert:', error);
    throw error;
  }
};

/**
 * Subscribes to alerts within a specified radius of the user's current location
 * @param callback - Function to call with nearby alerts
 * @param radiusKm - Radius in kilometers to search for alerts (default from env)
 * @returns A function to unsubscribe from alerts
 */
export const subscribeToNearbyAlerts = async (
  callback: (alerts: Alert[]) => void,
  radiusKm: number = Number(DEFAULT_ALERT_RADIUS_KM) || 5
): Promise<() => void> => {
  try {
    // Get current location
    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Could not get current location');
    }
    
    // Reference to all active alerts
    const alertsRef = ref(database, 'alerts');
    const activeAlertsQuery = query(
      alertsRef,
      orderByChild('isActive'),
      startAt(true),
      endAt(true)
    );
    
    // Subscribe to active alerts
    const onAlertsUpdate = onValue(activeAlertsQuery, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const allAlerts: Alert[] = [];
      snapshot.forEach((childSnapshot) => {
        const alert = childSnapshot.val() as Alert;
        
        // Check if alert is within radius
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          alert.location.latitude,
          alert.location.longitude
        );
        
        if (distance <= radiusKm) {
          allAlerts.push(alert);
        }
      });
      
      // Sort alerts by severity and creation time
      allAlerts.sort((a, b) => {
        // First by severity (critical first)
        const severityOrder = {
          [AlertSeverity.CRITICAL]: 0,
          [AlertSeverity.HIGH]: 1,
          [AlertSeverity.MEDIUM]: 2,
          [AlertSeverity.LOW]: 3
        };
        
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        
        // Then by creation time (newest first)
        return b.createdAt - a.createdAt;
      });
      
      callback(allAlerts);
    });
    
    // Return unsubscribe function
    return () => {
      off(activeAlertsQuery, 'value', onAlertsUpdate);
    };
  } catch (error) {
    console.error('Error subscribing to nearby alerts:', error);
    throw error;
  }
};
