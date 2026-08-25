
import { TelemetryContext, TelemetryContextProps } from '@/contexts/telemetryContext';
import { useContext } from 'react';

export function useReception(): TelemetryContextProps {
    const context = useContext(TelemetryContext);

    if (!context) {
        throw new Error('useReception deve ser usado dentro de um TelemetryProvider');
    }

    return context;
}