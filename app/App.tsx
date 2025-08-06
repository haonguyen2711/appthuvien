import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppNavigator from '../src/navigation/AppNavigator';
import { persistor, store } from '../src/store';
import LoggerService from '../src/utils/logger';

const App = () => {
  LoggerService.log('[App] Starting app with Redux store');
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;