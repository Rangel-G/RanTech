// /hooks/usePerformanceTimer.ts
import { useEffect, useRef, useState } from 'react';

export function usePerformanceTimer(speed: number) {
    const [zeroToHundred, setZeroToHundred] = useState<number | null>(null);
    const [isTiming, setIsTiming] = useState(false);

    const startTimeRef = useRef<number | null>(null);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        // Inicia o cronômetro se o carro estava parado (ou quase) e começou a andar
        if (speed > 1 && speed < 5 && !isTiming && !hasCompletedRef.current) {
            setIsTiming(true);
            startTimeRef.current = Date.now();
            setZeroToHundred(null);
        }

        // Se estiver cronometrando e atingir ou passar de 100 km/h
        if (isTiming && startTimeRef.current && speed >= 100) {
            const elapsedTime = (Date.now() - startTimeRef.current) / 1000; // Converte para segundos
            setZeroToHundred(parseFloat(elapsedTime.toFixed(2)));
            setIsTiming(false);
            hasCompletedRef.current = true;
        }

        // Reseta o gatilho se o carro parar completamente novamente
        if (speed === 0) {
            setIsTiming(false);
            hasCompletedRef.current = false;
            startTimeRef.current = null;
        }
    }, [speed, isTiming]);

    return { zeroToHundred, isTiming };
}