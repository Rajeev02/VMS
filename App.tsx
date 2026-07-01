import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/app/store';
import { AppLightTheme } from './src/theme/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/core/errors/ErrorBoundary';
import { OfflineManager } from './src/core/network/OfflineManager';

import { initializeFirebaseInfrastructure } from './src/infrastructure/firebase/init';

export default function App() {
  useEffect(() => {
    initializeFirebaseInfrastructure();
    OfflineManager.init();
  }, []);

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PaperProvider theme={AppLightTheme}>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </PaperProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
