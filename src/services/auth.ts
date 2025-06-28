/** This file exports the functions that manage user authentication */
import {
  PhoneAuthProvider,
  signInWithCredential,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { UserRole, UserProfile } from '../config/firebase';

// Constants
const USER_AUTH_KEY = 'user_auth_state';

// Web storage helper functions
const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageItem = async (key: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

/**
 * Creates a user profile in Firestore
 * @param user - Firebase user object
 * @param role - User role
 * @param additionalData - Additional user data
 * @returns The created user profile
 */
const createUserProfile = async (
  user: User,
  role: UserRole = UserRole.USER,
  additionalData: Partial<UserProfile> = {}
): Promise<UserProfile> => {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || undefined,
    displayName: user.displayName || undefined,
    phoneNumber: user.phoneNumber || undefined,
    role,
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
    ...additionalData
  };

  await setDoc(doc(firestore, 'users', user.uid), userProfile);
  return userProfile;
};

/**
 * Gets a user profile from Firestore
 * @param uid - User ID
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!firestore) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Updates a user profile in Firestore
 * @param uid - User ID
 * @param updates - Profile updates
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!firestore) {
    throw new Error('Firestore is not initialized');
  }

  await updateDoc(doc(firestore, 'users', uid), {
    ...updates,
    updatedAt: new Date()
  });
};

/**
 * Signs up a new user with email and password
 * @param email - User email
 * @param password - User password
 * @param displayName - User display name
 * @param role - User role (defaults to USER)
 * @returns The created user
 */
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName?: string,
  role: UserRole = UserRole.USER
): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(userCredential.user, role, { displayName });

    // Save auth state to localStorage
    await setStorageItem(USER_AUTH_KEY, JSON.stringify({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role,
      isAnonymous: false
    }));

    return userCredential.user;
  } catch (error) {
    console.error('Error signing up with email and password:', error);
    throw error;
  }
};

/**
 * Signs in a user with email and password
 * @param email - User email
 * @param password - User password
 * @returns The signed-in user
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Get user profile to check role
    const userProfile = await getUserProfile(userCredential.user.uid);

    // Update last login time
    if (userProfile) {
      await updateUserProfile(userCredential.user.uid, { lastLogin: new Date() });
    }

    // Save auth state to localStorage
    await setStorageItem(USER_AUTH_KEY, JSON.stringify({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: userProfile?.role || UserRole.USER,
      isAnonymous: false
    }));

    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
};

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
  if (!auth || !firestore) {
    throw new Error('Firebase services are not initialized');
  }

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
    
    // Save auth state to localStorage
    await setStorageItem(USER_AUTH_KEY, JSON.stringify({
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
 * Signs in with Google using popup method
 * @returns The Google user
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    const provider = new GoogleAuthProvider();

    // Add required scopes for better user experience
    provider.addScope('email');
    provider.addScope('profile');

    // Set custom parameters for better UX and to avoid popup closing issues
    provider.setCustomParameters({
      prompt: 'select_account',
      hd: '', // Allow any domain
      include_granted_scopes: 'true'
    });

    console.log('[Auth] Initiating Google Sign-In with popup...');

    // Try popup first, fallback to redirect if it fails
    let userCredential;
    try {
      console.log('[Auth] Calling signInWithPopup...');
      userCredential = await signInWithPopup(auth, provider);
      console.log('[Auth] signInWithPopup promise resolved. User:', userCredential?.user?.email);
    } catch (popupError: any) {
      console.error('[Auth] signInWithPopup failed:', popupError);
      console.error('[Auth] Popup Error Code:', popupError.code);
      console.error('[Auth] Popup Error Message:', popupError.message);

      // If popup fails due to blocking or other issues, try redirect
      if (popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {

        console.log('[Auth] Popup specific error, attempting redirect method for Google Sign-In...');
        try {
          await signInWithRedirect(auth, provider);
          console.log('[Auth] signInWithRedirect initiated.');
          // The redirect will handle the rest, so we throw an error to stop further execution in this path.
          throw new Error('REDIRECT_IN_PROGRESS');
        } catch (redirectError: any) {
          console.error('[Auth] signInWithRedirect failed:', redirectError);
          throw redirectError; // Re-throw the error from signInWithRedirect
        }
      }
      // For other errors, re-throw the original popupError
      throw popupError;
    }

    if (!userCredential || !userCredential.user) {
      console.error('[Auth] Google Sign-In did not return a user credential.');
      throw new Error('Google Sign-In failed to return user credential.');
    }

    console.log('[Auth] Google Sign-In successful via popup. User:', userCredential.user.email);

    // Get additional user info from the credential
    const credential = GoogleAuthProvider.credentialFromResult(userCredential);
    const token = credential?.accessToken;

    if (token) {
      console.log('Google access token obtained successfully');
    }

    return await completeGoogleSignIn(userCredential.user);
  } catch (error: any) {
    if (error.message === 'REDIRECT_IN_PROGRESS') {
      throw error; // Re-throw redirect indicator
    }

    console.error('Error signing in with Google:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Provide more specific error messages
    let errorMessage = 'Failed to sign in with Google. Please try again.';

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized for Google Sign-In. Please contact support.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Another sign-in popup is already open. Please close it and try again.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google Sign-In is not enabled. Please contact support.';
    }

    throw new Error(errorMessage);
  }
};

/**
 * Handle Google Sign-In redirect result
 * @returns The Google user or null if no redirect result
 */
