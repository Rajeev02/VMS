import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, error, isPassword, style, ...props }) => {
  const theme = useTheme<AppTheme>();
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.label,
          {
            color: theme.custom.colors.textSecondary,
            fontSize: theme.custom.typography.sizes.body2,
          },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.custom.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.custom.colors.border,
            borderRadius: theme.custom.borderRadius.md,
            backgroundColor: theme.custom.colors.surface,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.custom.colors.textPrimary,
              fontSize: theme.custom.typography.sizes.body1,
            },
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={theme.custom.colors.textSecondary}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.eyeIcon}
          >
            <Icon
              name={secureTextEntry ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.custom.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: theme.custom.colors.error,
              fontSize: theme.custom.typography.sizes.caption,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
  },
});
