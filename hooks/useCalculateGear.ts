// /hooks/useCalculatedGear.ts
import { useEffect, useState } from 'react';
import { SettingsStorage } from '../services/storage/settings-storage'; // Ajuste o caminho se necessário

export function useCalculatedGear(rpm: number, speed: number) {
    const [gear, setGear] = useState<string | number>('N');
    const [settings, setSettings] = useState<any>(null);

    // Carrega as configurações de marcha na montagem do hook
    useEffect(() => {
        SettingsStorage.getGearSettings().then(setSettings);
    }, []);

    useEffect(() => {
        // Se não houver configurações, ou se o carro estiver parado/em marcha lenta
        if (!settings || speed < 3 || rpm < 500) {
            setGear('N');
            return;
        }

        try {
            const diff = parseFloat(settings.differential);
            const perimeter = parseFloat(settings.tirePerimeter);
            // Transforma a string "3.58,1.93..." em um array de números [3.58, 1.93...]
            const ratios = settings.ratios.split(',').map((r: string) => parseFloat(r.trim()));

            // Aplicação da fórmula matemática
            const currentRatio = (rpm * perimeter * 60) / (speed * diff * 1000);

            let closestGear = 0;
            let minDifference = Infinity;

            // Encontra qual das marchas cadastradas tem a relação mais próxima do cálculo atual
            ratios.forEach((gearRatio: number, index: number) => {
                const difference = Math.abs(currentRatio - gearRatio);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestGear = index + 1; // +1 porque arrays começam em 0 (Marcha 1, 2, 3...)
                }
            });

            // Tolerância: se a relação calculada estiver muito longe de qualquer marcha conhecida,
            // significa que o motorista está com o pé na embreagem ou em ponto morto.
            if (minDifference > 0.4) {
                setGear('N');
            } else {
                setGear(closestGear);
            }

        } catch (e) {
            setGear('N');
        }
    }, [rpm, speed, settings]);

    return gear;
}