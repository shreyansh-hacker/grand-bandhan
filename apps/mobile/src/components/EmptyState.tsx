import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { ImperialButton } from './ImperialButton';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onActionPress,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <View style={styles.defaultEmblem}>
          <Text style={styles.emblemText}>👑</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress && (
        <ImperialButton
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  defaultEmblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emblemText: {
    fontSize: 28,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.sm,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: spacing.base,
  },
});
