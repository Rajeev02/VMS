import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';

export const DigitalPassScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();

  // Mock pass data
  const passDetails = {
    name: 'John Doe',
    company: 'ABC Technologies',
    host: 'Rajeev Joshi',
    validUntil: '12 Jul 2024, 05:00 PM',
    passId: 'VX-240712-0001',
    qrData: 'QR_MOCK_DATA'
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>Visitor Pass</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.passCard, { backgroundColor: theme.custom.colors.surface }]}>
          
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
            <Text style={[styles.validDate, { color: theme.custom.colors.textPrimary }]}>{passDetails.validUntil}</Text>
            
            <View style={[styles.qrPlaceholder, { borderColor: theme.custom.colors.border }]}>
              <Icon name="qr-code-2" size={120} color={theme.custom.colors.textPrimary} />
            </View>
            <Text style={[styles.passId, { color: theme.custom.colors.textSecondary }]}>Pass ID: {passDetails.passId}</Text>
          </View>

          <View style={[styles.divider, { borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed', borderColor: theme.custom.colors.border }]} />

          <View style={styles.detailsSection}>
            <DetailRow label="Host" value={passDetails.host} theme={theme} />
            <DetailRow label="Location" value="Main Office, Building A" theme={theme} />
          </View>

        </View>
        
        <View style={styles.actionsContainer}>
          <PrimaryButton 
            title="Add to Apple Wallet" 
            onPress={() => {}} 
            style={styles.walletButton}
          />
          <SecondaryButton 
            title="Share Pass" 
            onPress={() => {}} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

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
  passHeader: {
    padding: 24,
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
  },
  actionsContainer: {
    marginTop: 24,
  },
  walletButton: {
    backgroundColor: '#000', // Apple wallet black
    marginBottom: 12,
  },
});
