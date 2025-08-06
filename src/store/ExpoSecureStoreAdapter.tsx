import { Platform } from 'react-native';

// Conditionally import SecureStore only on native platforms
let SecureStore: any = null;
try {
  if (Platform.OS !== 'web') {
    SecureStore = require('expo-secure-store');
  }
} catch (error) {
  console.warn('SecureStore not available, using localStorage fallback');
}

// Helper function to clean keys for SecureStore
const cleanKey = (key: string): string => {
  // Remove any characters that are not alphanumeric, ".", "-", or "_"
  // and ensure key is not empty
  const cleanedKey = key.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleanedKey || 'default_key';
};

// Fallback storage for web platform (since SecureStore doesn't work on web)
const webStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available, using memory storage');
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage not available');
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage not available');
    }
  }
};

// Check if we're on web platform
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Check if SecureStore is available
const isSecureStoreAvailable = () => {
  return SecureStore && SecureStore.getItemAsync && !isWeb;
};

// Adapter for redux-persist to use Expo SecureStore (mobile) or localStorage (web)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      const cleanedKey = cleanKey(key);
      console.log(`Getting item with key: ${cleanedKey} on ${Platform.OS}`);
      
      // Use localStorage on web platform
      if (isWeb) {
        return webStorage.getItem(cleanedKey);
      }
      
      // Use SecureStore on mobile platforms only
      if (isSecureStoreAvailable()) {
        const value = await SecureStore.getItemAsync(cleanedKey);
        return value;
      } else {
        console.warn('SecureStore not available, falling back to localStorage');
        return webStorage.getItem(cleanedKey);
      }
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      const cleanedKey = cleanKey(key);
      console.log(`Setting item with key: ${cleanedKey} on ${Platform.OS}`);
      
      // Use localStorage on web platform
      if (isWeb) {
        webStorage.setItem(cleanedKey, value);
        return;
      }
      
      // Use SecureStore on mobile platforms only
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(cleanedKey, value);
      } else {
        console.warn('SecureStore not available, falling back to localStorage');
        webStorage.setItem(cleanedKey, value);
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      const cleanedKey = cleanKey(key);
      console.log(`Removing item with key: ${cleanedKey} on ${Platform.OS}`);
      
      // Use localStorage on web platform
      if (isWeb) {
        webStorage.removeItem(cleanedKey);
        return;
      }
      
      // Use SecureStore on mobile platforms only
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(cleanedKey);
      } else {
        console.warn('SecureStore not available, falling back to localStorage');
        webStorage.removeItem(cleanedKey);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

export default ExpoSecureStoreAdapter;
