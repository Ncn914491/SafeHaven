import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getCurrentLocation, LocationData } from '../utils/location';
import { auth } from '../config/firebase';

// Types
export interface UserProfile {
  uid: string;
  phoneNumber?: string;
  displayName?: string;
  emergencyContacts?: EmergencyContact[];
  status: UserStatus;
  lastLocation?: LocationData;
  lastStatusUpdate?: number;
  isAnonymous: boolean;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relation?: string;
}

export enum UserStatus {
  UNKNOWN = 'unknown',
  SAFE = 'safe',
  NEED_HELP = 'need_help',
  EMERGENCY = 'emergency'
}

/**
 * Gets the current user's profile from Firestore
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
    
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    
    return {
      uid: currentUser.uid,
      phoneNumber: currentUser.phoneNumber || undefined,
      displayName: userData.displayName,
      emergencyContacts: userData.emergencyContacts || [],
      status: userData.status || UserStatus.UNKNOWN,
      lastLocation: userData.lastLocation,
      lastStatusUpdate: userData.lastStatusUpdate,
      isAnonymous: currentUser.isAnonymous
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Updates the user's profile
 * @param updates - The fields to update
 */
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Updates the user's status with current location
 * @param status - The new status
 */
export const updateUserStatus = async (status: UserStatus): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const location = await getCurrentLocation();
    
    const updates: any = {
      status,
      lastStatusUpdate: Date.now()
    };
    
    if (location) {
      updates.lastLocation = location;
    }
    
    await updateDoc(doc(firestore, 'users', currentUser.uid), updates);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Marks the user as safe with current location
 */
export const markAsSafe = async (): Promise<void> => {
  await updateUserStatus(UserStatus.SAFE);
};

/**
 * Adds an emergency contact to the user's profile
 * @param contact - The emergency contact to add
 */
export const addEmergencyContact = async (contact: EmergencyContact): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User document not found');
    
    const userData = userDoc.data();
    const emergencyContacts = userData.emergencyContacts || [];
    
    // Check if contact already exists
    const contactExists = emergencyContacts.some(
      (c: EmergencyContact) => c.phoneNumber === contact.phoneNumber
    );
    
    if (contactExists) {
      throw new Error('Contact already exists');
    }
    
    // Add new contact
    await updateDoc(userRef, {
      emergencyContacts: [...emergencyContacts, contact]
    });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

/**
 * Removes an emergency contact from the user's profile
 * @param phoneNumber - The phone number of the contact to remove
 */
export const removeEmergencyContact = async (phoneNumber: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User document not found');
    
    const userData = userDoc.data();
    const emergencyContacts = userData.emergencyContacts || [];
    
    // Filter out the contact to remove
    const updatedContacts = emergencyContacts.filter(
      (c: EmergencyContact) => c.phoneNumber !== phoneNumber
    );
    
    await updateDoc(userRef, {
      emergencyContacts: updatedContacts
    });
  } catch (error) {
    console.error('Error removing emergency contact:', error);
    throw error;
  }
};
