import { ExpandablePanel } from '@/components/ui/expandable-panel';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    DEFAULT_GEAR_SETTINGS,
    DEFAULT_LED_SETTINGS,
    DEFAULT_OBD_SETTINGS,
    GearSettings,
    LedSettings,
    ObdSettings,
    SettingsStorage,
} from '../services/storage/settings-storage';

export function SettingsScreen() {
    const obdTypeOptions = [
        { value: 'bluetooth', label: 'Bluetooth ELM327 (Porta COM)' },
        { value: 'usb', label: 'USB Direto (Porta COM)' },
    ];

    const baudRateOptions = ['9600', '38400', '115200', '500000'];
    const protocolOptions = [
        { value: 'auto', label: 'Auto Detectar (ATSP0)' },
        { value: 'iso9141', label: 'ISO 9141-2' },
        { value: 'iso14230', label: 'ISO 14230-4 (KWP)' },
        { value: 'can11-500', label: 'CAN 11-bit / 500 Kbps' },
        { value: 'can29-500', label: 'CAN 29-bit / 500 Kbps' },
        { value: 'can11-250', label: 'CAN 11-bit / 250 Kbps' },
        { value: 'can29-250', label: 'CAN 29-bit / 250 Kbps' },
    ];

    const ftdiDevices = [
        { value: '', label: '-- Nenhum adaptador encontrado --' },
        { value: 'FTDI-123456', label: 'FTDI-123456' },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [obdSettings, setObdSettings] = useState<ObdSettings>(DEFAULT_OBD_SETTINGS);
    const [ledSettings, setLedSettings] = useState<LedSettings>(DEFAULT_LED_SETTINGS);
    const [gearSettings, setGearSettings] = useState<GearSettings>(DEFAULT_GEAR_SETTINGS);

    // Carrega as configurações do AsyncStorage ao abrir a tela
    useEffect(() => {
        async function loadAllSettings() {
            setIsLoading(true);
            const [savedObd, savedLed, savedGear] = await Promise.all([
                SettingsStorage.getObdSettings(),
                SettingsStorage.getLedSettings(),
                SettingsStorage.getGearSettings(),
            ]);

            setObdSettings(savedObd);
            setLedSettings(savedLed);
            setGearSettings(savedGear);
            setIsLoading(false);
        }
        loadAllSettings();
    }, []);

    const handleSaveObd = async () => {
        await SettingsStorage.saveObdSettings(obdSettings);
        Alert.alert('Sucesso', 'Configurações de Conexão OBD salvas!');
    };

    const handleSaveLed = async () => {
        if (!ledSettings.name.trim() || !ledSettings.uuid.trim()) {
            Alert.alert('Erro', 'Nome e UUID do LED não podem ficar vazios.');
            return;
        }
        await SettingsStorage.saveLedSettings(ledSettings);
        Alert.alert('Sucesso', 'Configurações do LED salvas!');
    };

    const handleSaveGear = async () => {
        await SettingsStorage.saveGearSettings(gearSettings);
        Alert.alert('Sucesso', 'Relações de Marcha salvas!');
    };

    const renderOptionButtonList = (
        items: Array<{ value: string; label: string }>,
        selectedValue: string,
        onSelect: (value: string) => void,
        isCompact = false
    ) => (
        <View style={[styles.selectContainer, isCompact && styles.selectContainerCompact]}>
            {items.map((item) => (
                <Pressable
                    key={item.value || item.label}
                    style={[
                        styles.selectButton,
                        selectedValue === item.value && styles.selectButtonActive,
                        isCompact && styles.selectButtonCompact,
                    ]}
                    onPress={() => onSelect(item.value)}
                >
                    <Text
                        style={[
                            styles.selectButtonText,
                            selectedValue === item.value && styles.selectButtonTextActive,
                        ]}
                    >
                        {item.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ffff" />
            </View>
        );
    }

    const showFtdiSelector = obdSettings.connectionType === 'usb';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Configuração OBD-II */}
            <ExpandablePanel title="Configurar Conexão" icon="🔌" status={obdSettings.port} defaultExpanded>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Tipo de Conexão</Text>
                    {renderOptionButtonList(
                        obdTypeOptions,
                        obdSettings.connectionType,
                        (value) => setObdSettings({ ...obdSettings, connectionType: value })
                    )}
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Porta Serial</Text>
                    <TextInput
                        style={styles.textInput}
                        value={obdSettings.port}
                        onChangeText={(text) => setObdSettings({ ...obdSettings, port: text })}
                        placeholder="COM4"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    />
                </View>

                {showFtdiSelector && (
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Adaptador FTDI Detectado</Text>
                        <View style={styles.inlineFieldRow}>
                            <View style={styles.inlineFieldFlex}>
                                {renderOptionButtonList(
                                    ftdiDevices,
                                    obdSettings.ftdiDevice,
                                    (value) => setObdSettings({ ...obdSettings, ftdiDevice: value }),
                                    true
                                )}
                            </View>
                            <Pressable style={[styles.actionButton, styles.smallActionButton]}>
                                <Text style={styles.buttonText}>🔄 Buscar</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Baud Rate</Text>
                    <View style={styles.selectContainer}>
                        {baudRateOptions.map((rate) => (
                            <Pressable
                                key={rate}
                                style={[
                                    styles.selectButton,
                                    obdSettings.baudRate === rate && styles.selectButtonActive,
                                ]}
                                onPress={() => setObdSettings({ ...obdSettings, baudRate: rate })}
                            >
                                <Text
                                    style={[
                                        styles.selectButtonText,
                                        obdSettings.baudRate === rate && styles.selectButtonTextActive,
                                    ]}
                                >
                                    {rate}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Protocolo OBD</Text>
                    <View style={[styles.selectContainer, styles.protocolGrid]}>
                        {protocolOptions.map((protocol) => (
                            <Pressable
                                key={protocol.value}
                                style={[
                                    styles.selectButton,
                                    styles.protocolButton,
                                    obdSettings.protocol === protocol.value && styles.selectButtonActive,
                                ]}
                                onPress={() => setObdSettings({ ...obdSettings, protocol: protocol.value })}
                            >
                                <Text
                                    style={[
                                        styles.selectButtonText,
                                        obdSettings.protocol === protocol.value && styles.selectButtonTextActive,
                                    ]}
                                >
                                    {protocol.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSaveObd}
                    >
                        <Text style={styles.buttonText}>✓ Salvar Conexão</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, obdSettings.connected ? styles.connectButton : {}]}
                        onPress={() =>
                            setObdSettings({ ...obdSettings, connected: !obdSettings.connected })
                        }
                    >
                        <Text style={styles.buttonText}>
                            {obdSettings.connected ? '✓ Conectado' : 'Conectar'}
                        </Text>
                    </Pressable>
                </View>
            </ExpandablePanel>

            {/* Configuração Dispositivo LED */}
            <ExpandablePanel title="Configurar Dispositivo LED" icon="💡" status={ledSettings.name}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Nome do Dispositivo BLE</Text>
                    <TextInput
                        style={styles.textInput}
                        value={ledSettings.name}
                        onChangeText={(text) => setLedSettings({ ...ledSettings, name: text })}
                        placeholder="LEDDMX-000101"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>UUID da Característica</Text>
                    <TextInput
                        style={styles.textInput}
                        value={ledSettings.uuid}
                        onChangeText={(text) => setLedSettings({ ...ledSettings, uuid: text })}
                        placeholder="0000ffe1-0000-1000-8000-00805f9b34fb"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.twoColumnRow}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>RPM do Shift Light</Text>
                        <TextInput
                            style={styles.textInput}
                            // Converte o número do estado para string para o TextInput conseguir exibir
                            value={String(ledSettings.redlineRpm ?? '')}
                            // Converte o texto digitado para número antes de salvar
                            onChangeText={(text) => {
                                const numericValue = text === '' ? 0 : Number(text.replace(/[^0-9]/g, ''));
                                setLedSettings({ ...ledSettings, redlineRpm: numericValue });
                            }}
                            placeholder="3000"
                            keyboardType="numeric"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>

                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Velocidade do Pisca (ms)</Text>
                        <TextInput
                            style={styles.textInput}
                            // Converte o número do estado para string para o TextInput
                            value={String(ledSettings.blinkSpeed ?? '')}
                            // Converte o texto digitado para número antes de salvar
                            onChangeText={(text) => {
                                const numericValue = text === '' ? 0 : Number(text.replace(/[^0-9]/g, ''));
                                setLedSettings({ ...ledSettings, blinkSpeed: numericValue });
                            }}
                            placeholder="70"
                            keyboardType="numeric"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>
                </View>

                <View style={styles.twoColumnRow}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Cor Normal</Text>
                        <View style={styles.colorPickerWrapper}>
                            <TextInput
                                style={[styles.textInput, styles.colorInput]}
                                value={ledSettings.colorNormal}
                                onChangeText={(text) => setLedSettings({ ...ledSettings, colorNormal: text })}
                                placeholder="#0084ff"
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                            />
                            <View style={[styles.colorPreview, { backgroundColor: ledSettings.colorNormal }]} />
                        </View>
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Cor Redline</Text>
                        <View style={styles.colorPickerWrapper}>
                            <TextInput
                                style={[styles.textInput, styles.colorInput]}
                                value={ledSettings.colorRedline}
                                onChangeText={(text) => setLedSettings({ ...ledSettings, colorRedline: text })}
                                placeholder="#ff0000"
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                            />
                            <View style={[styles.colorPreview, { backgroundColor: ledSettings.colorRedline }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <View style={styles.toggleRow}>
                        <Text style={styles.fieldLabel}>Shift Light Auto</Text>
                        <Switch
                            value={ledSettings.autoShift}
                            onValueChange={(value) => setLedSettings({ ...ledSettings, autoShift: value })}
                            trackColor={{ false: '#333', true: '#00ff66' }}
                            thumbColor={ledSettings.autoShift ? '#00ff99' : '#999'}
                        />
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSaveLed}
                    >
                        <Text style={styles.buttonText}>✓ Salvar LED</Text>
                    </Pressable>
                </View>
            </ExpandablePanel>

            {/* Calibração de Marchas */}
            <ExpandablePanel title="Calibrar Rel. Marcha" icon="🚗" status="5 marchas">
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Relação de Marchas (separadas por vírgula)</Text>
                    <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={gearSettings.ratios}
                        onChangeText={(text) => setGearSettings({ ...gearSettings, ratios: text })}
                        placeholder="3.58,1.93,1.41,1.11,0.88"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        multiline
                    />
                </View>

                <View style={styles.twoColumnRow}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Relação Diferencial</Text>
                        <TextInput
                            style={styles.textInput}
                            value={gearSettings.differential}
                            onChangeText={(text) => setGearSettings({ ...gearSettings, differential: text })}
                            placeholder="4.25"
                            keyboardType="decimal-pad"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Perímetro do Pneu (m)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={gearSettings.tirePerimeter}
                            onChangeText={(text) => setGearSettings({ ...gearSettings, tirePerimeter: text })}
                            placeholder="1.83"
                            keyboardType="decimal-pad"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        />
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSaveGear}
                    >
                        <Text style={styles.buttonText}>✓ Salvar Rel. Marcha</Text>
                    </Pressable>
                </View>
            </ExpandablePanel>
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
    loadingContainer: {
        flex: 1,
        backgroundColor: 'rgba(2, 8, 16, 0.96)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    fieldContainer: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#8be8ff',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.2)',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'monospace',
    },
    multilineInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    twoColumnRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    halfField: {
        flex: 1,
    },
    selectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectContainerCompact: {
        flexDirection: 'column',
    },
    selectButton: {
        flex: 1,
        minHeight: 42,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
    },
    selectButtonCompact: {
        flex: 0,
        minHeight: 38,
    },
    selectButtonActive: {
        borderColor: 'rgba(0, 255, 255, 0.6)',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
    },
    selectButtonText: {
        color: '#8be8ff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    selectButtonTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    protocolGrid: {
        flexDirection: 'column',
    },
    protocolButton: {
        flex: 0,
        minHeight: 44,
    },
    inlineFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inlineFieldFlex: {
        flex: 1,
    },
    smallActionButton: {
        minWidth: 110,
        paddingVertical: 10,
    },
    colorPickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    colorInput: {
        flex: 1,
        textTransform: 'uppercase',
    },
    colorPreview: {
        width: 30,
        height: 30,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: 'rgba(0, 200, 150, 0.2)',
        borderColor: 'rgba(0, 255, 200, 0.4)',
    },
    connectButton: {
        backgroundColor: 'rgba(0, 255, 100, 0.15)',
        borderColor: 'rgba(0, 255, 100, 0.5)',
    },
    buttonText: {
        color: '#00ffaa',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});