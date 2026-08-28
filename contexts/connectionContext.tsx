import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { OBDDevice, obdService } from '../services/obdService';

export type ConnectionStatus = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface ConnectionContextData {
    status: ConnectionStatus;
    scannedDevices: OBDDevice[];
    connectedDevice: OBDDevice | null;
    errorMessage: string | null;
    startScan: () => void;
    stopScan: () => void;
    connect: (deviceId: string) => Promise<void>;
    disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextData>({} as ConnectionContextData);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
    const [scannedDevices, setScannedDevices] = useState<OBDDevice[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<OBDDevice | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDeviceFound = (device: OBDDevice) => {
        setScannedDevices(prev => {
            if (prev.find(d => d.id === device.id)) return prev;
            return [...prev, device];
        });
    };

    const startScan = () => {
        setStatus('SCANNING');
        setScannedDevices([]);
        setErrorMessage(null);

        obdService.startScan(handleDeviceFound, (error) => {
            setStatus('ERROR');
            setErrorMessage(error.message);
        });
    };

    const stopScan = () => {
        obdService.stopScan();
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

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnection deve ser usado dentro de um ConnectionProvider');
    }
    return context;
};