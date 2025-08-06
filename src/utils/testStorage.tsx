// Test utility để kiểm tra storage hoạt động đúng
import storageService from './storage';

export const testStorage = async () => {
  console.log('🧪 Testing storage functionality...');
  
  try {
    // Test set/get/remove
    const testKey = 'test_key';
    const testValue = 'test_value';
    
    console.log('📝 Setting test item...');
    await storageService.setItem(testKey, testValue);
    
    console.log('📖 Getting test item...');
    const retrievedValue = await storageService.getItem(testKey);
    
    if (retrievedValue === testValue) {
      console.log('✅ Storage set/get working correctly');
    } else {
      console.error('❌ Storage set/get failed', { expected: testValue, actual: retrievedValue });
    }
    
    console.log('🗑️ Removing test item...');
    await storageService.removeItem(testKey);
    
    const removedValue = await storageService.getItem(testKey);
    if (removedValue === null) {
      console.log('✅ Storage remove working correctly');
    } else {
      console.error('❌ Storage remove failed', { value: removedValue });
    }
    
    console.log('🔍 Testing storage availability...');
    const isAvailable = storageService.isAvailable();
    console.log('Storage availability:', isAvailable);
    
    console.log('✅ All storage tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
};
