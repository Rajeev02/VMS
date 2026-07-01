import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { VisitorRepository } from '../../visitor/VisitorRepository';
import Logger from '../../../core/logger/Logger';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const QRScannerScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('not-determined');
  const [processing, setProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

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
      if (processing || codes.length === 0 || !codes[0].value) return;
      setProcessing(true);
      
      const qrValue = codes[0].value;
      Logger.info(`QR Scanned: ${qrValue}`);
      
      try {
        const visitor = await VisitorRepository.getVisitorByPassQr(qrValue);
        if (visitor) {
           navigation.navigate('CheckIn', { id: visitor.id });
        } else {
           Alert.alert('Invalid QR Code', 'This pass is not recognized.');
        }
      } catch (e) {
        Logger.error('QR Validation failed', e);
      } finally {
        setTimeout(() => setProcessing(false), 2000);
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
            <Text style={styles.subtitle}>Align QR code within the frame</Text>
          </View>
          <View style={{ width: 24 }} />
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

          <TouchableOpacity style={styles.bottomAction}>
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
