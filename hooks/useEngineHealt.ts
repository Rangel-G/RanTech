import { ENGINE_MAX_ECT } from '@/constants/telemetry-data';
import { useReception } from '@/contexts/telemetryContext';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export function useEngineHealth() {
    const { data } = useReception();

    useEffect(() => {
        // Alerta de Temperatura Crítica
        if (data.ect >= ENGINE_MAX_ECT) {
            Alert.alert(
                '⚠️ ALERTA DE SUPERAQUECIMENTO',
                `A temperatura do líquido de arrefecimento atingiu ${data.ect}ºC! Reduza a velocidade.`,
                [{ text: 'Entendido' }]
            );
        }

        // Alerta de Bateria Fraca
        if (data.battery > 0 && data.battery < 11.5) {
            Alert.alert(
                '⚠️ TENSÃO DE BATERIA BAIXA',
                `A voltagem do sistema caiu para ${data.battery}V. Verifique o alternador.`,
                [{ text: 'OK' }]
            );
        }
    }, [data.ect, data.battery]);
}