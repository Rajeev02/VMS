import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store, RootState } from './src/app/store';
import { AppLightTheme, AppDarkTheme } from './src/theme/theme';
import { useSelector } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/core/errors/ErrorBoundary';
import { OfflineManager } from './src/core/network/OfflineManager';

import { initializeFirebaseInfrastructure } from './src/infrastructure/firebase/init';

const ThemeWrapper = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  return (
    <PaperProvider theme={isDarkMode ? AppDarkTheme : AppLightTheme}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default function App() {
  useEffect(() => {
    initializeFirebaseInfrastructure();
    OfflineManager.init();
  }, []);

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeWrapper />
      </ReduxProvider>
    </ErrorBoundary>
  );
}
