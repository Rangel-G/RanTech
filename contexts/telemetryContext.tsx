import { GEAR_OPTIONS } from '@/constants/gear-options';
import { ENGINE_MAX_RPM, INITIAL_TELEMETRY, ReceptionData } from '@/constants/telemetry-data';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface TelemetryContextProps {
    data: ReceptionData;
    setData: React.Dispatch<React.SetStateAction<ReceptionData>>;
    toggleTc: () => void;
}

export const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

function tick(prev: ReceptionData): ReceptionData {
    // Aplica Math.round para garantir inteiro no RPM
    const rawRpm = prev.rpm + Math.random() * 400 - 100;
    const rpm = Math.round(Math.max(0, Math.min(ENGINE_MAX_RPM, rawRpm)));

    const speed = Math.max(0, prev.speed + Math.random() * 20 - 5);

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