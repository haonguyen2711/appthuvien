import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { color_1 } from '../../constants/colors';
import ErrorDisplay from './ErrorDisplay';

interface LoadingErrorStateProps {
  loading: boolean;
  error: any;
  onRetry?: () => void;
  showErrorDetails?: boolean;
  children: React.ReactNode;
  loadingSize?: 'small' | 'large';
  loadingColor?: string;
  style?: any;
}

export const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  loading,
  error,
  onRetry,
  showErrorDetails = false,
  children,
  loadingSize = 'large',
  loadingColor = color_1.primary,
  style
}) => {
  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size={loadingSize} color={loadingColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <ErrorDisplay 
          error={error}
          onRetry={onRetry}
          showDetails={showErrorDetails}
        />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default LoadingErrorState;
