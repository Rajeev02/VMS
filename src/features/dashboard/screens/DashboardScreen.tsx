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
import { GetDashboardStatsUseCase, DashboardStats } from '../usecases/GetDashboardStatsUseCase';
import { GetVisitsByStatusUseCase, PopulatedVisit } from '../usecases/GetVisitsByStatusUseCase';
import { VisitStatus } from '../../../domain/models/enums';
import { ProcessCheckOutUseCase } from '../../visitor/usecases/ProcessCheckOutUseCase';
import { Alert } from 'react-native';

export const DashboardScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = React.useState<DashboardStats>({
    expected: 0, active: 0, completed: 0
  });
  
  const [activeTab, setActiveTab] = React.useState<'EXPECTED' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [visits, setVisits] = React.useState<PopulatedVisit[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const statsUseCase = new GetDashboardStatsUseCase();
      const currentStats = await statsUseCase.execute();
      setStats(currentStats);

      const visitsUseCase = new GetVisitsByStatusUseCase();
      let statusesToFetch: VisitStatus[] = [];
      if (activeTab === 'EXPECTED') statusesToFetch = [VisitStatus.PENDING, VisitStatus.APPROVED];
      if (activeTab === 'ACTIVE') statusesToFetch = [VisitStatus.CHECKED_IN];
      if (activeTab === 'COMPLETED') statusesToFetch = [VisitStatus.COMPLETED, VisitStatus.CHECKED_OUT];
      
      const currentVisits = await visitsUseCase.execute(statusesToFetch);
      setVisits(currentVisits);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadDashboardData();
  }, [theme, activeTab]);

  const handleManualCheckOut = async (visitId: string) => {
    try {
      const useCase = new ProcessCheckOutUseCase();
      await useCase.execute(visitId);
      Alert.alert('Success', 'Visitor checked out manually.');
      loadDashboardData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const canScanQR = user ? hasPermission(user.permissions, Permissions.SCAN_QR) : false;
  const canRegisterWalkIn = user ? hasPermission(user.permissions, Permissions.REGISTER_WALK_IN) : false;
  const canManualVerify = user ? hasPermission(user.permissions, Permissions.MANUAL_VERIFY) : false;

  const quickActions = [
    ...(canScanQR ? [{ id: 1, title: 'Scan QR', icon: 'qr-code-scanner', color: '#10B981', action: () => navigation.navigate('Activity') }] : []),
    ...(canRegisterWalkIn ? [{ id: 2, title: 'Walk-in Registration', icon: 'person-add', color: '#3B82F6', action: () => navigation.navigate('WalkInRegistration') }] : []),
    ...(canManualVerify ? [{ id: 3, title: 'Verify Without Pass', icon: 'search', color: '#F59E0B', action: () => navigation.navigate('VerifyWithoutPass') }] : []),
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
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]}>Expected</Text>
            <Text style={[styles.statCount, { color: theme.custom.colors.warning }]}>{stats.expected}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]}>Active Now</Text>
            <Text style={[styles.statCount, { color: '#10B981' }]}>{stats.active}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]}>Completed</Text>
            <Text style={[styles.statCount, { color: theme.custom.colors.textPrimary }]}>{stats.completed}</Text>
          </View>
        </View>
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
              <Icon name={action.icon as any} size={28} color={action.color} />
              <Text style={[styles.actionTitle, { color: theme.custom.colors.textPrimary }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setActiveTab('EXPECTED')} style={[styles.tab, activeTab === 'EXPECTED' && { borderBottomColor: theme.colors.primary }]}>
            <Text style={{ color: activeTab === 'EXPECTED' ? theme.colors.primary : theme.custom.colors.textSecondary, fontWeight: activeTab === 'EXPECTED' ? 'bold' : 'normal' }}>Expected</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('ACTIVE')} style={[styles.tab, activeTab === 'ACTIVE' && { borderBottomColor: theme.colors.primary }]}>
            <Text style={{ color: activeTab === 'ACTIVE' ? theme.colors.primary : theme.custom.colors.textSecondary, fontWeight: activeTab === 'ACTIVE' ? 'bold' : 'normal' }}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('COMPLETED')} style={[styles.tab, activeTab === 'COMPLETED' && { borderBottomColor: theme.colors.primary }]}>
            <Text style={{ color: activeTab === 'COMPLETED' ? theme.colors.primary : theme.custom.colors.textSecondary, fontWeight: activeTab === 'COMPLETED' ? 'bold' : 'normal' }}>Completed</Text>
          </TouchableOpacity>
        </View>

        {refreshing ? <Text style={{textAlign: 'center', marginTop: 20}}>Loading...</Text> : visits.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No visits in this category.</Text> : visits.map(visit => (
          <View key={visit.id} style={[styles.activityRow, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" as any size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.activityName, { color: theme.custom.colors.textPrimary }]}>{visit.visitorName}</Text>
                <Text style={[styles.activityStatus, { color: theme.custom.colors.textSecondary }]}>{visit.purpose} • {visit.status}</Text>
              </View>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.activityTime, { color: theme.custom.colors.textSecondary, marginBottom: 8 }]}>
                {new Date(visit.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {activeTab === 'ACTIVE' && (
                <TouchableOpacity onPress={() => handleManualCheckOut(visit.id)} style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Check Out</Text>
                </TouchableOpacity>
              )}
            </View>
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
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
});
