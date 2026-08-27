import React, { createContext, useContext, useEffect, useState } from 'react';
import { LedDevice, ledService } from '../services/ble/led-service';
import {
    DEFAULT_LED_SETTINGS,
    LedSettings,
    SettingsStorage,
} from '../services/storage/settings-storage';

interface LedContextData {
    ledSettings: LedSettings;
    isScanning: boolean;
    isConnected: boolean;
    connectedDevice: LedDevice | null;
    error: string | null;
    updateLedSettings: (newSettings: LedSettings) => Promise<void>;
    connectToLed: (customName?: string) => void;
    disconnect: () => void;
    setColor: (r: number, g: number, b: number) => void;
}

const LedContext = createContext<LedContextData>({} as LedContextData);

export const LedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ledSettings, setLedSettings] = useState<LedSettings>(DEFAULT_LED_SETTINGS);
    const [isScanning, setIsScanning] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<LedDevice | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        SettingsStorage.getLedSettings().then(setLedSettings);
    }, []);

    const updateLedSettings = async (newSettings: LedSettings) => {
        setLedSettings(newSettings);
        await SettingsStorage.saveLedSettings(newSettings);
    };

    const connectToLed = (customName?: string) => {
        const targetName = customName || ledSettings.name;
        if (!targetName.trim()) {
            setError('Nome do dispositivo inválido.');
            return;
        }

        setIsScanning(true);
        setError(null);

        ledService.scanAndConnect(
            targetName.trim(),
            (device) => {
                setConnectedDevice(device);
                setIsConnected(true);
                setIsScanning(false);
            },
            (err) => {
                setError(err.message);
                setIsScanning(false);
                setIsConnected(false);
                setConnectedDevice(null);
            }
        );
    };

    const disconnect = async () => {
        await ledService.disconnect();
        setIsConnected(false);
        setConnectedDevice(null);
    };

    const setColor = (r: number, g: number, b: number) => {
        if (isConnected) {
            ledService.setRgbColor(r, g, b, true);
        }
    };

    return (
        <LedContext.Provider
            value={{
                ledSettings,
                isScanning,
                isConnected,
                connectedDevice,
                error,
                updateLedSettings,
                connectToLed,
                disconnect,
                setColor,
            }}
        >
            {children}
        </LedContext.Provider>
    );
};

export const useLed = () => useContext(LedContext);