import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { auth } from '../config/firebase';
import { getCurrentLocation, LocationData } from '../utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, EmergencyContact } from './users';

// Constants
const OFFLINE_SOS_QUEUE_KEY = 'offline_sos_queue';

// Types
export interface SOSMessage {
  id?: string;
  userId: string;
  userName?: string;
  phoneNumber?: string;
  location?: LocationData;
  message: string;
  timestamp: Timestamp;
  status: SOSStatus;
}

export enum SOSStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

/**
 * Sends an SOS message
 * @param message - Optional custom message
 * @returns The created SOS message
 */
export const sendSOS = async (message: string = 'I need help!'): Promise<SOSMessage | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const location = await getCurrentLocation();
    const userProfile = await getUserProfile();
    
    const sosData: SOSMessage = {
      userId: currentUser.uid,
      userName: userProfile?.displayName,
      phoneNumber: currentUser.phoneNumber || undefined,
      location,
      message,
      timestamp: Timestamp.now(),
      status: SOSStatus.PENDING
    };
    
    // Try to send to Firestore
    try {
      const sosRef = await addDoc(collection(firestore, 'sos_messages'), sosData);
      return { ...sosData, id: sosRef.id };
    } catch (error) {
      // If sending to Firestore fails, queue for offline sending
      await queueOfflineSOS(sosData);
      return null;
    }
  } catch (error) {
    console.error('Error sending SOS:', error);
    throw error;
  }
};

/**
 * Queues an SOS message for sending when back online
 * @param sosMessage - The SOS message to queue
 */
export const queueOfflineSOS = async (sosMessage: SOSMessage): Promise<void> => {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(OFFLINE_SOS_QUEUE_KEY);
    const queue: SOSMessage[] = queueString ? JSON.parse(queueString) : [];
    
    // Add new message to queue
    queue.push(sosMessage);
    
    // Save updated queue
    await AsyncStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(queue));
    
    // Try to send SMS via Twilio if we have emergency contacts
    await sendSOSViaSMS(sosMessage);
  } catch (error) {
    console.error('Error queuing offline SOS:', error);
    throw error;
  }
};

/**
 * Sends an SOS message via SMS using Twilio
 * @param sosMessage - The SOS message to send
 */
export const sendSOSViaSMS = async (sosMessage: SOSMessage): Promise<void> => {
  try {
    const userProfile = await getUserProfile();
    
    if (!userProfile || !userProfile.emergencyContacts || userProfile.emergencyContacts.length === 0) {
      console.log('No emergency contacts to send SMS to');
      return;
    }
    
    // In a real implementation, this would call a Cloud Function that uses Twilio
    // to send SMS messages to emergency contacts
    console.log('Would send SMS to emergency contacts:', userProfile.emergencyContacts);
    
    // This is a placeholder for the actual implementation
    // In a real app, you would use a Cloud Function to handle this securely
    /*
    const locationText = sosMessage.location 
      ? `Location: ${sosMessage.location.latitude},${sosMessage.location.longitude}` 
      : 'Location unavailable';
      
    const smsText = `EMERGENCY: ${userProfile.displayName || 'A SafeHaven user'} needs help! ${sosMessage.message}. ${locationText}`;
    
    // Call Cloud Function to send SMS
    // await fetch('https://your-cloud-function-url', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     contacts: userProfile.emergencyContacts,
    //     message: smsText
    //   })
    // });
    */
  } catch (error) {
    console.error('Error sending SOS via SMS:', error);
    // Don't throw here, as this is a fallback mechanism
  }
};

/**
 * Processes any queued offline SOS messages
 * @returns The number of messages processed
 */
export const processOfflineSOSQueue = async (): Promise<number> => {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(OFFLINE_SOS_QUEUE_KEY);
    if (!queueString) return 0;
    
    const queue: SOSMessage[] = JSON.parse(queueString);
    if (queue.length === 0) return 0;
    
    // Try to send each message
    let successCount = 0;
    const remainingQueue: SOSMessage[] = [];
    
    for (const sosMessage of queue) {
      try {
        await addDoc(collection(firestore, 'sos_messages'), sosMessage);
        successCount++;
      } catch (error) {
        // Keep in queue if sending fails
        remainingQueue.push(sosMessage);
      }
    }
    
    // Update queue with remaining messages
    await AsyncStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    return successCount;
  } catch (error) {
    console.error('Error processing offline SOS queue:', error);
    return 0;
  }
};

/**
 * Gets the user's SOS history
 * @param limit - Maximum number of messages to retrieve
 * @returns An array of SOS messages
 */
export const getUserSOSHistory = async (messageLimit: number = 10): Promise<SOSMessage[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const sosQuery = query(
      collection(firestore, 'sos_messages'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );
    
    const querySnapshot = await getDocs(sosQuery);
    const messages: SOSMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as SOSMessage);
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting SOS history:', error);
    throw error;
  }
};

/**
 * Subscribes to SOS messages for admin dashboard
 * @param callback - Function to call with SOS messages
 * @param messageLimit - Maximum number of messages to retrieve
 * @returns A function to unsubscribe
 */
export const subscribeToSOSMessages = (
  callback: (messages: SOSMessage[]) => void,
  messageLimit: number = 50
): Unsubscribe => {
  const sosQuery = query(
    collection(firestore, 'sos_messages'),
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );
  
  return onSnapshot(sosQuery, (querySnapshot) => {
    const messages: SOSMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as SOSMessage);
    });
    
    callback(messages);
  });
};
