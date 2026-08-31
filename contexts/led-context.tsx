import { requestBlePermissions } from "@/services/ble/ble-permissions";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LedDevice, ledService } from "../services/ble/led-service";
import {
    DEFAULT_LED_SETTINGS,
    LedSettings,
    SettingsStorage,
} from "../services/storage/settings-storage";

interface LedContextData {
  ledSettings: LedSettings;
  isScanning: boolean;
  isConnected: boolean;
  connectedDevice: LedDevice | null;
  scannedDevices: LedDevice[];
  error: string | null;
  updateLedSettings: (newSettings: LedSettings) => Promise<void>;
  startLedScan: () => Promise<void>;
  stopLedScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  connectToLed: (customName?: string) => void;
  disconnect: () => void;
  setColor: (r: number, g: number, b?: number) => void;
}

const LedContext = createContext<LedContextData>({} as LedContextData);

export const LedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ledSettings, setLedSettings] =
    useState<LedSettings>(DEFAULT_LED_SETTINGS);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<LedDevice | null>(
    null,
  );
  const [scannedDevices, setScannedDevices] = useState<LedDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    SettingsStorage.getLedSettings().then(setLedSettings);
  }, []);

  const updateLedSettings = async (newSettings: LedSettings) => {
    setLedSettings(newSettings);
    await SettingsStorage.saveLedSettings(newSettings);
  };

  // Inicia a varredura BLE filtrando dispositivos de LED próximos
  const startLedScan = async () => {
    const hasPermission = await requestBlePermissions();
    if (!hasPermission) {
      setError("Permissões de Bluetooth negadas.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScannedDevices([]);

    try {
      // Se o ledService possuir suporte a scan contínuo, coletamos aqui.
      // Caso contrário, simulamos/utilizamos a varredura exposta pelo serviço:
      (ledService as any).scanForDevices?.(
        (device: LedDevice) => {
          setScannedDevices((prev) => {
            if (prev.some((d) => d.id === device.id)) return prev;
            // Filtra opcionalmente por nomes comuns de LED se desejar, ou exibe todos os BLEs
            return [...prev, device];
          });
        },
        (err: any) => {
          setError(err.message);
          setIsScanning(false);
        },
      );
    } catch (e: any) {
      // Fallback caso o serviço use o scan por nome padrão
      setError(e.message || "Erro ao varrer dispositivos.");
      setIsScanning(false);
    }
  };

  const stopLedScan = () => {
    setIsScanning(false);
    (ledService as any).stopScan?.();
  };

  const connectToDevice = async (deviceId: string) => {
    setError(null);
    setIsScanning(false);

    try {
      await (ledService as any).connectById?.(
        deviceId,
        (device: LedDevice) => {
          setConnectedDevice(device);
          setIsConnected(true);
          updateLedSettings({
            ...ledSettings,
            deviceId: device.id,
            name: device.name || ledSettings.name,
          });
        },
        (err: any) => {
          setError(err.message);
          setIsConnected(false);
        },
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const connectToLed = async (customName?: string) => {
    if (ledSettings.deviceId) {
      await connectToDevice(ledSettings.deviceId);
      return;
    }

    const targetName = customName || ledSettings.name;
    if (!targetName.trim()) {
      setError("Nome do dispositivo inválido.");
      return;
    }

    const hasPermission = await requestBlePermissions();
    if (!hasPermission) {
      setError("Permissões de Bluetooth negadas.");
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
        updateLedSettings({ ...ledSettings, deviceId: device.id });
      },
      (err) => {
        setError(err.message);
        setIsScanning(false);
        setIsConnected(false);
        setConnectedDevice(null);
      },
    );
  };

  const disconnect = async () => {
    await ledService.disconnect();
    setIsConnected(false);
    setConnectedDevice(null);
  };

  const setColor = (r: number, g: number, b: number = 255) => {
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
        scannedDevices,
        error,
        updateLedSettings,
        startLedScan,
        stopLedScan,
        connectToDevice,
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
