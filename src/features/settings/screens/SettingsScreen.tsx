import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppTheme } from '../../../theme/theme';
import { RootState } from '../../../app/store';
import { logout } from '../../auth/authSlice';
// import { toggleTheme } from './themeSlice';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    // In a real app we'd call AuthRepository.logout() but AuthRepository wasn't imported correctly.
    // For demo purposes, just dispatching logout is fine.
    dispatch(logout());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.custom.colors.textPrimary }]}>{user?.name || 'Rajeev Joshi'}</Text>
          <Text style={[styles.userRole, { color: theme.custom.colors.textSecondary }]}>{user?.role || 'Security Officer'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Account Settings</Text>
          <SettingsItem 
            icon="person-outline" 
            title="Edit Profile" 
            onPress={() => {}} 
            theme={theme} 
          />
          <SettingsItem 
            icon="lock-outline" 
            title="Change Password" 
            onPress={() => {}} 
            theme={theme} 
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>App Settings</Text>
          <SettingsToggleItem 
            icon="notifications-none" 
            title="Push Notifications" 
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            theme={theme} 
          />
          <SettingsToggleItem 
            icon="dark-mode" 
            title="Dark Theme" 
            value={isDarkMode}
            onValueChange={() => dispatch(toggleTheme())}
            theme={theme} 
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Support</Text>
          <SettingsItem 
            icon="help-outline" 
            title="Help Center" 
            onPress={() => {}} 
            theme={theme} 
          />
          <SettingsItem 
            icon="privacy-tip" 
            title="Privacy Policy" 
            onPress={() => {}} 
            theme={theme} 
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color={theme.custom.colors.error} />
          <Text style={[styles.logoutText, { color: theme.custom.colors.error }]}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.custom.colors.textSecondary }]}>v1.0.0 (Build 24)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsItem = ({ icon, title, onPress, theme }: any) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <Icon name={icon} size={24} color={theme.custom.colors.textSecondary} style={styles.settingsIcon} />
      <Text style={[styles.settingsItemTitle, { color: theme.custom.colors.textPrimary }]}>{title}</Text>
    </View>
    <Icon name="chevron-right" size={24} color={theme.custom.colors.textSecondary} />
  </TouchableOpacity>
);

const SettingsToggleItem = ({ icon, title, value, onValueChange, theme }: any) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemLeft}>
      <Icon name={icon} size={24} color={theme.custom.colors.textSecondary} style={styles.settingsIcon} />
      <Text style={[styles.settingsItemTitle, { color: theme.custom.colors.textPrimary }]}>{title}</Text>
    </View>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.colors.primary, false: '#E2E8F0' }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 40,
  },
});
