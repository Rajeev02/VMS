import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { CustomInput } from '../../../components/CustomInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { VisitorRepository } from '../VisitorRepository';

export const CheckInScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [badgeNumber, setBadgeNumber] = useState('');

  const [visitor, setVisitor] = useState<any>(null);

  React.useEffect(() => {
    const loadVisitor = async () => {
      if (route.params?.passId) {
        // Fallback for demo: if we pass passId, use getVisitorById or similar.
        // Assuming we could fetch visitor by passId. For now we will fetch by QR which matches token.
        const v = await VisitorRepository.getVisitorByPassQr(route.params.passId);
        if (v) setVisitor(v);
      }
    };
    loadVisitor();
  }, [route.params?.passId]);

  const handleCheckIn = () => {
    // Navigate back to Dashboard on success for demo
    navigation.navigate('DashboardTab');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Check-In</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll}>
          <View style={styles.content}>
            
            <View style={styles.photoContainer}>
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" size={60} color={theme.colors.primary} />
              </View>
              <SecondaryButton 
                title="Capture Visitor Photo" 
                onPress={() => {}} 
                style={styles.captureButton} 
              />
            </View>

            <View style={[styles.detailsCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Visitor Details</Text>
              
              <DetailRow label="Name" value={visitor?.name || ''} theme={theme} />
              <DetailRow label="Company" value={visitor?.company || ''} theme={theme} />
              <DetailRow label="Phone" value={visitor?.phone || ''} theme={theme} />
              <DetailRow label="Email" value={visitor?.email || ''} theme={theme} />
              <DetailRow label="ID" value={visitor?.id || ''} theme={theme} />
            </View>

            <View style={[styles.badgeCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Security Verification</Text>
              <View style={[styles.verificationRow, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Icon name="check-circle" size={24} color={theme.colors.secondary} />
                <Text style={[styles.verificationText, { color: theme.custom.colors.textPrimary }]}>ID Verified Successfully</Text>
              </View>
              
              <CustomInput
                label="Assign Badge Number (Optional)"
                value={badgeNumber}
                onChangeText={setBadgeNumber}
                placeholder="Scan or enter badge number"
                rightIcon="qr-code-scanner"
                onRightIconPress={() => {}}
              />
            </View>

          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton 
            title="Approve & Check In" 
            onPress={handleCheckIn} 
          />
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureButton: {
    width: 200,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  badgeCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
