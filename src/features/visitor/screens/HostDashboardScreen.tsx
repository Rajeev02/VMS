import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { GetPendingRequestsUseCase } from '../usecases/GetPendingRequestsUseCase';
import { Visit } from '../../../domain/models/Visit';
import { Visitor } from '../../../domain/models/Visitor';
import { MaterialIcons as Icon } from '@expo/vector-icons';

type PendingRequest = { visit: Visit, visitor: Visitor | null };

export const HostDashboardScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const useCase = new GetPendingRequestsUseCase();
      // Hardcoded hostId for Phase 2 demo
      const result = await useCase.execute('Unknown Host');
      setRequests(result);
    } catch (error) {
      console.log('Error loading pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PendingRequest }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}
      onPress={() => navigation.navigate('ApprovalDetail', { visit: item.visit, visitor: item.visitor })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>
          {item.visitor?.name || 'Unknown Visitor'}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PENDING</Text>
        </View>
      </View>
      <Text style={[styles.details, { color: theme.custom.colors.textSecondary }]}>
        Company: {item.visitor?.company || 'N/A'}
      </Text>
      <Text style={[styles.details, { color: theme.custom.colors.textSecondary }]}>
        Purpose: {item.visit.purpose}
      </Text>
      <Text style={[styles.details, { color: theme.custom.colors.textSecondary }]}>
        Time: {new Date(item.visit.entryTime || item.visit.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Pending Approvals</Text>
        <TouchableOpacity onPress={loadRequests}>
          <Icon name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Icon name="inbox" size={64} color={theme.custom.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.custom.colors.textSecondary }]}>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.visit.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 16, fontSize: 16 },
  list: { padding: 16 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitorName: { fontSize: 16, fontWeight: 'bold' },
  badge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: '#F59E0B', fontWeight: 'bold' },
  details: { fontSize: 14, marginBottom: 4 },
});
