// /hooks/useFuelConsumption.ts
import { useEffect, useState } from 'react';

export function useFuelConsumption(maf: number, speed: number) {
    const [litersPerHour, setLitersPerHour] = useState(0);
    const [kmPerLiter, setKmPerLiter] = useState(0);

    useEffect(() => {
        if (!maf) {
            setLitersPerHour(0);
            setKmPerLiter(0);
            return;
        }

        // MAF (g/s) convertido direto para Litros/Hora
        const currentLph = maf * 0.3286;
        setLitersPerHour(currentLph);

        // Apenas calcula KM/L se o carro estiver em movimento para evitar divisão por zero
        if (speed > 5 && currentLph > 0) {
            setKmPerLiter(speed / currentLph);
        } else {
            setKmPerLiter(0);
        }
    }, [maf, speed]);

    return { litersPerHour, kmPerLiter };
}