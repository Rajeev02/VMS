import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../../theme/theme';
import { VisitorRepository } from '../VisitorRepository';
import { MockNotificationService } from '../../../core/notifications/MockNotificationService';
import Logger from '../../../core/logger/Logger';

export const CreateVisitorScreen = () => {
  const theme = useTheme<AppTheme>();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !company) return;
    setLoading(true);
    try {
      const { visitor, pass } = await VisitorRepository.createVisitor({
        name,
        company,
        purpose,
        phone,
        email,
        type: 'WALK_IN', // Defaulting to Walk-In for Security creating them
        hostId: '1', // Mock host ID
      });

      if (visitor.status === 'PENDING_APPROVAL') {
         MockNotificationService.notifyHostApprovalRequired(visitor.hostId, visitor.name);
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
});
