import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
    label: string;
    value: string | number;
    percentage: number;
    color?: string;
}

export function ProgressBar({ label, value, percentage, color = '#00ff66' }: ProgressBarProps) {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
            <View style={[styles.barBackground, { borderColor: color }]}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${clampedPercentage}%`,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#8be8ff',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    barBackground: {
        height: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
        shadowColor: '#00ffff',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
});
