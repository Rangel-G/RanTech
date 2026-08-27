// /constants/obdPids.ts

// Tipo para estruturar nosso objeto de PIDs
export interface ObdPid {
    pid: string;          // O código hexadecimal a ser enviado (Modo 01)
    name: string;         // Nome do sensor
    unit: string;         // Unidade de medida (ex: km/h, ºC, rpm)
    // Função que recebe a resposta hexadecimal do carro e retorna o valor numérico
    parse: (hexResponse: string) => number | null;
}

/**
 * Função auxiliar:
 * O adaptador Bluetooth (ELM327) geralmente retorna a string em hexa com espaços.
 * Ex: "41 0C 1A F8"
 * Precisamos extrair os bytes de dados (A, B, C, D...).
 * O byte '41' significa sucesso do modo '01'. O byte '0C' é o PID ecoado.
 * Os bytes de dados começam no índice 2.
 */
const getBytes = (hexString: string): number[] => {
    try {
        const parts = hexString.trim().split(' ');
        // Retorna um array numérico: [A, B, C, D...]
        return parts.slice(2).map(hex => parseInt(hex, 16));
    } catch (e) {
        return [];
    }
};

// Dicionário com os PIDs padrão do OBD2
export const OBD_PIDS: Record<string, ObdPid> = {
    // Rotação do Motor (RPM)
    RPM: {
        pid: '010C', // Modo 01, PID 0C
        name: 'Engine RPM',
        unit: 'rpm',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 2) return null;
            // Fórmula do RPM: ((A * 256) + B) / 4
            const A = bytes[0];
            const B = bytes[1];
            return ((A * 256) + B) / 4;
        }
    },

    // Velocidade do Veículo
    SPEED: {
        pid: '010D', // Modo 01, PID 0D
        name: 'Vehicle Speed',
        unit: 'km/h',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            // Fórmula da Velocidade: A
            const A = bytes[0];
            return A;
        }
    },

    // Temperatura do Líquido de Arrefecimento
    COOLANT_TEMP: {
        pid: '0105', // Modo 01, PID 05
        name: 'Coolant Temperature',
        unit: 'ºC',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            // Fórmula da Temperatura: A - 40
            const A = bytes[0];
            return A - 40;
        }
    },

    // Posição do Acelerador (%)
    THROTTLE_POS: {
        pid: '0111', // Modo 01, PID 11
        name: 'Throttle Position',
        unit: '%',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            // Fórmula do Acelerador: (A * 100) / 255
            const A = bytes[0];
            return (A * 100) / 255;
        }
    },

    // Carga Calculada do Motor (%)
    ENGINE_LOAD: {
        pid: '0104',
        name: 'Engine Load',
        unit: '%',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            const A = bytes[0];
            return (A * 100) / 255;
        }
    },

    // Voltagem da Bateria (Atenção: Este é um comando interno do chip, não um PID padrão)
    BATTERY: {
        pid: 'ATRV',
        name: 'Battery Voltage',
        unit: 'V',
        parse: (response) => {
            // O chip responde algo como "12.4V" ou "14.1V", então não usamos a lógica Hexadecimal aqui.
            const match = response.match(/([\d\.]+)/);
            return match ? parseFloat(match[1]) : null;
        }
    },
    // Pressão do Combustível
    FUEL_PRESSURE: {
        pid: '010A',
        name: 'Fuel Pressure',
        unit: 'kPa',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            return bytes[0] * 3;
        }
    },

    // Pressão do Coletor de Admissão (MAP)
    MAP: {
        pid: '010B',
        name: 'Intake Manifold Absolute Pressure',
        unit: 'kPa',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            return bytes[0];
        }
    },

    // Avanço de Ignição
    TIMING_ADVANCE: {
        pid: '010E',
        name: 'Timing Advance',
        unit: '°',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            return (bytes[0] / 2) - 64;
        }
    },

    // Temperatura do Ar de Admissão (IAT)
    IAT: {
        pid: '010F',
        name: 'Intake Air Temperature',
        unit: '°C',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            return bytes[0] - 40;
        }
    },

    // Nível do Tanque de Combustível
    FUEL_LEVEL: {
        pid: '012F',
        name: 'Fuel Tank Level Input',
        unit: '%',
        parse: (hex) => {
            const bytes = getBytes(hex);
            if (bytes.length < 1) return null;
            return (bytes[0] * 100) / 255;
        }
    }
};