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

// Escala máxima de limite do conta-giros do painel (ex: 8000 RPM)
const ENGINE_MAX_RPM = 8000;

const INITIAL: ReceptionData = {
    rpm: 0,
    rpmMax: ENGINE_MAX_RPM, // FIX: Inicia com o limite real do painel (8000 RPM)
    speed: 0,
    gear: 'N',
    ect: 20,
    map: 0,
    turbo: 0,
    battery: 13.2,
    power: 0,
    tc: true,
    wheelSpin: 'ESTÁVEL',
    fault: 'OK',
};

// ─── PONTO DE TROCA ───────────────────────────────────────────────────────────
function tick(prev: ReceptionData): ReceptionData {
    const rpm = Math.max(0, Math.min(ENGINE_MAX_RPM, prev.rpm + Math.random() * 400 - 100));
    const speed = Math.max(0, prev.speed + Math.random() * 20 - 5);

    return {
        rpm,
        rpmMax: ENGINE_MAX_RPM, // FIX: Mantém o limite fixo do instrumento em 8000 RPM
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