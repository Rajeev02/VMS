import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { VisitStatus } from '../../../domain/models/enums';
import Logger from '../../../core/logger/Logger';
import { RegisterWalkInVisitorUseCase } from '../usecases/RegisterWalkInVisitorUseCase';
import { ServiceLocator } from '../../../core/di/ServiceLocator';
import * as ImagePicker from 'expo-image-picker';
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

  const handleTakePhoto = () => {
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
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        cameraType: cameraType,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name || !company) return;
    setLoading(true);
    try {
      const useCase = new RegisterWalkInVisitorUseCase(
        ServiceLocator.getStorageService(),
        ServiceLocator.getNotificationFacade()
      );

      const { visitor, visit, pass } = await useCase.execute({
        visitorData: {
          name,
          company,
          phone,
          email,
          photoUrl: photoUri || undefined // Would upload to Firebase Storage in a real implementation
        },
        visitData: {
          purpose,
          hostId: 'host-firebase-id-123', 
        },
        isPreApproved: false // Default to false for Reception/Guard screens
      });

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

        <TouchableOpacity style={styles.photoContainer} onPress={handleTakePhoto}>
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
