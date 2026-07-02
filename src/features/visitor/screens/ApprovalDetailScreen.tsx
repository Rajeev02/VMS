import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { ProcessApprovalUseCase } from '../usecases/ProcessApprovalUseCase';

export const ApprovalDetailScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { visit, visitor } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setIsProcessing(true);
    try {
      const { MockEmailService, MockSmsService, MockWhatsAppService, MockPushNotificationService } = require('../../../infrastructure/notifications/MockNotificationServices');
      const { NotificationFacade } = require('../../notifications/NotificationFacade');
      
      const facade = new NotificationFacade(
        new MockEmailService(),
        new MockSmsService(),
        new MockWhatsAppService(),
        new MockPushNotificationService()
      );
      
      const useCase = new ProcessApprovalUseCase(facade);
      await useCase.execute(visit.id, action, visit.hostId);
      
      Alert.alert(
        'Success',
        `Visit has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log('Approval error:', error);
      Alert.alert('Error', 'Failed to process approval.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Approval Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.visitorProfile}>
          {visitor?.photoUrl ? (
            <Image source={{ uri: visitor.photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="person" size={48} color={theme.custom.colors.textSecondary} />
            </View>
          )}
          <Text style={[styles.name, { color: theme.custom.colors.textPrimary }]}>{visitor?.name || 'Unknown'}</Text>
          <Text style={[styles.company, { color: theme.custom.colors.textSecondary }]}>{visitor?.company}</Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={[styles.infoCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <View style={styles.sectionHeader}>
              <Icon name="person-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Identity Details</Text>
            </View>
            {visitor?.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Phone:</Text>
                <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>{visitor.phone}</Text>
              </View>
            )}
            {visitor?.email && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>{visitor.email}</Text>
              </View>
            )}
            {visitor?.governmentId && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Gov ID:</Text>
                <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>**** {String(visitor.governmentId).slice(-4)}</Text>
              </View>
            )}
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border, marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <Icon name="event-note" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Visit Details</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Purpose:</Text>
              <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>{visit.purpose}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Time:</Text>
              <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>
                {new Date(visit.entryTime || visit.createdAt).toLocaleString()}
              </Text>
            </View>
            {visit.vehicleNumber && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Vehicle:</Text>
                <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>{visit.vehicleNumber}</Text>
              </View>
            )}
            {visit.notes && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.custom.colors.textSecondary }]}>Notes:</Text>
                <Text style={[styles.infoValue, { color: theme.custom.colors.textPrimary }]}>{visit.notes}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton 
          title="Reject" 
          onPress={() => handleAction('REJECT')} 
          disabled={isProcessing}
          style={styles.actionButton}
        />
        <View style={{ width: 16 }} />
        <PrimaryButton 
          title="Approve" 
          onPress={() => handleAction('APPROVE')} 
          disabled={isProcessing}
          style={styles.actionButton}
        />
      </View>
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 24 },
  visitorProfile: { alignItems: 'center', marginBottom: 32 },
  photo: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: 'bold' },
  company: { fontSize: 16, marginTop: 4 },
  cardsContainer: { paddingBottom: 24 },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  infoLabel: { flex: 1, fontSize: 14 },
  infoValue: { flex: 2, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: { flex: 1 },
});
