import { ProgressBar } from '@/components/ui/progress-bar';
import { DEFAULT_LED_SETTINGS, SettingsStorage } from '@/services/storage/settings-storage';
import { useFocusEffect } from '@react-navigation/native'; // ou 'expo-router' dependendo da sua estrutura
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function DataloggerScreen() {
    const [telemetry, setTelemetry] = useState({
        rpm: 0,
        rpmMax: 8000,
        map: 0,
        mapMax: 2,
        ect: 20,
        ectMax: 120,
    });

    // 1. Estado para guardar o valor de redline do usuário
    const [redlineRpm, setRedlineRpm] = useState<number>(DEFAULT_LED_SETTINGS.redlineRpm);

    // 2. Recarrega as configurações salvas sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            async function loadLedSettings() {
                try {
                    const ledSettings = await SettingsStorage.getLedSettings();
                    if (ledSettings?.redlineRpm) {
                        setRedlineRpm(ledSettings.redlineRpm);
                    }
                } catch (error) {
                    console.error('Erro ao carregar configurações de LED:', error);
                }
            }

            loadLedSettings();
        }, [])
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry((prev) => ({
                ...prev,
                rpm: Math.max(0, Math.min(8000, prev.rpm + Math.random() * 400 - 100)),
                map: Math.max(0, Math.min(2, prev.map + Math.random() * 0.2 - 0.1)),
                ect: Math.max(20, Math.min(120, prev.ect + Math.random() * 4 - 2)),
            }));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerSection}>
                <Text style={styles.sectionTitle}>TELEMETRIA EM TEMPO REAL</Text>
                <Text style={styles.subtitle}>Dados de Sensores OBD-II</Text>
            </View>

        

            <ProgressBar
                label="Frequência Interna"
                value={`${Math.round(telemetry.rpm)} RPM`}
                percentage={(telemetry.rpm / telemetry.rpmMax) * 100}
                baseColor="#00ff66"
                // 3. Usa o estado atualizado 'redlineRpm' em vez do valor padrão
                isWarning={telemetry.rpm > redlineRpm}
            />

            <ProgressBar
                label="Pressão de Admissão"
                value={`${telemetry.map.toFixed(2)} BAR`}
                percentage={(telemetry.map / telemetry.mapMax) * 100}
                baseColor="#00fffa"
            />

            <ProgressBar
                label="Sensor de Temperatura"
                value={`${Math.round(telemetry.ect)}°C`}
                percentage={(telemetry.ect / telemetry.ectMax) * 100}
                baseColor="#ff9500"
            />

            {/* Additional metrics grid */}


            {/* Status section */}
            <View style={styles.statusSection}>
                <Text style={styles.statusTitle}>STATUS DE CONEXÃO</Text>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#00ff66' }]} />
                    <Text style={styles.statusText}>OBD Conectado</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#00ffff' }]} />
                    <Text style={styles.statusText}>Recebendo Dados</Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: '#ffd700' }]} />
                    <Text style={styles.statusText}>Logging Ativo</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 20,
    },
    metricCard: {
        flex: 1,
        backgroundColor: 'rgba(0, 100, 150, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.2)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 11,
        color: '#8be8ff',
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 2,
    },
    metricUnit: {
        fontSize: 10,
        color: '#cccccc',
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
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 2,
    },
    statusText: {
        fontSize: 13,
        color: '#8be8ff',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
