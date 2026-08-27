import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { LedDevice, ledService } from '../services/ble/led-service';

export interface UseBleLedReturn {
    isScanning: boolean;
    isConnected: boolean;
    connectedDevice: LedDevice | null;
    error: string | null;
    requestPermissions: () => Promise<boolean>;
    connectToLed: (deviceName: string) => Promise<void>;
    disconnect: () => Promise<void>;
    setColor: (r: number, g: number, b: number, force?: boolean) => Promise<void>;
    powerOn: () => Promise<void>;
    powerOff: () => Promise<void>;
}

export function useBleLed(): UseBleLedReturn {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectedDevice, setConnectedDevice] = useState<LedDevice | null>(null);
    const [error, setError] = useState<string | null>(null);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 31) {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                const allGranted =
                    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

                if (!allGranted) {
                    setError('Permissões de Bluetooth negadas.');
                    return false;
                }
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setError('Permissão de Localização necessária.');
                    return false;
                }
            }
        }
        return true;
    }, []);

    const connectToLed = useCallback(
        async (deviceName: string) => {
            setError(null);
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) return;

            const isBluetoothOn = await ledService.checkBluetoothState();
            if (!isBluetoothOn) {
                setError('O Bluetooth do celular está desligado.');
                return;
            }

            setIsScanning(true);

            ledService.scanAndConnect(
                deviceName,
                (device) => {
                    setIsScanning(false);
                    setIsConnected(true);
                    setConnectedDevice(device);
                },
                (err) => {
                    setIsScanning(false);
                    setIsConnected(false);
                    setError(err.message || 'Erro ao conectar com a Fita LED.');
                }
            );
        },
        [requestPermissions]
    );

    const setColor = useCallback(
        async (r: number, g: number, b: number, force = false) => {
            if (!isConnected) return;
            try {
                await ledService.setRgbColor(r, g, b, force);
            } catch (err) {
                setError('Falha ao enviar cor para a LED.');
            }
        },
        [isConnected]
    );

    const powerOn = useCallback(async () => {
        if (!isConnected) return;
        try {
            await ledService.setPower(true);
        } catch (err) {
            setError('Falha ao ligar a LED.');
        }
    }, [isConnected]);

    const powerOff = useCallback(async () => {
        if (!isConnected) return;
        try {
            await ledService.setPower(false);
        } catch (err) {
            setError('Falha ao desligar a LED.');
        }
    }, [isConnected]);

    const disconnect = useCallback(async () => {
        try {
            await ledService.disconnect();
            setIsConnected(false);
            setConnectedDevice(null);
        } catch (err) {
            setError('Erro ao desconectar.');
        }
    }, []);

    useEffect(() => {
        return () => {
            ledService.disconnect();
        };
    }, []);

    return {
        isScanning,
        isConnected,
        connectedDevice,
        error,
        requestPermissions,
        connectToLed,
        disconnect,
        setColor,
        powerOn,
        powerOff,
    };
}