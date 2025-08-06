// Cấu hình bảo mật cho debug features
export const DEBUG_CONFIG = {
  // Các chức năng chỉ được phép trong development
  ENABLE_API_TESTING: __DEV__ && false, // Tắt API testing hoàn toàn
  ENABLE_ERROR_TESTING: __DEV__ && false, // Tắt error testing
  ENABLE_CONSOLE_LOGS: __DEV__ && false, // Tắt console.log
  ENABLE_API_MONITOR: __DEV__ && false, // Tắt API monitoring UI
  
  // Production safety
  STRIP_DEBUG_IN_PRODUCTION: !__DEV__,
};

// Safe console log wrapper
export const secureLog = (...args: any[]) => {
  if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log(...args);
  }
};

// Safe console error wrapper  
export const secureError = (...args: any[]) => {
  if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.error(...args);
  }
};

// Check if debug features should be available
export const canUseDebugFeatures = () => {
  return __DEV__ && !DEBUG_CONFIG.STRIP_DEBUG_IN_PRODUCTION;
};

// Check specific debug feature
export const canUseApiTesting = () => {
  return DEBUG_CONFIG.ENABLE_API_TESTING && canUseDebugFeatures();
};

export const canUseErrorTesting = () => {
  return DEBUG_CONFIG.ENABLE_ERROR_TESTING && canUseDebugFeatures();
};

export const canUseApiMonitor = () => {
  return DEBUG_CONFIG.ENABLE_API_MONITOR && canUseDebugFeatures();
};
