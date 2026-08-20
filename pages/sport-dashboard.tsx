import { GaugeCard } from '@/components/ui/gauge-card';
import { BORDER_RADIUS, COLORS, COMPONENT_STYLES, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import { useReception } from '@/services/reception';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export function SportDashboard() {
    const { data } = useReception()



    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.dashboard}>
                {/* Left Column - Large RPM Gauge */}
                <View style={{ position: 'relative', width: 500, height: 500 }}>
                    <GaugeCard
                        label="RPM"
                        value={data.rpm}
                        max={data.rpmMax}
                        unit="RPM"
                        size="medium"
                        style={{ position: 'absolute', top: 0, left: 60 }}
                    />
                </View>

                {/* Right Column - Speed & Turbo */}
                <View style={styles.rightColumn}>
                    <View style={styles.gaugePair}>
                        <GaugeCard
                            label="Velocidade"
                            value={Math.round(data.speed)}
                            max={240}
                            unit="KM/H"
                            size="small"
                            color={COLORS.neon.brightGreen}
                            style={{ position: 'absolute', top: 0, left: -150 }}
                        />
                        <GaugeCard
                            label="Pressão Turbo"
                            value={Math.round(data.turbo * 10) / 10}
                            max={2}
                            unit="BAR"
                            size="small"
                            color={COLORS.neon.orange}
                            style={{ position: 'absolute', top: 0, left: 60 }}
                        />
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
