import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

export type StatusType = 'Draft' | 'Pending' | 'Approved' | 'Checked-In' | 'Checked-Out' | 'Completed' | 'Rejected' | 'Cancelled' | 'Expired' | 'No Show';

interface StatusBadgeProps {
  status: StatusType;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const theme = useTheme<AppTheme>();

  const getStatusColors = () => {
    switch (status) {
      case 'Approved':
      case 'Checked-In':
      case 'Completed':
        return { bg: '#D1FAE5', text: theme.custom.colors.success }; // Light green
      case 'Pending':
      case 'Draft':
        return { bg: '#FEF3C7', text: theme.custom.colors.warning }; // Light amber
      case 'Rejected':
      case 'Cancelled':
      case 'Expired':
      case 'No Show':
        return { bg: '#FEE2E2', text: theme.custom.colors.error }; // Light red
      case 'Checked-Out':
      default:
        return { bg: '#F1F5F9', text: theme.custom.colors.textSecondary }; // Light gray
    }
  };

  const { bg, text } = getStatusColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: theme.custom.borderRadius.round,
          paddingHorizontal: theme.custom.spacing.sm,
          paddingVertical: theme.custom.spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: theme.custom.typography.sizes.caption,
            fontWeight: theme.custom.typography.weights.medium as '500',
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
});
