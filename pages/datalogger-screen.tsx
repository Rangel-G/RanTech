import { ChannelBox } from '@/components/ui/channel-box';
import { useCarData } from '@/hooks/useCarData';
import { useFuelConsumption } from '@/hooks/useFuelConsumption';
import { useHorsepower } from '@/hooks/useHorsePower';
import { usePerformanceTimer } from '@/hooks/usePerformanceTimer';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Cor do LED quando estiver desligado / sem comunicação
const LED_OFF_COLOR = 'rgba(255, 255, 255, 0.15)';

export function DataloggerScreen() {
    const { speed, maf } = useCarData();
    const { litersPerHour, kmPerLiter } = useFuelConsumption(maf, speed);
    const { zeroToHundred, isTiming } = usePerformanceTimer(speed);
    const { currentHp, peakHp } = useHorsepower(maf);



   return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerSection}>
                <Text style={styles.sectionTitle}>TELEMETRIA EM TEMPO REAL</Text>
            </View>

            {/* Grid Lado a Lado: Consumo e Vazão */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <ChannelBox label="Consumo Instantâneo" value={kmPerLiter.toFixed(1)} unit="KM/L" />
                </View>
                <View style={styles.cell}>
                    <ChannelBox label="Vazão de Combustível" value={litersPerHour.toFixed(1)} unit="L/H" />
                </View>
            </View>

            {/* Este ocupa a largura inteira (linha única) */}
            <View style={styles.fullWidthContainer}>
                <ChannelBox
                    label="0-100 KM/H"
                    value={isTiming ? "CRONOMETRANDO..." : (zeroToHundred ? `${zeroToHundred}s` : "AGUARDANDO")}
                    unit="PERFORMANCE"
                />
            </View>

            {/* Grid Lado a Lado: Potência Atual e Pico */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <ChannelBox label="Potência Atual" value={currentHp} unit="HP" />
                </View>
                <View style={styles.cell}>
                    <ChannelBox label="Pico de Potência" value={peakHp} unit="MAX HP" theme="warning" />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    cell: {
        flex: 1,
    },
    fullWidthContainer: {
        marginBottom: 12,
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(2, 8, 16, 0.96)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 255, 255, 0.12)',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    headerSection: {
        marginBottom: 28,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 255, 255, 0.15)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#8be8ff',
        letterSpacing: 0.5,
    },
    statusSection: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 255, 255, 0.15)',
    },
    statusTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    statusText: {
        fontSize: 13,
        color: '#8be8ff',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    statusTextDisabled: {
        color: 'rgba(255, 255, 255, 0.3)', // Texto esmaecido quando desconectado
    },
});