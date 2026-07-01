import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SmartSearchService } from '../../../core/services/SmartSearchService';
import { VisitorPassRepository } from '../../../domain/repositories/VisitorPassRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { Visitor } from '../../../domain/models/Visitor';

export const VerifyWithoutPassScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch(searchQuery);
      } else {
        setResult(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // First try Pass ID
    let pass = await VisitorPassRepository.getByPassId(query);
    if (!pass) {
      pass = await VisitorPassRepository.getByQrToken(query);
    }
    
    if (pass) {
      // Load associated visit and visitor
      const visit = await VisitRepository.getById(pass.visitId);
      const visitor = await SmartSearchService.findVisitor(pass.visitorId); // assuming we can search by ID too
      setResult({ visitor, visit, pass });
    } else {
      // Fallback to SmartSearch for the visitor identity
      const visitor = await SmartSearchService.findVisitor(query);
      if (visitor) {
        // Find their active visit
        const visits = await VisitRepository.getVisitsByVisitor(visitor.id);
        const activeVisit = visits.find(v => v.status === 'PENDING' || v.status === 'CHECKED_IN') || visits[0];
        if (activeVisit) {
          const pass = await VisitorPassRepository.getByVisitId(activeVisit.id);
          setResult({ visitor, visit: activeVisit, pass });
        } else {
          setResult({ visitor, error: 'No active visits found for this identity.' });
        }
      } else {
        setResult(null);
      }
    }
    
    setIsSearching(false);
  };

  const handleVerify = () => {
    if (result?.pass) {
      navigation.navigate('CheckIn', { passId: result.pass.id });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Security Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <Text style={[styles.helperText, { color: theme.custom.colors.textSecondary }]}>
          Search by Pass ID, Gov ID, Phone, Email, or Name.
        </Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
          <Icon name="search" size={20} color={theme.custom.colors.textSecondary} style={styles.searchIcon} />
          <RNTextInput 
            placeholder="Enter identifier..."
            placeholderTextColor={theme.custom.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.custom.colors.textPrimary }]}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {isSearching ? (
          <View style={styles.center}>
             <Text style={{ color: theme.custom.colors.textSecondary }}>Searching securely...</Text>
          </View>
        ) : result ? (
          <View style={[styles.card, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            {result.error ? (
              <View style={styles.errorState}>
                <Icon name="error-outline" size={48} color={theme.custom.colors.error} />
                <Text style={[styles.errorText, { color: theme.custom.colors.error }]}>{result.error}</Text>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{result.visitor?.name}</Text>
                    <Text style={[styles.companyName, { color: theme.custom.colors.textSecondary }]}>{result.visitor?.company}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>{result.pass?.status}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={{ color: theme.custom.colors.textSecondary }}>Pass ID:</Text>
                  <Text style={{ color: theme.custom.colors.textPrimary, fontWeight: '500' }}>{result.pass?.passId}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={{ color: theme.custom.colors.textSecondary }}>Host:</Text>
                  <Text style={{ color: theme.custom.colors.textPrimary, fontWeight: '500' }}>{result.visit?.hostId}</Text>
                </View>
                
                <PrimaryButton 
                  title="Proceed to Verification" 
                  onPress={handleVerify} 
                  style={{ marginTop: 24 }}
                />
              </>
            )}
          </View>
        ) : (
          <View style={styles.center}>
            {searchQuery.length > 2 ? (
              <Text style={{ color: theme.custom.colors.textSecondary }}>No records found.</Text>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="security" size={64} color={theme.custom.colors.border} />
                <Text style={[styles.emptyText, { color: theme.custom.colors.textSecondary }]}>
                  Type at least 3 characters to search across all visitor records.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
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
  helperText: {
    fontSize: 13,
    marginBottom: 8,
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
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  visitorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
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
  errorState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  }
});
