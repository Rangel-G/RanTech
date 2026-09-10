import { useConnection } from '@/contexts/connectionContext';
import { useReception } from '@/contexts/telemetryContext';

export interface CarMetrics {
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

export const useCarData = (): CarMetrics => {
    const { data } = useReception();
    const { status } = useConnection();

    const isObdConnected = status === 'CONNECTED';
    const rawData = data as any;

    return {
        // Velocidade ativa pelo GPS (funciona sempre)
        speed: rawData.speed ?? 0,
        rpmMax: 8000,

        // Sensores do motor: leem o OBD2 se conectado, caso contrário retornam 0
        rpm: isObdConnected ? (rawData.rpm ?? 0) : 0,
        coolantTemp: isObdConnected ? (rawData.ect ?? rawData.coolantTemp ?? 0) : 0,
        throttlePos: isObdConnected ? (rawData.tps ?? rawData.throttlePos ?? 0) : 0,
        engineLoad: isObdConnected ? (rawData.load ?? rawData.engineLoad ?? 0) : 0,
        battery: isObdConnected ? (rawData.battery ?? 0) : 0,
        fuelPressure: isObdConnected ? (rawData.fuelPressure ?? 0) : 0,
        map: isObdConnected ? (rawData.map ?? 0) : 0,
        timingAdvance: isObdConnected ? (rawData.timingAdvance ?? 0) : 0,
        iat: isObdConnected ? (rawData.iat ?? 0) : 0,
        fuelLevel: isObdConnected ? (rawData.fuel ?? rawData.fuelLevel ?? 0) : 0,
        maf: isObdConnected ? (rawData.maf ?? 0) : 0,
    };
};