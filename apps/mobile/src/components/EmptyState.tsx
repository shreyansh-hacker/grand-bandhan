import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { ImperialButton } from './ImperialButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  actionTitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  message,
  actionTitle,
  actionLabel,
  onActionPress,
  onAction,
  icon,
  style,
}) => {
  const finalDescription = description || message || '';
  const finalActionTitle = actionTitle || actionLabel;
  const finalOnAction = onActionPress || onAction;

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
      {Boolean(finalDescription) && <Text style={styles.description}>{finalDescription}</Text>}
      {finalActionTitle && finalOnAction && (
        <ImperialButton
          title={finalActionTitle}
          onPress={finalOnAction}
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
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: '#8E9CAE',
    textAlign: 'center',
    lineHeight: typography.lineHeight.sm,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: spacing.base,
  },
});
