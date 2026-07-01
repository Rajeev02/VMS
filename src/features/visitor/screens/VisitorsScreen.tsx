import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { Visitor, VisitorRepository } from '../VisitorRepository';
import { PermissionGuard } from '../../../core/auth/PermissionGuard';
import { Permissions } from '../../../core/auth/permissions';
import Logger from '../../../core/logger/Logger';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBadge } from '../../../components/StatusBadge';

const FilterTabs = ['All', 'Upcoming', 'Checked-In', 'Checked-Out'];

export const VisitorsScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchVisitors = async () => {
    try {
      const data = await VisitorRepository.getVisitors();
      // For demo purposes, we will mock the status fields so the UI looks like the design
      const mockedData = data.map((v, i) => {
        let status = 'Approved';
        if (i === 1) status = 'Upcoming';
        if (i === 2) status = 'Pending';
        if (i === 3) status = 'Cancelled';
        if (i === 4) status = 'Approved';
        
        return {
          ...v,
          status,
          date: '12 Jul 2024',
          time: '10:00 AM'
        };
      });
      setVisitors(mockedData as any);
    } catch (error) {
      Logger.error('Failed to fetch visitors', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVisitors();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('VisitorDetails', { id: item.id })}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="person" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.visitorTime, { color: theme.custom.colors.textSecondary }]}>
            {item.date}, {item.time}
          </Text>
        </View>
      </View>
      <StatusBadge status={item.status as any} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>My Visitors</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
          <Icon name="search" size={20} color={theme.custom.colors.textSecondary} style={styles.searchIcon} />
          <RNTextInput 
            placeholder="Search by name, phone or pass id"
            placeholderTextColor={theme.custom.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.custom.colors.textPrimary }]}
          />
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FilterTabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border, borderWidth: 1 }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab ? { color: theme.custom.colors.surface } : { color: theme.custom.colors.textSecondary }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlashList
        data={visitors}
        renderItem={renderItem}
        estimatedItemSize={80}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: theme.custom.colors.textSecondary }}>No visitors found.</Text>
          </View>
        }
      />
      
      <PermissionGuard permission={Permissions.CREATE_PRE_APPROVED}>
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.custom.colors.surface}
          onPress={() => navigation.navigate('CreateVisitor')}
        />
      </PermissionGuard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cardLeft: {
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
  cardInfo: {
    justifyContent: 'center',
  },
  visitorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visitorTime: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
