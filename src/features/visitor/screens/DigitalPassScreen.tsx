import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert, Share, Linking } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { NotificationService, NotificationChannel, NotificationPayload } from '../../../core/notifications/NotificationService';
import { PassStatus, VisitStatus } from '../../../domain/models/enums';
import { VisitorPassRepository } from '../../../domain/repositories/VisitorPassRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { VisitorRepository } from '../VisitorRepository';
import { useRoute } from '@react-navigation/native';

const buildPublicPassUrl = (token?: string) => {
  return token ? `https://rajeev02.github.io/vms/pass.html?token=${token}` : '';
};

const resolvePublicPassUrl = (publicUrl?: string, token?: string) => {
  if (!publicUrl || publicUrl.includes('token=mock')) {
    return buildPublicPassUrl(token);
  }

  return publicUrl;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const DigitalPassScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [passDetails, setPassDetails] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchPassDetails = async () => {
      const visitId = route.params?.visitId;
      if (!visitId) {
        setLoadError('Visit ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        const visit = await VisitRepository.getById(visitId);
        if (!visit) {
          setLoadError('Visit record was not found.');
          return;
        }

        const visitor = await VisitorRepository.getVisitorById(visit.visitorId);
        let pass = await VisitorPassRepository.getByVisitId(visitId);

        if (!pass && visit.status === VisitStatus.APPROVED) {
          const secureToken = generateUUID();
          pass = await VisitorPassRepository.createPass({
            id: secureToken,
            visitId,
            visitorId: visit.visitorId,
            passId: `VX-${Math.floor(1000 + Math.random() * 9000)}`,
            qrToken: secureToken,
            token: secureToken,
            visitorName: visitor?.name,
            hostName: visit.hostId,
            company: visitor?.company,
            purpose: visit.purpose,
            status: PassStatus.GENERATED,
            validFrom: visit.entryTime || new Date().toISOString(),
            validUntil: visit.expectedExitTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            gracePeriodMinutes: 30,
            publicUrl: buildPublicPassUrl(secureToken),
            generatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (!pass) {
          const message = visit.status === VisitStatus.PENDING
            ? 'Pass is not generated yet. The host must approve this visit first.'
            : `No digital pass found for this visit. Current visit status: ${visit.status}.`;
          setLoadError(message);
          return;
        }

        setPassDetails({
          name: visitor?.name,
          company: visitor?.company,
          host: visit.hostId,
          building: 'Headquarters',
          floor: 'Main Floor',
          purpose: visit.purpose,
          validFrom: new Date(visit.scheduledDate || Date.now()).toLocaleString(),
          validUntil: pass.validUntil ? new Date(pass.validUntil).toLocaleString() : 'N/A',
          expectedExitTime: '05:00 PM',
          passId: pass.passId,
          qrToken: pass.qrToken,
          status: pass.status,
          instructions: pass.instructions || 'Please bring a valid Government ID.',
          publicUrl: resolvePublicPassUrl(pass.publicUrl, pass.qrToken || pass.token),
        });
      } catch (error) {
        console.error('Failed to fetch pass details', error);
        setLoadError('Failed to load pass details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPassDetails();
  }, [route.params?.visitId]);

  const handleShare = async (channel: string) => {
    try {
      const publicUrl = resolvePublicPassUrl(passDetails.publicUrl, passDetails.qrToken);
      const message = `Here is your visitor pass for ${passDetails.building}. Link: ${publicUrl}`;
      const urlMessage = encodeURIComponent(message);
      
      switch (channel) {
        case 'SMS':
          await Linking.openURL(`sms:?body=${urlMessage}`);
          break;
        case 'EMAIL':
          await Linking.openURL(`mailto:?subject=Visitor Pass&body=${urlMessage}`);
          break;
        case 'WHATSAPP':
          await Linking.openURL(`whatsapp://send?text=${urlMessage}`);
          break;
        case 'ANY':
        default:
          await Share.share({
            message: message,
            url: publicUrl,
            title: 'Visitor Pass'
          });
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share the pass link using this channel.');
    }
  };

  const handlePrintPdf = async () => {
    try {
      const { MockDocumentService } = require('../../../infrastructure/documents/MockDocumentService');
      const docService = new MockDocumentService();
      
      const pdfUri = await docService.generatePdf(passDetails);
      await docService.printDocument(pdfUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate or print the pass.');
    }
  };


  const isExpired = passDetails?.status === PassStatus.EXPIRED || passDetails?.status === PassStatus.REVOKED;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>Loading Pass Details...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !passDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFF' }]}>Digital Visitor Pass</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Icon name="info-outline" size={48} color="#FFF" />
          <Text style={styles.emptyTitle}>Pass unavailable</Text>
          <Text style={styles.emptyMessage}>{loadError || 'No pass details are available for this visit.'}</Text>
          <PrimaryButton title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

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
              <ShareButton icon="message" label="SMS" onPress={() => handleShare('SMS')} />
              <ShareButton icon="email" label="Email" onPress={() => handleShare('EMAIL')} />
              <ShareButton icon="chat" label="WhatsApp" onPress={() => handleShare('WHATSAPP')} />
              <ShareButton icon="share" label="Share..." onPress={() => handleShare('ANY')} />
            </View>

            <PrimaryButton 
              title="Generate PDF & Print" 
              onPress={handlePrintPdf} 
              style={{ marginBottom: 12 }}
            />
            
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
  emptyState: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