export const handleGoogleRedirectResult = async (): Promise<User | null> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    console.log('Checking for Google Sign-In redirect result...');
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      console.log('Google Sign-In redirect successful:', result.user.email);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        console.log('Google access token obtained from redirect');
      }

      return await completeGoogleSignIn(result.user);
    }

    return null;
  } catch (error: any) {
    console.error('Error handling Google redirect result:', error);
    throw error;
  }
};

/**
 * Complete Google Sign-In process (shared by popup and redirect methods)
 * @param user The Firebase user
 * @returns The Firebase user
 */
const completeGoogleSignIn = async (user: User): Promise<User> => {
  // Check if user profile exists
  let userProfile = await getUserProfile(user.uid);

  if (!userProfile) {
    // Create new user profile with default USER role
    console.log('Creating new user profile for Google user');
    userProfile = await createUserProfile(user, UserRole.USER);
  } else {
    // Update last login time
    console.log('Updating existing user profile');
    await updateUserProfile(user.uid, { lastLogin: new Date() });
  }

  // Save auth state to localStorage
  await setStorageItem(USER_AUTH_KEY, JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: userProfile.role,
    isAnonymous: false
  }));

  console.log('Google Sign-In completed successfully');
  return user;
};

/**
 * Signs in as a guest user
 * @returns The anonymous user
 */
export const signInAsGuest = async (): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    
    // Save auth state to localStorage
    await setStorageItem(USER_AUTH_KEY, JSON.stringify({
      uid: userCredential.user.uid,
      isAnonymous: true
    }));
    
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

/**
 * Checks if the current user has admin privileges
 * @returns True if user is admin, false otherwise
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const userProfile = await getUserProfile(currentUser.uid);
    return userProfile?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Gets the current user's role
 * @returns User role or null if not authenticated
 */
export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userProfile = await getUserProfile(currentUser.uid);
    return userProfile?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Creates an admin user (should only be used for initial setup)
 * @param email - Admin email
 * @param password - Admin password
 * @param displayName - Admin display name
 * @returns The created admin user
 */
export const createAdminUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  return signUpWithEmailAndPassword(email, password, displayName, UserRole.ADMIN);
};

/**
 * Signs out the current user and clears storage
 */
export const signOut = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    await firebaseSignOut(auth);
    await removeStorageItem(USER_AUTH_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Gets the current authentication state from localStorage
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async (): Promise<{
  uid: string;
  phoneNumber?: string;
  isAnonymous: boolean;
} | null> => {
  try {
    const userAuth = await getStorageItem(USER_AUTH_KEY);
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
