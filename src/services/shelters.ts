import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDoc, 
  doc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { calculateDistance, LocationData } from '../utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const SHELTERS_CACHE_KEY = 'shelters_cache';
const SHELTERS_CACHE_EXPIRY_KEY = 'shelters_cache_expiry';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Types
export interface Shelter {
  id: string;
  name: string;
  address: string;
  location: LocationData;
  capacity: number;
  currentOccupancy?: number;
  type: ShelterType;
  amenities: string[];
  contactPhone?: string;
  isActive: boolean;
  lastUpdated: number;
}

export enum ShelterType {
  EVACUATION = 'evacuation',
  EMERGENCY = 'emergency',
  LONG_TERM = 'long_term',
  MEDICAL = 'medical',
  FOOD = 'food',
  WATER = 'water'
}

/**
 * Gets all active shelters
 * @param forceRefresh - Whether to force a refresh from Firestore
 * @returns An array of shelters
 */
export const getAllShelters = async (forceRefresh: boolean = false): Promise<Shelter[]> => {
  try {
    // Try to get from cache first
    if (!forceRefresh) {
      const cachedShelters = await getSheltersFromCache();
      if (cachedShelters) return cachedShelters;
    }
    
    // Get from Firestore
    const sheltersQuery = query(
      collection(firestore, 'shelters'),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(sheltersQuery);
    const shelters: Shelter[] = [];
    
    querySnapshot.forEach((doc) => {
      shelters.push({
        id: doc.id,
        ...doc.data()
      } as Shelter);
    });
    
    // Cache the results
    await cacheShelters(shelters);
    
    return shelters;
  } catch (error) {
    console.error('Error getting shelters:', error);
    
    // If Firestore fails, try to get from cache as fallback
    const cachedShelters = await getSheltersFromCache();
    if (cachedShelters) return cachedShelters;
    
    throw error;
  }
};

/**
 * Gets shelters near a location
 * @param location - The location to search near
 * @param radiusKm - Radius in kilometers to search
 * @param types - Optional filter for shelter types
 * @returns An array of nearby shelters
 */
export const getNearbyShelters = async (
  location: LocationData,
  radiusKm: number = 10,
  types?: ShelterType[]
): Promise<Shelter[]> => {
  try {
    // Get all shelters (potentially from cache)
    const allShelters = await getAllShelters();
    
    // Filter by distance and type
    return allShelters.filter((shelter) => {
      // Check distance
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        shelter.location.latitude,
        shelter.location.longitude
      );
      
      const isNearby = distance <= radiusKm;
      
      // Check type if specified
      const matchesType = !types || types.length === 0 || types.includes(shelter.type);
      
      return isNearby && matchesType;
    });
  } catch (error) {
    console.error('Error getting nearby shelters:', error);
    throw error;
  }
};

/**
 * Gets a shelter by ID
 * @param shelterId - The ID of the shelter
 * @returns The shelter or null if not found
 */
export const getShelterById = async (shelterId: string): Promise<Shelter | null> => {
  try {
    const shelterDoc = await getDoc(doc(firestore, 'shelters', shelterId));
    
    if (!shelterDoc.exists()) return null;
    
    return {
      id: shelterDoc.id,
      ...shelterDoc.data()
    } as Shelter;
  } catch (error) {
    console.error('Error getting shelter:', error);
    throw error;
  }
};

/**
 * Subscribes to a shelter's data for real-time updates
 * @param shelterId - The ID of the shelter
 * @param callback - Function to call with shelter data
 * @returns A function to unsubscribe
 */
export const subscribeToShelter = (
  shelterId: string,
  callback: (shelter: Shelter | null) => void
): Unsubscribe => {
  const shelterRef = doc(firestore, 'shelters', shelterId);
  
  return onSnapshot(shelterRef, (doc) => {
    if (!doc.exists()) {
      callback(null);
      return;
    }
    
    callback({
      id: doc.id,
      ...doc.data()
    } as Shelter);
  });
};

/**
 * Caches shelters in AsyncStorage
 * @param shelters - The shelters to cache
 */
const cacheShelters = async (shelters: Shelter[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SHELTERS_CACHE_KEY, JSON.stringify(shelters));
    await AsyncStorage.setItem(SHELTERS_CACHE_EXPIRY_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching shelters:', error);
    // Non-critical error, can be ignored
  }
};

/**
 * Gets shelters from AsyncStorage cache
 * @returns The cached shelters or null if cache is invalid
 */
const getSheltersFromCache = async (): Promise<Shelter[] | null> => {
  try {
    const expiryString = await AsyncStorage.getItem(SHELTERS_CACHE_EXPIRY_KEY);
    if (!expiryString) return null;
    
    const expiry = parseInt(expiryString, 10);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - expiry > CACHE_EXPIRY_MS) return null;
    
    const sheltersString = await AsyncStorage.getItem(SHELTERS_CACHE_KEY);
    if (!sheltersString) return null;
    
    return JSON.parse(sheltersString) as Shelter[];
  } catch (error) {
    console.error('Error getting shelters from cache:', error);
    return null;
  }
};
