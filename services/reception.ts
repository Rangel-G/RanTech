import { GEAR_OPTIONS } from '@/constants/gear-options';
import { useCallback, useEffect, useState } from 'react';

// ─── Contrato de dados de telemetria ──────────────────────────────────────────
export interface ReceptionData {
    rpm: number;
    rpmMax: number;
    speed: number;
    gear: string;
    ect: number;       // Engine Coolant Temp (°C)
    ectMax: number;    // Engine Coolant Temp Max (°C)
    map: number;       // Pressão de admissão (BAR)
    mapMax: number;    // Pressão de admissão máxima (BAR)
    turbo: number;     // Pressão turbo (BAR)
    battery: number;   // Tensão (V)
    power: number;     // Carga do motor (%)
    tc: boolean;       // Controle de tração
    wheelSpin: 'ESTÁVEL' | 'PATINANDO';
    fault: string;     // Diagnóstico ECU
}

// ─── Retorno estendido do Hook ────────────────────────────────────────────────
export interface UseReceptionReturn {
    data: ReceptionData;
    setData: React.Dispatch<React.SetStateAction<ReceptionData>>;
    toggleTc: () => void;
}

const ENGINE_MAX_RPM = 8000;

const INITIAL: ReceptionData = {
    rpm: 0,
    rpmMax: ENGINE_MAX_RPM,
    speed: 0,
    gear: 'N',
    ect: 20,
    ectMax: 120,
    map: 0,
    mapMax: 2,
    turbo: 0,
    battery: 13.2,
    power: 0,
    tc: true,
    wheelSpin: 'ESTÁVEL',
    fault: 'OK',
};

function tick(prev: ReceptionData): ReceptionData {
    const rpm = Math.max(0, Math.min(ENGINE_MAX_RPM, prev.rpm + Math.random() * 400 - 100));
    const speed = Math.max(0, prev.speed + Math.random() * 20 - 5);

    return {
        ...prev,
        rpm,
        rpmMax: ENGINE_MAX_RPM,
        speed,
        gear: GEAR_OPTIONS[Math.floor(Math.random() * GEAR_OPTIONS.length)],
        ect: Math.max(20, Math.min(120, prev.ect + Math.random() * 4 - 2)),
        map: Math.max(0, Math.min(2, prev.map + Math.random() * 0.2 - 0.1)),
        turbo: Math.max(0, Math.min(2, prev.turbo + Math.random() * 0.2 - 0.1)),
        battery: 12.5 + Math.random() * 2,
        power: Math.max(0, Math.min(100, prev.power + Math.random() * 30 - 15)),
        wheelSpin: Math.abs(rpm - speed * 70) > 1500 ? 'PATINANDO' : 'ESTÁVEL',
    };
}

// ─── Hook público ─────────────────────────────────────────────────────────────
export function useReception(intervalMs = 500): UseReceptionReturn {
    const [data, setData] = useState<ReceptionData>(INITIAL);

    useEffect(() => {
        const id = setInterval(() => setData((prev) => tick(prev)), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    const toggleTc = useCallback(() => {
        setData((prev) => ({ ...prev, tc: !prev.tc }));
    }, []);

    return { data, setData, toggleTc };
}