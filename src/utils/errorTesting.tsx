// Test utility để kiểm tra enhanced error handling
import api from '../services/api';
import { showErrorToUser } from './errorDisplay';

export const testEnhancedErrorHandling = async () => {
  console.log('🧪 Testing Enhanced Error Handling...');
  
  const tests = [
    {
      name: 'Network Error Test',
      test: async () => {
        try {
          // Test với URL không tồn tại
          await api.get('/nonexistent-endpoint');
        } catch (error) {
          console.log('✅ Network Error Test:', error);
          return error;
        }
      }
    },
    {
      name: 'Validation Error Test',
      test: async () => {
        try {
          // Test với data không hợp lệ
          await api.post('/auth/login', { invalid: 'data' });
        } catch (error) {
          console.log('✅ Validation Error Test:', error);
          return error;
        }
      }
    },
    {
      name: 'Auth Error Test',
      test: async () => {
        try {
          // Test với endpoint cần auth
          await api.get('/users/profile');
        } catch (error) {
          console.log('✅ Auth Error Test:', error);
          return error;
        }
      }
    }
  ];

  console.log('📊 Running Error Handling Tests...');
  
  for (const testCase of tests) {
    console.log(`\n🔧 Running: ${testCase.name}`);
    try {
      const error = await testCase.test();
      
      // Kiểm tra error structure
      console.log('Error Structure Check:');
      console.log('• Has isApiError:', !!(error as any)?.isApiError);
      console.log('• Has details:', !!(error as any)?.details);
      console.log('• Has response data:', !!(error as any)?.details?.response?.data);
      console.log('• Has request data:', !!(error as any)?.details?.request);
      console.log('• Message:', (error as any)?.message);
      
      // Test error display
      if (error) {
        showErrorToUser(error, `Test: ${testCase.name}`);
      }
      
    } catch (testError) {
      console.error(`❌ Test failed: ${testCase.name}`, testError);
    }
  }
  
  console.log('\n✅ Enhanced Error Handling Tests Completed!');
  console.log('Check console logs và error displays để xem kết quả chi tiết.');
};

// Test specific error scenarios
export const testSpecificErrorScenarios = {
  // Test validation error với response data chi tiết
  validationError: async () => {
    try {
      await api.post('/auth/register', {
        username: '', // Invalid data
        email: 'invalid-email',
        password: '123' // Too short
      });
    } catch (error) {
      console.log('🔍 Validation Error Details:');
      console.log('• Error:', error);
      console.log('• Response Data:', (error as any)?.details?.response?.data);
      console.log('• Validation Errors:', (error as any)?.details?.validationErrors);
      return error;
    }
  },

  // Test server error với response headers
  serverError: async () => {
    try {
      // Simulate server error
      await api.get('/admin/system-error-test');
    } catch (error) {
      console.log('🔍 Server Error Details:');
      console.log('• Error:', error);
      console.log('• Response Headers:', (error as any)?.details?.response?.headers);
      console.log('• Stack Trace:', (error as any)?.details?.stack);
      return error;
    }
  },

  // Test timeout error
  timeoutError: async () => {
    try {
      // Create a request that will timeout
      await api.get('/slow-endpoint', { timeout: 1000 });
    } catch (error) {
      console.log('🔍 Timeout Error Details:');
      console.log('• Error:', error);
      console.log('• Code:', (error as any)?.details?.code);
      console.log('• Context:', (error as any)?.details?.context);
      return error;
    }
  }
};

// Main test runner
export const runAllErrorTests = async () => {
  console.log('🚀 Starting Comprehensive Error Handling Tests...');
  
  // Basic error handling test
  await testEnhancedErrorHandling();
  
  console.log('\n📋 Testing Specific Scenarios...');
  
  // Specific scenario tests
  const scenarios = Object.entries(testSpecificErrorScenarios);
  for (const [name, testFn] of scenarios) {
    console.log(`\n🎯 Testing: ${name}`);
    try {
      await testFn();
    } catch (error) {
      console.log(`✅ ${name} completed:`, (error as any)?.message);
    }
  }
  
  console.log('\n🎉 All Error Handling Tests Completed!');
  console.log('Check DevTools API Monitor để xem detailed logs.');
};
