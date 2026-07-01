import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { SplashScreen } from '../features/auth/screens/SplashScreen';

const linking = {
  prefixes: ['vms://', 'https://vms-project.web.app'],
  config: {
    screens: {
      WebPassRoute: 'pass/:qrToken', 
    },
  },
};

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <SplashScreen />;
  }

  // The WebPassScreen will be added to AppNavigator later.
  // We'll let AppNavigator or AuthNavigator handle it if needed.
  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
