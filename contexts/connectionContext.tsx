// /contexts/ConnectionContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Device } from 'react-native-ble-plx';
import { obdService } from '../services/obdService'; // Ajuste o caminho se necessário

// Definindo os estados possíveis da conexão da máquina
export type ConnectionStatus = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface ConnectionContextData {
    status: ConnectionStatus;
    scannedDevices: Device[];
    connectedDevice: Device | null;
    errorMessage: string | null;
    startScan: () => void;
    stopScan: () => void;
    connect: (deviceId: string) => Promise<void>;
    disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextData>({} as ConnectionContextData);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
    const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Lida com dispositivos encontrados durante o escaneamento
    const handleDeviceFound = (device: Device) => {
        setScannedDevices(prev => {
            // Evita duplicatas na lista
            if (prev.find(d => d.id === device.id)) return prev;
            return [...prev, device];
        });
    };

    const startScan = () => {
        setStatus('SCANNING');
        setScannedDevices([]);
        setErrorMessage(null);
        obdService.startScan(handleDeviceFound);
    };

    const stopScan = () => {
        obdService.stopScan();
        // Se não estivesse conectando, volta para desconectado
        if (status === 'SCANNING') {
            setStatus('DISCONNECTED');
        }
    };

    const connect = async (deviceId: string) => {
        try {
            setStatus('CONNECTING');
            setErrorMessage(null);
            const device = await obdService.connectToDevice(deviceId);

            setConnectedDevice(device);
            setStatus('CONNECTED');

            // (Opcional, mas recomendado) Observar se o dispositivo desconectou inesperadamente (ex: desligou o carro)
            device.onDisconnected((error, disconnectedDevice) => {
                console.warn(`Dispositivo ${disconnectedDevice.id} desconectado.`, error);
                setStatus('DISCONNECTED');
                setConnectedDevice(null);
                setErrorMessage('A conexão com o veículo foi perdida.');
            });

        } catch (error: any) {
            console.error("Falha ao conectar", error);
            setStatus('ERROR');
            setErrorMessage(error.message || 'Falha ao conectar ao adaptador OBD2.');
        }
    };

    const disconnect = () => {
        obdService.disconnect();
        setConnectedDevice(null);
        setStatus('DISCONNECTED');
    };

    // Limpeza de segurança (Unmount)
    useEffect(() => {
        return () => {
            obdService.stopScan();
            obdService.disconnect();
        };
    }, []);

    return (
        <ConnectionContext.Provider
            value={{
                status,
                scannedDevices,
                connectedDevice,
                errorMessage,
                startScan,
                stopScan,
                connect,
                disconnect,
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

// Hook customizado para facilitar o uso nos componentes
export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnection deve ser usado dentro de um ConnectionProvider');
    }
    return context;
};