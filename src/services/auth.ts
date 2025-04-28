import { 
  PhoneAuthProvider, 
  signInWithCredential, 
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const USER_AUTH_KEY = 'user_auth_state';

/**
 * Sends a verification code to the provided phone number
 * @param phoneNumber - The phone number to send the verification code to
 * @param recaptchaVerifier - The reCAPTCHA verifier instance
 * @returns A verification ID to be used with confirmPhoneAuth
 */
export const sendPhoneVerification = async (phoneNumber: string, recaptchaVerifier: any) => {
  try {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return verificationId;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * Confirms the phone authentication with the verification code
 * @param verificationId - The verification ID from sendPhoneVerification
 * @param verificationCode - The verification code entered by the user
 * @returns The user credential
 */
export const confirmPhoneAuth = async (verificationId: string, verificationCode: string) => {
  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    const userCredential = await signInWithCredential(auth, credential);
    
    // Save user data to Firestore if it's a new user
    const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        phoneNumber: userCredential.user.phoneNumber,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'unknown',
        lastLocation: null,
        emergencyContacts: []
      });
    } else {
      // Update last login time
      await updateDoc(doc(firestore, 'users', userCredential.user.uid), {
        lastLogin: new Date()
      });
    }
    
    // Save auth state to AsyncStorage
    await AsyncStorage.setItem(USER_AUTH_KEY, JSON.stringify({
      uid: userCredential.user.uid,
      phoneNumber: userCredential.user.phoneNumber,
      isAnonymous: userCredential.user.isAnonymous
    }));
    
    return userCredential.user;
  } catch (error) {
    console.error('Error confirming verification code:', error);
    throw error;
  }
};

/**
 * Signs in anonymously for emergency mode
 * @returns The anonymous user
 */
export const signInEmergencyMode = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    
    // Save minimal user data to Firestore
    await setDoc(doc(firestore, 'users', userCredential.user.uid), {
      isAnonymous: true,
      createdAt: new Date(),
      lastLogin: new Date(),
      status: 'unknown',
      lastLocation: null
    });
    
    // Save auth state to AsyncStorage
    await AsyncStorage.setItem(USER_AUTH_KEY, JSON.stringify({
      uid: userCredential.user.uid,
      isAnonymous: userCredential.user.isAnonymous
    }));
    
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem(USER_AUTH_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Gets the current authentication state from AsyncStorage
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async (): Promise<{
  uid: string;
  phoneNumber?: string;
  isAnonymous: boolean;
} | null> => {
  try {
    const userAuth = await AsyncStorage.getItem(USER_AUTH_KEY);
    return userAuth ? JSON.parse(userAuth) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listens for authentication state changes
 * @param callback - The callback to call when the auth state changes
 * @returns An unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
