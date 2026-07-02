import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppTheme } from '../../../theme/theme';
import { RootState } from '../../../app/store';
import Logger from '../../../core/logger/Logger';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { StatusBadge } from '../../../components/StatusBadge';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { PrimaryButton } from '../../../components/PrimaryButton';

// Domain Models & Repositories
import { Visitor } from '../../../domain/models/Visitor';
import { Visit } from '../../../domain/models/Visit';
import { AuditLog } from '../../../domain/models/AuditLog';
import { VisitorRepository } from '../VisitorRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { AuditRepository } from '../../../domain/repositories/AuditRepository';
import { VisitStatus } from '../../../domain/models/enums';
import { PermissionGuard } from '../../../core/auth/PermissionGuard';
import { hasPermission, Permissions } from '../../../core/auth/permissions';

const canRenderImageUri = (uri?: string) => {
  return !!uri && /^(https?:\/\/|file:\/\/)/i.test(uri);
};

const createNotificationFacade = () => {
  const { MockEmailService, MockSmsService, MockWhatsAppService, MockPushNotificationService } = require('../../../infrastructure/notifications/MockNotificationServices');
  const { NotificationFacade } = require('../../notifications/NotificationFacade');
  return new NotificationFacade(
    new MockEmailService(),
    new MockSmsService(),
    new MockWhatsAppService(),
    new MockPushNotificationService()
  );
};

