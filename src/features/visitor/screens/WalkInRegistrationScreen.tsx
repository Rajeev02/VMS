import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { CustomInput } from '../../../components/CustomInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const WalkInRegistrationScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleNext = () => {
    navigation.navigate('CaptureID');
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

        <View style={styles.stepContainer}>
          <Text style={[styles.stepText, { color: theme.custom.colors.textSecondary }]}>Step 1 of 3</Text>
          <Text style={[styles.title, { color: theme.custom.colors.textPrimary }]}>Visitor Information</Text>
        </View>

        <View style={styles.form}>
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Continue" 
          onPress={handleNext} 
          disabled={!fullName || !phone || !company}
        />
      </View>
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
  stepContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
});
