import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { VisitorRepository } from '../VisitorRepository';

export const CheckOutScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [badgeCollected, setBadgeCollected] = useState(false);

  const [visitor, setVisitor] = useState<any>(null);

  React.useEffect(() => {
    const loadVisitor = async () => {
      if (route.params?.passId) {
        const v = await VisitorRepository.getVisitorByPassQr(route.params.passId);
        if (v) setVisitor(v);
      }
    };
    loadVisitor();
  }, [route.params?.passId]);

  const handleCheckOut = () => {
    // Navigate back to Dashboard on success for demo
    navigation.navigate('DashboardTab');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Check-Out</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="person" size={60} color={theme.colors.primary} />
          </View>

          <View style={[styles.detailsCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Visitor Summary</Text>
            
            <DetailRow label="Name" value={visitor?.name || ''} theme={theme} />
            <DetailRow label="Company" value={visitor?.company || ''} theme={theme} />
            <DetailRow label="ID" value={visitor?.id || ''} theme={theme} />
            <DetailRow label="Status" value={visitor?.status || ''} theme={theme} />
          </View>

          <View style={[styles.badgeCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Verify Badge Collection</Text>
            <Text style={[styles.badgeDesc, { color: theme.custom.colors.textSecondary }]}>
              Please confirm that the visitor has returned their physical security badge.
            </Text>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.custom.colors.textPrimary }]}>Badge Collected</Text>
              <Switch 
                value={badgeCollected} 
                onValueChange={setBadgeCollected} 
                color={theme.colors.primary}
              />
            </View>
          </View>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Complete Check-Out" 
          onPress={handleCheckOut} 
          disabled={!badgeCollected}
        />
      </View>
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
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
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
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  badgeDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
