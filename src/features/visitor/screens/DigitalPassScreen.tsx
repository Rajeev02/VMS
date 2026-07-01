import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert, Share } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { NotificationService, NotificationChannel, NotificationPayload } from '../../../core/notifications/NotificationService';
import { PassStatus } from '../../../domain/models/enums';

export const DigitalPassScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();

  // In reality, this data would come from the repository based on route.params.passId
  const [passDetails] = useState({
    name: 'John Doe',
    company: 'ABC Technologies',
    host: 'Rajeev Joshi',
    building: 'Headquarters',
    floor: 'Floor 3',
    purpose: 'System Integration Meeting',
    validFrom: '12 Jul 2024, 09:00 AM',
    validUntil: '12 Jul 2024, 05:00 PM',
    expectedExitTime: '05:00 PM',
    passId: 'VX-240712-0001',
    qrToken: 'SECURE_QR_TOKEN_ABC123',
    status: PassStatus.GENERATED,
    instructions: 'Please bring a valid Government ID.',
    publicUrl: 'https://vms.example.com/pass/VX-240712-0001', // Deep link ready
  });

  const handleShare = async (channel: NotificationChannel) => {
    const payload: NotificationPayload = {
      title: 'Your Visitor Pass',
      body: `Hi ${passDetails.name}, here is your secure visitor pass for your visit to ${passDetails.building}. Link: ${passDetails.publicUrl}`,
      channels: [channel],
    };

    await NotificationService.send(payload);
    Alert.alert('Pass Shared', `Pass was successfully sent via ${channel}.`);
  };

  const handleCopyLink = () => {
    // React Native clipboard mock
    Alert.alert('Link Copied', 'Secure pass link copied to clipboard.');
  };

  const isExpired = passDetails.status === PassStatus.EXPIRED || passDetails.status === PassStatus.REVOKED;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>Digital Visitor Pass</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.passCard, { backgroundColor: theme.custom.colors.surface }]}>
          
          <View style={[
            styles.statusBanner, 
            { backgroundColor: isExpired ? '#FEE2E2' : '#DCFCE7' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: isExpired ? '#991B1B' : '#166534' }
            ]}>
              {passDetails.status}
            </Text>
          </View>

          <View style={styles.passHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="person" size={40} color={theme.colors.primary} />
            </View>
            <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{passDetails.name}</Text>
            <Text style={[styles.companyName, { color: theme.custom.colors.textSecondary }]}>{passDetails.company}</Text>
          </View>

          <View style={[styles.divider, { borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed', borderColor: theme.custom.colors.border }]} />

          <View style={styles.qrSection}>
            <Text style={[styles.validText, { color: theme.custom.colors.textSecondary }]}>VALID UNTIL</Text>
            <Text style={[styles.validDate, { color: isExpired ? '#EF4444' : theme.custom.colors.textPrimary }]}>
              {passDetails.validUntil}
            </Text>
            
            <View style={[
              styles.qrPlaceholder, 
              { borderColor: theme.custom.colors.border, opacity: isExpired ? 0.3 : 1 }
            ]}>
              <Icon name="qr-code-2" size={120} color={theme.custom.colors.textPrimary} />
            </View>
            <Text style={[styles.passId, { color: theme.custom.colors.textSecondary }]}>Pass ID: {passDetails.passId}</Text>
          </View>

          <View style={[styles.divider, { borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed', borderColor: theme.custom.colors.border }]} />

          <View style={styles.detailsSection}>
            <DetailRow label="Host" value={passDetails.host} theme={theme} />
            <DetailRow label="Location" value={`${passDetails.building}, ${passDetails.floor}`} theme={theme} />
            <DetailRow label="Purpose" value={passDetails.purpose} theme={theme} />
            <DetailRow label="Expected Exit" value={passDetails.expectedExitTime} theme={theme} />
            
            {passDetails.instructions ? (
              <View style={styles.instructionsContainer}>
                <Icon name="info-outline" size={16} color={theme.colors.secondary} style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={[styles.instructions, { color: theme.custom.colors.textSecondary }]}>{passDetails.instructions}</Text>
              </View>
            ) : null}
          </View>

        </View>
        
        {!isExpired && (
          <View style={styles.actionsContainer}>
            <Text style={[styles.shareTitle, { color: '#FFF' }]}>Share Pass</Text>
            <View style={styles.shareRow}>
              <ShareButton icon="message" label="SMS" onPress={() => handleShare(NotificationChannel.SMS)} />
              <ShareButton icon="email" label="Email" onPress={() => handleShare(NotificationChannel.EMAIL)} />
              <ShareButton icon="chat" label="WhatsApp" onPress={() => handleShare(NotificationChannel.WHATSAPP)} />
              <ShareButton icon="link" label="Copy Link" onPress={handleCopyLink} />
            </View>

            <PrimaryButton 
              title="Add to Apple Wallet" 
              onPress={() => {}} 
              style={styles.walletButton}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const ShareButton = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.shareBtn} onPress={onPress}>
    <View style={styles.shareIconCircle}>
      <Icon name={icon} size={24} color="#FFF" />
    </View>
    <Text style={styles.shareLabel}>{label}</Text>
  </TouchableOpacity>
);

const DetailRow = ({ label, value, theme }: any) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.custom.colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.custom.colors.textPrimary }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 12,
  },
  passCard: {
    borderRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  statusBanner: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  passHeader: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  visitorName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
  },
  divider: {
    borderWidth: 1,
    marginHorizontal: 24,
  },
  qrSection: {
    padding: 24,
    alignItems: 'center',
  },
  validText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  validDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  passId: {
    fontSize: 12,
  },
  detailsSection: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  instructionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  instructions: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    marginTop: 32,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  shareBtn: {
    alignItems: 'center',
  },
  shareIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    color: '#FFF',
    fontSize: 12,
  },
  walletButton: {
    backgroundColor: '#000', // Apple wallet black
    marginBottom: 12,
  },
});
