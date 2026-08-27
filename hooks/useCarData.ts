// /hooks/useCarData.ts
import { useConnection } from '@/contexts/connectionContext';
import { useEffect, useRef, useState } from 'react';
import { OBD_PIDS } from '../constants/obdPids';
import { obdService } from '../services/obdService';

// Estrutura do objeto de dados que vai alimentar o seu Dashboard
interface CarMetrics {
    rpm: number;
    speed: number;
    coolantTemp: number;
    throttlePos: number;
    engineLoad: number;
    battery: number;
}

// /hooks/useCarData.ts

// Estrutura do objeto de dados que vai alimentar o seu Dashboard
interface CarMetrics {
    rpm: number;
    speed: number;
    coolantTemp: number;
    throttlePos: number;
    engineLoad: number;
    battery: number;
}

// Lista ordenada do que queremos perguntar ao carro a cada ciclo
const POLLING_QUEUE = [
    { key: 'rpm', pidConfig: OBD_PIDS.RPM },
    { key: 'speed', pidConfig: OBD_PIDS.SPEED },
    { key: 'coolantTemp', pidConfig: OBD_PIDS.COOLANT_TEMP },
    { key: 'throttlePos', pidConfig: OBD_PIDS.THROTTLE_POS },
    { key: 'engineLoad', pidConfig: OBD_PIDS.ENGINE_LOAD },
    { key: 'battery', pidConfig: OBD_PIDS.BATTERY },
];

export const useCarData = () => {
    const { status } = useConnection();

    // Estado que será consumido pela UI
    const [metrics, setMetrics] = useState<CarMetrics>({
        rpm: 0,
        speed: 0,
        coolantTemp: 0,
        throttlePos: 0,
        engineLoad: 0,
        battery: 0
    });

    const currentQueryIndex = useRef(0);
    const isPolling = useRef(false);

    // O useEffect AQUI estava faltando!
    useEffect(() => {
        // Só inicia o polling se estiver conectado
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
                    setMetrics(prev => ({
                        ...prev,
                        [currentQuery.key]: numericValue
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
                console.error("Erro ao solicitar PID:", error);
            }
        };

        // Inicia a escuta no serviço Bluetooth
        obdService.startListening(handleDataReceived);

        // Dá o pontapé inicial na primeira pergunta
        requestNextMetric();

        // Limpeza quando o componente é desmontado ou a conexão cai
        return () => {
            isPolling.current = false;
        };
    }, [status]); // Agora o fechamento do useEffect faz sentido

    return metrics;
};