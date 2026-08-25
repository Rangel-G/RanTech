
import { RpmGaugeCard } from '@/components/ui/rpmGauge';
import { RpmTempGaugeCard } from '@/components/ui/tempGauge';
import COLORS from '@/constants/global-styles';
import { useReception } from '@/hooks/useReception';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function SportDashboard() {
    const { data } = useReception();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.dashboard}>
                {/* Velocímetro/RPM Esquerdo */}
                <RpmGaugeCard
                    speed={data.speed}
                    rpm={data.rpm}
                    maxRpm={data.rpmMax}
                    gear={data.gear || 'N'}
                    showShiftLight={data.rpm > 6500}
                />

                {/* Temp Direita */}
                <RpmTempGaugeCard
                    temperature={data.ect || 90}
                />
            </View>

            {/* Indicadores de Status */}
            <View style={styles.statusBar}>
                <View style={styles.statusItem}>
                    <View style={[styles.ledIndicator, { backgroundColor: COLORS.status.connected }]} />
                    <Text style={styles.statusLabel}>OBD Conectado</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.ledIndicator, { backgroundColor: COLORS.status.receiving }]} />
                    <Text style={styles.statusLabel}>Dados Recebendo</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.ledIndicator, { backgroundColor: COLORS.status.connected }]} />
                    <Text style={styles.statusLabel}>LED Conectado</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.darkBase,
    },
    contentContainer: {
        padding: 16,
    },
    dashboard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.overlay.cyan.veryLow,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ledIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusLabel: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
});