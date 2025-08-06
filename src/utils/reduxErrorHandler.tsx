// Redux error handling utility
import { PayloadAction } from '@reduxjs/toolkit';
import { formatErrorMessage, logErrorDetails } from './errorHandler';

// Helper để xử lý pending state trong Redux slice
export const handlePending = (state: any) => {
  state.loading = true;
  state.error = null;
};

// Helper để xử lý fulfilled state trong Redux slice
export const handleFulfilled = (state: any, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = null;
  return action.payload;
};

// Helper để xử lý rejected state trong Redux slice với logging chi tiết
export const handleRejected = (state: any, action: PayloadAction<unknown>) => {
  state.loading = false;
  
  const error = action.payload as any;
  
  // Log error details cho debugging
  logErrorDetails(error, 'Redux Action Failed');
  
  // Lưu error object đầy đủ vào state để component có thể hiển thị chi tiết
  state.error = error;
};

// Tạo extraReducers cho async thunk một cách consistent
export const createAsyncReducers = (builder: any, asyncThunk: any, options?: {
  onFulfilled?: (state: any, action: PayloadAction<any>) => void;
  onRejected?: (state: any, action: PayloadAction<unknown>) => void;
}) => {
  builder
    .addCase(asyncThunk.pending, handlePending)
    .addCase(asyncThunk.fulfilled, (state: any, action: PayloadAction<any>) => {
      handleFulfilled(state, action);
      if (options?.onFulfilled) {
        options.onFulfilled(state, action);
      }
    })
    .addCase(asyncThunk.rejected, (state: any, action: PayloadAction<unknown>) => {
      handleRejected(state, action);
      if (options?.onRejected) {
        options.onRejected(state, action);
      }
    });
};

// Helper để throw error trong async thunk với format chuẩn
export const throwFormattedError = (error: any) => {
  // Đảm bảo error được format đúng cách cho Redux
  const formattedError = {
    message: formatErrorMessage(error),
    isApiError: error.isApiError || false,
    details: error.details || null,
    originalError: error
  };
  
  throw formattedError;
};
