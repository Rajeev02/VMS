import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { GenerateVisitorReportUseCase } from '../usecases/GenerateVisitorReportUseCase';
import { ExportAuditLogsUseCase } from '../usecases/ExportAuditLogsUseCase';
import { MockDocumentService } from '../../../infrastructure/documents/MockDocumentService';

// A simple utility to get today and X days ago in ISO string
const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const ReportsScreen = () => {
  const theme = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();
  
  // For simplicity in Phase 11, we use pre-defined ranges rather than a complex DatePicker UI
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [generating, setGenerating] = useState(false);

  const getRangeValues = () => {
    const endDate = new Date().toISOString();
    let startDate = endDate;
    if (dateRange === 'TODAY') startDate = getDaysAgo(0);
    else if (dateRange === 'WEEK') startDate = getDaysAgo(7);
    else if (dateRange === 'MONTH') startDate = getDaysAgo(30);
    
    // To cover the full day
    return { startDate: startDate.split('T')[0] + 'T00:00:00.000Z', endDate };
  };

  const handleExportVisitorReport = async () => {
    try {
      setGenerating(true);
      const docService = new MockDocumentService();
      const useCase = new GenerateVisitorReportUseCase(docService);
      await useCase.execute(getRangeValues());
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportAuditLogs = async () => {
    try {
      setGenerating(true);
      const docService = new MockDocumentService();
      const useCase = new ExportAuditLogsUseCase(docService);
      await useCase.execute(getRangeValues());
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>Reports & Analytics</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Date Range</Text>
        <View style={styles.rangeTabs}>
          {(['TODAY', 'WEEK', 'MONTH'] as const).map((r) => (
            <TouchableOpacity 
              key={r}
              style={[
                styles.rangeTab, 
                dateRange === r && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setDateRange(r)}
            >
              <Text style={{ color: dateRange === r ? '#FFF' : theme.custom.colors.textSecondary, fontWeight: 'bold' }}>
                {r === 'TODAY' ? 'Today' : r === 'WEEK' ? 'Last 7 Days' : 'Last 30 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Available Reports</Text>
        
        <View style={[styles.reportCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
          <View style={styles.reportInfo}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F620' }]}>
              <Icon name="people" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.reportTitle, { color: theme.custom.colors.textPrimary }]}>Visitor Summary</Text>
              <Text style={[styles.reportDesc, { color: theme.custom.colors.textSecondary }]}>Export a CSV of all visitor records, status, and entry/exit times.</Text>
            </View>
          </View>
          <Button mode="contained" onPress={handleExportVisitorReport} disabled={generating} style={{ marginTop: 16 }}>
            Generate CSV
          </Button>
        </View>

        <View style={[styles.reportCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border, marginTop: 16 }]}>
          <View style={styles.reportInfo}>
            <View style={[styles.iconContainer, { backgroundColor: '#F59E0B20' }]}>
              <Icon name="security" size={24} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.reportTitle, { color: theme.custom.colors.textPrimary }]}>System Audit Logs</Text>
              <Text style={[styles.reportDesc, { color: theme.custom.colors.textSecondary }]}>Export a CSV of immutable system events for compliance auditing.</Text>
            </View>
          </View>
          <Button mode="contained" onPress={handleExportAuditLogs} disabled={generating} style={{ marginTop: 16 }}>
            Generate Logs
          </Button>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
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
  rangeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 40, // leave space for text
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 18,
  }
});
