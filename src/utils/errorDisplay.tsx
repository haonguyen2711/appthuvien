import { Alert } from 'react-native';
import { formatErrorMessage, getErrorDetails, isAuthError, isNetworkError } from './errorHandler';

// Helper để hiển thị lỗi cho user với thông tin chi tiết
export const showErrorToUser = (error: any, title = 'Đã xảy ra lỗi') => {
  const message = formatErrorMessage(error);
  const details = getErrorDetails(error);
  
  let buttons: any[] = [{ text: 'Đóng', style: 'cancel' }];
  
  // Thêm button Chi tiết nếu có error details
  if (details) {
    buttons.unshift({
      text: 'Chi tiết',
      onPress: () => showErrorDetails(details)
    });
  }
  
  // Tùy chỉnh title dựa trên loại lỗi
  if (isNetworkError(error)) {
    title = '❌ Lỗi kết nối';
  } else if (isAuthError(error)) {
    title = '🔒 Lỗi xác thực';
  }

  Alert.alert(title, message, buttons);
};

// Hiển thị chi tiết lỗi cho developer
const showErrorDetails = (details: any) => {
  const detailsText = `
📍 Status: ${details.status} ${details.statusText}
🌐 URL: ${details.config.method?.toUpperCase()} ${details.config.url}
⏰ Thời gian: ${new Date(details.timestamp).toLocaleString()}
📝 Message: ${details.message}
${details.code ? `🏷️ Code: ${details.code}` : ''}
${details.validationErrors ? `⚠️ Validation: ${JSON.stringify(details.validationErrors, null, 2)}` : ''}
  `.trim();

  Alert.alert(
    'Chi tiết lỗi kỹ thuật',
    detailsText,
    [
      { text: 'Đóng', style: 'cancel' },
      { 
        text: 'Copy log', 
        onPress: () => {
          console.log('=== ERROR DETAILS ===');
          console.log(detailsText);
          console.log('=== RAW ERROR ===');
          console.log(details);
          console.log('====================');
        }
      }
    ]
  );
};

// Quick helpers cho các trường hợp thường dùng
export const showNetworkError = () => {
  Alert.alert(
    '📡 Lỗi kết nối',
    'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.',
    [{ text: 'Đóng', style: 'cancel' }]
  );
};

export const showAuthError = () => {
  Alert.alert(
    '🔒 Phiên đăng nhập hết hạn',
    'Vui lòng đăng nhập lại để tiếp tục.',
    [{ text: 'Đóng', style: 'cancel' }]
  );
};

export const showGenericError = (message?: string) => {
  Alert.alert(
    '⚠️ Lỗi hệ thống',
    message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
    [{ text: 'Đóng', style: 'cancel' }]
  );
};
