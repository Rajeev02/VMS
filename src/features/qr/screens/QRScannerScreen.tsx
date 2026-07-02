import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Button } from 'react-native-paper';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../../theme/theme';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import Logger from '../../../core/logger/Logger';
import { VisitStatus } from '../../../domain/models/enums';
import { ValidateQrScanUseCase } from '../usecases/ValidateQrScanUseCase';
import { VerifyCheckpointUseCase } from '../usecases/VerifyCheckpointUseCase';
import { ProcessCheckOutUseCase } from '../../visitor/usecases/ProcessCheckOutUseCase';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export const QRScannerScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('not-determined');
  const [processing, setProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanMode, setScanMode] = useState<'CHECK_IN' | 'CHECKPOINT' | 'CHECK_OUT'>('CHECK_IN');
  
  const isProcessingRef = useRef(false);

  const checkAndRequestPermission = async () => {
    const currentStatus = Camera.getCameraPermissionStatus();
    if (currentStatus === 'granted') {
      setHasPermission(true);
      setPermissionStatus('granted');
    } else {
      const newStatus = await Camera.requestCameraPermission();
      setHasPermission(newStatus === 'granted');
      setPermissionStatus(newStatus);
    }
  };

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  const openSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Error', 'Unable to open settings. Please open your device settings and manually grant the camera permission.');
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      if (isProcessingRef.current || processing || codes.length === 0 || !codes[0].value) return;
      isProcessingRef.current = true;
      setProcessing(true);
      
      const qrValue = codes[0].value;
      Logger.info(`QR Scanned: ${qrValue}`);
      
      try {
        if (scanMode === 'CHECK_IN') {
          const useCase = new ValidateQrScanUseCase();
          const result = await useCase.execute(qrValue);

          if (!result.isValid) {
            throw new Error(result.error || 'Invalid QR code.');
          }

          Alert.alert('Scan Successful', 'Navigating to check-in...');
          navigation.navigate('CheckIn', { 
            visitId: result.pass?.visitId, 
            qrToken: qrValue,
            visitorId: result.pass?.visitorId 
          });
        } else if (scanMode === 'CHECKPOINT') {
          // Checkpoint mode
          const validateCase = new ValidateQrScanUseCase();
          const useCase = new VerifyCheckpointUseCase(validateCase);
          const result = await useCase.execute({
            qrToken: qrValue,
            checkpointName: 'Internal Security Gate',
            scannedBy: 'Guard123'
          });

          if (!result.isValid) {
            throw new Error(result.error || 'Invalid QR code.');
          }

          Alert.alert('Verification Successful', `${result.visitor?.name} is authorized. Checkpoint logged.`);
        } else if (scanMode === 'CHECK_OUT') {
          // Check-Out mode
          const validateCase = new ValidateQrScanUseCase();
          const result = await validateCase.execute(qrValue);

          // For check-out, we only care that the pass is currently valid (or at least belongs to a visit).
          // If the pass is expired, they might already be checked out.
          if (!result.visit) {
            throw new Error('Associated visit not found for this QR code.');
          }

          if (result.visit.status !== VisitStatus.CHECKED_IN) {
            throw new Error(`Cannot check out. Visitor is currently in status: ${result.visit.status}`);
          }

          const useCase = new ProcessCheckOutUseCase();
          await useCase.execute(result.visit.id);
          
          Alert.alert('Check-Out Successful', `${result.visitor?.name || 'Visitor'} has been securely checked out.`);
        }
      } catch (e: any) {
        Logger.error('QR Validation failed', e);
        Alert.alert('Scan Failed', e.message || 'The pass is invalid or expired.');
      } finally {
        setTimeout(() => {
          setProcessing(false);
          isProcessingRef.current = false;
        }, 2000);
      }
    },
  });

  if (!hasPermission) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background, padding: 24 }]}>
        <Icon name="videocam-off" size={64} color={theme.custom.colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={{ color: theme.custom.colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          Camera Permission Required
        </Text>
        <Text style={{ color: theme.custom.colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          {permissionStatus === 'denied' 
            ? "You have denied camera access. Please enable it in your device settings to scan visitor QR passes."
            : "We need access to your camera to scan visitor QR passes."}
        </Text>
        
        {permissionStatus === 'denied' ? (
          <Button mode="contained" onPress={openSettings} style={{ width: '100%' }}>
            Open Settings
          </Button>
        ) : (
          <Button mode="contained" onPress={checkAndRequestPermission} style={{ width: '100%' }}>
            Grant Permission
          </Button>
        )}
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.custom.colors.background, padding: 24 }]}>
        <Icon name="error-outline" size={64} color={theme.custom.colors.error} style={{ marginBottom: 16 }} />
        <Text style={{ color: theme.custom.colors.textPrimary, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
          No Camera Device Found
        </Text>
      </View>
    );
  }

  const handleGalleryPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to scan a QR code from your gallery!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // BarcodeScanner is deprecated and removed to fix iOS build errors.
        Alert.alert('Not Supported', 'Scanning from gallery is currently disabled while we upgrade the barcode scanner library.');
      }
    } catch (error) {
      Logger.error('Failed to pick and scan image', error);
      Alert.alert('Error', 'An error occurred while picking the image.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused && !processing}
          codeScanner={codeScanner}
          torch={flashOn ? 'on' : 'off'}
        />
      )}
      
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Scan Visitor Pass</Text>
            <Text style={styles.subtitle}>
              {scanMode === 'CHECK_IN' ? 'Align QR code for Main Gate Entry' : 
               scanMode === 'CHECK_OUT' ? 'Align QR code to Check-Out' : 
               'Verify Pass at Checkpoint'}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modeToggleContainer}>
          <TouchableOpacity 
            style={[styles.modeToggleBtn, scanMode === 'CHECK_IN' && styles.modeToggleActive]}
            onPress={() => setScanMode('CHECK_IN')}
          >
            <Text style={[styles.modeToggleText, scanMode === 'CHECK_IN' && styles.modeToggleActiveText]}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeToggleBtn, scanMode === 'CHECKPOINT' && styles.modeToggleActive]}
            onPress={() => setScanMode('CHECKPOINT')}
          >
            <Text style={[styles.modeToggleText, scanMode === 'CHECKPOINT' && styles.modeToggleActiveText]}>Checkpoint</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeToggleBtn, scanMode === 'CHECK_OUT' && styles.modeToggleActive]}
            onPress={() => setScanMode('CHECK_OUT')}
          >
            <Text style={[styles.modeToggleText, scanMode === 'CHECK_OUT' && styles.modeToggleActiveText]}>Check-Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scannerFrameContainer}>
          <View style={styles.scannerFrame}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.bottomAction}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Icon name={flashOn ? "flash-on" : "flash-off"} size={28} color="#FFF" />
            <Text style={styles.bottomActionText}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomAction} onPress={handleGalleryPick}>
            <Icon name="photo-library" size={28} color="#FFF" />
            <Text style={styles.bottomActionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  modeToggleActive: {
    backgroundColor: '#10B981',
  },
  modeToggleText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modeToggleActiveText: {
    color: '#FFF',
  },
  scannerFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10B981', // Success green from theme
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 40,
    paddingTop: 20,
  },
  bottomAction: {
    alignItems: 'center',
  },
  bottomActionText: {
    color: '#FFF',
    marginTop: 8,
    fontSize: 12,
  },
});
