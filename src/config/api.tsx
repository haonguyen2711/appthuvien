// Cấu hình API cho các môi trường khác nhau
export const API_CONFIG = {
  // Development - khi test trên máy local
  DEVELOPMENT: {
    BASE_URL: 'http://192.168.60.241:8080/api', // API server của bạn ở port 8080
    TIMEOUT: 30000,
  },
  
  // Production - khi deploy lên server thật
  PRODUCTION: {
    BASE_URL: 'https://your-domain.com/api', // Tuân theo tiêu chuẩn API document
    TIMEOUT: 30000,
  },
  
  // Mock - để test mà không cần server
  MOCK: {
    BASE_URL: 'https://jsonplaceholder.typicode.com', // API giả lập
    TIMEOUT: 10000,
  }
};

// Chọn môi trường hiện tại
export const CURRENT_ENV = __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION';

// Có thể thay đổi thành 'MOCK' để test mà không cần server thật
// export const CURRENT_ENV = 'MOCK';

export const getCurrentConfig = () => {
  return API_CONFIG[CURRENT_ENV as keyof typeof API_CONFIG];
};
