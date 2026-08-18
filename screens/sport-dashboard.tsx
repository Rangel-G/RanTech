import { GaugeCard } from '@/components/ui/gauge-card';
import { DEFAULT_GEAR } from '@/constants/gear-options';
import { BORDER_RADIUS, COLORS, COMPONENT_STYLES, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export function SportDashboard() {
    const [rpm, setRpm] = useState(2500);
    const [speed, setSpeed] = useState(85);
    const [turbo, setTurbo] = useState(0.8);
    const [gear, setGear] = useState(DEFAULT_GEAR);

    // Simulate data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRpm((prev) => Math.min(prev + Math.random() * 200 - 50, 8000));
            setSpeed((prev) => Math.min(prev + Math.random() * 10 - 3, 240));
            setTurbo((prev) => Math.max(Math.min(prev + Math.random() * 0.2 - 0.1, 2), 0));
        }, 500);
        return () => clearInterval(interval);
    }, []);


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.dashboard}>
                {/* Left Column - Large RPM Gauge */}
                <View style={{ position: 'relative', width: 500, height: 500 }}>
                    <GaugeCard
                        label="RPM"
                        value={7200}
                        max={8000}
                        unit="RPM"
                        size="smallMedium"
                        style={{ position: 'absolute', top: 0, left: 60 }}
                    />
                </View>

                {/* Right Column - Speed & Turbo */}
                <View style={styles.rightColumn}>
                    <View style={styles.gaugePair}>
                        <GaugeCard
                            label="Velocidade"
                            value={Math.round(speed)}
                            max={240}
                            unit="KM/H"
                            size="small"
                            color={COLORS.neon.brightGreen}
                            style={{ position: 'absolute', top: 0, left: -150 }}
                        />
                        <GaugeCard
                            label="Pressão Turbo"
                            value={Math.round(turbo * 10) / 10}
                            max={2}
                            unit="BAR"
                            size="small"
                            color={COLORS.neon.orange}
                            style={{ position: 'absolute', top: 0, left: 60 }}
                        />
                    </View>

                    {/* Digital Display - Gear & Speed */}
                    <View style={styles.digitalDisplay}>
                        <View style={styles.displayRow}>
                            <Text style={styles.displayLabel}>Marcha</Text>
                            <Text style={styles.displayValue}>{gear}</Text>
                        </View>
                        <View style={styles.displayRow}>
                            <Text style={styles.displayLabel}>Velocidade</Text>
                            <Text style={styles.displayValue}>{Math.round(speed)}</Text>
                        </View>

                        {/* Shift Light Indicator */}
                        {rpm > 6500 && (
                            <View style={styles.shiftLight}>
                                <Text style={styles.shiftLightText}>⚠️ SHIFT!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Status Indicators */}
            <View style={styles.statusBar}>
                <View style={styles.statusItem}>
                    <View style={[styles.ledIndicator, { backgroundColor: COLORS.status.connected }]} />
                    <Text style={styles.statusLabel}>OBD Conectado</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.ledIndicator, { backgroundColor: COLORS.status.receiving }]} />
                    <Text style={styles.statusLabel}>Dados Recebendo</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.darkBase,
        borderTopWidth: 1,
        borderTopColor: COLORS.overlay.cyan.veryLow,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    dashboard: {
        flexDirection: 'row',
        gap: SPACING.md,
        minHeight: height - 200,
    },
    leftColumn: {
        flex: 1.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightColumn: {
        flex: 1,
        justifyContent: 'space-between',
    },
    gaugePair: {
        gap: SPACING.sm,
    },
    digitalDisplay: {
        backgroundColor: COLORS.overlay.panel.medium,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.overlay.cyan.high,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    displayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    displayLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.medium,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        textTransform: 'uppercase',
    },
    displayValue: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        fontStyle: 'italic',
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
    centerDisplayLarge: {
        alignItems: 'center',
    },
    largeValue: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.black,
        color: COLORS.text.primary,
        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    },
    largeUnit: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.tertiary,
        letterSpacing: TYPOGRAPHY.letterSpacing.widest,
        marginTop: SPACING.xs,
    },
    shiftLight: {
        backgroundColor: COLORS.overlay.red.medium,
        borderColor: COLORS.overlay.red.medium,
        borderWidth: 2,
        borderRadius: BORDER_RADIUS.sm,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
    },
    shiftLightText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.neon.brightRed,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.sm,
        marginTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.overlay.cyan.veryLow,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    ledIndicator: {
        ...COMPONENT_STYLES.ledIndicator,
        shadowColor: COLORS.neon.cyan,
        shadowOpacity: SHADOWS.cyan.opacity,
        shadowRadius: SHADOWS.cyan.radius,
        elevation: SHADOWS.cyan.elevation,
    },
    statusLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        fontWeight: TYPOGRAPHY.weights.medium,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    },
});
