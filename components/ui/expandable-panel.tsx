import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

interface ExpandablePanelProps {
  title: string;
  icon?: string;
  status?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandablePanel({
  title,
  icon,
  status,
  children,
  defaultExpanded = false,
}: ExpandablePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggleExpand}>
        <View style={styles.titleContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.metaContainer}>
          {status && <Text style={styles.status}>{status}</Text>}
          <Text style={[styles.arrow, expanded && styles.arrowUp]}>▼</Text>
        </View>
      </Pressable>

      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.overlay.cyan.medium,
    backgroundColor: COLORS.background.darkLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.overlay.panel.low,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: TYPOGRAPHY.sizes.xl,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  status: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    backgroundColor: COLORS.overlay.cyan.low,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  arrow: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    transform: [{ rotate: '0deg' }],
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.overlay.cyan.veryLow,
  },
});
