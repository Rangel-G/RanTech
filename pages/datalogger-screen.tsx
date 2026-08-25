import { ProgressBar } from '@/components/ui/progress-bar';
import { useReception } from '@/hooks/useReception';
import { DEFAULT_LED_SETTINGS, SettingsStorage } from '@/services/storage/settings-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Cor do LED quando estiver desligado / sem comunicação
const LED_OFF_COLOR = 'rgba(255, 255, 255, 0.15)';

export function DataloggerScreen() {
    const { data } = useReception();

    const [redlineRpm, setRedlineRpm] = useState<number>(DEFAULT_LED_SETTINGS.redlineRpm);

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

    // ─── Condições dinâmicas de conexão/status ──────────────────────────────
    const isObdConnected = data.fault === 'OK';
    const isReceivingData = data.rpm >= 0 && isObdConnected;
    const isLoggingActive = isReceivingData; // Pode trocar por uma flag real de gravação caso exista

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerSection}>
                <Text style={styles.sectionTitle}>TELEMETRIA EM TEMPO REAL</Text>
                <Text style={styles.subtitle}>Dados de Sensores OBD-II</Text>
            </View>

            <ProgressBar
                label="Frequência Interna"
                value={`${Math.round(data.rpm)} RPM`}
                percentage={(data.rpm / data.rpmMax) * 100}
                baseColor="#00ff66"
                isWarning={data.rpm > redlineRpm}
            />

            <ProgressBar
                label="Pressão de Admissão"
                value={`${data.map.toFixed(2)} BAR`}
                percentage={(data.map / data.mapMax) * 100}
                baseColor="#00fffa"
            />

            <ProgressBar
                label="Sensor de Temperatura"
                value={`${Math.round(data.ect)}°C`}
                percentage={(data.ect / data.ectMax) * 100}
                baseColor="#ff9500"
            />

            {/* Status section */}
            <View style={styles.statusSection}>
                <Text style={styles.statusTitle}>STATUS DE CONEXÃO</Text>

                {/* OBD Conectado */}
                <View style={styles.statusItem}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isObdConnected ? '#00ff66' : LED_OFF_COLOR,
                                shadowColor: isObdConnected ? '#00ff66' : 'transparent',
                            }
                        ]}
                    />
                    <Text style={[styles.statusText, !isObdConnected && styles.statusTextDisabled]}>
                        OBD Conectado
                    </Text>
                </View>

                {/* Recebendo Dados */}
                <View style={styles.statusItem}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isReceivingData ? '#00ffff' : LED_OFF_COLOR,
                                shadowColor: isReceivingData ? '#00ffff' : 'transparent',
                            }
                        ]}
                    />
                    <Text style={[styles.statusText, !isReceivingData && styles.statusTextDisabled]}>
                        Recebendo Dados
                    </Text>
                </View>

                {/* Logging Ativo */}
                <View style={styles.statusItem}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: isLoggingActive ? '#ffd700' : LED_OFF_COLOR,
                                shadowColor: isLoggingActive ? '#ffd700' : 'transparent',
                            }
                        ]}
                    />
                    <Text style={[styles.statusText, !isLoggingActive && styles.statusTextDisabled]}>
                        Logging Ativo
                    </Text>
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