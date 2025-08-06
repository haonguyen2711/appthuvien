// Utility functions để xử lý API errors

export interface ApiErrorDetails {
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

export interface ApiError extends Error {
  details?: ApiErrorDetails;
  isApiError?: boolean;
}

// Format error message cho user
export const formatErrorMessage = (error: any): string => {
  if (error.isApiError && error.details) {
    return error.details.message;
  }
  
  return error.message || 'Đã xảy ra lỗi không xác định';
};

// Get error details cho debugging
export const getErrorDetails = (error: any): ApiErrorDetails | null => {
  if (error.isApiError && error.details) {
    return error.details;
  }
  
  return null;
};

// Check nếu là lỗi network
export const isNetworkError = (error: any): boolean => {
  return error.details?.code === 'NETWORK_ERROR' || 
         error.details?.code === 'ECONNREFUSED' ||
         error.details?.code === 'TIMEOUT_ERROR';
};

// Check nếu là lỗi authentication
export const isAuthError = (error: any): boolean => {
  return error.details?.status === 401;
};

// Check nếu là lỗi validation
export const isValidationError = (error: any): boolean => {
  return error.details?.status === 422 && error.details?.validationErrors;
};

// Check nếu là lỗi server
export const isServerError = (error: any): boolean => {
  return error.details?.status >= 500;
};

// Get response data từ error
export const getResponseData = (error: any): any => {
  return error.details?.response?.data || error.details?.data || null;
};

// Get validation errors chi tiết
export const getValidationErrors = (error: any): any[] => {
  return error.details?.validationErrors || [];
};

// Get full response object
export const getFullResponse = (error: any): any => {
  return error.details?.response || null;
};

// Get request data để debug
export const getRequestData = (error: any): any => {
  return error.details?.request || null;
};

// Format error message với response details
export const formatDetailedErrorMessage = (error: any): string => {
  const basicMessage = formatErrorMessage(error);
  const responseData = getResponseData(error);
  const validationErrors = getValidationErrors(error);
  
  let detailedMessage = basicMessage;
  
  // Thêm validation errors nếu có
  if (validationErrors.length > 0) {
    const validationText = validationErrors.map(err => 
      typeof err === 'string' ? err : err.message || JSON.stringify(err)
    ).join(', ');
    detailedMessage += `\nChi tiết: ${validationText}`;
  }
  
  // Thêm response data nếu có thông tin hữu ích
  if (responseData && typeof responseData === 'object' && responseData.details) {
    detailedMessage += `\nThông tin thêm: ${responseData.details}`;
  }
  
  return detailedMessage;
};

// Log chi tiết lỗi (chỉ trong development)
export const logErrorDetails = (error: any, context?: string) => {
  if (__DEV__) {
    console.group(`🚨 API Error${context ? ` - ${context}` : ''}`);
    
    if (error.isApiError && error.details) {
      console.error('Status:', error.details.status);
      console.error('Message:', error.details.message);
      console.error('URL:', error.details.config.url);
      console.error('Method:', error.details.config.method);
      console.error('Code:', error.details.code);
      console.error('Data:', error.details.data);
      
      if (error.details.validationErrors) {
        console.error('Validation Errors:', error.details.validationErrors);
      }
    } else {
      console.error('Raw Error:', error);
    }
    
    console.groupEnd();
  }
};

// Create user-friendly error message với suggestions
export const createUserErrorMessage = (error: any): { title: string; message: string } => {
  if (!error.isApiError || !error.details) {
    return {
      title: 'Lỗi',
      message: error.message || 'Đã xảy ra lỗi không xác định'
    };
  }

  const details = error.details;

  switch (details.status) {
    case 0:
      return {
        title: 'Lỗi kết nối',
        message: `Không thể kết nối đến server.\n\n✅ Kiểm tra:\n• Server đã chạy?\n• Kết nối internet?\n• URL: ${details.config.baseURL}`
      };

    case 400:
      return {
        title: 'Dữ liệu không hợp lệ',
        message: details.message + '\n\n💡 Vui lòng kiểm tra lại thông tin đã nhập'
      };

    case 401:
      return {
        title: 'Yêu cầu đăng nhập',
        message: 'Phiên đăng nhập đã hết hạn.\n\n🔄 Vui lòng đăng nhập lại'
      };

    case 403:
      return {
        title: 'Không có quyền',
        message: 'Bạn không có quyền truy cập tài nguyên này.\n\n👮‍♂️ Liên hệ admin nếu cần thiết'
      };

    case 404:
      return {
        title: 'Không tìm thấy',
        message: 'Tài nguyên yêu cầu không tồn tại.\n\n🔍 Kiểm tra lại đường dẫn'
      };

    case 422:
      let validationMsg = details.message;
      if (details.validationErrors) {
        validationMsg += '\n\n📝 Chi tiết:\n' + 
          Object.entries(details.validationErrors)
            .map(([field, errors]) => `• ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
      }
      return {
        title: 'Dữ liệu không hợp lệ',
        message: validationMsg
      };

    case 429:
      return {
        title: 'Quá nhiều yêu cầu',
        message: 'Bạn đã gửi quá nhiều yêu cầu.\n\n⏰ Vui lòng chờ một chút rồi thử lại'
      };

    case 500:
      return {
        title: 'Lỗi máy chủ',
        message: 'Server đang gặp sự cố.\n\n🔧 Vui lòng thử lại sau hoặc liên hệ hỗ trợ'
      };

    case 502:
      return {
        title: 'Server không phản hồi',
        message: 'Máy chủ không phản hồi.\n\n🔄 Vui lòng thử lại sau'
      };

    case 503:
      return {
        title: 'Dịch vụ bảo trì',
        message: 'Hệ thống đang bảo trì.\n\n⚙️ Vui lòng thử lại sau'
      };

    default:
      return {
        title: `Lỗi ${details.status}`,
        message: details.message + '\n\n🔄 Vui lòng thử lại hoặc liên hệ hỗ trợ'
      };
  }
};
