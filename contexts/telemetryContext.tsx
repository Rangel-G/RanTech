import { GEAR_OPTIONS } from '@/constants/gear-options';
import { ENGINE_MAX_RPM, INITIAL_TELEMETRY, ReceptionData } from '@/constants/telemetry-data';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface TelemetryContextProps {
    data: ReceptionData;
    setData: React.Dispatch<React.SetStateAction<ReceptionData>>;
    toggleTc: () => void;
}

export const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

// Coordenadas iniciais padrão (ex: São Paulo)
const DEFAULT_LAT = -23.55052;
const DEFAULT_LNG = -46.633308;

function tick(prev: ReceptionData): ReceptionData {
    // Aplica Math.round para garantir inteiro no RPM
    const rawRpm = prev.rpm + Math.random() * 400 - 100;
    const rpm = Math.round(Math.max(0, Math.min(ENGINE_MAX_RPM, rawRpm)));

    const speed = Math.max(0, prev.speed + Math.random() * 20 - 5);

    // --- Simulação de GPS ---
    // Incrementa a posição simulando um veículo em movimento contínuo
    const currentLat = prev.latitude ?? DEFAULT_LAT;
    const currentLng = prev.longitude ?? DEFAULT_LNG;

    // Pequeno deslocamento baseado na velocidade atual (fator de escala ~0.00002)
    const deltaLat = (speed > 0 ? 0.00003 : 0) + (Math.random() * 0.00001 - 0.000005);
    const deltaLng = (speed > 0 ? 0.00003 : 0) + (Math.random() * 0.00001 - 0.000005);

    const latitude = currentLat + deltaLat;
    const longitude = currentLng + deltaLng;
    const heading = (prev.heading ?? 45) + (Math.random() * 4 - 2); // Direção em graus (0-360)

    return {
        ...prev,
        rpm,
        rpmMax: Math.max(prev.rpmMax, rpm),
        speed,
        gear: GEAR_OPTIONS[Math.floor(Math.random() * GEAR_OPTIONS.length)],
        ect: Math.round(Math.max(20, Math.min(120, prev.ect + Math.random() * 4 - 2))), // Inteiro para temperatura
        map: Math.max(0, Math.min(2, prev.map + Math.random() * 0.2 - 0.1)),
        turbo: Math.max(0, Math.min(2, prev.turbo + Math.random() * 0.2 - 0.1)),
        battery: 12.5 + Math.random() * 2,
        power: Math.round(Math.max(0, Math.min(100, prev.power + Math.random() * 30 - 15))), // Inteiro para potência
        wheelSpin: Math.abs(rpm - speed * 70) > 1500 ? 'PATINANDO' : 'ESTÁVEL',
        latitude,
        longitude,
        heading,
    };
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<ReceptionData>(INITIAL_TELEMETRY);

    useEffect(() => {
        const id = setInterval(() => setData((prev) => tick(prev)), 500);
        return () => clearInterval(id);
    }, []);

    const toggleTc = useCallback(() => {
        setData((prev) => ({ ...prev, tc: !prev.tc }));
    }, []);

    return (
        <TelemetryContext.Provider value={{ data, setData, toggleTc }}>
            {children}
        </TelemetryContext.Provider>
    );
}