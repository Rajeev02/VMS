import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const theme = useTheme<AppTheme>();
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: 'transparent',
          borderColor: theme.custom.colors.border,
          borderWidth: 1,
          borderRadius: theme.custom.borderRadius.md,
          paddingVertical: theme.custom.spacing.md,
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.custom.colors.textPrimary,
            fontSize: theme.custom.typography.sizes.body1,
            fontWeight: theme.custom.typography.weights.semibold as '600',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
