import { Alert } from 'react-native';
import { secureLog } from '../config/debugConfig';
import api from '../services/api';

// Interface cho API error với details
interface ApiError extends Error {
  details?: {
    status: number;
    statusText: string;
    message: string;
    data: any;
    code: string;
    config: {
      url: string;
      method: string;
      baseURL: string;
    };
    timestamp: string;
    validationErrors?: any[];
  };
  isApiError?: boolean;
}

// Test kết nối API
export const testApiConnection = async () => {
  try {
    secureLog('Testing API connection...');
    
    // Test endpoint đơn giản
    const response = await api.get('/health'); // hoặc endpoint nào đó của bạn
    
    secureLog('API Connection Success:', response.data);
    Alert.alert(
      'Thành công ✅', 
      `Kết nối API thành công!\n\nURL: ${response.config.baseURL}\nStatus: ${response.status}`
    );
    return true;
  } catch (error: any) {
    console.error('API Connection Failed:', error);
    
    // Hiển thị chi tiết lỗi từ enhanced error
    if (error.isApiError && error.details) {
      const details = error.details;
      
      let errorMessage = `❌ ${details.message}\n\n`;
      errorMessage += `📍 URL: ${details.config.url}\n`;
      errorMessage += `🔧 Method: ${details.config.method}\n`;
      errorMessage += `📊 Status: ${details.status} ${details.statusText}\n`;
      errorMessage += `⏰ Time: ${new Date(details.timestamp).toLocaleTimeString()}\n`;
      
      if (details.validationErrors) {
        errorMessage += `\n🔍 Validation Errors:\n${JSON.stringify(details.validationErrors, null, 2)}`;
      }
      
      if (details.data) {
        errorMessage += `\n📄 Response Data:\n${JSON.stringify(details.data, null, 2)}`;
      }

      Alert.alert('Chi tiết lỗi API', errorMessage);
    } else {
      // Fallback cho lỗi không có details
      const errorMessage = `❌ ${error.message}\n\n📋 Kiểm tra:\n1. Server đã chạy?\n2. URL đúng?\n3. Network connection?`;
      Alert.alert('Lỗi kết nối', errorMessage);
    }
    
    return false;
  }
};

// Test với mock data khi không có server
export const useMockData = () => {
  secureLog('Using mock data mode');
  Alert.alert(
    'Chế độ Demo', 
    'Đang sử dụng dữ liệu giả lập. Thay đổi API_CONFIG để kết nối server thật.'
  );
};
