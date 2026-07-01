import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppTheme } from '../../../theme/theme';
import { RootState } from '../../../app/store';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { StatusBadge } from '../../../components/StatusBadge';
import { hasPermission, Permissions } from '../../../core/auth/permissions';
import { useNavigation } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DashboardScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Mock data for the UI
  const stats = [
    { title: "Today's Visitors", count: 32, pending: 18, color: theme.custom.colors.border },
    { title: "Checked-in", count: 12, pending: 2, color: theme.custom.colors.border },
  ];

  const canScanQR = user ? hasPermission(user.permissions, Permissions.SCAN_QR) : false;
  const canRegisterWalkIn = user ? hasPermission(user.permissions, Permissions.REGISTER_WALK_IN) : false;
  const canManualVerify = user ? hasPermission(user.permissions, Permissions.MANUAL_VERIFY) : false;

  const quickActions = [
    ...(canScanQR ? [{ id: 1, title: 'Scan QR', icon: 'qr-code-scanner', color: '#10B981', action: () => navigation.navigate('Activity') }] : []),
    ...(canRegisterWalkIn ? [{ id: 2, title: 'Walk-in Registration', icon: 'person-add', color: '#3B82F6', action: () => navigation.navigate('WalkInRegistration') }] : []),
    ...(canManualVerify ? [{ id: 3, title: 'Verify Without Pass', icon: 'search', color: '#F59E0B', action: () => navigation.navigate('VerifyWithoutPass') }] : []),
  ];

  const recentActivity = [
    { id: 1, name: 'John Doe', status: 'Checked-in', time: '09:15 AM' },
    { id: 2, name: 'Mike Smith', status: 'Checked-in', time: '10:30 AM' },
    { id: 3, name: 'Sarah Wilson', status: 'Pending', time: '11:00 AM' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>SO</Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={[styles.greeting, { color: theme.custom.colors.textSecondary }]}>Good Morning,</Text>
            <Text style={[styles.userName, { color: theme.custom.colors.textPrimary }]}>{user?.role || 'Security Officer'}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="menu" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]}>{stat.title}</Text>
            <View style={styles.statContent}>
              <Text style={[styles.statCount, { color: theme.custom.colors.textPrimary }]}>{stat.count}</Text>
              <View style={styles.pendingContainer}>
                <Text style={[styles.pendingText, { color: theme.custom.colors.warning }]}>Pending</Text>
                <Text style={[styles.pendingCount, { color: theme.custom.colors.warning }]}>{stat.pending}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id} 
              style={[styles.actionCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}
              onPress={action.action}
            >
              <Icon name={action.icon} size={28} color={action.color} />
              <Text style={[styles.actionTitle, { color: theme.custom.colors.textPrimary }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Recent Activity</Text>
        {recentActivity.map(activity => (
          <View key={activity.id} style={[styles.activityRow, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.activityName, { color: theme.custom.colors.textPrimary }]}>{activity.name}</Text>
                <Text style={[styles.activityStatus, { color: theme.custom.colors.textSecondary }]}>{activity.status}</Text>
              </View>
            </View>
            <Text style={[styles.activityTime, { color: theme.custom.colors.textSecondary }]}>{activity.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userTextContainer: {},
  greeting: {
    fontSize: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pendingContainer: {
    alignItems: 'flex-end',
  },
  pendingText: {
    fontSize: 12,
  },
  pendingCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityStatus: {
    fontSize: 12,
  },
  activityTime: {
    fontSize: 12,
  },
});
