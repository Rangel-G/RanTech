import { auth } from '@/services/firebase/firebase';
import { LoggerService } from '@/services/loggerService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function LogViewerSection() {
    const [logs, setLogs] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);

    // Conecta a aba de logs ao LoggerService para atualizações em tempo real
    useEffect(() => {
        const unsubscribe = LoggerService.subscribe((content) => {
            setLogs(content);
        });

        // Carrega a primeira vez
        LoggerService.getLogs().then(setLogs);

        // Adicionamos as chaves { } para que a arrow function retorne 'void' ao invés do 'boolean'
        return () => {
            unsubscribe();
        };
    }, []);

    const handleOpenLogs = () => {
        setModalVisible(true);
    };

    const handleClear = async () => {
        await LoggerService.clearLogs();
        Alert.alert('Sucesso', 'Arquivo de logs limpo com sucesso.');
    };

    const handleGoogleSignIn = async () => {
        try {
            await LoggerService.log('INFO', "1. Iniciando fluxo de login com o Google...");

            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            await LoggerService.log('INFO', "2. Google Play Services OK. Abrindo seletor de contas...");

            const response = await GoogleSignin.signIn();
            await LoggerService.log('INFO', "3. Resposta recebida do Google Sign-In...");

            if (response.type !== 'success') {
                throw new Error("O login foi cancelado ou não foi bem-sucedido.");
            }

            const idToken = response.data.idToken;
            if (!idToken) {
                throw new Error("ID Token retornado está vazio ou nulo.");
            }
            await LoggerService.log('INFO', "4. ID Token extraído com sucesso. Passando para o Firebase...");

            const googleCredential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, googleCredential);

            await LoggerService.log('INFO', "5. Sucesso! Usuário autenticado no Firebase.");
        } catch (error: any) {
            const errorCode = error.code || "ERRO_DESCONHECIDO";
            const errorMessage = error.message || JSON.stringify(error);
            await LoggerService.logError("Google SignIn", `[${errorCode}]: ${errorMessage}`);
        }
    };

    // Função que colore cada linha dinamicamente baseada no nível do Log
    const renderColoredLogs = () => {
        const lines = logs.split('\n');
        return lines.map((line, index) => {
            if (!line.trim()) return null;

            let color = '#00ffff'; // Ciano padrão para INFO
            if (line.includes('[ERROR]')) color = '#ff4444'; // Vermelho para Erros
            else if (line.includes('[WARN]')) color = '#ffcc00'; // Amarelo para Alertas

            return (
                <Text key={index} style={{ color, fontFamily: 'monospace', fontSize: 11, marginBottom: 4 }}>
                    {line}
                </Text>
            );
        });
    };

    return (
        <View style={{ marginTop: 16 }}>
            <Pressable
                style={{ backgroundColor: '#333', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 }}
                onPress={handleGoogleSignIn}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>🔑 Testar Login Google</Text>
            </Pressable>

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
                        {renderColoredLogs()}
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