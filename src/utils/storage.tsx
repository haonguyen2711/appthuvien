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

// Cross-platform storage utility
class StorageService {
  private isWeb(): boolean {
    return Platform.OS === 'web' || typeof window !== 'undefined';
  }

  private isSecureStoreAvailable(): boolean {
    return SecureStore && SecureStore.getItemAsync && !this.isWeb();
  }

  // Get item from storage (SecureStore on mobile, localStorage on web)
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb()) {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      }
      
      if (this.isSecureStoreAvailable()) {
        return await SecureStore.getItemAsync(key);
      }
      
      // Fallback to localStorage if SecureStore is not available
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  // Set item in storage
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb()) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      
      if (this.isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      
      // Fallback to localStorage if SecureStore is not available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  // Remove item from storage
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb()) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      
      if (this.isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
      
      // Fallback to localStorage if SecureStore is not available
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  // Check if storage is available
  isAvailable(): boolean {
    try {
      if (this.isWeb()) {
        return typeof Storage !== 'undefined' && typeof localStorage !== 'undefined';
      }
      return this.isSecureStoreAvailable() || typeof localStorage !== 'undefined';
    } catch (error) {
      return false;
    }
  }
}

export default new StorageService();
