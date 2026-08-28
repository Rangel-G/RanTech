// hooks/useCarData.ts
import { useConnection } from '@/contexts/connectionContext';
import { useEffect, useRef, useState } from 'react';
import { OBD_PIDS } from '../constants/obdPids';
import { obdService } from '../services/obdService';

interface CarMetrics {
    rpm: number;
    rpmMax: number;
    speed: number;
    coolantTemp: number;
    throttlePos: number;
    engineLoad: number;
    battery: number;
    fuelPressure: number;
    map: number;
    timingAdvance: number;
    iat: number;
    fuelLevel: number;
    maf: number;
}

const POLLING_QUEUE = [
    { key: 'rpm', pidConfig: OBD_PIDS.RPM },
    { key: 'speed', pidConfig: OBD_PIDS.SPEED },
    { key: 'coolantTemp', pidConfig: OBD_PIDS.COOLANT_TEMP },
    { key: 'throttlePos', pidConfig: OBD_PIDS.THROTTLE_POS },
    { key: 'engineLoad', pidConfig: OBD_PIDS.ENGINE_LOAD },
    { key: 'battery', pidConfig: OBD_PIDS.BATTERY },
    { key: 'fuelPressure', pidConfig: OBD_PIDS.FUEL_PRESSURE },
    { key: 'map', pidConfig: OBD_PIDS.MAP },
    { key: 'timingAdvance', pidConfig: OBD_PIDS.TIMING_ADVANCE },
    { key: 'iat', pidConfig: OBD_PIDS.IAT },
    { key: 'fuelLevel', pidConfig: OBD_PIDS.FUEL_LEVEL },
    { key: 'maf', pidConfig: OBD_PIDS.MAF },
];

export const useCarData = () => {
    const { status } = useConnection();

    // ✅ Único useState, agora dentro da função
    const [metrics, setMetrics] = useState<CarMetrics>({
        rpm: 0,
        rpmMax: 8000,
        speed: 0,
        coolantTemp: 0,
        throttlePos: 0,
        engineLoad: 0,
        battery: 0,
        fuelPressure: 0,
        map: 0,
        timingAdvance: 0,
        iat: 0,
        fuelLevel: 0,
        maf: 0,
    });

    const currentQueryIndex = useRef(0);
    const isPolling = useRef(false);

    useEffect(() => {
        if (status !== 'CONNECTED') {
            isPolling.current = false;
            return;
        }

        isPolling.current = true;

        const handleDataReceived = (hexResponse: string) => {
            if (!isPolling.current) return;

            const currentQuery = POLLING_QUEUE[currentQueryIndex.current];
            const isAtCommand = currentQuery.pidConfig.pid.startsWith('AT');
            const expectedResponsePrefix = isAtCommand ? '' : `41 ${currentQuery.pidConfig.pid.substring(2)}`;

            if (isAtCommand || hexResponse.includes(expectedResponsePrefix)) {
                const numericValue = currentQuery.pidConfig.parse(hexResponse);

                if (numericValue !== null) {
                    setMetrics((prev) => ({
                        ...prev,
                        [currentQuery.key]: numericValue,
                    }));
                }

                currentQueryIndex.current = (currentQueryIndex.current + 1) % POLLING_QUEUE.length;
                requestNextMetric();
            }
        };

        const requestNextMetric = async () => {
            if (!isPolling.current) return;
            try {
                const nextQuery = POLLING_QUEUE[currentQueryIndex.current];
                await obdService.writeCommand(`${nextQuery.pidConfig.pid}\r`);
            } catch (error) {
                console.error('Erro ao solicitar PID:', error);
            }
        };

        obdService.startListening(handleDataReceived);
        requestNextMetric();

        return () => {
            isPolling.current = false;
        };
    }, [status]);

    return metrics;
};