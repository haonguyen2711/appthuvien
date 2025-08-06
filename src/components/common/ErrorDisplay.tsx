import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    formatErrorMessage,
    getErrorDetails,
    getResponseData,
    getValidationErrors,
    isAuthError,
    isNetworkError
} from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  showDetails?: boolean;
  style?: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  showDetails = false,
  style 
}) => {
  const errorMessage = formatErrorMessage(error);
  const errorDetails = getErrorDetails(error);
  const responseData = getResponseData(error);
  const validationErrors = getValidationErrors(error);
  
  const showErrorDetails = () => {
    if (!errorDetails) return;
    
    let details = `
🔍 Chi tiết lỗi:
• Message: ${errorDetails.message}
• Status: ${errorDetails.status} ${errorDetails.statusText}
• URL: ${errorDetails.config.method?.toUpperCase()} ${errorDetails.config.url}
• Thời gian: ${new Date(errorDetails.timestamp).toLocaleString()}
• Code: ${errorDetails.code}`;

    // Thêm response data nếu có
    if (responseData && typeof responseData === 'object') {
      details += `\n\n📤 Response từ server:`;
      details += `\n${JSON.stringify(responseData, null, 2)}`;
    }

    // Thêm validation errors nếu có
    if (validationErrors.length > 0) {
      details += `\n\n⚠️ Validation Errors:`;
      validationErrors.forEach((err, index) => {
        details += `\n${index + 1}. ${typeof err === 'string' ? err : JSON.stringify(err)}`;
      });
    }

    // Thêm request data nếu có
    if (errorDetails.request?.data) {
      details += `\n\n📥 Request data:`;
      details += `\n${JSON.stringify(errorDetails.request.data, null, 2)}`;
    }

    details = details.trim();
    
    Alert.alert('Chi tiết lỗi', details, [
      { text: 'Đóng', style: 'cancel' },
      { text: 'Copy', onPress: () => {
        // In a real app, you might use Clipboard API here
        console.log('Error details:', details);
      }}
    ]);
  };

  const getErrorIcon = () => {
    if (isNetworkError(error)) return '📡';
    if (isAuthError(error)) return '🔒';
    return '⚠️';
  };

  const getErrorType = () => {
    if (isNetworkError(error)) return 'Lỗi kết nối';
    if (isAuthError(error)) return 'Lỗi xác thực';
    return 'Lỗi hệ thống';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getErrorIcon()}</Text>
        <Text style={styles.type}>{getErrorType()}</Text>
      </View>
      
      <Text style={styles.message}>{errorMessage}</Text>
      
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        )}
        
        {(showDetails && errorDetails) && (
          <TouchableOpacity style={styles.detailsButton} onPress={showErrorDetails}>
            <Text style={styles.detailsText}>Chi tiết</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    margin: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  message: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  detailsText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ErrorDisplay;
