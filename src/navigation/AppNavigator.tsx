import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { VisitorNavigator } from './VisitorNavigator';
import { QRScannerScreen } from '../features/qr/screens/QRScannerScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { hasPermission, Permissions } from '../core/auth/permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const theme = useTheme<AppTheme>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const canScanQR = user ? hasPermission(user.permissions, Permissions.SCAN_QR) : false;

  return (
    <Tab.Navigator
      screenOptions={{
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
