import { COLORS, TYPOGRAPHY } from '@/constants/global-styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GaugeCardProps {
    label: string;
    value: number;
    max: number;
    unit?: string;
    size?: 'small' | 'medium' | 'large';
    color?: string;
    centerDisplay?: React.ReactNode;
    style?: object;
}

export function GaugeCard({
    label,
    value,
    max,
    unit = '',
    size = 'medium',
    color = COLORS.neon.cyan,
    centerDisplay,
    style = {},
}: GaugeCardProps) {
    const sizeConfig = {
        small: { diameter: 140, innerDiameter: 110, ringWidth: 12 },
        smallMedium: { diameter: 240, innerDiameter: 200, ringWidth: 16 },
        medium: { diameter: 280, innerDiameter: 220, ringWidth: 18 },
        mediumLarge: { diameter: 320, innerDiameter: 250, ringWidth: 20 },
        large: { diameter: 380, innerDiameter: 300, ringWidth: 22 },
    };

    const config = sizeConfig[size];
    const percentage = Math.min(value / max, 1);

    return (
        <View style={[styles.container, { width: config.diameter, height: config.diameter + 40 }, style]}>
            <View style={[styles.gaugeWrapper, { width: config.diameter, height: config.diameter }]}>
                {/* Outer ring background */}
                <View
                    style={[
                        styles.gaugeRingBg,
                        {
                            width: config.diameter,
                            height: config.diameter,
                            borderRadius: config.diameter / 2,
                            borderWidth: config.ringWidth,
                            borderColor: COLORS.overlay.cyan.veryLow,
                        },
                    ]}
                />

                {/* Filled progress ring - simulated with rotated views */}
                <View
                    style={[
                        styles.gaugeProgress,
                        {
                            width: config.diameter,
                            height: config.diameter,
                            borderRadius: config.diameter / 2,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.progressSegment,
                            {
                                width: '100%',
                                height: '100%',
                                borderRadius: config.diameter / 2,
                                borderTopWidth: config.ringWidth,
                                borderTopColor: color,
                                borderRightWidth: config.ringWidth,
                                borderRightColor: color,
                                transform: [{ rotate: `${percentage * 360 - 90}deg` }],
                                opacity: 0.8,
                            },
                        ]}
                    />
                </View>

                {/* Inner circle background */}
                <View
                    style={[
                        styles.gaugeInner,
                        {
                            width: config.innerDiameter,
                            height: config.innerDiameter,
                            borderRadius: config.innerDiameter / 2,
                            top: (config.diameter - config.innerDiameter) / 2,
                            left: (config.diameter - config.innerDiameter) / 2,
                        },
                    ]}
                />

                {/* Center display content */}
                <View style={styles.centerDisplay}>
                    {centerDisplay ? (
                        centerDisplay
                    ) : (
                        <>
                            <Text style={styles.gaugeValue}>{value}</Text>
                            {unit && <Text style={styles.gaugeUnit}>{unit}</Text>}
                        </>
                    )}
                </View>
            </View>

            {/* Label below gauge */}
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
    },
    gaugeWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    gaugeRingBg: {
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    gaugeProgress: {
        position: 'absolute',
        overflow: 'hidden',
    },
    progressSegment: {
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    gaugeInner: {
        position: 'absolute',
        backgroundColor: COLORS.background.darkLight,
        borderWidth: 1,
        borderColor: COLORS.overlay.cyan.low,
        shadowColor: COLORS.neon.cyan,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    centerDisplay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    gaugeValue: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        textShadowColor: 'rgba(255, 255, 255, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    gaugeUnit: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.tertiary,
        letterSpacing: TYPOGRAPHY.letterSpacing.widest,
        textTransform: 'uppercase',
        marginTop: 4,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        textTransform: 'uppercase',
        marginTop: 8,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
});

