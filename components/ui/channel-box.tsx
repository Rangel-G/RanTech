import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ChannelBoxProps {
    label: string;
    value: string | number;
    unit?: string;
    size?: 'small' | 'smallMedium' | 'medium' | 'mediumLarge' | 'large';
    onPress?: () => void;
    isActive?: boolean;
    theme?: 'default' | 'success' | 'warning' | 'error';
}

export function ChannelBox({
    label,
    value,
    unit,
    size = 'medium',
    onPress,
    isActive = false,
    theme = 'default',
}: ChannelBoxProps) {
    const sizeStyles = {
        small: styles.sizeSmall,
        smallMedium: styles.sizeSmallMedium,
        medium: styles.sizeMedium,
        mediumLarge: styles.sizeMediumLarge,
        large: styles.sizeLarge,
    };

    const themeStyles = {
        default: styles.themeDefault,
        success: styles.themeSuccess,
        warning: styles.themeWarning,
        error: styles.themeError,
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [
                styles.container,
                sizeStyles[size],
                themeStyles[theme],
                isActive && styles.active,
                pressed && onPress && { opacity: 0.7 },
            ]}
        >
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.overlay.cyan.medium,
        backgroundColor: COLORS.background.darkMedium,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    sizeSmall: {
        paddingVertical: SPACING.xs,
        minHeight: 70,
    },
    sizeSmallMedium: {
        paddingVertical: SPACING.sm,
        minHeight: 100,
    },
    sizeMedium: {
        paddingVertical: SPACING.md,
        minHeight: 120,
    },
    sizeMediumLarge: {
        paddingVertical: SPACING.md,
        minHeight: 140,
    },
    sizeLarge: {
        paddingVertical: SPACING.xxl,
        minHeight: 160,
    },
    themeDefault: {
        borderColor: COLORS.overlay.cyan.medium,
    },
    themeSuccess: {
        borderColor: `rgba(${parseInt(COLORS.status.connected.slice(1, 3), 16)}, ${parseInt(COLORS.status.connected.slice(3, 5), 16)}, ${parseInt(COLORS.status.connected.slice(5, 7), 16)}, 0.3)`,
    },
    themeWarning: {
        borderColor: `rgba(${parseInt(COLORS.neon.orange.slice(1, 3), 16)}, ${parseInt(COLORS.neon.orange.slice(3, 5), 16)}, ${parseInt(COLORS.neon.orange.slice(5, 7), 16)}, 0.3)`,
    },
    themeError: {
        borderColor: COLORS.overlay.red.medium,
    },
    active: {
        borderColor: COLORS.overlay.cyan.high,
        backgroundColor: COLORS.overlay.cyan.low,
        shadowColor: COLORS.neon.cyan,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        textTransform: 'uppercase',
        marginBottom: SPACING.xs,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    value: {
        fontSize: TYPOGRAPHY.sizes.xl,
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.weights.black,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
    unit: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
        letterSpacing: TYPOGRAPHY.letterSpacing.widest,
        textTransform: 'uppercase',
        marginTop: SPACING.xs,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
});
