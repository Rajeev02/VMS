import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { CustomInput } from '../../../components/CustomInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { VisitorRepository } from '../VisitorRepository';
import { ProcessCheckInUseCase } from '../usecases/ProcessCheckInUseCase';
import * as ImagePicker from 'expo-image-picker';
import Logger from '../../../core/logger/Logger';

export const CheckInScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [badgeNumber, setBadgeNumber] = useState('');

  const [visitor, setVisitor] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const loadVisitor = async () => {
      if (route.params?.visitorId) {
        const firestore = require('@react-native-firebase/firestore').default;
        const v = await firestore().collection('visitors').doc(route.params.visitorId).get();
        if (v.exists && isMounted) setVisitor({ id: v.id, ...v.data() });
      } else if (route.params?.qrToken) {
        const v = await VisitorRepository.getVisitorByPassQr(route.params.qrToken);
        if (v && isMounted) setVisitor(v);
      }
    };
    loadVisitor();
    return () => {
      isMounted = false;
    };
  }, [route.params]);

  const handleCheckIn = async () => {
    if (!route.params?.visitId) {
      Alert.alert('Error', 'Missing Visit ID.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const { NotificationFacade } = require('../../notifications/NotificationFacade');
      const { MockEmailService, MockSmsService, MockWhatsAppService, MockPushNotificationService } = require('../../../infrastructure/notifications/MockNotificationServices');
      const { LocalStorageService } = require('../../../infrastructure/storage/LocalStorageService');
      
      const facade = new NotificationFacade(
        new MockEmailService(),
        new MockSmsService(),
        new MockWhatsAppService(),
        new MockPushNotificationService()
      );
      const storageService = new LocalStorageService();
      
      const useCase = new ProcessCheckInUseCase(facade, storageService);
      
      // We assume the qrToken was passed, if not we mock it for demo
      const qrToken = route.params?.qrToken || 'mock-token';
      
      await useCase.execute({
        visitId: route.params.visitId,
        qrToken: qrToken,
        badgeNumber: badgeNumber,
        newPhotoLocalUri: photoUri || undefined
      });
      
      Alert.alert('Check-In Successful', 'The visitor has been checked in and the host has been notified.', [
        { text: 'OK', onPress: () => navigation.navigate('DashboardTab') }
      ]);
    } catch (e: any) {
      console.log('Check-In Error:', e);
      Alert.alert('Check-In Failed', e.message || 'An error occurred during check-in.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapturePhoto = () => {
    Alert.alert(
      'Select Camera',
      'Which camera would you like to use?',
      [
        { text: 'Front Camera', onPress: () => openCamera(ImagePicker.CameraType.front) },
        { text: 'Back Camera', onPress: () => openCamera(ImagePicker.CameraType.back) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async (cameraType: any) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to capture a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        cameraType: cameraType,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Logger.error('Failed to capture photo', error);
      Alert.alert('Error', 'An error occurred while capturing the photo.');
    }
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
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPlaceholder} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="person" size={60} color={theme.colors.primary} />
                </View>
              )}
              <SecondaryButton 
                title={photoUri ? "Retake Visitor Photo" : "Capture Visitor Photo"} 
                onPress={handleCapturePhoto} 
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
            disabled={isProcessing}
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
