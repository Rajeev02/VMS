import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AppTheme } from '../../../theme/theme';
import { TokenManager } from '../../../core/network/TokenManager';
import { AuthRepository } from '../AuthRepository';
import { loginSuccess, logout, setAuthLoading } from '../authSlice';
import Logger from '../../../core/logger/Logger';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const SplashScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        Logger.info('Starting App Bootstrap Flow');
        const token = await TokenManager.getAccessToken();

        if (token) {
          Logger.info('Token found, fetching profile...');
          const profile = await AuthRepository.fetchProfile();
          dispatch(loginSuccess(profile));
        } else {
          Logger.info('No token found, redirecting to login');
          dispatch(logout());
        }
      } catch (error) {
        Logger.error('Bootstrap failed', error);
        await TokenManager.clearTokens();
        dispatch(logout());
      } finally {
        dispatch(setAuthLoading(false));
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.logoContainer}>
        <Icon name="security" size={100} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>
          VisitorX
        </Text>
        <Text style={[styles.subtitle, { color: theme.custom.colors.textSecondary }]}>
          Secure. Smart. Seamless.
        </Text>
      </View>
      <ActivityIndicator animating={true} size="large" color={theme.colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
