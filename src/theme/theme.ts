import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Centralized Design Tokens
export const tokens = {
  colors: {
    primary: '#2563EB', // Primary
    primaryVariant: '#1D4ED8',
    secondary: '#10B981', // Secondary / Success
    background: '#F8FAFC', // Background
    surface: '#FFFFFF', // Surface
    error: '#EF4444', // Danger
    textPrimary: '#0F172A',
    textSecondary: '#64748B', // Neutral
    border: '#E2E8F0',
    success: '#10B981', // Success
    warning: '#F59E0B', // Warning
  },
  darkColors: {
    primary: '#3B82F6',
    primaryVariant: '#2563EB',
    secondary: '#34D399',
    background: '#0F172A',
    surface: '#1E293B',
    error: '#F87171',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
  },
  typography: {
    fontFamily: 'System', // Assuming system fallback for Inter
    sizes: {
      h1: 28,
      h2: 20,
      h3: 18,
      body1: 16,
      body2: 14,
      caption: 12,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
    huge: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    round: 9999,
  },
  elevation: {
    small: 2,
    medium: 4,
    large: 8,
  },
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokens.colors.primary,
    secondary: tokens.colors.secondary,
    background: tokens.colors.background,
    surface: tokens.colors.surface,
    error: tokens.colors.error,
  },
  custom: tokens,
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: tokens.darkColors.primary,
    secondary: tokens.darkColors.secondary,
    background: tokens.darkColors.background,
    surface: tokens.darkColors.surface,
    error: tokens.darkColors.error,
  },
  custom: {
    ...tokens,
    colors: tokens.darkColors,
  },
};

export type AppTheme = typeof AppLightTheme;
