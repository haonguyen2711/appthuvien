import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import ExpoSecureStoreAdapter from './ExpoSecureStoreAdapter';
import authReducer from './slices/authSlice';
import bookReducer from './slices/bookSlice';

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage: ExpoSecureStoreAdapter,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'],
};

// Persist config for books (only bookmarks and current page)
const bookPersistConfig = {
  key: 'books',
  storage: ExpoSecureStoreAdapter,
  whitelist: ['bookmarks', 'currentPage'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedBookReducer = persistReducer(bookPersistConfig, bookReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    books: persistedBookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
