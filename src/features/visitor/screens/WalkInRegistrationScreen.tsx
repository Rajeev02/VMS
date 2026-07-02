import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppTheme } from '../../../theme/theme';
import { CustomInput } from '../../../components/CustomInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { SmartSearchService } from '../../../core/services/SmartSearchService';
import { Visitor } from '../../../domain/models/Visitor';

export const WalkInRegistrationScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();

  // Search Step
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Registration Data
  const [existingVisitor, setExistingVisitor] = useState<Visitor | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [govId, setGovId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Additional Visit Data
  const [hostId, setHostId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString());
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());
  const [notes, setNotes] = useState('');

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    const visitor = await SmartSearchService.findVisitor(searchQuery);
    setIsSearching(false);
    setHasSearched(true);
    
    if (visitor) {
      setExistingVisitor(visitor);
      setFullName(visitor.name || '');
      setPhone(visitor.phone || '');
      setEmail(visitor.email || '');
      setCompany(visitor.company || '');
      setGovId(visitor.governmentId || '');
    } else {
      // Pre-fill whatever they searched with into the right field
      if (searchQuery.includes('@')) setEmail(searchQuery);
      else if (/^[0-9+\-\s()]+$/.test(searchQuery)) setPhone(searchQuery);
      else setGovId(searchQuery); // Fallback assumption
    }
  };

  const resetSearch = () => {
    setHasSearched(false);
    setExistingVisitor(null);
    setSearchQuery('');
    setFullName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setGovId('');
    setPhotoUrl('');
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
    }
  };

  const handleNext = () => {
    navigation.navigate('CaptureID', {
      visitorData: {
        id: existingVisitor?.id, // Important: Pass existing ID if returning
        name: fullName,
        phone,
        email,
        company,
        governmentId: govId,
        photoUrl: photoUrl,
        hostId,
        purpose,
        vehicleNumber,
        validFrom,
        validUntil,
        notes,
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.custom.colors.background }]}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="close" size={24} color={theme.custom.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.custom.colors.textPrimary }]}>Walk-in Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        {!hasSearched ? (
          <View style={styles.content}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepText, { color: theme.custom.colors.textSecondary }]}>Step 1 of 3: Identity Search</Text>
              <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>Find Visitor</Text>
              <Text style={[styles.subtitle, { color: theme.custom.colors.textSecondary }]}>
                Search by Government ID, Phone, or Email to prevent duplicate records.
              </Text>
            </View>

            <View style={styles.form}>
              <CustomInput
                label="Search Identifier"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Enter ID, Phone, or Email"
                rightIcon="search"
                onRightIconPress={handleSearch}
              />
              <PrimaryButton 
                title={isSearching ? "Searching..." : "Search"} 
                onPress={handleSearch} 
                disabled={!searchQuery || isSearching}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.stepContainer}>
              <View style={styles.statusRow}>
                <Text style={[styles.stepText, { color: theme.custom.colors.textSecondary }]}>Step 2 of 3</Text>
                {existingVisitor ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Icon name="check-circle" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' }}>Returning Visitor</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
                    <Icon name="person-add" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: 'bold' }}>New Visitor</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>Visitor Information</Text>
            </View>

            {existingVisitor && (
              <View style={[styles.statsCard, { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border }]}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: theme.custom.colors.textPrimary }}>History Summary</Text>
                <Text style={{ fontSize: 14, color: theme.custom.colors.textSecondary }}>Total Visits: {existingVisitor.totalVisits}</Text>
                {existingVisitor.lastVisitDate && (
                  <Text style={{ fontSize: 14, color: theme.custom.colors.textSecondary }}>Last Visit: {new Date(existingVisitor.lastVisitDate).toLocaleDateString()}</Text>
                )}
                {existingVisitor.previousHosts.length > 0 && (
                  <Text style={{ fontSize: 14, color: theme.custom.colors.textSecondary }}>Previous Host: {existingVisitor.previousHosts[0]}</Text>
                )}
              </View>
            )}

            <View style={styles.form}>
              <CustomInput
                label="Government ID"
                value={govId}
                onChangeText={setGovId}
                placeholder="Enter ID number"
                disabled={!!existingVisitor?.governmentId}
              />
              <CustomInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
              />
              <CustomInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                disabled={!!existingVisitor?.phone}
              />
              <CustomInput
                label="Email (Optional)"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
              />
              <CustomInput
                label="Company / Organization"
                value={company}
                onChangeText={setCompany}
                placeholder="Enter company name"
              />
              <CustomInput
                label="Host Name/ID"
                value={hostId}
                onChangeText={setHostId}
                placeholder="Enter host name or ID"
              />
              <CustomInput
                label="Purpose of Visit"
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Enter purpose"
              />
              <CustomInput
                label="Vehicle Number (Optional)"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                placeholder="Enter vehicle number"
              />
              <CustomInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter notes"
              />
              
              <View style={styles.photoSection}>
                <Text style={[styles.photoLabel, { color: theme.custom.colors.textPrimary }]}>Visitor Photo</Text>
                {photoUrl ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
                    <SecondaryButton title="Retake Photo" onPress={handleTakePhoto} style={{ flex: 1, marginLeft: 16 }} />
                  </View>
                ) : (
                  <TouchableOpacity style={styles.photoPlaceholder} onPress={handleTakePhoto}>
                    <Icon name="add-a-photo" size={32} color={theme.custom.colors.textSecondary} />
                    <Text style={{ marginTop: 8, color: theme.custom.colors.textSecondary }}>Tap to take photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              <SecondaryButton title="Start Over" onPress={resetSearch} style={{ marginTop: 24 }} />
            </View>
          </View>
        )}
      </ScrollView>

      {hasSearched && (
        <View style={styles.footer}>
          <PrimaryButton 
            title="Continue" 
            onPress={handleNext} 
            disabled={!fullName || !phone || !company || !govId || !hostId || !purpose}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
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
  },
  stepContainer: {
    padding: 24,
    paddingBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  statsCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  form: {
    padding: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  photoSection: {
    marginTop: 16,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
});
