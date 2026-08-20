
export interface ReceptionData {
    rpm: number;
    rpmMax: number;
    speed: number;
    gear: string;
    ect: number;
    ectMax: number;
    map: number;
    mapMax: number;
    turbo: number;
    battery: number;
    power: number;
    tc: boolean;
    wheelSpin: 'ESTÁVEL' | 'PATINANDO';
    fault: string;
}

export const ENGINE_MAX_RPM = 8000;

export const INITIAL_TELEMETRY: ReceptionData = {
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
    tc: true, // Estado padrão do TC
    wheelSpin: 'ESTÁVEL',
    fault: 'OK',
};