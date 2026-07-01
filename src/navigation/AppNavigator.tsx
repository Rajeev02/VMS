import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { VisitorNavigator } from './VisitorNavigator';
import { QRScannerScreen } from '../features/qr/screens/QRScannerScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { hasPermission, Permissions } from '../core/auth/permissions';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import { WalkInRegistrationScreen } from '../features/visitor/screens/WalkInRegistrationScreen';
import { CaptureIDScreen } from '../features/visitor/screens/CaptureIDScreen';
import { CheckInScreen } from '../features/visitor/screens/CheckInScreen';
import { VerifyWithoutPassScreen } from '../features/visitor/screens/VerifyWithoutPassScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const theme = useTheme<AppTheme>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const canScanQR = user ? hasPermission(user.permissions, Permissions.SCAN_QR) : false;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.custom.colors.textPrimary,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.custom.colors.textSecondary,
        tabBarStyle: { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.custom.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          headerTitle: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Visitors" 
        component={VisitorNavigator} 
        options={{ 
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" color={color} size={size} />
          )
        }} 
      />
      {canScanQR && (
        <Tab.Screen 
          name="Activity" 
          component={QRScannerScreen} 
          options={{ 
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="qr-code-scanner" color={color} size={size} />
            )
          }} 
        />
      )}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="WalkInRegistration" component={WalkInRegistrationScreen} options={{ headerShown: false, title: 'Walk-in Registration' }} />
      <Stack.Screen name="CaptureID" component={CaptureIDScreen} options={{ headerShown: false, title: 'Capture Government ID' }} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ headerShown: false, title: 'Check-In' }} />
      <Stack.Screen name="VerifyWithoutPass" component={VerifyWithoutPassScreen} options={{ headerShown: false, title: 'Verify Identity' }} />
    </Stack.Navigator>
  );
};
