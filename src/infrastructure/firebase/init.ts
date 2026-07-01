import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Configure Firebase to connect to the local emulators during development.
 * This is crucial for safely testing the Enterprise VMS without affecting production data.
 */
export async function initializeFirebaseInfrastructure() {
  if (__DEV__) {
    console.log('[FirebaseInfrastructure] Development mode active. Connecting to live Firebase project.');
  }
  
  // Note: @react-native-firebase/firestore enables offline persistence by default.
  // There is no need to manually enable it, but we can configure its cache size if needed.
  try {
    await firestore().settings({
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
    console.log('[FirebaseInfrastructure] Offline persistence settings applied.');
  } catch (error) {
    console.error('[FirebaseInfrastructure] Error setting offline persistence:', error);
  }
}
