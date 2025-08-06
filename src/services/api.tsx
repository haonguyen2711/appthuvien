import axios from 'axios';
import { Alert } from 'react-native';
import { getCurrentConfig } from '../config/api';
import { apiMonitor } from '../utils/apiMonitor';
import storageService from '../utils/storage';

// Interface cho error details - mở rộng để bao gồm thêm thông tin từ API response
interface ApiErrorDetails {
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
  // Thêm các thông tin response chi tiết
  response?: {
    headers: any;
    data: any;
    status: number;
    statusText: string;
  };
  // Thông tin request chi tiết
  request?: {
    headers: any;
    data: any;
    params: any;
  };
  // Error stack trace cho debugging
  stack?: string;
  // Additional context
  context?: string;
}

// Lấy cấu hình API hiện tại
const config = getCurrentConfig();

const api = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Tuân theo tiêu chuẩn API document
  },
});

// Request interceptor để thêm token và monitor API calls
api.interceptors.request.use(async (config) => {
  try {
    const token = await storageService.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Bắt đầu monitor API call
    const monitorId = apiMonitor.startCall(
      config.url || 'unknown',
      config.method || 'unknown'
    );
    (config as any).monitorId = monitorId;
    
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Response interceptor để handle errors với chi tiết đầy đủ
api.interceptors.response.use(
  (response) => {
    // Kết thúc monitor API call (thành công)
    const monitorId = (response.config as any).monitorId;
    if (monitorId) {
      const responseSize = JSON.stringify(response.data).length;
      apiMonitor.endCall(monitorId, response.status, responseSize);
    }
    return response;
  },
  async (error) => {
    // Kết thúc monitor API call (lỗi)
    const monitorId = (error.config as any)?.monitorId;
    
    // Tạo error object với thông tin chi tiết mở rộng
    const errorDetails: ApiErrorDetails = {
      status: error.response?.status || 0,
      statusText: error.response?.statusText || 'Unknown Error',
      message: '',
      data: error.response?.data || null,
      code: error.code || 'UNKNOWN_ERROR',
      config: {
        url: error.config?.url || 'Unknown URL',
        method: error.config?.method?.toUpperCase() || 'Unknown Method',
        baseURL: error.config?.baseURL || 'Unknown Base URL',
      },
      timestamp: new Date().toISOString(),
      // Thêm thông tin response chi tiết
      response: error.response ? {
        headers: error.response.headers || {},
        data: error.response.data || null,
        status: error.response.status,
        statusText: error.response.statusText || 'Unknown',
      } : undefined,
      // Thêm thông tin request chi tiết
      request: error.config ? {
        headers: error.config.headers || {},
        data: error.config.data || null,
        params: error.config.params || {},
      } : undefined,
      // Stack trace cho debugging
      stack: error.stack,
      // Context từ monitor
      context: monitorId ? `Monitor ID: ${monitorId}` : undefined,
    };

    // Xử lý các loại lỗi khác nhau với response detail
    if (error.response) {
      // Lỗi từ server (4xx, 5xx)
      const { status, data } = error.response;
      
      // Trích xuất error message từ response data
      const extractErrorMessage = (responseData: any) => {
        if (typeof responseData === 'string') return responseData;
        if (responseData?.error) return responseData.error;
        if (responseData?.message) return responseData.message;
        if (responseData?.detail) return responseData.detail;
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          return responseData.errors.map((err: any) => 
            typeof err === 'string' ? err : err.message || err.detail || JSON.stringify(err)
          ).join(', ');
        }
        if (responseData?.validationErrors) {
          errorDetails.validationErrors = responseData.validationErrors;
          return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        }
        return null;
      };

      const serverMessage = extractErrorMessage(data);
      
      switch (status) {
        case 400:
          errorDetails.message = serverMessage || 'Dữ liệu không hợp lệ';
          break;
        case 401:
          errorDetails.message = serverMessage || 'Phiên đăng nhập đã hết hạn';
          // Clear auth data
          try {
            await storageService.removeItem('authToken');
            await storageService.removeItem('userProfile');
            Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại');
          } catch (secureStoreError) {
            console.error('Error clearing storage:', secureStoreError);
          }
          break;
        case 403:
          errorDetails.message = serverMessage || 'Bạn không có quyền truy cập tài nguyên này';
          break;
        case 404:
          errorDetails.message = serverMessage || 'Không tìm thấy tài nguyên yêu cầu';
          break;
        case 409:
          errorDetails.message = serverMessage || 'Dữ liệu đã tồn tại hoặc xung đột';
          break;
        case 422:
          errorDetails.message = serverMessage || 'Dữ liệu không đúng định dạng';
          break;
        case 429:
          errorDetails.message = serverMessage || 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
          break;
        case 500:
          errorDetails.message = serverMessage || 'Lỗi máy chủ nội bộ';
          break;
        case 502:
          errorDetails.message = serverMessage || 'Máy chủ không phản hồi';
          break;
        case 503:
          errorDetails.message = serverMessage || 'Dịch vụ tạm thời không khả dụng';
          break;
        default:
          errorDetails.message = serverMessage || `Lỗi server (${status})`;
      }
    } else if (error.request) {
      // Lỗi network/connection
      if (error.code === 'NETWORK_ERROR') {
        errorDetails.message = 'Không thể kết nối đến server. Kiểm tra kết nối mạng';
      } else if (error.code === 'ECONNREFUSED') {
        errorDetails.message = 'Server từ chối kết nối. Kiểm tra server có chạy không';
      } else if (error.code === 'TIMEOUT_ERROR') {
        errorDetails.message = 'Kết nối quá thời gian chờ';
      } else {
        errorDetails.message = 'Lỗi kết nối mạng';
      }
    } else {
      // Lỗi khác
      errorDetails.message = error.message || 'Đã xảy ra lỗi không xác định';
    }

    // Log chi tiết lỗi để debug với thông tin response đầy đủ
    console.group('🚨 API Error Details');
    console.error('Status:', errorDetails.status);
    console.error('Message:', errorDetails.message);
    console.error('URL:', errorDetails.config.url);
    console.error('Method:', errorDetails.config.method);
    if (errorDetails.response?.data) {
      console.error('Response Data:', errorDetails.response.data);
    }
    if (errorDetails.validationErrors) {
      console.error('Validation Errors:', errorDetails.validationErrors);
    }
    if (errorDetails.request?.data) {
      console.error('Request Data:', errorDetails.request.data);
    }
    console.error('Full Error Details:', errorDetails);
    console.groupEnd();

    // Kết thúc monitor với error
    if (monitorId) {
      apiMonitor.endCallWithError(monitorId, errorDetails);
    }

    // Tạo enhanced error object
    const enhancedError = new Error(errorDetails.message);
    (enhancedError as any).details = errorDetails;
    (enhancedError as any).isApiError = true;

    return Promise.reject(enhancedError);
  }
);

export default api;
