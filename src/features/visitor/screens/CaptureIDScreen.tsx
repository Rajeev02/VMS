import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../../theme/theme';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { VisitorRepository } from '../../visitor/VisitorRepository';

export const CaptureIDScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const visitorData = route.params?.visitorData || {};

  const [idCardUrl, setIdCardUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaptureID = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to capture the ID.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdCardUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error capturing ID:', error);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to pick the ID.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdCardUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking ID:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { LocalStorageService } = require('../../../infrastructure/storage/LocalStorageService');
      const { RegisterWalkInVisitorUseCase } = require('../usecases/RegisterWalkInVisitorUseCase');
      const { MockEmailService, MockSmsService, MockWhatsAppService, MockPushNotificationService } = require('../../../infrastructure/notifications/MockNotificationServices');
      const { NotificationFacade } = require('../../notifications/NotificationFacade');
      
      const storageService = new LocalStorageService();
      const facade = new NotificationFacade(
        new MockEmailService(),
        new MockSmsService(),
        new MockWhatsAppService(),
        new MockPushNotificationService()
      );
      const useCase = new RegisterWalkInVisitorUseCase(storageService, facade);

      const payload = {
        visitorData: visitorData,
        visitData: {
          purpose: visitorData.purpose,
          hostId: visitorData.hostId,
          vehicleNumber: visitorData.vehicleNumber,
          notes: visitorData.notes,
          entryTime: visitorData.validFrom,
          expectedExitTime: visitorData.validUntil,
        },
        photoLocalUri: visitorData.photoUrl,
        idCardLocalUri: idCardUrl,
      };
      
      const { visitor, visit, pass } = await useCase.execute(payload);
      navigation.navigate('CheckIn', { id: visitor.id });
    } catch (error) {
      console.log('Error registering visitor:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to register visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.custom.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Capture Government ID</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.custom.colors.textSecondary }]}>
          Please capture a clear photo of the visitor's ID card.
        </Text>

        {idCardUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: idCardUrl }} style={styles.idPreview} />
            <TouchableOpacity style={styles.retakeButton} onPress={handleCaptureID}>
              <Icon name="refresh" size={24} color="#FFF" />
              <Text style={{ color: '#FFF', marginLeft: 8 }}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraPlaceholder} onPress={handleCaptureID}>
            <Icon name="camera-alt" size={48} color={theme.custom.colors.textSecondary} />
            <Text style={[styles.cameraText, { color: theme.custom.colors.textSecondary }]}>
              Tap to Open Camera
            </Text>
            <View style={styles.idFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </TouchableOpacity>
        )}

        <SecondaryButton 
          title="Choose from Gallery" 
          onPress={handleGalleryPick} 
          style={styles.galleryButton}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title={isSubmitting ? "Processing..." : "Complete Registration"} 
          onPress={handleSubmit}
          disabled={!idCardUrl || isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  cameraPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraText: {
    marginTop: 8,
    fontSize: 16,
  },
  idFrame: {
    position: 'absolute',
    width: '85%',
    height: '75%',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#3B82F6', // Blue primary
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  galleryButton: {
    width: '100%',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#000',
  },
  idPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
