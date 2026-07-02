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
import { VisitStatus } from '../../../domain/models/enums';
import { ProcessCheckOutUseCase } from '../../visitor/usecases/ProcessCheckOutUseCase';
import { ProcessCheckInUseCase } from '../../visitor/usecases/ProcessCheckInUseCase';
import { Alert } from 'react-native';

const canViewAllVisits = (user: any) => {
  const role = (user?.role || '').toUpperCase();
  return !!user && (
    hasPermission(user.permissions || [], Permissions.ALL) ||
    hasPermission(user.permissions || [], Permissions.VIEW_ALL_VISITORS) ||
    role.includes('ADMIN') ||
    role.includes('SECURITY') ||
    role.includes('RECEPTIONIST')
  );
};

const isVisitVisibleForUser = (visit: any, user: any) => {
  if (!user) return false;
  if (canViewAllVisits(user)) return true;
  const role = (user.role || '').toUpperCase();
  if (hasPermission(user.permissions || [], Permissions.VIEW_OWN_VISITORS) || role.includes('HOST') || role.includes('EMPLOYEE')) {
    return visit.hostId === user.id || visit.createdBy === user.id || visit.hostId === user.name;
  }

  return false;
};

const getInitials = (name?: string, fallback?: string) => {
  const value = (name || fallback || 'User').trim();
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

export const DashboardScreen = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = React.useState({
    expected: 0, active: 0, completed: 0
  });
  
  const [activeTab, setActiveTab] = React.useState<'EXPECTED' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [allVisits, setAllVisits] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(true);

  React.useEffect(() => {
    const firestore = require('@react-native-firebase/firestore').default;
    let isMounted = true;

    if (!user) {
      setAllVisits([]);
      setStats({ expected: 0, active: 0, completed: 0 });
      setRefreshing(false);
      return () => {
        isMounted = false;
      };
    }

    setRefreshing(true);
    
    const visitsQuery = canViewAllVisits(user)
      ? firestore().collection('visits')
      : firestore().collection('visits').where('hostId', '==', user.id);

    const unsubscribe = visitsQuery.onSnapshot(async (snapshot: any) => {
      let expected = 0;
      let active = 0;
      let completed = 0;

      const promises = snapshot.docs.map(async (doc: any) => {
        const v = doc.data();

        let visitorName = 'Unknown';
        try {
          const visitorDoc = await firestore().collection('visitors').doc(v.visitorId).get();
          if (visitorDoc.exists) visitorName = visitorDoc.data().name;
        } catch (e) {}

        return { ...v, id: doc.id, visitorName };
      });

      const results = await Promise.all(promises);
      if (!isMounted) return;
      const visibleResults = results.filter(visit => isVisitVisibleForUser(visit, user));
      visibleResults.forEach((visit) => {
        if (visit.status === VisitStatus.APPROVED || visit.status === VisitStatus.PENDING) expected++;
        else if (visit.status === VisitStatus.CHECKED_IN) active++;
        else if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CHECKED_OUT) completed++;
      });
      visibleResults.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setAllVisits(visibleResults);
      setStats({ expected, active, completed });
      setRefreshing(false);
    }, (error: any) => {
      if (!isMounted) return;
      console.error('Dashboard visits listener failed', error);
      setAllVisits([]);
      setStats({ expected: 0, active: 0, completed: 0 });
      setRefreshing(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const displayedVisits = React.useMemo(() => {
    return allVisits.filter(v => {
      if (activeTab === 'EXPECTED') return v.status === VisitStatus.PENDING || v.status === VisitStatus.APPROVED;
      if (activeTab === 'ACTIVE') return v.status === VisitStatus.CHECKED_IN;
      if (activeTab === 'COMPLETED') return v.status === VisitStatus.COMPLETED || v.status === VisitStatus.CHECKED_OUT;
      return false;
    });
  }, [allVisits, activeTab]);

  const handleManualCheckOut = async (visitId: string) => {
    try {
      const useCase = new ProcessCheckOutUseCase();
      await useCase.execute(visitId);
      Alert.alert('Success', 'Visitor checked out manually.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleManualCheckIn = async (visitId: string) => {
    try {
      const useCase = new ProcessCheckInUseCase();
      await useCase.execute({ visitId });
      Alert.alert('Success', 'Visitor checked in manually.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const canScanQR = user ? hasPermission(user.permissions, Permissions.SCAN_QR) : false;
  const canRegisterWalkIn = user ? hasPermission(user.permissions, Permissions.REGISTER_WALK_IN) : false;
  const canManualVerify = user ? hasPermission(user.permissions, Permissions.MANUAL_VERIFY) : false;
  const displayName = user?.name?.trim() || user?.email || user?.role || 'User';
  const avatarText = getInitials(user?.name, user?.role);

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
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{avatarText}</Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={[styles.greeting, { color: theme.custom.colors.textSecondary }]}>Good Morning,</Text>
            <Text style={[styles.userName, { color: theme.custom.colors.textPrimary }]} numberOfLines={1}>{displayName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="menu" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Expected</Text>
            <Text style={[styles.statCount, { color: theme.custom.colors.warning }]} numberOfLines={1} adjustsFontSizeToFit>{stats.expected}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Active</Text>
            <Text style={[styles.statCount, { color: '#10B981' }]} numberOfLines={1} adjustsFontSizeToFit>{stats.active}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.statTitle, { color: theme.custom.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Completed</Text>
            <Text style={[styles.statCount, { color: theme.custom.colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>{stats.completed}</Text>
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

        {refreshing ? <Text style={{textAlign: 'center', marginTop: 20}}>Loading...</Text> : displayedVisits.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No visits in this category.</Text> : displayedVisits.map(visit => (
          <View key={visit.id} style={[styles.activityRow, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" as any size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityName, { color: theme.custom.colors.textPrimary }]} numberOfLines={1}>{visit.visitorName}</Text>
                <Text style={[styles.activityStatus, { color: theme.custom.colors.textSecondary }]} numberOfLines={2}>{visit.purpose} • {visit.status}</Text>
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
              {activeTab === 'EXPECTED' && visit.status === VisitStatus.APPROVED && (
                <TouchableOpacity onPress={() => handleManualCheckIn(visit.id)} style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Check In</Text>
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
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statCount: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
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
    flex: 1,
    paddingRight: 8,
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
