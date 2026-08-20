import { useLed } from '@/contexts/led-context';
import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PRESET_COLORS = [
    { name: 'Vermelho', r: 255, g: 0, b: 0, hex: '#FF0000' },
    { name: 'Verde', r: 0, g: 255, b: 0, hex: '#00FF00' },
    { name: 'Azul', r: 0, g: 0, b: 255, hex: '#0000FF' },
    { name: 'Amarelo', r: 255, g: 255, b: 0, hex: '#FFFF00' },
    { name: 'Ciano', r: 0, g: 255, b: 0, hex: '#00FFFF' },
    { name: 'Roxo', r: 128, g: 0, b: 128, hex: '#800080' },
    { name: 'Branco', r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    { name: 'Desligar', r: 0, g: 0, b: 0, hex: '#222222' },
];

export default function LedScreen() {
    const {
        ledSettings,
        updateLedSettings,
        isScanning,
        isConnected,
        connectedDevice,
        error,
        connectToLed,
        disconnect,
        setColor,
    } = useLed();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Painel de Teste — Fita LED</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Nome do Dispositivo BLE:</Text>
                    <TextInput
                        style={styles.input}
                        value={ledSettings.name}
                        onChangeText={(text) => updateLedSettings({ ...ledSettings, name: text })}
                        placeholder="Ex: HM-10, BT05, LEDDMX-000101"
                        placeholderTextColor="#666"
                        editable={!isConnected && !isScanning}
                    />

                    {!isConnected ? (
                        <TouchableOpacity
                            style={[styles.button, styles.connectButton]}
                            onPress={() => connectToLed()}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>Buscar e Conectar</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.disconnectButton]}
                            onPress={disconnect}
                        >
                            <Text style={styles.buttonText}>Desconectar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>
                        Status:{' '}
                        <Text
                            style={
                                isConnected
                                    ? styles.statusConnected
                                    : isScanning
                                        ? styles.statusScanning
                                        : styles.statusDisconnected
                            }
                        >
                            {isConnected
                                ? `Conectado (${connectedDevice?.name || ledSettings.name})`
                                : isScanning
                                    ? 'Buscando...'
                                    : 'Desconectado'}
                        </Text>
                    </Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                {isConnected && (
                    <View style={styles.card}>
                        <Text style={styles.label}>Cores Rápidas:</Text>
                        <View style={styles.colorGrid}>
                            {PRESET_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color.name}
                                    style={[styles.colorButton, { backgroundColor: color.hex }]}
                                    onPress={() => setColor(color.r, color.g, color.b)}
                                >
                                    <Text
                                        style={[
                                            styles.colorButtonText,
                                            ['#FFFFFF', '#00FF00', '#FFFF00', '#00FFFF'].includes(color.hex)
                                                ? { color: '#000' }
                                                : { color: '#FFF' },
                                        ]}
                                    >
                                        {color.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(2, 8, 16, 0.96)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 255, 255, 0.12)',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    label: {
        color: '#AAA',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        padding: 12,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectButton: {
        backgroundColor: '#007AFF',
    },
    disconnectButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statusContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    statusText: {
        color: '#FFF',
        fontSize: 16,
    },
    statusConnected: {
        color: '#34C759',
        fontWeight: 'bold',
    },
    statusScanning: {
        color: '#FF9500',
        fontWeight: 'bold',
    },
    statusDisconnected: {
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF453A',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    colorButton: {
        width: '48%',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    colorButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});