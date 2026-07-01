import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { AppTheme } from '../../../theme/theme';
import { VisitorRepository } from '../../visitor/VisitorRepository';
import { Visitor } from '../../../domain/models/Visitor';
import Logger from '../../../core/logger/Logger';

export const SearchVisitorScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await VisitorRepository.searchVisitors(query);
      setResults(data);
    } catch (error) {
      Logger.error('Failed to search visitors', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Visitor }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.custom.colors.border }]}
      onPress={() => navigation.navigate('VisitorDetails', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>{item.name}</Text>
        <Text variant="bodySmall" style={{ color: theme.custom.colors.textSecondary }}>{item.status}</Text>
      </View>
      <Text variant="bodyMedium">Phone: {item.phone || 'N/A'}</Text>
      <Text variant="bodyMedium">Email: {item.email || 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchHeader}>
        <TextInput
          label="Search by Name, Email, or Phone"
          value={query}
          onChangeText={setQuery}
          mode="outlined"
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
        <Button mode="contained" onPress={handleSearch} loading={loading} disabled={loading || !query.trim()}>
          Search
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <FlashList
            data={results}
            renderItem={renderItem}
            {...{ estimatedItemSize: 100 }}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text>No visitors found. Please try another query.</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    marginBottom: 12,
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  }
});
