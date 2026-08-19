import { GEAR_OPTIONS } from '@/constants/gear-options';
import { useEffect, useState } from 'react';

// ─── Contrato de dados de telemetria ──────────────────────────────────────────
export interface ReceptionData {
    rpm: number;
    rpmMax: number;
    speed: number;
    gear: string;
    ect: number;       // Engine Coolant Temp (°C)
    map: number;       // Pressão de admissão (BAR)
    turbo: number;     // Pressão turbo (BAR)
    battery: number;   // Tensão (V)
    power: number;     // Carga do motor (%)
    tc: boolean;       // Controle de tração
    wheelSpin: 'ESTÁVEL' | 'PATINANDO';
    fault: string;     // Diagnóstico ECU
}

const INITIAL: ReceptionData = {
    rpm: 0, rpmMax: 0, speed: 0, gear: 'N',
    ect: 20, map: 0, turbo: 0, battery: 13.2,
    power: 0, tc: true, wheelSpin: 'ESTÁVEL', fault: 'OK',
};

// ─── PONTO DE TROCA ───────────────────────────────────────────────────────────
// Para dados reais: substitua o corpo desta função pelo parsing do OBD2/BLE.
// A assinatura deve permanecer: (prev: ReceptionData) => ReceptionData
function tick(prev: ReceptionData): ReceptionData {
    const rpm = Math.max(0, Math.min(8000, prev.rpm + Math.random() * 400 - 100));
    const speed = Math.max(0, prev.speed + Math.random() * 20 - 5);

    return {
        rpm,
        rpmMax: Math.max(prev.rpmMax, rpm),
        speed,
        gear: GEAR_OPTIONS[Math.floor(Math.random() * GEAR_OPTIONS.length)],
        ect: Math.max(20, Math.min(120, prev.ect + Math.random() * 4 - 2)),
        map: Math.max(0, Math.min(2, prev.map + Math.random() * 0.2 - 0.1)),
        turbo: Math.max(0, Math.min(2, prev.turbo + Math.random() * 0.2 - 0.1)),
        battery: 12.5 + Math.random() * 2,
        power: Math.max(0, Math.min(100, prev.power + Math.random() * 30 - 15)),
        tc: prev.tc,
        wheelSpin: Math.abs(rpm - speed * 70) > 1500 ? 'PATINANDO' : 'ESTÁVEL',
        fault: 'OK',
    };
}

// ─── Hook público ─────────────────────────────────────────────────────────────
export function useReception(intervalMs = 500): ReceptionData {
    const [data, setData] = useState<ReceptionData>(INITIAL);

    useEffect(() => {
        const id = setInterval(() => setData((prev) => tick(prev)), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return data;
}