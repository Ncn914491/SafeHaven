import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import { auth } from '../config/firebase';
import { getCurrentLocation, LocationData } from '../utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const OFFLINE_REPORTS_QUEUE_KEY = 'offline_reports_queue';

// Types
export interface Report {
  id?: string;
  title: string;
  description: string;
  location?: LocationData;
  timestamp: Timestamp;
  userId: string;
  isAnonymous: boolean;
  mediaUrls: string[];
  status: ReportStatus;
  category: ReportCategory;
}

export enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export enum ReportCategory {
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  INFRASTRUCTURE_DAMAGE = 'infrastructure_damage',
  HAZARD = 'hazard',
  CRIME = 'crime',
  OTHER = 'other'
}

export interface ReportMedia {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

/**
 * Creates a new report with optional media
 * @param reportData - The report data
 * @param media - Optional media files to upload
 * @returns The created report
 */
export const createReport = async (
  reportData: Omit<Report, 'id' | 'timestamp' | 'userId' | 'mediaUrls' | 'status'>,
  media?: ReportMedia[]
): Promise<Report | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    // Get current location if not provided
    let location = reportData.location;
    if (!location) {
      location = await getCurrentLocation();
    }
    
    const report: Omit<Report, 'id'> = {
      ...reportData,
      location,
      timestamp: Timestamp.now(),
      userId: currentUser.uid,
      mediaUrls: [],
      status: ReportStatus.PENDING
    };
    
    // Try to upload to Firestore and Storage
    try {
      // Upload media files if provided
      if (media && media.length > 0) {
        const mediaUrls = await uploadReportMedia(media);
        report.mediaUrls = mediaUrls;
      }
      
      // Save report to Firestore
      const reportRef = await addDoc(collection(firestore, 'reports'), report);
      return { ...report, id: reportRef.id };
    } catch (error) {
      // If sending to Firestore fails, queue for offline sending
      if (media && media.length > 0) {
        // Store media locally for later upload
        await queueOfflineReport(report, media);
        return null;
      } else {
        await queueOfflineReport(report);
        return null;
      }
    }
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

/**
 * Uploads media files for a report
 * @param media - The media files to upload
 * @returns Array of download URLs
 */
export const uploadReportMedia = async (media: ReportMedia[]): Promise<string[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const mediaUrls: string[] = [];
    
    for (const item of media) {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${currentUser.uid}_${timestamp}_${item.name}`;
      const storageRef = ref(storage, `reports/${filename}`);
      
      // Convert URI to blob
      const response = await fetch(item.uri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      mediaUrls.push(downloadUrl);
    }
    
    return mediaUrls;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

/**
 * Queues a report for sending when back online
 * @param report - The report to queue
 * @param media - Optional media files to queue
 */
export const queueOfflineReport = async (
  report: Omit<Report, 'id'>,
  media?: ReportMedia[]
): Promise<void> => {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(OFFLINE_REPORTS_QUEUE_KEY);
    const queue: Array<{ report: Omit<Report, 'id'>, media?: ReportMedia[] }> = 
      queueString ? JSON.parse(queueString) : [];
    
    // Add new report to queue
    queue.push({ report, media });
    
    // Save updated queue
    await AsyncStorage.setItem(OFFLINE_REPORTS_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queuing offline report:', error);
    throw error;
  }
};

/**
 * Processes any queued offline reports
 * @returns The number of reports processed
 */
export const processOfflineReportQueue = async (): Promise<number> => {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(OFFLINE_REPORTS_QUEUE_KEY);
    if (!queueString) return 0;
    
    const queue: Array<{ report: Omit<Report, 'id'>, media?: ReportMedia[] }> = JSON.parse(queueString);
    if (queue.length === 0) return 0;
    
    // Try to send each report
    let successCount = 0;
    const remainingQueue: Array<{ report: Omit<Report, 'id'>, media?: ReportMedia[] }> = [];
    
    for (const item of queue) {
      try {
        let mediaUrls: string[] = [];
        
        // Upload media if available
        if (item.media && item.media.length > 0) {
          mediaUrls = await uploadReportMedia(item.media);
        }
        
        // Update report with media URLs
        const reportWithMedia = {
          ...item.report,
          mediaUrls
        };
        
        // Save to Firestore
        await addDoc(collection(firestore, 'reports'), reportWithMedia);
        successCount++;
      } catch (error) {
        // Keep in queue if sending fails
        remainingQueue.push(item);
      }
    }
    
    // Update queue with remaining reports
    await AsyncStorage.setItem(OFFLINE_REPORTS_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    return successCount;
  } catch (error) {
    console.error('Error processing offline report queue:', error);
    return 0;
  }
};

/**
 * Gets the user's report history
 * @param limit - Maximum number of reports to retrieve
 * @returns An array of reports
 */
export const getUserReports = async (reportLimit: number = 10): Promise<Report[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const reportsQuery = query(
      collection(firestore, 'reports'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(reportLimit)
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    const reports: Report[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      } as Report);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting user reports:', error);
    throw error;
  }
};

/**
 * Gets a report by ID
 * @param reportId - The ID of the report
 * @returns The report or null if not found
 */
export const getReportById = async (reportId: string): Promise<Report | null> => {
  try {
    const reportDoc = await getDoc(doc(firestore, 'reports', reportId));
    
    if (!reportDoc.exists()) return null;
    
    return {
      id: reportDoc.id,
      ...reportDoc.data()
    } as Report;
  } catch (error) {
    console.error('Error getting report:', error);
    throw error;
  }
};

/**
 * Subscribes to reports for admin dashboard
 * @param callback - Function to call with reports
 * @param reportLimit - Maximum number of reports to retrieve
 * @returns A function to unsubscribe
 */
export const subscribeToReports = (
  callback: (reports: Report[]) => void,
  reportLimit: number = 50
): Unsubscribe => {
  const reportsQuery = query(
    collection(firestore, 'reports'),
    orderBy('timestamp', 'desc'),
    limit(reportLimit)
  );
  
  return onSnapshot(reportsQuery, (querySnapshot) => {
    const reports: Report[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      } as Report);
    });
    
    callback(reports);
  });
};
