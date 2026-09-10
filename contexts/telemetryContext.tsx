import { INITIAL_TELEMETRY, ReceptionData } from '@/constants/telemetry-data';
import { useConnection } from '@/contexts/connectionContext'; // <-- Importe o useConnection
import { obdService } from '@/services/obdService';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface TelemetryContextProps {
    data: ReceptionData;
    setData: React.Dispatch<React.SetStateAction<ReceptionData>>;
    toggleTc: () => void;
}

export const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<ReceptionData>(INITIAL_TELEMETRY);
    const { status } = useConnection(); // <-- Obtém o status da conexão

    // 1. Leitura de PIDs do OBD (Executa apenas quando CONECTADO)
    useEffect(() => {
        let failCount = 0;

        if (status === 'CONNECTED') {
            obdService.startPolling((key, value) => {
                failCount = 0; // Reseta falhas ao receber dado válido
                setData((prev) => {
                    const updated = { ...prev };
                    if (key === 'RPM') updated.rpm = Math.round(value);
                    if (key === 'SPEED') updated.speed = Math.round(value);
                    if (key === 'COOLANT_TEMP') updated.ect = Math.round(value);
                    if (key === 'MAP') updated.map = Number(value.toFixed(2));
                    if (key === 'BATTERY') updated.battery = Number(value.toFixed(1));
                    return updated;
                });
            });
        } else {
            obdService.stopPolling();
        }

        return () => {
            obdService.stopPolling();
        };
    }, [status]);

    // 2. Rastreamento GPS do Celular (Fallback de velocidade quando DESCONECTADO)
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        async function startGpsTracking() {
            try {
                const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
                if (locStatus !== 'granted') return;

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    (location) => {
                        const rawSpeedMs = location.coords.speed;
                        const gpsSpeedKmH = rawSpeedMs !== null && rawSpeedMs >= 0 ? Math.round(rawSpeedMs * 3.6) : 0;

                        setData((prev) => ({
                            ...prev,
                            // Atualiza a velocidade pelo GPS APENAS se o OBD estiver desconectado
                            speed: status === 'CONNECTED' ? prev.speed : gpsSpeedKmH,
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            heading: location.coords.heading ?? prev.heading,
                        }));
                    }
                );
            } catch (error) {
                console.error("Erro ao iniciar GPS no TelemetryContext:", error);
            }
        }

        startGpsTracking();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [status]);

    const toggleTc = useCallback(() => {
        setData((prev) => ({ ...prev, tc: !prev.tc }));
    }, []);

    return (
        <TelemetryContext.Provider value={{ data, setData, toggleTc }}>
            {children}
        </TelemetryContext.Provider>
    );
}

export const useReception = () => {
    const context = React.useContext(TelemetryContext);
    if (!context) {
        throw new Error('useReception deve ser usado dentro de um TelemetryProvider');
    }
    return context;
};