export const VisitorDetailsScreen = () => {
  const theme = useTheme<AppTheme>();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [idCardLoadFailed, setIdCardLoadFailed] = useState(false);
  
  const fetchDetails = async () => {
    try {
      setLoading(true);
      if (route.params?.visitId) {
        const currentVisit = await VisitRepository.getById(route.params.visitId);
        if (currentVisit) {
          setVisit(currentVisit);
          
          const currentVisitor = await VisitorRepository.getVisitorById(currentVisit.visitorId);
          if (currentVisitor) {
            setVisitor(currentVisitor);
            setAvatarLoadFailed(false);
            setIdCardLoadFailed(false);
          }
          
          const logs = await AuditRepository.getLogsForEntity('VISIT', currentVisit.id);
          setAuditLogs(logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        }
      }
    } catch (error) {
      Logger.error('Failed to fetch visitor details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [route.params?.visitId]);

  const handleUpdateStatus = async (newStatus: VisitStatus) => {
    if (!visit) return;
    try {
      setLoading(true);
      if (newStatus === VisitStatus.APPROVED || newStatus === VisitStatus.REJECTED) {
        const { ProcessApprovalUseCase } = require('../usecases/ProcessApprovalUseCase');
        const useCase = new ProcessApprovalUseCase(createNotificationFacade());
        await useCase.execute(visit.id, newStatus === VisitStatus.APPROVED ? 'APPROVE' : 'REJECT', visit.hostId);
      } else {
        await VisitRepository.updateVisit(visit.id, { status: newStatus });
      }
      await fetchDetails(); // Refresh details
    } catch (e) {
      Logger.error('Failed to update status', e);
      setLoading(false);
    }
  };

  const userRole = (user?.role || '').toUpperCase();
  const canManagePendingVisit = !!user && (
    hasPermission(user.permissions || [], Permissions.CREATE_PRE_APPROVED) ||
    hasPermission(user.permissions || [], Permissions.REGISTER_WALK_IN) ||
    hasPermission(user.permissions || [], Permissions.CHECK_IN) ||
    hasPermission(user.permissions || [], Permissions.ALL) ||
    userRole.includes('ADMIN') ||
    userRole.includes('RECEPTIONIST') ||
    userRole.includes('SECURITY') ||
    userRole.includes('HOST')
  );

  const handleApproveAndGeneratePass = async () => {
    if (!visit) return;
    try {
      setLoading(true);
      const { ProcessApprovalUseCase } = require('../usecases/ProcessApprovalUseCase');
      const useCase = new ProcessApprovalUseCase(createNotificationFacade());
      await useCase.execute(visit.id, 'APPROVE', user?.id || visit.hostId);
      setLoading(false);
      navigation.navigate('DigitalPass', { visitId: visit.id });
    } catch (error) {
      Logger.error('Failed to approve and generate pass', error);
      setLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!visit) return;
    try {
      await VisitRepository.updateVisit(visit.id, { status: VisitStatus.CANCELLED });
      await fetchDetails();
    } catch (error) {
      Logger.error('Failed to cancel visit', error);
    }
  };

  const handleSendApprovalReminder = async () => {
    if (!visit || !visitor) return;
    try {
      await createNotificationFacade().sendArrivalNotification(visitor, visit);
      Logger.info(`[VisitorDetailsScreen] Approval reminder sent for visit=${visit.id}`);
    } catch (error) {
      Logger.error('Failed to send approval reminder', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!visitor || !visit) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background }]}>
        <Text style={{ color: theme.custom.colors.textPrimary }}>Visit Record Not Found</Text>
        <SecondaryButton title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const timelineEvents = auditLogs.map(log => ({
    title: log.action.replace('_', ' '),
    time: new Date(log.timestamp).toLocaleString(),
    isCompleted: true
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.custom.colors.background }}>
      <ScrollView style={[styles.container]}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            {canRenderImageUri(visitor.photoUrl) && !avatarLoadFailed ? (
              <Image source={{ uri: visitor.photoUrl }} style={styles.avatarImage} onError={() => setAvatarLoadFailed(true)} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="person" size={40} color={theme.colors.primary} />
              </View>
            )}
            <Text style={[styles.visitorName, { color: theme.custom.colors.textPrimary }]}>{visitor.name}</Text>
            <Text style={[styles.companyName, { color: theme.custom.colors.textSecondary }]}>{visitor.company || 'Individual'}</Text>
            <StatusBadge status={visit.status} style={{ marginTop: 8 }} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.custom.colors.textPrimary }]}>{visitor.totalVisits}</Text>
            <Text style={[styles.statLabel, { color: theme.custom.colors.textSecondary }]}>Total Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{visit.status === VisitStatus.CHECKED_IN ? 'Active' : 'Past'}</Text>
            <Text style={[styles.statLabel, { color: theme.custom.colors.textSecondary }]}>Status</Text>
          </View>
        </View>

        <View style={styles.detailsList}>
          <DetailRow label="Visit Purpose" value={visit.purpose} theme={theme} />
          <DetailRow label="Host ID" value={visit.hostId} theme={theme} />
          <DetailRow label="Scheduled Date" value={new Date(visit.scheduledDate).toLocaleDateString()} theme={theme} />
          {visitor.phone && <DetailRow label="Phone" value={visitor.phone} theme={theme} />}
          {visitor.email && <DetailRow label="Email" value={visitor.email} theme={theme} />}
          {visitor.governmentId && <DetailRow label="Gov ID" value="****" theme={theme} />}
        </View>

        {canRenderImageUri(visitor.idCardUrl) && (
          <View style={styles.verificationSection}>
            <Text style={[styles.sectionTitle, { color: theme.custom.colors.textPrimary }]}>Verification Documents</Text>
            {!idCardLoadFailed ? (
              <Image source={{ uri: visitor.idCardUrl }} style={styles.idCardImage} onError={() => setIdCardLoadFailed(true)} />
            ) : (
              <View style={[styles.documentPlaceholder, { borderColor: theme.custom.colors.border }]}>
                <Icon name="description" size={36} color={theme.custom.colors.textSecondary} />
                <Text style={[styles.documentPlaceholderText, { color: theme.custom.colors.textSecondary }]}>Document preview unavailable</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.timelineSection}>
          <Text style={[styles.timelineTitle, { color: theme.custom.colors.textPrimary }]}>Visit Audit Timeline</Text>
          
          {timelineEvents.map((event, index) => (
            <TimelineItem 
              key={index}
              title={event.title} 
              time={event.time} 
              isCompleted={event.isCompleted}
              isLast={index === timelineEvents.length - 1}
              theme={theme}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {visit.status === VisitStatus.PENDING && (
            <View style={{ marginBottom: 16 }}>
              {canManagePendingVisit && (
                <PrimaryButton title="Approve & Generate Pass" onPress={handleApproveAndGeneratePass} style={{ marginBottom: 12 }} />
              )}
              <SecondaryButton title="Send Approval Reminder" onPress={handleSendApprovalReminder} style={{ marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SecondaryButton title="Cancel" onPress={handleCancelVisit} style={{ flex: 1, marginRight: 8, borderColor: theme.custom.colors.error }} textStyle={{ color: theme.custom.colors.error }} />
                <SecondaryButton title="Reject" onPress={() => handleUpdateStatus(VisitStatus.REJECTED)} style={{ flex: 1, marginLeft: 8, borderColor: theme.custom.colors.warning }} textStyle={{ color: theme.custom.colors.warning }} />
              </View>
            </View>
          )}
          
          {visit.status === VisitStatus.APPROVED && (
            <PermissionGuard permission={Permissions.CHECK_IN}>
              <SecondaryButton title="Check In Visitor" onPress={() => handleUpdateStatus(VisitStatus.CHECKED_IN)} style={{ marginBottom: 16, backgroundColor: '#10B981' }} textStyle={{ color: 'white' }} />
            </PermissionGuard>
          )}

          {visit.status === VisitStatus.CHECKED_IN && (
            <PermissionGuard permission={Permissions.CHECK_OUT}>
              <SecondaryButton title="Check Out Visitor" onPress={() => handleUpdateStatus(VisitStatus.CHECKED_OUT)} style={{ marginBottom: 16, backgroundColor: '#F59E0B' }} textStyle={{ color: 'white' }} />
            </PermissionGuard>
          )}

          {visit.status !== VisitStatus.PENDING && visit.status !== VisitStatus.REJECTED && (
            <SecondaryButton title="View Digital Pass" onPress={() => navigation.navigate('DigitalPass', { visitId: visit.id })} />
          )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
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
  verificationSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  idCardImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
  },
  documentPlaceholder: {
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
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
