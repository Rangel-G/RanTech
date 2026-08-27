// /hooks/useHorsepower.ts
import { useEffect, useState } from 'react';

export function useHorsepower(maf: number) {
    const [currentHp, setCurrentHp] = useState(0);
    const [peakHp, setPeakHp] = useState(0);

    useEffect(() => {
        if (!maf || maf <= 0) {
            setCurrentHp(0);
            return;
        }

        // Fórmula padrão de conversão MAF para HP (WHP/BHP aproximado)
        // MAF (g/s) * 1.25 ou dividido por 0.8 dá uma aproximação excelente do caballage
        const calculatedHp = Math.round(maf * 1.25);
        setCurrentHp(calculatedHp);

        // Atualiza o pico se for maior que o recorde da sessão
        if (calculatedHp > peakHp) {
            setPeakHp(calculatedHp);
        }
    }, [maf]);

    return { currentHp, peakHp };
}