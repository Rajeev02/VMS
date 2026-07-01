import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { Visitor, VisitorRepository } from '../VisitorRepository';
import Logger from '../../../core/logger/Logger';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBadge } from '../../../components/StatusBadge';
import { SecondaryButton } from '../../../components/SecondaryButton';

export const VisitorDetailsScreen = () => {
  const theme = useTheme<AppTheme>();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchVisitor();
  }, [route.params?.id]);

  const fetchVisitor = async () => {
    try {
      if (route.params?.id) {
        const data = await VisitorRepository.getVisitorById(route.params.id);
        // Mock data to match UI exactly
        setVisitor({
          ...data,
          name: 'John Doe',
          company: 'ABC Technologies Pvt Ltd',
          purpose: 'Business Meeting',
          host: 'Rajeev Joshi',
          date: '12 Jul 2024',
          time: '10:00 AM',
          validUntil: '12 Jul 2024, 05:00 PM',
          passId: 'VX-240712-0001',
          phone: '+91 98765 43210',
          email: 'john.doe@example.com',
          status: 'Approved'
        } as any);
      }
    } catch (error) {
      Logger.error('Failed to fetch visitor details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!visitor) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background }]}>
        <Text style={{ color: theme.custom.colors.textPrimary }}>Visitor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="person" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{visitor.name}</Text>
        <Text style={[styles.companyName, { color: theme.custom.colors.textSecondary }]}>{visitor.company}</Text>
        <StatusBadge status={(visitor.status as any) || 'Approved'} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.detailsList}>
        <DetailRow label="Visit Purpose" value={(visitor as any).purpose} theme={theme} />
        <DetailRow label="Host" value={(visitor as any).host} theme={theme} />
        <DetailRow label="Visit Date & Time" value={`${(visitor as any).date}, ${(visitor as any).time}`} theme={theme} />
        <DetailRow label="Valid Until" value={(visitor as any).validUntil} theme={theme} />
        <DetailRow label="Pass ID" value={(visitor as any).passId} theme={theme} />
        <DetailRow label="Phone" value={(visitor as any).phone} theme={theme} />
        <DetailRow label="Email" value={(visitor as any).email} theme={theme} />
      </View>

      <View style={styles.timelineSection}>
        <Text style={[styles.timelineTitle, { color: theme.custom.colors.textPrimary }]}>Timeline</Text>
        
        <TimelineItem 
          title="Pass Generated" 
          time="11 Jul 2024, 05:30 PM" 
          isCompleted={true}
          theme={theme}
        />
        <TimelineItem 
          title="Visitor Arrived" 
          time="12 Jul 2024, 09:50 AM" 
          isCompleted={true}
          theme={theme}
        />
        <TimelineItem 
          title="Checked-In" 
          time="12 Jul 2024, 10:05 AM" 
          isCompleted={true}
          isLast={true}
          theme={theme}
        />
      </View>

      <View style={styles.actions}>
        <SecondaryButton title="Resend Pass" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value, theme }: any) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.custom.colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.custom.colors.textPrimary }]}>{value}</Text>
  </View>
);

const TimelineItem = ({ title, time, isCompleted, isLast, theme }: any) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[
        styles.timelineDot,
        { backgroundColor: isCompleted ? theme.colors.primary : theme.custom.colors.border }
      ]} />
      {!isLast && (
        <View style={[
          styles.timelineLine,
          { backgroundColor: isCompleted ? theme.colors.primary : theme.custom.colors.border }
        ]} />
      )}
    </View>
    <View style={styles.timelineContent}>
      <Text style={[
        styles.timelineItemTitle,
        { color: isCompleted ? theme.custom.colors.textPrimary : theme.custom.colors.textSecondary }
      ]}>{title}</Text>
      <Text style={[styles.timelineItemTime, { color: theme.custom.colors.textSecondary }]}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  detailsList: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  timelineSection: {
    padding: 24,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginTop: -2,
    marginBottom: -2,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    marginTop: -4,
  },
  timelineItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineItemTime: {
    fontSize: 12,
  },
  actions: {
    padding: 24,
    paddingTop: 0,
    marginBottom: 24,
  },
});
