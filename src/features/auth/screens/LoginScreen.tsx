import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AppTheme } from '../../../theme/theme';
import { AuthRepository } from '../AuthRepository';
import { loginSuccess } from '../authSlice';
import Logger from '../../../core/logger/Logger';
import { CustomInput } from '../../../components/CustomInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const LoginScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('john.doe@company.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await AuthRepository.login(email, password);
      dispatch(loginSuccess(response.user));
    } catch (err: any) {
      Logger.error('Login Error', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.custom.colors.surface }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>
            Welcome Back!
          </Text>
          <Text style={[styles.subtitle, { color: theme.custom.colors.textSecondary }]}>
            Sign in to your account
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <CustomInput
            label="Email or Phone"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            placeholder="john.doe@company.com"
          />
          
          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            editable={!loading}
            placeholder="••••••••"
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <Icon 
                name={rememberMe ? 'check-box' : 'check-box-outline-blank'} 
                size={20} 
                color={rememberMe ? theme.colors.primary : theme.custom.colors.textSecondary} 
              />
              <Text style={[styles.rememberMeText, { color: theme.custom.colors.textSecondary }]}>
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          
          {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

          <PrimaryButton 
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: theme.custom.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.signupLink, { color: theme.colors.primary }]}>Contact Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.languageContainer}>
          <Icon name="language" size={20} color={theme.custom.colors.textSecondary} />
          <Text style={[styles.languageText, { color: theme.custom.colors.textSecondary }]}>English</Text>
          <Icon name="keyboard-arrow-down" size={20} color={theme.custom.colors.textSecondary} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  languageText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
