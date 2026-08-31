import { LoggerService } from '@/services/loggerService';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function LogViewerSection() {
    const [logs, setLogs] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenLogs = async () => {
        const content = await LoggerService.getLogs();
        setLogs(content);
        setModalVisible(true);
    };

    const handleClear = async () => {
        await LoggerService.clearLogs();
        setLogs('Logs limpos.');
        Alert.alert('Sucesso', 'Arquivo de logs limpo com sucesso.');
    };

    return (
        <View style={{ marginTop: 16 }}>
            <Pressable
                style={{ backgroundColor: '#333', padding: 12, borderRadius: 6, alignItems: 'center' }}
                onPress={handleOpenLogs}
            >
                <Text style={{ color: '#00ffff', fontWeight: 'bold' }}>📋 Ver Logs do Sistema</Text>
            </Pressable>

            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#0a121e', padding: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        Logs de Execução
                    </Text>

                    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 10, borderRadius: 6 }}>
                        <Text style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: 11 }}>{logs}</Text>
                    </ScrollView>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                        <Pressable
                            style={{ flex: 1, backgroundColor: '#ff3333', padding: 12, borderRadius: 6, alignItems: 'center' }}
                            onPress={handleClear}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Limpar Logs</Text>
                        </Pressable>

                        <Pressable
                            style={{ flex: 1, backgroundColor: '#007aff', padding: 12, borderRadius: 6, alignItems: 'center' }}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}