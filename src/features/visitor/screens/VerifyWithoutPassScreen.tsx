import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { AppTheme } from '../../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PrimaryButton } from '../../../components/PrimaryButton';

const FilterTabs = ['Host Name', 'Visitor Name', 'Phone Number', 'Company'];

// Mock data for search results
const MOCK_RESULTS = [
  { id: '1', name: 'John Doe', company: 'ABC Technologies', host: 'Rajeev Joshi', time: '10:00 AM' },
  { id: '2', name: 'Mike Smith', company: 'XYZ Corp', host: 'Rajeev Joshi', time: '11:30 AM' },
  { id: '3', name: 'Sarah Wilson', company: 'Acme Inc', host: 'Priya Sharma', time: '02:00 PM' },
];

export const VerifyWithoutPassScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Visitor Name');
  
  // Simulated search results based on query length for demo
  const results = searchQuery.length > 2 ? MOCK_RESULTS : [];

  const handleVerify = (id: string) => {
    // Navigate to ID capture/Check-in flow
    navigation.navigate('CheckIn', { id });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.visitorTime, { color: theme.colors.primary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.companyName, { color: theme.custom.colors.textSecondary }]}>{item.company}</Text>
        <Text style={[styles.hostName, { color: theme.custom.colors.textSecondary }]}>Host: {item.host}</Text>
      </View>
      <PrimaryButton 
        title="Verify" 
        onPress={() => handleVerify(item.id)} 
        style={styles.verifyButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Verify Identity</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
          <Icon name="search" size={20} color={theme.custom.colors.textSecondary} style={styles.searchIcon} />
          <RNTextInput 
            placeholder={`Search by ${activeTab.toLowerCase()}`}
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
        data={results}
        renderItem={renderItem}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.center}>
            {searchQuery.length > 0 ? (
              <Text style={{ color: theme.custom.colors.textSecondary }}>No upcoming visits found.</Text>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="person-search" size={64} color={theme.custom.colors.border} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.textSecondary }]}>
                  Search for a visitor to verify their identity and complete check-in manually.
                </Text>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitorTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    marginBottom: 4,
  },
  hostName: {
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
  },
});
