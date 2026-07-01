import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { VisitorRepository } from '../VisitorRepository';
import { NotificationService, NotificationChannel } from '../../../core/notifications/NotificationService';
import { VisitStatus } from '../../../domain/models/enums';
import Logger from '../../../core/logger/Logger';
import * as ImagePicker from 'expo-image-picker';
import { Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export const CreateVisitorScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to capture a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !company) return;
    setLoading(true);
    try {
      const { visitor, visit, pass } = await VisitorRepository.registerWalkInVisitor({
        name,
        company,
        phone,
        email,
        photoUrl: photoUri || undefined // Would upload to Firebase Storage in a real implementation
      }, {
        purpose,
        hostId: 'host-firebase-id-123', 
      });

      if (visit.status === VisitStatus.PENDING) {
         await NotificationService.send({
           title: 'Host Approval Required',
           body: `${visitor.name} is waiting for your approval.`,
           channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
           data: { visitId: visit.id }
         });
         Logger.info('Host approval requested for Walk-In');
      }

      navigation.goBack();
    } catch (error) {
      Logger.error('Failed to create visitor', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <TextInput
          label="Full Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Company *"
          value={company}
          onChangeText={setCompany}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Purpose of Visit"
          value={purpose}
          onChangeText={setPurpose}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.photoContainer} onPress={handleCapturePhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color={theme.colors.primary} />
              <Button mode="text">Capture Visitor Photo</Button>
            </View>
          )}
        </TouchableOpacity>
        
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          loading={loading}
          disabled={loading || !name || !company}
          style={styles.button}
        >
          Register Walk-In
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  photoContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
